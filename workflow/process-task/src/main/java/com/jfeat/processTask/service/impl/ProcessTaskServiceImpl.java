package com.jfeat.processTask.service.impl;

import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.jfeat.am.core.jwt.JWTKit;
import com.jfeat.am.module.workflow.constant.ProcessOpenToEnum;
import com.jfeat.am.module.workflow.constant.ProcessStatusEnum;
import com.jfeat.am.module.workflow.services.persistence.dao.ProcessMapper;
import com.jfeat.am.module.workflow.services.persistence.model.Process;
import com.jfeat.crud.base.exception.BusinessCode;
import com.jfeat.crud.base.exception.BusinessException;
import com.jfeat.processTask.dao.converter.TaskConverter;
import com.jfeat.processTask.dao.dto.TaskDTO;
import com.jfeat.processTask.dao.model.ProcessTask;
import com.jfeat.processTask.dao.model.TaskProcessRelation;
import com.jfeat.processTask.dao.model.TaskTransfer;
import com.jfeat.processTask.enums.AssigneeType;
import com.jfeat.processTask.enums.TaskStatus;
import com.jfeat.processTask.mapper.ProcessTaskMapper;
import com.jfeat.processTask.mapper.TaskProcessRelationMapper;
import com.jfeat.processTask.service.ProcessTaskService;
import com.jfeat.processTask.service.TaskTransferService;
import com.jfeat.processTask.utils.FileStorageUtils;
import com.jfeat.processTask.utils.ProcessCodeGenerator;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProcessTaskServiceImpl implements ProcessTaskService {


    @Resource
    private ProcessTaskMapper processTaskMapper;
    @Resource
    ProcessMapper processMapper;

    @Resource
    TaskProcessRelationMapper taskProcessRelationMapper;

    @Resource
    TaskTransferService taskTransferService;

    @Override
    @Transactional
    public Integer createTask(TaskDTO taskDTO) {
        // 1. 参数基础校验
        if (taskDTO == null) {
            throw new BusinessException(BusinessCode.BadRequest, "任务参数不能为空");
        }
        // 2. 验证时间逻辑
        validateTaskTime(taskDTO.getStartTime(), taskDTO.getDeadline());

        // 3. 处理文件上传
        handleFileUpload(taskDTO);

        // 4. DTO转DO
        ProcessTask processTask = TaskConverter.toDO(taskDTO);


        Boolean assigneeFlag = true;
        processTask.setStatus(TaskStatus.IN_PROGRESS.name());
        if (processTask.getAssigneeType()==null || processTask.getAssigneeType()==null) {
            assigneeFlag=false;
            processTask.setStatus(TaskStatus.PENDING.name());
        }


//        processTask.setCreatedBy(1L);
        processTask.setCreatedBy(JWTKit.getUserId());
        processTask.setCreatedAt(LocalDateTime.now());

        // 5. 写入数据库
        Integer affect = processTaskMapper.insertProcessTask(processTask);
        System.out.println(processTask.getTaskId());

        if (affect!=null && affect > 0) {
//           创建一个工作流并关联起来
            Process process = new Process();
            process.setCode(ProcessCodeGenerator.generateProcessCode());
            process.setStatus(ProcessStatusEnum.ENABLED.name());
            process.setName(processTask.getTitle());
            process.setOpenTo(ProcessOpenToEnum.USER.toString());
            if (AssigneeType.ORGANIZATION.toString().equals(processTask.getAssigneeType())){
                process.setOpenTo(ProcessOpenToEnum.DEPARTMENT.toString());
            }
            affect+=processMapper.insertProcess(process);
            TaskProcessRelation taskProcessRelation = new TaskProcessRelation();
            taskProcessRelation.setProcessId(process.getId());
            taskProcessRelation.setTaskId(processTask.getTaskId());
            affect+=taskProcessRelationMapper.insert(taskProcessRelation);


            if (assigneeFlag) {
                //            创建一个流转节点
                TaskTransfer taskTransfer = new TaskTransfer();
                taskTransfer.setTaskId(processTask.getTaskId());
                taskTransfer.setFromAssigneeId(processTask.getCreatedBy());
                taskTransfer.setFromAssigneeType(AssigneeType.USER.toString());
                taskTransfer.setToAssigneeId(processTask.getAssigneeId());
                taskTransfer.setToAssigneeType(processTask.getAssigneeType());
                taskTransfer.setTransferredBy(processTask.getCreatedBy());
                taskTransfer.setTransferredAt(LocalDateTime.now());
                affect+= taskTransferService.transferTask(taskTransfer, true);
            }


        }


        return affect;
    }

    @Override
    public Integer assignTask(Long taskId, String newAssigneeType, Long newAssigneeId) {
        // 1. 参数基础校验
        if (taskId == null || newAssigneeType == null || newAssigneeId == null) {
            throw new BusinessException(BusinessCode.BadRequest, "必要参数不能为空");
        }

        // 2. 获取当前任务信息
        ProcessTask currentTask = processTaskMapper.selectById(taskId);
        if (currentTask == null) {
            throw new BusinessException(BusinessCode.BadRequest, "任务不存在");
        }

        // 3. 权限校验（示例：仅当前处理人可转派）
//        Long currentUserId = JWTKit.getUserId();
//        if (!currentUserId.equals(currentTask.getCreatedBy())) {
//            throw new BusinessException(BusinessCode.NoPermission, "无操作权限");
//        }

        // 4. 状态校验（例如：已完成任务不可转派）
        if (TaskStatus.COMPLETED.name().equals(currentTask.getStatus())) {
            throw new BusinessException(BusinessCode.BadRequest, "已完成任务不可转派");
        }

        int affect = 0;
        // 6. 创建流转记录
        TaskTransfer taskTransfer = new TaskTransfer();
        taskTransfer.setTaskId(currentTask.getTaskId());
        taskTransfer.setFromAssigneeId(currentTask.getCreatedBy());
        taskTransfer.setFromAssigneeType(AssigneeType.USER.toString());
        taskTransfer.setToAssigneeId(newAssigneeId);
        taskTransfer.setToAssigneeType(newAssigneeType);
        taskTransfer.setTransferredBy(currentTask.getCreatedBy());
        taskTransfer.setTransferredAt(LocalDateTime.now());

        // 8. 更新任务信息
        currentTask.setAssigneeId(newAssigneeId);
        currentTask.setAssigneeType(newAssigneeType);
        currentTask.setStatus(TaskStatus.IN_PROGRESS.name());

        // 插入处理记录
        affect+= taskTransferService.transferTask(taskTransfer, true);
        affect += processTaskMapper.updateById(currentTask);   // 更新任务

        return affect;
    }

    @Override
    public List<ProcessTask> getTasksByUser(Long userId,Integer offset, Integer pageSize) {

//        查找用户的角色 和 所在团队
        return processTaskMapper.selectUserTasks(userId,null,offset,pageSize);
    }

    @Override
    public int updateTaskStatus(ProcessTask dto) {
        // 1. 校验任务是否存在
        ProcessTask processTask = processTaskMapper.selectById(dto.getTaskId());
        if (processTask == null) {
//            log.warn("任务不存在: taskId={}", dto.getTaskId());
            throw new BusinessException(BusinessCode.BadRequest,"任务不存在");
        }
        processTask.setStatus(dto.getStatus());
        return processTaskMapper.updateById(processTask);
    }



    /**
     * 校验任务时间有效性
     */
    private void validateTaskTime(LocalDateTime startTime, LocalDateTime deadline) {
        if (startTime != null && deadline != null) {
            if (startTime.isAfter(deadline)) {
                throw new BusinessException(BusinessCode.BadRequest,"开始时间不能晚于截止时间");
            }
        }

        // 可选：禁止创建过去时间的任务
        if (deadline != null && deadline.isBefore(LocalDateTime.now())) {
            throw new BusinessException(BusinessCode.BadRequest, "截止时间不能早于当前时间");
        }
    }

    /**
     * 处理文件上传逻辑
     */
    private void handleFileUpload(TaskDTO taskDTO) {
        try {
            // 处理附件
            if (taskDTO.getAttachmentFile() != null && !taskDTO.getAttachmentFile().isEmpty()) {
                String attachmentUrl = FileStorageUtils.upload(taskDTO.getAttachmentFile());
                taskDTO.setAttachment(attachmentUrl);
            }

            // 处理图片
            if (taskDTO.getImageFile() != null && !taskDTO.getImageFile().isEmpty()) {
                String imageUrl = FileStorageUtils.upload(taskDTO.getImageFile());
                taskDTO.setImageUrl(imageUrl);
            }
        } catch (IOException e) {
            throw new BusinessException(BusinessCode.UploadFileError, "文件上传失败");
        }
    }


}
