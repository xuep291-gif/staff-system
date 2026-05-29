package com.jfeat.processTask.service;

import com.jfeat.processTask.dao.dto.TaskDTO;
import com.jfeat.processTask.dao.model.ProcessTask;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ProcessTaskService {


    @Transactional
    Integer createTask(TaskDTO task);
    Integer assignTask(Long taskId, String newAssigneeType, Long newAssigneeId);

    List<ProcessTask> getTasksByUser(Long userId, Integer offset, Integer pageSize);


    int updateTaskStatus(ProcessTask dto);

}
