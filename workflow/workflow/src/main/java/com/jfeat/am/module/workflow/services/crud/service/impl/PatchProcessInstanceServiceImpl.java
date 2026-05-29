package com.jfeat.am.module.workflow.services.crud.service.impl;


import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.jfeat.am.core.jwt.JWTKit;
import com.jfeat.am.module.base.services.persistence.model.TicketAttachmentItem;
import com.jfeat.am.module.base.services.service.TicketAttachmentItemService;
import com.jfeat.am.module.virtualForm.services.domain.enums.AuditType;
import com.jfeat.am.module.virtualForm.services.gen.persistence.model.VirtualForm;
import com.jfeat.am.module.workflow.constant.*;
import com.jfeat.am.module.workflow.listener.InstanceChangeListenerRegister;
import com.jfeat.am.module.workflow.services.crud.service.*;
import com.jfeat.am.module.workflow.services.domain.dao.QueryProcessDao;
import com.jfeat.am.module.workflow.services.domain.dao.QueryProcessInstanceDao;
import com.jfeat.am.module.workflow.services.domain.model.ProcessInstanceModel;
import com.jfeat.am.module.workflow.services.domain.model.ProcessStepModel;
import com.jfeat.am.module.workflow.services.crud.service.ProcessInstanceStepService;
import com.jfeat.am.module.workflow.services.domain.service.QueryHistoryService;
import com.jfeat.am.module.workflow.services.domain.service.QueryProcessInstanceService;
import com.jfeat.am.module.workflow.services.domain.service.QueryProcessStepService;
import com.jfeat.am.module.workflow.services.domain.model.ProcessInstanceStepModel;
import com.jfeat.am.module.workflow.services.persistence.dao.ProcessStepMapper;
import com.jfeat.am.module.workflow.services.persistence.model.*;
import com.jfeat.am.module.workflow.services.persistence.model.Process;
import com.jfeat.crud.base.exception.BusinessCode;
import com.jfeat.crud.base.exception.BusinessException;
import com.jfeat.crud.base.util.StrKit;
import com.jfeat.crud.plus.CRUD;
import com.jfeat.eav.services.domain.model.EavIds;
import com.jfeat.eav.services.domain.service.EavEntityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import com.jfeat.am.module.workflow.services.crud.service.PatchProcessInstanceService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;
import java.util.Date;
import java.util.List;
import java.util.Optional;

/**
 * Created by Code Generator on 2017-10-25
 */
@Service
public class PatchProcessInstanceServiceImpl implements PatchProcessInstanceService {

    private static Logger logger = LoggerFactory.getLogger(PatchProcessInstanceService.class);

    @Resource
    ProcessService processService;

    @Resource
    ProcessStepService processStepService;

    @Resource
    ProcessInstanceService processInstanceService;

    @Resource
    HistoryService historyService;

    @Resource
    QueryProcessStepService queryProcessStepService;

    @Resource
    QueryProcessInstanceService queryProcessInstanceService;

    @Resource
    QueryHistoryService queryHistoryService;

    @Resource
    InstanceChangeListenerRegister instanceChangeListenerRegister;

    @Resource
    TicketAttachmentItemService ticketAttachmentItemService;

    @Resource
    QueryProcessInstanceDao queryProcessInstanceDao;

    @Resource
    EavEntityService eavEntityService;
    @Resource
    CodeGenService codeGenService;

    @Resource
    QueryProcessDao queryProcessDao;

    @Resource
    ProcessInstanceStepService processInstanceStepService;

    @Resource
    ProcessStepMapper processStepMapper;

    @Resource
    PatchProcessInstanceService patchProcessInstanceService;

    @Override
    @Transactional
    public ProcessInstance createProcessInstance(Long userId, String userName, ProcessInstanceModel entity) {


        Process process = processService.retrieveMaster(entity.getProcessId());
        if(StringUtils.isEmpty(entity.getName())){entity.setName(process.getName());}

        if(process == null) {
            logger.error("process not found. processId = {}", entity.getProcessId());
            throw BizExceptionEnum.PROCESS_NOT_FOUND.createException();
        }
        if (process.getStatus().equals(ProcessStatusEnum.DISABLED.toString())) {
            logger.error("process disabled. processId = {}", process.getId());
            throw BizExceptionEnum.PROCESS_DISABLED.createException();
        }
        //获取code定义 生成code 设置code 和自增值
        String codeRule = process.getCodeRule();
        CodeBody codeBody = codeGenService.genCode(codeRule, process.getName());
        entity.setCode(codeBody.getCode());
        entity.setAutoCode(codeBody.getAutoNumber());

        List<ProcessStep> steps = queryProcessStepService.findProcessSteps(entity.getProcessId(), null);
        Optional<ProcessStep> firstStep = steps.stream().filter(item -> item.getType().equals(ProcessStepTypeEnum.START.toString())).findFirst();
        if (!firstStep.isPresent()) {
            logger.error("process START step not found.");
            throw BizExceptionEnum.PROCESS_STEP_NOT_FOUND.createException();
        }

        ProcessInstance processInstance = queryProcessInstanceService.getProcessInstanceByFormId(entity.getFormId(),process.getFormType());
        if (processInstance == null) {
            processInstance = new ProcessInstance();
            processInstance.setCode(entity.getCode());
            processInstance.setAutoCode(entity.getAutoCode());
            processInstance.setCreatorId(userId);
            processInstance.setCreator(userName);
            processInstance.setExecutorId(entity.getExecutorId());
            processInstance.setExecutor(entity.getExecutor());
            processInstance.setCurrentStepId(entity.getCurrentStepId());
            processInstance.setCurrentStepName(entity.getCurrentStepName());
            processInstance.setCurrentUserId(entity.getCurrentUserId());
            processInstance.setCurrentUserName(entity.getCurrentUserName());
            processInstance.setFormId(entity.getFormId());
            processInstance.setFormType(entity.getFormType());
            processInstance.setFormGroup(process.getFormGroup());
            processInstance.setProcessId(entity.getProcessId());
            processInstance.setName(entity.getName());
            processInstance.setStatus(ProcessInstanceStatusEnum.START.toString());
            processInstance.setCreateTime(new Date());
            processInstance.setOrgId(JWTKit.getTenantOrgId()==null?JWTKit.getOrgId():JWTKit.getTenantOrgId());
//            processInstanceService.createMaster(processInstance);
            queryProcessInstanceDao.insertProcessInstance(processInstance);

        }
        return submit(processInstance.getId(), userId, userName, entity);
    }

    @Transactional
    public ProcessInstance submit(Long instanceId, Long userId, String account, ProcessInstanceModel entity) {
        ProcessInstance processInstance = processInstanceService.retrieveMaster(instanceId);
        if (processInstance == null) {
            throw BizExceptionEnum.PROCESS_INSTANCE_NOT_FOUND.createException();
        }
        //判断用户权限时 过滤管理员
        if (!userId.equals(processInstance.getCreatorId())
                &&!queryProcessInstanceDao.getRoleNameByUserId(userId).contains(WorkFlowManager.NAME)) {
            throw BizExceptionEnum.PROCESS_INSTANCE_NO_PERMISSION.createException();
        }

        ProcessInstanceStatusEnum currentInstanceStatus = ProcessInstanceStatusEnum.valueOf(processInstance.getStatus());
        if (currentInstanceStatus != ProcessInstanceStatusEnum.START) {
            logger.error("process instance not in START status. {}", processInstance);
            throw BizExceptionEnum.PROCESS_INSTANCE_CANNOT_SUBMIT.createException();
        }

        ProcessStep step = processStepService.retrieveMaster(entity.getCurrentStepId());
        if (step == null) {
            logger.error("process START step not found. {}", entity.getCurrentStepId());
            throw BizExceptionEnum.PROCESS_STEP_NOT_FOUND.createException();
        }

        processInstance.setCreatorId(userId);
        processInstance.setCreator(account);
        processInstance.setExecutorId(entity.getExecutorId());
        processInstance.setExecutor(entity.getExecutor());
        processInstance.setCurrentStepId(step.getId());
        processInstance.setCurrentStepName(step.getName());
        processInstance.setCurrentUserId(entity.getCurrentUserId());
        processInstance.setCurrentUserName(entity.getCurrentUserName());
        processInstance.setName(entity.getName());
        processInstance.setStatus(ProcessInstanceStatusEnum.VERIFYING.toString());
        processInstanceService.updateMaster(processInstance);

        ProcessInstance instance = processInstanceService.retrieveMaster(processInstance.getId());
        instanceChangeListenerRegister.handle(instance.getId());


        History history = new History();
        history.setFormId(instance.getFormId());
        history.setFormType(instance.getFormType());
        history.setProcessId(instance.getProcessId());
        history.setProcessInstanceId(instance.getId());
        history.setProcessInstanceName(instance.getName());
        history.setUserId(userId);
        history.setUserName(account);
        history.setComment(entity.getNote());
        history.setResult(TaskStatusEnum.INITED.toString());
        history.setHandleTime(new Date());
        historyService.createMaster(history);

//        对附件进行处理
        List<TicketAttachmentItem> ticketAttachmentItems = entity.getAttachments();
        if (ticketAttachmentItems != null && ticketAttachmentItems.size() > 0){
            for (TicketAttachmentItem ticketAttachmentItem:ticketAttachmentItems){
                ticketAttachmentItem.setTicketId(history.getId());
                ticketAttachmentItemService.create(ticketAttachmentItem);
            }
        }
        return instance;
    }

    @Override
    public ProcessInstance approve(Long instanceId, Long approverId, String approverName,
                                   Long nextStepId, Long nextUserId, String nextUserName, String note,List<TicketAttachmentItem> ticketAttachmentItems) {
        return handle(instanceId, approverId, approverName, nextStepId, nextUserId, nextUserName, TaskStatusEnum.HANDLED_APPROVED.toString(), note,ticketAttachmentItems);
    }

    @Override
    public ProcessInstance reject(Long instanceId, Long approverId, String approverName,
                                   Long nextStepId, Long nextUserId, String nextUserName, String note,List<TicketAttachmentItem> ticketAttachmentItems) {
        return handle(instanceId, approverId, approverName, null, nextUserId, nextUserName, TaskStatusEnum.HANDLED_REJECTED.toString(), note,ticketAttachmentItems);
    }


    @Transactional
    public ProcessInstance handle(Long instanceId, Long approverId, String approverName,
                                  Long nextStepId, Long nextUserId, String nextUserName,
                                  String result, String note, List<TicketAttachmentItem> ticketAttachmentItems) {

        ProcessInstance instance = processInstanceService.retrieveMaster(instanceId);
        if (instance == null) {
            throw BizExceptionEnum.PROCESS_INSTANCE_NOT_FOUND.createException();
        }
        //管理员不检查权限
        if (!approverId.equals(instance.getCurrentUserId())
                &&!queryProcessInstanceDao.getRoleNameByUserId(approverId).contains(WorkFlowManager.NAME)
                &&!"admin".equals(approverName)) {
            throw BizExceptionEnum.PROCESS_INSTANCE_NO_PERMISSION.createException();
        }

        ProcessInstanceStatusEnum currentInstanceStatus = ProcessInstanceStatusEnum.valueOf(instance.getStatus());
        if (currentInstanceStatus == ProcessInstanceStatusEnum.CLOSE_APPROVED
                || currentInstanceStatus == ProcessInstanceStatusEnum.CLOSE_REJECTED) {
            logger.error("process instance already closed. {}", instance);
            throw BizExceptionEnum.PROCESS_INSTANCE_ALREADY_CLOSED.createException();
        }
        ProcessStepModel currentStep = processStepService.selectModel(instance.getCurrentStepId());
        //ProcessStep currentStep = processStepService.retrieveMaster(instance.getCurrentStepId());
        if (currentStep == null || !instance.getProcessId().equals(currentStep.getProcessId())) {
            logger.error("process step not found. step = {}", currentStep);
            throw BizExceptionEnum.PROCESS_STEP_NOT_FOUND.createException();
        }

        //如果步骤中有配置执行人，则自动设置办理人
        if(currentStep.getCurrentUserId()!=null){
            nextUserId = currentStep.getCurrentUserId();
            nextUserName = currentStep.getCurrentUserName();
        }

/*        if (nextStepId != null &&
                StrKit.notBlank(currentStep.getNextSteps()) &&
                !currentStep.getNextSteps().contains(nextStepId.toString())) {
            logger.error("{} is not the next step of {}", nextStepId, currentStep.getId());
            throw BizExceptionEnum.PROCESS_STEP_NOT_FOUND.createException();
        }*/

        ProcessStep nextStep = new ProcessStep();
        if (nextStepId != null) {
            nextStep = processStepService.retrieveMaster(nextStepId);
            if (nextStep != null && !instance.getProcessId().equals(nextStep.getProcessId())) {
                logger.error("process next step not found. step = {}", nextStep);
                throw BizExceptionEnum.PROCESS_STEP_NOT_FOUND.createException();
            }
            if (nextStep == null) {
                nextStep = new ProcessStep();
            }
        }



        ////// start processing
        instance.setCurrentUserId(nextUserId);
        instance.setCurrentUserName(nextUserName);
        instance.setCurrentStepId(nextStep.getId());
        instance.setCurrentStepName(nextStep.getName());
        instance.setHandledSteps(pushHandled(instance.getHandledSteps(), currentStep.getId()));
        instance.setHandledUsers(pushHandled(instance.getHandledUsers(), approverId));

        ProcessInstanceStatusEnum instanceStatus = ProcessInstanceStatusEnum.VERIFYING;
        TaskStatusEnum taskStatus = TaskStatusEnum.valueOf(result);
        ProcessStepTypeEnum currentStepStatus = ProcessStepTypeEnum.valueOf(currentStep.getType());
        if (currentStepStatus == ProcessStepTypeEnum.END) {
            instance.setCurrentUserId(null);
            instance.setCurrentUserName(null);
            instanceStatus = ProcessInstanceStatusEnum.CLOSE_APPROVED;
        }
        if (taskStatus == TaskStatusEnum.HANDLED_REJECTED) {
            instanceStatus = ProcessInstanceStatusEnum.CLOSE_REJECTED;
        }

        instance.setStatus(instanceStatus.toString());
        processInstanceService.updateAllColumn(instance);

        History history = new History();
        history.setFormId(instance.getFormId());
        history.setFormType(instance.getFormType());
        history.setProcessId(instance.getProcessId());
        history.setProcessInstanceId(instance.getId());
        history.setProcessInstanceName(instance.getName());
        history.setStepId(currentStep.getId());
        history.setStepName(currentStep.getName());
        history.setUserId(approverId);
        history.setUserName(approverName);
        history.setComment(note);
        history.setResult(result);
        history.setHandleTime(new Date());
        historyService.createMaster(history);

        //        对附件进行处理
        if (ticketAttachmentItems != null && ticketAttachmentItems.size() > 0){
            for (TicketAttachmentItem ticketAttachmentItem:ticketAttachmentItems){
                ticketAttachmentItem.setTicketId(history.getId());
                ticketAttachmentItemService.create(ticketAttachmentItem);
            }
        }

        instanceChangeListenerRegister.handle(instance.getId());

        return instance;
    }

    /**
     * 回退到上一步骤
     * @param userId
     * @param account
     * @param comment
     * @param instanceId
     */
    @Override
    @Transactional
    public ProcessInstance rollback(Long instanceId, Long userId, String account, String comment) {
        ProcessInstance processInstance = processInstanceService.retrieveMaster(instanceId);
        if (processInstance == null) {
            throw BizExceptionEnum.PROCESS_INSTANCE_NOT_FOUND.createException();
        }
        //同时过滤流程管理员
        if (!userId.equals(processInstance.getCurrentUserId())
                &&!queryProcessInstanceDao.getRoleNameByUserId(userId).contains(WorkFlowManager.NAME)) {
            throw BizExceptionEnum.PROCESS_INSTANCE_NO_PERMISSION.createException();
        }

        ProcessInstanceStatusEnum currentInstanceStatus = ProcessInstanceStatusEnum.valueOf(processInstance.getStatus());
        if (currentInstanceStatus == ProcessInstanceStatusEnum.CLOSE_APPROVED
                || currentInstanceStatus == ProcessInstanceStatusEnum.CLOSE_REJECTED) {
            logger.error("process instance already closed. {}", processInstance);
            throw BizExceptionEnum.PROCESS_INSTANCE_ALREADY_CLOSED.createException();
        }
        if (currentInstanceStatus == ProcessInstanceStatusEnum.START) {
            logger.error("process instance in the START status, can't rollback. {}", processInstance);
            throw BizExceptionEnum.PROCESS_INSTANCE_CANNOT_ROLLBACK.createException();
        }

        Long previousStepId = getPreviousHandled(processInstance.getHandledSteps());
        Long previousUserId = getPreviousHandled(processInstance.getHandledUsers());
        ProcessStep previousStep = new ProcessStep();
        History history = new History();
        ProcessInstanceStatusEnum processInstanceStatus = ProcessInstanceStatusEnum.VERIFYING;

        if (previousStepId == null) {
            logger.debug("rollback to init status.");
            processInstanceStatus = ProcessInstanceStatusEnum.START;
        }
        else {
            previousStep = processStepService.retrieveMaster(previousStepId);
            if (previousStep == null) {
                logger.error("previous step not found. {}", previousStepId);
                throw BizExceptionEnum.PROCESS_STEP_NOT_FOUND.createException();
            }
        }

        if (previousStepId != null && previousUserId != null) {
            history = queryHistoryService.getHistory(processInstance.getFormId(), previousStepId, previousUserId,null);
            if (history == null) {
                logger.error("process history not found. formId = {}, stepId = {}, userId = {}", processInstance.getFormId(), previousStepId, previousUserId);
                throw BizExceptionEnum.HISTORY_NOT_FOUND.createException();
            }
            if (!history.getProcessInstanceId().equals(instanceId)) {
                logger.error("invalid history. instanceId = {}, history's instanceId = {}", instanceId, history.getProcessInstanceId());
                throw BizExceptionEnum.HISTORY_INVALID.createException();
            }
        }


        //////// start processing

        History rollbackHistory = new History();
        rollbackHistory.setProcessInstanceId(processInstance.getId());
        rollbackHistory.setProcessInstanceName(processInstance.getName());
        rollbackHistory.setFormId(processInstance.getFormId());
        rollbackHistory.setFormType(processInstance.getFormType());
        rollbackHistory.setProcessId(processInstance.getProcessId());
        rollbackHistory.setStepId(processInstance.getCurrentStepId());
        rollbackHistory.setStepName(processInstance.getCurrentStepName());
        rollbackHistory.setUserId(userId);
        rollbackHistory.setUserName(account);
        rollbackHistory.setComment(comment);
        rollbackHistory.setHandleTime(new Date());
        rollbackHistory.setResult(TaskStatusEnum.HANDLED_ROLLBACK.toString());
        historyService.createMaster(rollbackHistory);

        processInstance.setStatus(processInstanceStatus.toString());
        processInstance.setCurrentStepId(previousStep.getId());
        processInstance.setCurrentStepName(previousStep.getName());
        processInstance.setCurrentUserId(history.getUserId());
        processInstance.setCurrentUserName(history.getUserName());
        processInstance.setHandledSteps(popHandled(processInstance.getHandledSteps()));
        processInstance.setHandledUsers(popHandled(processInstance.getHandledUsers()));
        processInstanceService.updateAllColumn(processInstance);

        instanceChangeListenerRegister.handle(processInstance.getId());

        return processInstance;
    }

    /**
     * 回退到指定步骤（增强版回退方法）
     * 支持回退到任意已处理步骤，包含权限验证、原因验证、中间步骤清理等功能
     *
     * @param instanceId 流程实例ID
     * @param userId 操作人ID
     * @param userName 操作人名称
     * @param targetStepId 目标步骤ID（null表示回退到开始状态）
     * @param reason 回退原因（必填，至少5个字符）
     * @return 更新后的流程实例
     */
    @Override
    @Transactional
    public ProcessInstance rollbackToStep(Long instanceId, Long userId, String userName,
                                    Long targetStepId, String reason) {
        // 1. 权限验证
        validateRollbackPermission(instanceId, userId, targetStepId);

        // 2. 原因验证
        validateRollbackReason(reason);

        // 3. 获取流程实例
        ProcessInstance processInstance = processInstanceService.retrieveMaster(instanceId);
        if (processInstance == null) {
            throw BizExceptionEnum.PROCESS_INSTANCE_NOT_FOUND.createException();
        }

        // 4. 状态验证
        ProcessInstanceStatusEnum currentStatus = ProcessInstanceStatusEnum.valueOf(processInstance.getStatus());
        if (currentStatus == ProcessInstanceStatusEnum.CLOSE_APPROVED
                || currentStatus == ProcessInstanceStatusEnum.CLOSE_REJECTED) {
            logger.error("process instance already closed. {}", processInstance);
            throw BizExceptionEnum.PROCESS_INSTANCE_ALREADY_CLOSED.createException();
        }
        if (currentStatus == ProcessInstanceStatusEnum.START) {
            logger.error("process instance in the START status, can't rollback. {}", processInstance);
            throw BizExceptionEnum.PROCESS_INSTANCE_CANNOT_ROLLBACK.createException();
        }

        // 5. 处理目标步骤
        ProcessStep targetStep = null;
        ProcessInstanceStatusEnum newStatus = ProcessInstanceStatusEnum.VERIFYING;
        History targetHistory = null;

        if (targetStepId == null) {
            // 回退到初始状态
            newStatus = ProcessInstanceStatusEnum.START;
            processInstance.setCurrentStepId(null);
            processInstance.setCurrentStepName(null);
            processInstance.setCurrentUserId(null);
            processInstance.setCurrentUserName(null);
        } else {
            // 回退到指定步骤
            targetStep = processStepService.retrieveMaster(targetStepId);
            if (targetStep == null) {
                logger.error("target step not found. stepId = {}", targetStepId);
                throw BizExceptionEnum.PROCESS_STEP_NOT_FOUND.createException();
            }

            // 查找目标步骤的历史记录以获取处理人信息
            String handledSteps = processInstance.getHandledSteps();
            String handledUsers = processInstance.getHandledUsers();

            if (StringUtils.hasText(handledSteps) && StringUtils.hasText(handledUsers)) {
                JSONArray stepsArray = JSON.parseArray(handledSteps);
                JSONArray usersArray = JSON.parseArray(handledUsers);

                // 找到目标步骤的索引
                int targetIndex = -1;
                for (int i = 0; i < stepsArray.size(); i++) {
                    if (stepsArray.getLong(i).equals(targetStepId)) {
                        targetIndex = i;
                        break;
                    }
                }

                if (targetIndex == -1) {
                    throw new BusinessException("目标步骤不在已处理步骤中，无法回退");
                }

                // 获取目标步骤的处理人
                Long targetUserId = usersArray.getLong(targetIndex);
                targetHistory = queryHistoryService.getHistory(
                        processInstance.getFormId(), targetStepId, targetUserId, null);

                if (targetHistory == null) {
                    logger.error("process history not found. formId = {}, stepId = {}, userId = {}",
                            processInstance.getFormId(), targetStepId, targetUserId);
                    throw BizExceptionEnum.HISTORY_NOT_FOUND.createException();
                }
                if (!targetHistory.getProcessInstanceId().equals(instanceId)) {
                    logger.error("invalid history. instanceId = {}, history's instanceId = {}",
                            instanceId, targetHistory.getProcessInstanceId());
                    throw BizExceptionEnum.HISTORY_INVALID.createException();
                }

                // 设置当前步骤和处理人
                processInstance.setCurrentStepId(targetStep.getId());
                processInstance.setCurrentStepName(targetStep.getName());
                processInstance.setCurrentUserId(targetHistory.getUserId());
                processInstance.setCurrentUserName(targetHistory.getUserName());
            } else {
                throw new BusinessException("没有已处理的步骤可以回退");
            }
        }

        // 6. 清理中间步骤
        cleanUpIntermediateSteps(processInstance, targetStepId);

        // 7. 更新状态
        processInstance.setStatus(newStatus.toString());
        processInstanceService.updateAllColumn(processInstance);

        // 8. 记录回退历史
        recordRollbackHistory(processInstance, userId, userName, targetStep, reason);

        // 9. 触发监听器
        instanceChangeListenerRegister.handle(processInstance.getId());

        return processInstance;
    }

    /**
     * 验证回退权限
     * 只有以下用户可以执行回退操作：
     * 1. 流程管理员
     * 2. 当前审批人（如果指定目标步骤，目标步骤必须在已处理步骤中）
     *
     * @param instanceId 流程实例ID
     * @param userId 用户ID
     * @param targetStepId 目标步骤ID（null表示回退到开始状态）
     */
    private void validateRollbackPermission(Long instanceId, Long userId, Long targetStepId) {
        ProcessInstance instance = processInstanceService.retrieveMaster(instanceId);
        if (instance == null) {
            throw BizExceptionEnum.PROCESS_INSTANCE_NOT_FOUND.createException();
        }

        // 1. 流程管理员可以回退
        if (queryProcessInstanceDao.getRoleNameByUserId(userId).contains(WorkFlowManager.NAME)) {
            return;
        }

        // 2. 当前审批人可以回退
        if (userId.equals(instance.getCurrentUserId())) {
            // 如果指定了目标步骤，需要验证是在已处理步骤中
            if (targetStepId != null) {
                String handledSteps = instance.getHandledSteps();
                if (StringUtils.hasText(handledSteps)) {
                    JSONArray stepsArray = JSON.parseArray(handledSteps);
                    boolean found = false;
                    for (int i = 0; i < stepsArray.size(); i++) {
                        if (stepsArray.getLong(i).equals(targetStepId)) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        throw new BusinessException("无权限回退到该步骤，目标步骤不在已处理步骤中");
                    }
                } else {
                    throw new BusinessException("没有已处理的步骤可以回退");
                }
            }
            return;
        }

        throw new BusinessException("无权限执行回退操作，只有当前审批人或流程管理员可以回退");
    }

    /**
     * 验证回退原因
     * 回退原因不能为空且长度至少5个字符
     *
     * @param reason 回退原因
     */
    private void validateRollbackReason(String reason) {
        if (!StringUtils.hasText(reason)) {
            throw new BusinessException("回退原因不能为空");
        }
        if (reason.trim().length() < 5) {
            throw new BusinessException("回退原因至少需要5个字符");
        }
    }

    /**
     * 清理中间步骤
     * 回退时移除目标步骤之后的所有步骤记录
     *
     * @param instance 流程实例
     * @param targetStepId 目标步骤ID（null表示清空所有）
     */
    private void cleanUpIntermediateSteps(ProcessInstance instance, Long targetStepId) {
        String handledSteps = instance.getHandledSteps();
        String handledUsers = instance.getHandledUsers();

        if (!StringUtils.hasText(handledSteps)) {
            return;
        }

        JSONArray stepsArray = JSON.parseArray(handledSteps);
        JSONArray usersArray = StringUtils.hasText(handledUsers) ? JSON.parseArray(handledUsers) : new JSONArray();

        // 找到目标步骤的索引
        int targetIndex = -1;
        if (targetStepId != null) {
            for (int i = 0; i < stepsArray.size(); i++) {
                if (stepsArray.getLong(i).equals(targetStepId)) {
                    targetIndex = i;
                    break;
                }
            }
        }

        // 移除目标步骤之后的所有步骤
        if (targetIndex >= 0) {
            JSONArray newSteps = new JSONArray();
            JSONArray newUsers = new JSONArray();
            for (int i = 0; i <= targetIndex; i++) {
                newSteps.add(stepsArray.get(i));
                if (i < usersArray.size()) {
                    newUsers.add(usersArray.get(i));
                }
            }

            instance.setHandledSteps(newSteps.toJSONString());
            instance.setHandledUsers(newUsers.toJSONString());
        } else if (targetStepId == null) {
            // 回退到初始状态，清空所有
            instance.setHandledSteps(null);
            instance.setHandledUsers(null);
        }
    }

    /**
     * 记录回退历史
     * 在wf_history表中记录回退操作的详细信息
     *
     * @param instance 流程实例
     * @param userId 操作人ID
     * @param userName 操作人名称
     * @param targetStep 目标步骤（null表示回退到开始状态）
     * @param reason 回退原因
     */
    private void recordRollbackHistory(ProcessInstance instance, Long userId,
                                       String userName, ProcessStep targetStep, String reason) {
        History rollbackHistory = new History();
        rollbackHistory.setProcessInstanceId(instance.getId());
        rollbackHistory.setProcessInstanceName(instance.getName());
        rollbackHistory.setFormId(instance.getFormId());
        rollbackHistory.setFormType(instance.getFormType());
        rollbackHistory.setProcessId(instance.getProcessId());

        // 记录原步骤信息（回退前的步骤）
        rollbackHistory.setStepId(instance.getCurrentStepId());
        rollbackHistory.setStepName(instance.getCurrentStepName());

        // 记录目标步骤信息（回退后的步骤）
        rollbackHistory.setPreviousStepId(targetStep != null ? targetStep.getId() : null);
        rollbackHistory.setPreviousStepName(targetStep != null ? targetStep.getName() : null);

        rollbackHistory.setUserId(userId);
        rollbackHistory.setUserName(userName);
        rollbackHistory.setComment("回退原因: " + reason);
        rollbackHistory.setResult(TaskStatusEnum.HANDLED_ROLLBACK.toString());
        rollbackHistory.setHandleTime(new Date());
        historyService.createMaster(rollbackHistory);
    }

    private String pushHandled(String handledStr, Long id) {
        JSONArray array = new JSONArray();
        if (StrKit.notBlank(handledStr)) {
            array = JSON.parseArray(handledStr);
        }
        array.add(id);
        return array.toJSONString();
    }

    private String popHandled(String handledStr) {
        JSONArray array = new JSONArray();
        if (StrKit.notBlank(handledStr)) {
            array = JSON.parseArray(handledStr);
            if (array.size() > 0) {
                array.remove(array.size() - 1);
            }
        }
        return array.toJSONString();
    }

    private Long getPreviousHandled(String handledStr) {
        if (StrKit.notBlank(handledStr)) {
            JSONArray array = JSON.parseArray(handledStr);
            if (array.size() > 0) {
                return array.getLong(array.size() - 1);
            }
        }
        return null;
    }


    @Transactional
    @Override
    public Integer createInstanceAndFormValue(JSONObject request){
        return  instanceAndFormValue(request,false);
    }

    //根据实例id推进进度
    @Transactional
    @Override
    public Integer pushInstanceAndCreateFormValue(JSONObject request) {
        return  instanceAndFormValue(request,true);
    }

    public Integer instanceAndFormValue(JSONObject request,Boolean pushFlag){
        ProcessStepModel step = null;
        Long rowId = null;
        Long instanceId = null;
        Integer i = 0;
        Long entityId = null;
        Long processId = null;
        ProcessInstanceModel entity = null;
        Long userId = JWTKit.getUserId();
//        System.out.println("userId"+userId);
//        Long userId =1L;
        String account = JWTKit.getAccount();
        VirtualForm virtualForm = new VirtualForm();
        //审核情况
        String auditInfo = request.getString("auditInfo");
        //默认设置为 通过
        if(StringUtils.isEmpty(auditInfo)){
            auditInfo = AuditType.APPROVE;
        }
        /****************************参数初始化*******************************/
        if(pushFlag){
            instanceId = request.getLong("id");
            ProcessInstance instance = queryProcessInstanceDao.selectById(instanceId);
            //这里的currentStepId和request中的currentStepId不同在于 一个是用户提交选择的下一步，一个是当前流程的下一步（上一步的时候用户选择的下一步）
            entityId = queryProcessInstanceDao.getEntityIdByCurrentId(instance.getCurrentStepId());
            ProcessStep processStep = processStepMapper.selectById(instance.getCurrentStepId());
            virtualForm = queryProcessInstanceDao.getVirtualFormByCurrentId(instance.getCurrentStepId());
            step = CRUD.castObject(processStep,ProcessStepModel.class);
        }else{
            entity = CRUD.castObject(request,ProcessInstanceModel.class);
            processId = entity.getProcessId();
            entityId = queryProcessDao.getEntityIdByProcess(processId);
            virtualForm = queryProcessDao.getVirtualFormByProcess(processId);
            step = processStepService.getStartStep(processId);
        }



        //新建前检查是否已存在
        ProcessInstanceStepModel processInstanceStepModel = checkHasStepValue(step, instanceId);
        /****************************表单数据维护*******************************/
        //审核为通过才对表单进行处理  且 entityId不为空
        if(auditInfo.equals(AuditType.APPROVE) && entityId!=null){
            if(StringUtils.isEmpty(virtualForm.getDesignData())){
                //空表单

            }else{
                if(processInstanceStepModel!=null ){
                    //更新表单
                    EavIds eavIds = new EavIds();
                    eavIds.setRowStringId(processInstanceStepModel.getRowId().toString());
                    eavIds.setEntityStringId(entityId.toString());
                    Long aLong = eavEntityService.updateValue(eavIds, request);
                    rowId = processInstanceStepModel.getRowId();
                }else{
                    //新增表单数据
                    rowId = eavEntityService.createValue(entityId, request,true);
                    if(rowId == null){throw new BusinessException(BusinessCode.CRUD_GENERAL_ERROR,"未成功插入表单数据"); }

                }
            }

       }


        /***************************流程进度推进 发起 回退 终止 ************************/
        if(pushFlag){
            //推进流程
            entity = CRUD.castObject(request, ProcessInstanceModel.class);

            switch(auditInfo) {
                case AuditType.APPROVE :
                patchProcessInstanceService.approve(instanceId, userId, account,
                        entity.getCurrentStepId(),
                        entity.getCurrentUserId(),
                        entity.getUserName(),
                        entity.getNote(), entity.getAttachments());
                //创建流程实例步骤信息****************** 不存在流程实例的时候才创建
                if(entityId!=null && processInstanceStepModel == null){
                        i += processInstanceStepService.createInstanceStep(instanceId,rowId,step);
                }

                break;

                case AuditType.REJECT :
                patchProcessInstanceService.reject(instanceId, userId, account,
                        entity.getCurrentStepId(),
                        entity.getCurrentUserId(),
                        entity.getUserName(),
                        entity.getNote(), entity.getAttachments());
                break;

                case AuditType.ROLLBACK :
                patchProcessInstanceService.rollback(instanceId, userId, account, entity.getNote());
                break;
                default:break;
            }
        }
        else {
            //发起流程
            String userName = queryProcessInstanceDao.getUserNameById(userId);
//            String userName = "张三";
            //仅开始步骤的 entityId和rowId
            entity.setFormId(rowId);
            entity.setFormType(entityId.toString());
//            entity.setFormType("formType");
//            根据id设置经办人名字
            autoSetCurrentName(entity);
            //新增流程实例
            ProcessInstance processInstance = this.createProcessInstance(userId, userName, entity);

            instanceId = processInstance.getId();
            //创建流程实例步骤信息******************
            i += processInstanceStepService.createInstanceStep(instanceId,rowId,step);
        }


        return i;
    }

    public ProcessInstanceStepModel checkHasStepValue(ProcessStepModel step,Long instanceId){
        ProcessInstanceStepModel instanceStep = processInstanceStepService.getInstanceStepByStep(step, instanceId);
       return instanceStep;
    }


    //根据id设置经办人名字
    public void autoSetCurrentName(ProcessInstanceModel entity){

        Long currentStepId = entity.getCurrentStepId();
        ProcessStepModel processStepModel = processStepService.selectModel(currentStepId);
        //检查下一步的经办人信息，有就填入
        if(processStepModel.getCurrentUserId()!=null){
            entity.setCurrentUserName(processStepModel.getCurrentUserName());
            entity.setCurrentUserId(processStepModel.getCurrentUserId());
        }else{
            String currentUserName = entity.getCurrentUserName();
            if(StringUtils.isEmpty(currentUserName)){
                Long currentUserId = entity.getCurrentUserId();
                String currentName = queryProcessInstanceDao.getUserNameById(currentUserId);
                entity.setCurrentUserName(currentName);
            }
        }


    }

}
