package com.jfeat.am.module.workflow.strategy.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.jfeat.am.module.base.services.service.TicketAttachmentItemService;
import com.jfeat.am.module.workflow.constant.BizExceptionEnum;
import com.jfeat.am.module.workflow.constant.ProcessInstanceStatusEnum;
import com.jfeat.am.module.workflow.constant.ProcessStepTypeEnum;
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

/**
 * 抄送审批策略
 * 处理抄送节点的审批逻辑
 * 抄送节点不需要审批，只需要通知相关人员
 *
 * @author Code Generator
 * @date 2026-02-14
 */
@Component
public class CopyApprovalStrategy implements ApprovalStrategy {

    private static final Logger logger = LoggerFactory.getLogger(CopyApprovalStrategy.class);

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

        // 抄送节点不需要审批人处理，直接推进到下一步
        return processCopyApproval(instance, currentStep, request);
    }

    @Override
    public boolean supports(ProcessStep step) {
        if (step == null || step.getType() == null) {
            return false;
        }
        // 支持抄送节点
        ProcessStepTypeEnum stepType = ProcessStepTypeEnum.valueOf(step.getType());
        return stepType == ProcessStepTypeEnum.COPY;
    }

    /**
     * 验证审批权限
     */
    private void validatePermission(ProcessInstance instance, ApprovalRequest request) {
        // 抄送节点权限检查相对宽松
        // 管理员或当前处理人可以操作
        if (!request.getApproverId().equals(instance.getCurrentUserId())
                && !queryProcessInstanceDao.getRoleNameByUserId(request.getApproverId()).contains(WorkFlowManager.NAME)
                && !"admin".equals(request.getApproverName())) {
            // 抄送节点可能不需要严格权限检查，根据实际业务需求调整
            logger.warn("Copy node accessed by non-approver: {}", request.getApproverName());
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
     * 处理抄送审批核心逻辑
     */
    private ProcessInstance processCopyApproval(ProcessInstance instance, ProcessStep currentStep,
                                                ApprovalRequest request) {
        // 创建抄送记录(作为历史记录保存)
        createCopyHistory(instance, currentStep, request);

        // 获取下一步骤
        ProcessStep nextStep = getNextStep(instance, request);

        // 更新流程实例，直接推进到下一步
        instance.setCurrentUserId(request.getNextUserId());
        instance.setCurrentUserName(request.getNextUserName());
        instance.setCurrentStepId(nextStep.getId());
        instance.setCurrentStepName(nextStep.getName());
        instance.setHandledSteps(pushHandled(instance.getHandledSteps(), currentStep.getId()));

        // 判断流程状态
        ProcessInstanceStatusEnum instanceStatus = ProcessInstanceStatusEnum.VERIFYING;
        ProcessStepTypeEnum nextStepType = ProcessStepTypeEnum.valueOf(nextStep.getType());

        if (nextStepType == ProcessStepTypeEnum.END) {
            instance.setCurrentUserId(null);
            instance.setCurrentUserName(null);
            instanceStatus = ProcessInstanceStatusEnum.CLOSE_APPROVED;
        }

        instance.setStatus(instanceStatus.toString());
        processInstanceService.updateAllColumn(instance);

        // 触发监听器
        instanceChangeListenerRegister.handle(instance.getId());

        return instance;
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
     * 创建抄送历史记录
     */
    private void createCopyHistory(ProcessInstance instance, ProcessStep currentStep, ApprovalRequest request) {
        // 为所有抄送人创建历史记录
        String handlerIds = currentStep.getHandlerIds();
        if (StrKit.isNotBlank(handlerIds)) {
            JSONArray copyUsers = JSON.parseArray(handlerIds);
            for (int i = 0; i < copyUsers.size(); i++) {
                History history = new History();
                history.setFormId(instance.getFormId());
                history.setFormType(instance.getFormType());
                history.setProcessId(instance.getProcessId());
                history.setProcessInstanceId(instance.getId());
                history.setProcessInstanceName(instance.getName());
                history.setStepId(currentStep.getId());
                history.setStepName(currentStep.getName());
                history.setUserId(copyUsers.getLong(i));
                history.setUserName("抄送人"); // 可以通过userId查询真实姓名
                history.setComment(request.getNote());
                history.setResult("COPY"); // 标记为抄送
                history.setHandleTime(new Date());
                historyService.createMaster(history);
            }
        }

        // 处理附件
        if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
            for (var attachment : request.getAttachments()) {
                attachment.setTicketId(instance.getId());
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
