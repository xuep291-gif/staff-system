package com.jfeat.processTask.controller;


import com.jfeat.crud.base.tips.SuccessTip;
import com.jfeat.crud.base.tips.Tip;
import com.jfeat.processTask.dao.model.TaskTransfer;
import com.jfeat.processTask.service.TaskTransferService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

@RestController
@RequestMapping("/api/pub/taskTransfer")
public class TaskTransferController {

    @Resource
    TaskTransferService taskTransferService;

    @PostMapping
    public Tip createTaskTransfer(@RequestBody TaskTransfer taskTransfer) {
        return SuccessTip.create(taskTransferService.transferTask(taskTransfer,false));
    }

    @GetMapping("/{taskId}/timeline")
    public Tip getTaskTimeline(
            @PathVariable Long taskId) {
        return SuccessTip.create(taskTransferService.getTimeline(taskId));
    }
}
