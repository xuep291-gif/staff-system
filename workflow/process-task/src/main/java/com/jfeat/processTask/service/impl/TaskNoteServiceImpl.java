package com.jfeat.processTask.service.impl;

import com.jfeat.am.core.jwt.JWTKit;
import com.jfeat.crud.base.exception.BusinessCode;
import com.jfeat.crud.base.exception.BusinessException;
import com.jfeat.processTask.dao.converter.TaskNoteConverter;
import com.jfeat.processTask.dao.dto.TaskDTO;
import com.jfeat.processTask.dao.dto.TaskNoteDTO;
import com.jfeat.processTask.dao.model.ProcessTask;
import com.jfeat.processTask.dao.model.TaskNote;
import com.jfeat.processTask.enums.TaskStatus;
import com.jfeat.processTask.mapper.TaskNoteMapper;
import com.jfeat.processTask.service.ProcessTaskService;
import com.jfeat.processTask.service.TaskNoteService;
import com.jfeat.processTask.utils.FileStorageUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class TaskNoteServiceImpl implements TaskNoteService {

    @Resource
    private TaskNoteMapper taskNoteMapper;

    @Resource
    private ProcessTaskService processTaskService;

    @Override
    @Transactional
    public int updateTaskNote(TaskNoteDTO taskNoteDTO) {
        // 参数校验
        if (taskNoteDTO==null || taskNoteDTO.getId()==null || taskNoteDTO.getTransferId()==null){
            throw new BusinessException(BusinessCode.BadRequest,"参数出错误");
        }
        handleFileUpload(taskNoteDTO);
        taskNoteDTO.setHandlerId(JWTKit.getUserId());
        return taskNoteMapper.updateById(TaskNoteConverter.convertToModel(taskNoteDTO));
    }

    @Override
    public int updateTaskNote(Long taskId, Long userId, TaskNoteDTO taskNoteDTO) {

//        找到这个用户拥有的任务列表
        List<ProcessTask> tasksByUser = processTaskService.getTasksByUser(userId, null, null);
        // 使用 Stream 过滤并提取匹配的 taskId 对象
        Optional<ProcessTask> matchedTask = tasksByUser.stream()
                .filter(task -> taskId.equals(task.getTaskId()))
                .findFirst();

        if (matchedTask.isPresent()) {
            ProcessTask processTask = matchedTask.get();

//            找到具体处理note

            TaskNote taskNote = taskNoteMapper.selectNoteByLatestTransfer(processTask.getTaskId(), processTask.getAssigneeType(), processTask.getAssigneeId());
            if (taskNote == null) {
                throw new BusinessException(BusinessCode.NoPermission);
            }

            taskNoteDTO.setId(taskNote.getId());
            taskNoteDTO.setTransferId(taskNote.getTransferId());
            taskNote.setStatus(TaskStatus.COMPLETED.name());


            return updateTaskNote(taskNoteDTO);
        } else {
            // 没有找到匹配的 taskId
//            log.warn("Task not found with ID: {}", taskId);
            return 0; // 返回 0 表示未找到
        }
    }


    /**
     * 处理文件上传逻辑
     */
    private void handleFileUpload(TaskNoteDTO taskNoteDTO) {
        try {
            // 处理附件
            if (taskNoteDTO.getAttachmentFile() != null && !taskNoteDTO.getAttachmentFile().isEmpty()) {
                String attachmentUrl = FileStorageUtils.upload(taskNoteDTO.getAttachmentFile());
                taskNoteDTO.setAttachment(attachmentUrl);
            }
            // 处理图片
            if (taskNoteDTO.getImageFile() != null && !taskNoteDTO.getImageFile().isEmpty()) {
                String imageUrl = FileStorageUtils.upload(taskNoteDTO.getImageFile());
                taskNoteDTO.setImageUrl(imageUrl);
            }
        } catch (IOException e) {
            throw new BusinessException(BusinessCode.UploadFileError, "文件上传失败");
        }
    }
}
