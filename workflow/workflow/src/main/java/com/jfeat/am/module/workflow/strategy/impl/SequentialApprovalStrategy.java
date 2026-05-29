package com.jfeat.am.module.workflow.strategy.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.jfeat.am.module.base.services.service.TicketAttachmentItemService;
import com.jfeat.am.module.workflow.constant.BizExceptionEnum;
import com.jfeat.am.module.workflow.constant.ProcessInstanceStatusEnum;
import com.jfeat.am.module.workflow.constant.ProcessStepTypeEnum;
import com.jfeat.am.module.workflow.constant.TaskStatusEnum;
import com.jfeat.am.module.workflow.constant.WorkFlowManager;
import com.jfeat.am.module.workflow.listener.InstanceChangeListenerRegister;
import com.jfeat.am.module.workflow.services.crud.service.HistoryService;
import com.jfeat.am.module.workflow.services.crud.service.ProcessInstanceService;
import com.jfeat.am.module.workflow.services.crud.service.ProcessStepService;
import com.jfeat.am.module.workflow.services.domain.dao.QueryProcessInstanceDao;
import com.jfeat.am.module.workflow.services.persistence.model.History;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;
import com.jfeat.am.module.workflow.strategy.ApprovalRequest;
import com.jfeat.am.module.workflow.strategy.ApprovalStrategy;
import com.jfeat.crud.base.exception.BusinessException;
import com.jfeat.crud.base.util.StrKit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.Date;
import java.util.List;

/**
 * 顺序审批策略
 * 处理单人审批的普通步骤(START, MIDDLE, END节点)
 *
 * @author Code Generator
 * @date 2026-02-14
 */
@Component
public class SequentialApprovalStrategy implements ApprovalStrategy {

    private static final Logger logger = LoggerFactory.getLogger(SequentialApprovalStrategy.class);

    @Resource
    private ProcessInstanceService processInstanceService;

    @Resource
    private ProcessStepService processStepService;

    @Resource
    private HistoryService historyService;

    @Resource
    private InstanceChangeListenerRegister instanceChangeListenerRegister;

    @Resource
    private TicketAttachmentItemService ticketAttachmentItemService;

    @Resource
    private QueryProcessInstanceDao queryProcessInstanceDao;

    @Override
    public ProcessInstance handle(ProcessInstance instance, ApprovalRequest request) {
        // 验证权限
        validatePermission(instance, request);

        // 获取当前步骤
        ProcessStep currentStep = processStepService.retrieveMaster(instance.getCurrentStepId());
        if (currentStep == null || !instance.getProcessId().equals(currentStep.getProcessId())) {
            logger.error("process step not found. step = {}", instance.getCurrentStepId());
            throw BizExceptionEnum.PROCESS_STEP_NOT_FOUND.createException();
        }

        // 如果步骤中有配置执行人，则自动设置办理人
        if (currentStep.getCurrentUserId() != null) {
            request.setNextUserId(currentStep.getCurrentUserId());
            request.setNextUserName(currentStep.getCurrentUserName());
        }

        // 获取下一步骤
        ProcessStep nextStep = getNextStep(instance, request);

        // 处理审批逻辑
        return processApproval(instance, currentStep, nextStep, request);
    }

    @Override
    public boolean supports(ProcessStep step) {
        if (step == null || step.getType() == null) {
            return false;
        }
        // 支持普通步骤: START, MIDDLE, END
        ProcessStepTypeEnum stepType = ProcessStepTypeEnum.valueOf(step.getType());
        return stepType == ProcessStepTypeEnum.START
                || stepType == ProcessStepTypeEnum.MIDDLE
                || stepType == ProcessStepTypeEnum.END;
    }

    /**
     * 验证审批权限
     */
    private void validatePermission(ProcessInstance instance, ApprovalRequest request) {
        // 管理员不检查权限
        if (!request.getApproverId().equals(instance.getCurrentUserId())
                && !queryProcessInstanceDao.getRoleNameByUserId(request.getApproverId()).contains(WorkFlowManager.NAME)
                && !"admin".equals(request.getApproverName())) {
            throw BizExceptionEnum.PROCESS_INSTANCE_NO_PERMISSION.createException();
        }

        // 检查流程状态
        ProcessInstanceStatusEnum currentInstanceStatus = ProcessInstanceStatusEnum.valueOf(instance.getStatus());
        if (currentInstanceStatus == ProcessInstanceStatusEnum.CLOSE_APPROVED
                || currentInstanceStatus == ProcessInstanceStatusEnum.CLOSE_REJECTED) {
            logger.error("process instance already closed. {}", instance);
            throw BizExceptionEnum.PROCESS_INSTANCE_ALREADY_CLOSED.createException();
        }
    }

    /**
     * 获取下一步骤
     */
    private ProcessStep getNextStep(ProcessInstance instance, ApprovalRequest request) {
        ProcessStep nextStep = new ProcessStep();
        if (request.getNextStepId() != null) {
            nextStep = processStepService.retrieveMaster(request.getNextStepId());
            if (nextStep != null && !instance.getProcessId().equals(nextStep.getProcessId())) {
                logger.error("process next step not found. step = {}", nextStep);
                throw BizExceptionEnum.PROCESS_STEP_NOT_FOUND.createException();
            }
            if (nextStep == null) {
                nextStep = new ProcessStep();
            }
        }
        return nextStep;
    }

    /**
     * 处理审批核心逻辑
     */
    private ProcessInstance processApproval(ProcessInstance instance, ProcessStep currentStep,
                                           ProcessStep nextStep, ApprovalRequest request) {
        // 更新流程实例状态
        instance.setCurrentUserId(request.getNextUserId());
        instance.setCurrentUserName(request.getNextUserName());
        instance.setCurrentStepId(nextStep.getId());
        instance.setCurrentStepName(nextStep.getName());
        instance.setHandledSteps(pushHandled(instance.getHandledSteps(), currentStep.getId()));
        instance.setHandledUsers(pushHandled(instance.getHandledUsers(), request.getApproverId()));

        // 判断流程状态
        ProcessInstanceStatusEnum instanceStatus = ProcessInstanceStatusEnum.VERIFYING;
        TaskStatusEnum taskStatus = TaskStatusEnum.valueOf(request.getResult());
        ProcessStepTypeEnum currentStepType = ProcessStepTypeEnum.valueOf(currentStep.getType());

        if (currentStepType == ProcessStepTypeEnum.END) {
            instance.setCurrentUserId(null);
            instance.setCurrentUserName(null);
            instanceStatus = ProcessInstanceStatusEnum.CLOSE_APPROVED;
        }

        if (taskStatus == TaskStatusEnum.HANDLED_REJECTED) {
            instanceStatus = ProcessInstanceStatusEnum.CLOSE_REJECTED;
        }

        instance.setStatus(instanceStatus.toString());
        processInstanceService.updateAllColumn(instance);

        // 创建审批历史记录
        createHistory(instance, currentStep, request);

        // 触发监听器
        instanceChangeListenerRegister.handle(instance.getId());

        return instance;
    }

    /**
     * 创建审批历史记录
     */
    private void createHistory(ProcessInstance instance, ProcessStep currentStep, ApprovalRequest request) {
        History history = new History();
        history.setFormId(instance.getFormId());
        history.setFormType(instance.getFormType());
        history.setProcessId(instance.getProcessId());
        history.setProcessInstanceId(instance.getId());
        history.setProcessInstanceName(instance.getName());
        history.setStepId(currentStep.getId());
        history.setStepName(currentStep.getName());
        history.setUserId(request.getApproverId());
        history.setUserName(request.getApproverName());
        history.setComment(request.getNote());
        history.setResult(request.getResult());
        history.setHandleTime(new Date());
        historyService.createMaster(history);

        // 处理附件
        if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
            for (TicketAttachmentItem attachment : request.getAttachments()) {
                attachment.setTicketId(history.getId());
                ticketAttachmentItemService.create(attachment);
            }
        }
    }

    /**
     * 将已处理的步骤ID添加到处理记录中
     */
    private String pushHandled(String handledStr, Long id) {
        JSONArray array = new JSONArray();
        if (StrKit.notBlank(handledStr)) {
            array = JSON.parseArray(handledStr);
        }
        array.add(id);
        return array.toJSONString();
    }
}
