package com.jfeat.am.module.workflow.api.crud;

import com.jfeat.am.core.jwt.JWTKit;
import com.jfeat.am.module.log.annotation.BusinessLog;
import com.jfeat.am.module.workflow.constant.*;
import com.jfeat.am.module.workflow.listener.InstanceChangeListenerRegister;
import com.jfeat.am.module.workflow.services.crud.service.ProcessInstanceService;
import com.jfeat.am.module.workflow.services.crud.service.ProcessService;
import com.jfeat.am.module.workflow.services.crud.service.ProcessStepService;
import com.jfeat.am.module.workflow.services.crud.service.TaskService;
import com.jfeat.am.module.workflow.services.domain.dao.QueryProcessInstanceDao;
import com.jfeat.am.module.workflow.services.domain.model.TaskModel;
import com.jfeat.am.module.workflow.services.domain.service.QueryTaskService;
import com.jfeat.am.module.workflow.services.persistence.dao.TaskMapper;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;
import com.jfeat.am.module.workflow.services.persistence.model.Task;
import com.jfeat.crud.base.tips.SuccessTip;
import com.jfeat.crud.base.tips.Tip;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.Date;

/**
 * <p>
 * api
 * </p>
 *
 * @author Code Generator
 * @since 2017-10-25
 */

@RestController
@RequestMapping("/api/wf/tasks")
public class TaskEndpoint  {

    @Resource
    TaskService taskService;

    @Resource
    ProcessInstanceService processInstanceService;

    @Resource
    ProcessService processService;

    @Resource
    ProcessStepService processStepService;

    @Resource
    QueryTaskService queryTaskService;

    @Resource
    InstanceChangeListenerRegister instanceStatusChangeListenerRegister;
    @Resource
    QueryProcessInstanceDao queryProcessInstanceDao;

    @Resource
    TaskMapper taskMapper;


    @PostMapping
    @BusinessLog(name = "任务",value = "新增任务")
    public Tip createTask(@RequestBody Task entity) {
        Long userId = JWTKit.getUserId();
        entity.setUserId(userId);
        entity.setId(null);
        return new SuccessTip(taskMapper.insert(entity));
//        return SuccessTip.create(taskService.createMaster(entity));
    }

    @GetMapping("/{id}")
    public Tip getTask(@PathVariable Long id) {
        return SuccessTip.create(taskService.retrieveMaster(id));
    }

    @PutMapping("/{id}")
    @BusinessLog(name = "任务",value = "修改任务")
    public Tip updateTask(@PathVariable Long id, @RequestBody TaskModel taskModel) {
        Task originalTask = taskService.retrieveMaster(id);
        if (originalTask == null) {
            throw BizExceptionEnum.TASK_NOT_FOUND.createException();
        }

//        设置任务状态
        originalTask.setStatus(taskModel.getStatus());
        originalTask.setHandleTime(new Date());
        taskService.updateMaster(originalTask);

//        获取任务步骤
        ProcessStep processStep = processStepService.retrieveMaster(originalTask.getStepId());
        ProcessStepTypeEnum processStepStatus = ProcessStepTypeEnum.valueOf(processStep.getType());

//        获取任务实例 设置任务实例状态
        ProcessInstance processInstance = processInstanceService.retrieveMaster(originalTask.getProcessInstanceId());
        TaskStatusEnum taskStatus = TaskStatusEnum.valueOf(taskModel.getStatus());
        processInstance.setStatus(ProcessInstanceStatusEnum.VERIFYING.toString());


        if (taskStatus == TaskStatusEnum.HANDLED_APPROVED) {
            if (processStepStatus == ProcessStepTypeEnum.END) {
                processInstance.setStatus(ProcessInstanceStatusEnum.CLOSE_APPROVED.toString());
            } else {
                //pass to next step
                Task nextTask = new Task();
                nextTask.setUserId(taskModel.getUserId());
                nextTask.setStepId(taskModel.getStepId());
                nextTask.setProcessInstanceId(processInstance.getId());
                nextTask.setFormType(processInstance.getFormType());
                nextTask.setFormId(processInstance.getFormId());
                nextTask.setStatus(TaskStatusEnum.HANDLING.toString());
                nextTask.setName(processInstance.getName());
                taskMapper.insert(nextTask);
//                taskService.createMaster(nextTask);
            }
        } else {
            processInstance.setStatus(ProcessInstanceStatusEnum.CLOSE_REJECTED.toString());
        }
        processInstanceService.updateMaster(processInstance);
        instanceStatusChangeListenerRegister.handle(processInstance.getId());

        return SuccessTip.create(originalTask);
    }

    @GetMapping
    //此方法可能需要自行添加需要的参数,按需要使用
    public Tip queryTasks(
            @RequestParam(name = "pageNum", required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(name = "pageSize", required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long formId,
            @RequestParam(required = false) String status) {
        Long userId = JWTKit.getUserId();
        if(queryProcessInstanceDao.getRoleNameByUserId(userId).contains(WorkFlowManager.NAME)){
            userId=null;
        }
        return SuccessTip.create(queryTaskService.findTasks(pageNum, pageSize, userId, formId, status));
    }
}
