package com.jfeat.processTask.controller;

import com.jfeat.am.core.jwt.JWTKit;
import com.jfeat.crud.base.exception.BusinessCode;
import com.jfeat.crud.base.exception.BusinessException;
import com.jfeat.crud.base.tips.SuccessTip;
import com.jfeat.crud.base.tips.Tip;
import com.jfeat.processTask.dao.dto.TaskDTO;
import com.jfeat.processTask.dao.dto.TaskNoteDTO;
import com.jfeat.processTask.dao.model.ProcessTask;
import com.jfeat.processTask.dao.model.TaskNote;
import com.jfeat.processTask.enums.TaskStatus;
import com.jfeat.processTask.service.ProcessTaskService;
import com.jfeat.processTask.service.TaskNoteService;
import org.apache.ibatis.annotations.Param;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

@RestController
@RequestMapping("/api/task")
public class TaskController {

    @Resource
    ProcessTaskService processTaskService;

    @Resource
    TaskNoteService taskNoteService;

    @PostMapping
    public Tip createTask(@RequestBody TaskDTO task) {
        return SuccessTip.create(this.processTaskService.createTask(task));
    }

    @PostMapping("/{taskId}/assign")
    public Tip assignTask(
            @PathVariable Long taskId,
            @RequestParam String assigneeType,
            @RequestParam Long assigneeId) {
        int affect = processTaskService.assignTask(
                taskId,
                assigneeType,
                assigneeId
        );
        return SuccessTip.create(affect);
    }

    @GetMapping
    public Tip getAssignedTasks(@RequestParam(name = "pageNum", required = false, defaultValue = "1") Integer pageNum,
                                @RequestParam(name = "pageSize", required = false, defaultValue = "10") Integer pageSize) {
        Long userId = JWTKit.getUserId();
        userId=2725L;
        if (userId == null) {
            throw new BusinessException(BusinessCode.NoPermission,"未带token");
        }
        List<ProcessTask> tasks = processTaskService.getTasksByUser(userId, pageNum, pageSize);
        return SuccessTip.create(tasks);
    }


    @PostMapping("/{taskId}/taskNote")
    public Tip DoTask(
            @PathVariable Long taskId,@RequestBody TaskNoteDTO taskNoteDTO) {
        Long userId = JWTKit.getUserId();
//        userId=2732L;
        if (userId == null) {
            throw new BusinessException(BusinessCode.NoPermission,"请登录token");
        }
        int affect = taskNoteService.updateTaskNote(taskId,userId,taskNoteDTO);
        return SuccessTip.create(affect);
    }

    @PutMapping("/{taskId}/taskStatus")
    public Tip complicationTask(@PathVariable Long taskId) {
        ProcessTask processTask = new ProcessTask();
        processTask.setTaskId(taskId);
        processTask.setStatus(TaskStatus.COMPLETED.name());
        return SuccessTip.create(processTaskService.updateTaskStatus(processTask));
    }



}
