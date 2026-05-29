package com.jfeat.processTask.service.impl;

import com.jfeat.am.module.workflow.services.persistence.dao.TaskMapper;
import com.jfeat.crud.base.exception.BusinessCode;
import com.jfeat.crud.base.exception.BusinessException;
import com.jfeat.processTask.dao.model.ProcessTask;
import com.jfeat.processTask.dao.model.TaskNote;
import com.jfeat.processTask.dao.model.TaskTransfer;
import com.jfeat.processTask.dao.vo.TaskTransferVO;
import com.jfeat.processTask.enums.AssigneeType;
import com.jfeat.processTask.enums.TaskNotesType;
import com.jfeat.processTask.enums.TaskStatus;
import com.jfeat.processTask.mapper.ProcessTaskMapper;
import com.jfeat.processTask.mapper.TaskNoteMapper;
import com.jfeat.processTask.mapper.TaskTransferMapper;
import com.jfeat.processTask.service.TaskTransferService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class TaskTransferServiceImpl implements TaskTransferService {

    @Resource
    private TaskTransferMapper taskTransferMapper;

    @Resource
    private ProcessTaskMapper processTaskMapper;

    @Resource
    private TaskNoteMapper taskNoteMapper;


    /**
     * 执行任务转交
     */
    @Transactional
    public int transferTask(TaskTransfer taskTransfer,Boolean flag) {
        int affectRows=0;
        // 1. 参数基础校验
        if (taskTransfer.getTaskId()== null || taskTransfer.getToAssigneeType() == null || taskTransfer.getToAssigneeId() == null || taskTransfer.getTransferredBy() == null) {
            throw new BusinessException(BusinessCode.BadRequest,"参数不合法");
        }
        // 2. 获取并校验任务
        ProcessTask task = processTaskMapper.selectById(taskTransfer.getTaskId());
        if (task == null) {
            throw new BusinessException(BusinessCode.BadRequest,"任务不存在");
        }
        // 3. 校验新负责人合法性
        validateAssignee(taskTransfer.getToAssigneeType(), taskTransfer.getToAssigneeId());

        if (task.getStatus().equals(TaskStatus.COMPLETED.name())){
            throw new BusinessException(BusinessCode.BadRequest,"任务已完成，不可流转");
        }
        // 4. 权限校验（示例：操作人必须是原负责人或管理员）
//        validatePermission(task, taskTransfer.getTransferredBy());
        // 5. 创建流转记录
        taskTransfer.setTransferredAt(LocalDateTime.now());
        taskTransferMapper.insert(taskTransfer);
        System.out.println(taskTransfer.getTaskId());
        // 6. 更新任务负责人
        task.setAssigneeType(taskTransfer.getToAssigneeType());
        task.setAssigneeId(taskTransfer.getToAssigneeId());
        processTaskMapper.updateById(task);

        if (!flag) {
            TaskNote taskNote = taskNoteMapper.selectNoteByLatestTransfer(task.getTaskId(), taskTransfer.getFromAssigneeType(), taskTransfer.getFromAssigneeId());
            if(taskNote==null){
                throw new BusinessException(BusinessCode.BadRequest,"任务不存在");
            }
            if (!TaskNotesType.isTransferAllowed(taskNote.getStatus())){
                throw new BusinessException(BusinessCode.ErrorStatus,"当前任务未完成不可以转交");
            }
        }
        TaskNote nextTaskNote = new TaskNote();
        nextTaskNote.setTransferId(taskTransfer.getTransferId());
        nextTaskNote.setHandlerId(taskTransfer.getToAssigneeId());
        nextTaskNote.setStatus(TaskNotesType.NEW.name());
        affectRows+=taskNoteMapper.insert(nextTaskNote);
        return affectRows;
    }

    @Override
    public List<TaskTransferVO> getTimeline(Long taskId) {
        return taskTransferMapper.selectTaskTransferHistory(taskId);
    }

    private void validateAssignee(String type, Long id) {

//        验证流转类似是否合法
        AssigneeType.checkValid(type);

//        if ("USER".equals(type) && !userService.existsUser(id)) {
//            throw new BusinessException("指定用户不存在");
//        }
//
//        if ("ORGANIZATION".equals(type) && !orgService.existsOrganization(id)) {
//            throw new BusinessException("指定组织不存在");
//        }
    }

    private void validatePermission(ProcessTask task, Long operatorId) {
        // 示例权限逻辑：操作人必须是原负责人或管理员
        boolean isAssignee = operatorId.equals(task.getAssigneeId())
                && AssigneeType.USER.name().equals(task.getAssigneeType());
//        boolean isAdmin = userService.isAdminUser(operatorId);
//&& !isAdmin
        if (!isAssignee ) {
            throw new BusinessException(BusinessCode.NoPermission,"无权操作此任务");
        }
    }
}
