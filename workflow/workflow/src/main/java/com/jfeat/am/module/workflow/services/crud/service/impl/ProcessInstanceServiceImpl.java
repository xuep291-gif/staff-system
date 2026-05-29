package com.jfeat.am.module.workflow.services.crud.service.impl;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jfeat.am.core.jwt.JWTKit;
import com.jfeat.am.module.workflow.constant.*;
import com.jfeat.am.module.workflow.services.crud.service.ProcessStepService;
import com.jfeat.am.module.workflow.services.domain.dao.QueryProcessInstanceDao;
import com.jfeat.am.module.workflow.services.domain.model.ProcessInstanceRecord;
import com.jfeat.am.module.workflow.services.persistence.dao.*;
import com.jfeat.am.module.workflow.services.persistence.model.*;
import com.jfeat.am.module.workflow.services.crud.service.ProcessInstanceService;
import com.jfeat.am.module.workflow.services.persistence.model.Process;
import com.jfeat.crud.base.exception.BusinessCode;
import com.jfeat.crud.base.exception.BusinessException;
import com.jfeat.crud.plus.CRUD;
import com.jfeat.crud.plus.impl.CRUDServiceOnlyImpl;
import com.jfeat.eav.services.domain.model.EavEntityModel;
import com.jfeat.eav.services.domain.service.EavEntityService;
import com.jfeat.eav.services.domain.service.EntityAttributeConfigService;
import com.jfeat.eav.services.gen.persistence.model.EavAttribute;
import com.jfeat.eav.services.gen.persistence.model.EavEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * <p>
 * implementation
 * </p>
 *
 * @author Code Generator
 * @since 2017-10-26
 */

@Service
public class ProcessInstanceServiceImpl extends CRUDServiceOnlyImpl<ProcessInstance> implements ProcessInstanceService {


    @Resource
    private ProcessInstanceMapper processInstanceMapper;
    @Resource
    private ProcessStepMapper processStepMapper;

    @Resource
    private ProcessMapper processMapper;

    @Resource
    private EntityAttributeConfigService entityAttributeConfigService;

    @Resource
    private EavEntityService entityService;

    @Resource
    private ProcessStepService processStepService;

    @Resource
    private ProcessInstanceStepMapper processInstanceStepMapper;

    @Resource
    private ProcessStepApprovalMapper processStepApprovalMapper;


    @Resource
    private QueryProcessInstanceDao queryProcessInstanceDao;

    @Resource
    private EavEntityService eavEntityService;


    @Override
    protected BaseMapper<ProcessInstance> getMasterMapper() {
        return processInstanceMapper;
    }

    /**
     * 根据ID获取流程实例详情
     *
     * @param id 流程实例ID
     * @return ProcessInstanceRecord 包含流程实例详情和下一步骤信息的记录对象
     */
    @Override
    public ProcessInstanceRecord getProcessInstance(Long id) {
        ProcessInstance instance = this.retrieveMaster(id);
        if (instance == null) {
            throw BizExceptionEnum.PROCESS_INSTANCE_NOT_FOUND.createException();
        }
        ProcessInstanceRecord processInstanceRecord = CRUD.castObject(instance, ProcessInstanceRecord.class);
        //获取下一步信息
        JSONArray returnArray = getStepArray(processInstanceRecord);

        processInstanceRecord.setNextSteps(returnArray);
        return processInstanceRecord;
    }

    @Override
    public ProcessInstanceRecord getV2ProcessInstance(Long id) {
        ProcessInstance instance = this.retrieveMaster(id);
        if (instance == null) {
            throw BizExceptionEnum.PROCESS_INSTANCE_NOT_FOUND.createException();
        }
        ProcessInstanceRecord processInstanceRecord = CRUD.castObject(instance, ProcessInstanceRecord.class);
        Process process = processMapper.selectById(processInstanceRecord.getProcessId());
        if (process == null || process.getEntityName()==null) {
            throw BizExceptionEnum.PROCESS_NOT_FOUND.createException();
        }
        EavEntity entity = eavEntityService.getByEntityName(process.getEntityName());
        Map<String, String> entityValueByEntityIdRowId = eavEntityService.getEntityValueByEntityIdRowId(entity.getId(), processInstanceRecord.getRowId());
        processInstanceRecord.setCommitDate(entityValueByEntityIdRowId);
        return processInstanceRecord;
    }

    /**
     * 创建步骤JSON对象
     *
     * @param id            步骤ID
     * @param name          步骤名称
     * @param currentUserId 当前用户ID(可为空)
     * @return 包含步骤信息的JSON对象
     */
    JSONObject createStepObj(Long id, String name, Long currentUserId) {
        JSONObject stepObj = new JSONObject();
        stepObj.put("id", id);
        stepObj.put("name", name);
        if (currentUserId != null) {
            stepObj.put("currentUserId", currentUserId);
        }
        return stepObj;
    }

    /**
     * 获取流程实例的下一步骤信息
     *
     * @param processInstanceRecord 流程实例记录
     * @return JSONArray 包含所有下一步骤信息的数组
     * @throws BusinessException 当步骤配置有误时抛出异常
     */
    @Override
    public JSONArray getStepArray(ProcessInstanceRecord processInstanceRecord) {
        //获取当前流程下的所有步骤
        List<ProcessStep> processSteps = processStepMapper.selectNextSteps(processInstanceRecord.getProcessId(), null);
        Map<Long, ProcessStep> nextStepMap = processSteps.stream().collect(Collectors.toMap(i -> i.getId(), v -> v));
        String step = nextStepMap.get(processInstanceRecord.getCurrentStepId()).getNextSteps();
        //根据是否配置了下一步 决定是使用配置还是默认获取下一个

        JSONArray returnArray = new JSONArray();
        if (!StringUtils.isEmpty(step) && step.indexOf("[]") < 0) {
            JSONArray parse = JSONArray.parseArray(step);
            for (Object parseId : parse) {
                long pId = Long.parseLong(parseId.toString());
                ProcessStep processStep = nextStepMap.get(pId);
                if (processStep == null) {
                    throw new BusinessException(4012, "步骤配置有误，请检查当前流程的步骤配置情况");
                }
                returnArray.add(createStepObj(processStep.getId(), processStep.getName(), processStep.getCurrentUserId()));
            }

        } else {
            //循环 获取当前步骤的下一步骤
            int i = 0;
            for (ProcessStep processStep : processSteps) {
                if (i == 1) {
                    JSONObject stepObj = createStepObj(processStep.getId(), processStep.getName(), processStep.getCurrentUserId());
                    returnArray.add(stepObj);
                    break;
                } else {
                    if (processStep.getId().equals(processInstanceRecord.getCurrentStepId())) {
                        i++;
                    }
                }
            }
        }
        return returnArray;
    }


    /**
     * 更新流程实例所有字段
     *
     * @param processInstance 要更新的流程实例对象
     * @return 影响的行数
     */
    @Override
    public Integer updateAllColumn(ProcessInstance processInstance) {
        return getMasterMapper().updateById(processInstance);
    }

    @Override
    public Integer submitApproval(Long processId, JSONObject request) {

        Integer affect = 0;
        logger.info("开始查询流程ID为{}的实例", processId);
        Process process = processMapper.selectById(processId);
        if (process == null) {
            logger.warn("未找到流程ID为{}的实例", processId);
            return null;
        }
        if (StringUtils.isEmpty(process.getEntityName())) {
            logger.warn("流程ID为{}的实例缺少entityName字段", processId);
        }
        EavEntityModel eavEntityAttributesByEntityName = entityAttributeConfigService.getEavEntityAttributesByEntityName(process.getEntityName());
        if (eavEntityAttributesByEntityName == null || eavEntityAttributesByEntityName.getChildren() == null) {
            logger.warn("流程ID为{}的实例缺少Eav属性配置", processId);
            return null;
        }
        List<EavAttribute> attributes = eavEntityAttributesByEntityName.getChildren();
        // 验证必填字段
        for (EavAttribute attribute : attributes) {
            if (attribute.getRequired() && !request.containsKey(attribute.getAttributeName())) {
                logger.error("流程ID为{}的实例缺少必填字段: {}", processId, attribute.getAttributeName());
                throw new BusinessException(4001, "缺少必填字段: " + attribute.getAttributeName());
            }
        }


//        添加申请表单数据
        Long rowId = entityService.addEavValuesToEntity(eavEntityAttributesByEntityName.getId(), request);

        // 获取流程的所有步骤
        List<ProcessStep> sortedStepsByProcessId = processStepService.getSortedStepsByProcessId(processId);
        QueryWrapper<ProcessStepApproval> approvalQueryWrapper = new QueryWrapper<>();
        approvalQueryWrapper.and(wrapper -> wrapper.eq("step_id", sortedStepsByProcessId.get(1).getId()));
        List<ProcessStepApproval> processStepApprovals = processStepApprovalMapper.selectList(approvalQueryWrapper);

//        添加工作流实例
        ProcessInstance processInstance = new ProcessInstance();
        processInstance.setProcessId(processId);
        processInstance.setFormType(ProcessInstanceFormTypeEnum.SINGLE_FORM.name());
        processInstance.setRowId(rowId);
        processInstance.setName(request.getString("name"));
        processInstance.setStatus(ProcessInstanceStatusEnum.START.name());
        processInstance.setCreatorId(JWTKit.getUserId());
        processInstance.setCreator(processMapper.getEndUserNameById(JWTKit.getUserId()));
        processInstance.setCurrentUserId(processStepApprovals.get(0).getUserId());
        processInstance.setCurrentStepId(sortedStepsByProcessId.get(1).getId());
        processInstance.setCurrentStepName(sortedStepsByProcessId.get(1).getName());
        affect+=queryProcessInstanceDao.insertProcessInstance(processInstance);
        //      添加一条工作流实例步骤


        ProcessInstanceStep processInstanceStep = new ProcessInstanceStep();
        processInstanceStep.setStepId(sortedStepsByProcessId.get(0).getId());
        processInstanceStep.setInstanceId(processInstance.getId());
        processInstanceStep.setUserId(JWTKit.getUserId());
        processInstanceStep.setStatus(ProcessStepApproceStatusEnum.APPROVED.name());
        affect+=processInstanceStepMapper.insert(processInstanceStep);

        return affect;
    }


    /**
     * 判断当前步骤是否需要提交表单
     * |
     * 判断上一个步骤是否完成
     * |
     * 当前是否是多人审核（是多人审核-->查看多人审核模式-->是否满足条件）
     * |
     * 审核（如果已经是最后一个节点，需要将最后的结束节点修改状态）
     *
     * @param processSeptId
     * @param processInstanceId
     * @param action
     * @param comment
     * @param request
     * @return
     */
    @Override
    public Integer approve(Long userId,Long processInstanceId, Long processSeptId, String action, String comment, JSONObject request) {

        QueryWrapper<ProcessInstance> instanceQueryWrapper = new QueryWrapper<>();
        instanceQueryWrapper.eq("id", processInstanceId);
        ProcessInstance processInstance = processInstanceMapper.selectOne(instanceQueryWrapper);

//        判断当前工作流步骤是否到这里了
        if (processInstance == null || processInstance.getCurrentStepId() == null || !processInstance.getCurrentStepId().equals(processSeptId)) {
            throw BizExceptionEnum.PROCESS_INSTANCE_NOT_FOUND.createException();
        }

//        判断工作流是否关闭
        if (processInstance.getStatus().equals(ProcessInstanceStatusEnum.CLOSE_APPROVED.name()) || processInstance.getStatus().equals(ProcessInstanceStatusEnum.CLOSE_REJECTED.name())) {
            logger.error("流程步骤已经关闭" + processInstance.getStatus());
            throw BizExceptionEnum.PROCESS_INSTANCE_CANNOT_SUBMIT.createException();
        }


        Long processId = processInstance.getProcessId();
        Integer affect = 1;
        // 获取流程的所有步骤
        List<ProcessStep> sortedStepsByProcessId = processStepService.getSortedStepsByProcessId(processId);
        if (sortedStepsByProcessId == null || sortedStepsByProcessId.isEmpty() || sortedStepsByProcessId.size() < 3) {
            logger.error("流程步骤为空，processId: {}", processId);
            throw BizExceptionEnum.PROCESS_STEP_NOT_FOUND.createException();
        }


        // 查询该实例的所有步骤记录
        QueryWrapper<ProcessInstanceStep> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("instance_id", processInstanceId);
        queryWrapper.eq("step_id", processSeptId);
        List<ProcessInstanceStep> currentInstanceSteps = processInstanceStepMapper.selectList(queryWrapper);
        logger.info("流程实例步骤记录查询结果，processInstanceId: {}, 记录数: {}", processInstanceId, currentInstanceSteps.size());


//        获取当前审批步骤
        ProcessStep currentStep = processStepMapper.selectById(processInstance.getCurrentStepId());
        int currentStepIndex = sortedStepsByProcessId.stream().filter(step -> step.getId().equals(currentStep.getId())).findFirst().map(sortedStepsByProcessId::indexOf).orElse(-1);
//        下一个步骤
        ProcessStep previousStep = currentStepIndex > 0 ? sortedStepsByProcessId.get(currentStepIndex - 1) : null;
        ProcessStep nextStep = currentStepIndex < sortedStepsByProcessId.size() - 1 ? sortedStepsByProcessId.get(currentStepIndex + 1) : null;


//        审核人员
        QueryWrapper<ProcessStepApproval> approvalQueryWrapper = new QueryWrapper<>();
        approvalQueryWrapper.and(wrapper -> wrapper.eq("step_id", previousStep.getId()).or().eq("step_id", currentStep.getId())).or().eq("step_id", nextStep.getId());
        List<ProcessStepApproval> processStepApprovals = processStepApprovalMapper.selectList(approvalQueryWrapper);

//        当前审核人员
        List<ProcessStepApproval> currentStepApprovals = processStepApprovals.stream()
                .filter(approval -> approval.getStepId().equals(currentStep.getId()))
                .collect(Collectors.toList());

//        下一步的审核人员
        List<ProcessStepApproval> nextStepApprovals = processStepApprovals.stream()
                .filter(approval -> approval.getStepId().equals(nextStep.getId()))
                .collect(Collectors.toList());

        // 按sortNum排序
        currentStepApprovals = currentStepApprovals.stream()
                .sorted((a, b) -> a.getSortNum().compareTo(b.getSortNum()))
                .collect(Collectors.toList());

        nextStepApprovals = nextStepApprovals.stream()
                .sorted((a, b) -> a.getSortNum().compareTo(b.getSortNum()))
                .collect(Collectors.toList());


        if (ProcessStepMultiApproveModeEnum.COUNTERSIGN.name().equals(currentStep.getMultiApproveMode())) {
            handleCountersignApproval(userId,processInstanceId, comment, action, currentStep, nextStep, processInstance, currentInstanceSteps, currentStepApprovals, nextStepApprovals);
        } else if (ProcessStepMultiApproveModeEnum.OR_SIGN.name().equals(currentStep.getMultiApproveMode())) {
            handleOrSignApproval(userId,processInstanceId, comment, action, currentStep, nextStep, processInstance, currentInstanceSteps, currentStepApprovals, nextStepApprovals);
        } else {
            handleSequentialApproval(userId,processInstanceId, comment, action, currentStep, nextStep, processInstance, currentInstanceSteps, currentStepApprovals, nextStepApprovals);
        }


        return affect;
    }

    @Override
    public List<ProcessInstance> getMySubmissions() {
        return new ArrayList<>();
    }

    @Override
    public List<ProcessInstance> getPendingApprovals() {
        return new ArrayList<>();
    }

    @Override
    public List<ProcessInstance> findCopyProcessInstances(Long userId) {
        return processInstanceMapper.findCopyProcessInstances(userId);
    }

    /**
     * 处理顺序审批模式
     */
    private Boolean handleSequentialApproval(Long userId,Long processInstanceId, String comment, String action, ProcessStep currentStep, ProcessStep nextStep, ProcessInstance processInstance, List<ProcessInstanceStep> currentInstanceSteps, List<ProcessStepApproval> currentStepApprovals, List<ProcessStepApproval> nextStepApprovals) {
        //        多人审核
        if (currentStep.getMultiApprover() != null && currentStep.getMultiApprover() && currentStepApprovals.size() > 1) {
            ProcessStepApproval processStepApproval = currentStepApprovals.get(currentInstanceSteps.size());

//            验证身份
            Boolean b = validateApproverIdentity(userId,currentStep, processStepApproval);
            if (!b) {
                throw BizExceptionEnum.PROCESS_INSTANCE_NO_PERMISSION.createException();
            }


            // 如果是拒绝，直接结束流程
            if (ProcessStepApproceStatusEnum.REJECTED.name().equals(action)) {
                processInstance.setStatus(ProcessInstanceStatusEnum.CLOSE_REJECTED.name());
                processInstance.setCurrentStepId(null);
                processInstance.setCurrentStepName(null);
                processInstance.setCurrentUserId(null);
            }else {
                //            判断按顺序是否是当前审核最后一个
                if (currentStepApprovals.size() == currentInstanceSteps.size() + 1) {
                    processInstance.setCurrentStepId(nextStep.getId());
                    processInstance.setCurrentStepName(nextStep.getName());
                    processInstance = handleEndStep(processInstance, nextStep, action, nextStepApprovals);

                } else {
//                不是当前审批步骤最后一个
                    processInstance.setCurrentStepId(currentStep.getId());
                    processInstance.setCurrentStepName(currentStep.getName());

                    /**
                     * todo 改为根据步骤不一样 获取当前组织名称 id 或者 是角色名称或者id
                     */
                    Long septUserId = currentStepApprovals.get(currentInstanceSteps.size() + 1).getUserId();
                    processInstance.setCurrentUserId(septUserId);
                    processInstance.setCurrentUserName(processMapper.getEndUserNameById(septUserId));

                }
            }



        } else {
//           验证身份
            Boolean b = validateApproverIdentity(userId,currentStep, currentStepApprovals.get(0));
            if (!b) {
                throw BizExceptionEnum.PROCESS_INSTANCE_NO_PERMISSION.createException();
            }

            // 如果是拒绝，直接结束流程
            if (ProcessStepApproceStatusEnum.REJECTED.name().equals(action)) {
                processInstance.setStatus(ProcessInstanceStatusEnum.CLOSE_REJECTED.name());
                processInstance.setCurrentStepId(null);
                processInstance.setCurrentStepName(null);
                processInstance.setCurrentUserId(null);
            }else {
                //           单人审核
                processInstance.setCurrentStepId(nextStep.getId());
                processInstance.setCurrentStepName(nextStep.getName());
                processInstance = handleEndStep(processInstance, nextStep, action, nextStepApprovals);
            }

        }

        ProcessInstanceStep processInstanceStep = new ProcessInstanceStep();
        processInstanceStep.setSortNum(currentInstanceSteps.size() + 1);
        processInstanceStep.setStepId(currentStep.getId());
        processInstanceStep.setInstanceId(processInstanceId);
        processInstanceStep.setNote(comment);
        processInstanceStep.setStatus(action);
        processInstanceStep.setUserId(userId);
        processInstanceMapper.updateById(processInstance);
        processInstanceStepMapper.insert(processInstanceStep);
        return true;
    }


    /**
     * 处理会签审批模式
     */
    private Boolean handleCountersignApproval(Long userId,Long processInstanceId, String comment, String action, ProcessStep currentStep, ProcessStep nextStep, ProcessInstance processInstance, List<ProcessInstanceStep> currentInstanceSteps, List<ProcessStepApproval> currentStepApprovals, List<ProcessStepApproval> nextStepApprovals) {
        //        多人审核
        if (currentStep.getMultiApprover() != null && currentStep.getMultiApprover() && currentStepApprovals.size() > 1) {
            // 过滤已经审批过的人员
            List<Long> approvedUserIds = currentInstanceSteps.stream()
                    .map(ProcessInstanceStep::getUserId)
                    .collect(Collectors.toList());

            // 验证当前用户身份
            Long currentUserId = JWTKit.getUserId();
//            Long currentUserId = 2731L;
            ProcessStepApproval currentUserApproval = currentStepApprovals.stream()
                    .filter(approval -> approval.getUserId().equals(currentUserId))
                    .findFirst()
                    .orElse(null);
            
            if (currentUserApproval == null || approvedUserIds.contains(currentUserId)) {
                throw BizExceptionEnum.PROCESS_INSTANCE_NO_PERMISSION.createException();
            }
            
            // 如果是拒绝，直接结束流程
            if (ProcessStepApproceStatusEnum.REJECTED.name().equals(action)) {
                processInstance.setStatus(ProcessInstanceStatusEnum.CLOSE_REJECTED.name());
                processInstance.setCurrentStepId(null);
                processInstance.setCurrentStepName(null);
                processInstance.setCurrentUserId(null);
            } else {
                // 如果是同意，检查是否所有人都已审批
                int totalApprovers = currentStepApprovals.size();
                int approvedCount = approvedUserIds.size() + 1; // 包含当前审批
                
                if (approvedCount == totalApprovers) {
                    // 所有人都已同意，进入下一步
                    processInstance.setCurrentStepId(nextStep.getId());
                    processInstance.setCurrentStepName(nextStep.getName());
                    processInstance = handleEndStep(processInstance, nextStep, action, nextStepApprovals);
                } else {
                    // 还有人未审批，等待下一个审批人
                    ProcessStepApproval nextApprover = currentStepApprovals.stream()
                            .filter(approval -> !approvedUserIds.contains(approval.getUserId()) && !approval.getUserId().equals(currentUserId))
                            .findFirst()
                            .orElse(null);
                    
                    if (nextApprover != null) {
                        processInstance.setCurrentUserId(nextApprover.getUserId());
                        processInstance.setCurrentUserName(processMapper.getEndUserNameById(nextApprover.getUserId()));
                    }
                }
            }
        } else {
            // 单人审核
            Boolean b = validateApproverIdentity(userId,currentStep, currentStepApprovals.get(0));
            if (!b) {
                throw BizExceptionEnum.PROCESS_INSTANCE_NO_PERMISSION.createException();
            }
            // 如果是拒绝，直接结束流程
            if (ProcessStepApproceStatusEnum.REJECTED.name().equals(action)) {
                processInstance.setStatus(ProcessInstanceStatusEnum.CLOSE_REJECTED.name());
                processInstance.setCurrentStepId(null);
                processInstance.setCurrentStepName(null);
                processInstance.setCurrentUserId(null);
            }else {
                processInstance.setCurrentStepId(nextStep.getId());
                processInstance.setCurrentStepName(nextStep.getName());
                processInstance = handleEndStep(processInstance, nextStep, action, nextStepApprovals);
            }

        }

        // 记录审批步骤
        ProcessInstanceStep processInstanceStep = new ProcessInstanceStep();
        processInstanceStep.setSortNum(currentInstanceSteps.size() + 1);
        processInstanceStep.setStepId(currentStep.getId());
        processInstanceStep.setInstanceId(processInstanceId);
        processInstanceStep.setNote(comment);
        processInstanceStep.setStatus(action);
        processInstanceStep.setUserId(userId);
        
        // 更新数据库
        processInstanceMapper.updateById(processInstance);
        processInstanceStepMapper.insert(processInstanceStep);

        return true;
    }

    /**
     * 处理或签审批模式
     */
    private Boolean handleOrSignApproval(Long userId,Long processInstanceId, String comment, String action, ProcessStep currentStep, ProcessStep nextStep, ProcessInstance processInstance, List<ProcessInstanceStep> currentInstanceSteps, List<ProcessStepApproval> currentStepApprovals, List<ProcessStepApproval> nextStepApprovals) {
        //        多人审核
        if (currentStep.getMultiApprover() != null && currentStep.getMultiApprover() && currentStepApprovals.size() > 1) {


            // 过滤出未提交审核的人员
            List<ProcessStepApproval> pendingApprovals = currentStepApprovals.stream()
                    .filter(approval -> !currentInstanceSteps.stream()
                            .anyMatch(step -> step.getUserId().equals(approval.getUserId())))
                    .collect(Collectors.toList());
            // 验证身份
            Boolean isValidApprover = false;
            for (ProcessStepApproval approval : pendingApprovals) {
                if (validateApproverIdentity(userId,currentStep, approval)) {
                    isValidApprover = true;
                    break;
                }
            }


            if (!isValidApprover) {
                throw BizExceptionEnum.PROCESS_INSTANCE_NO_PERMISSION.createException();
            }

            // 同意则推进到下一步
            if (ProcessStepApproceStatusEnum.APPROVED.name().equals(action)) {
                processInstance.setCurrentStepId(nextStep.getId());
                processInstance.setCurrentStepName(nextStep.getName());
//                处理最后的审批
                processInstance = handleEndStep(processInstance, nextStep, action, nextStepApprovals);
            } else {
                // 不同意则保持当前状态
                // 如果是最后一个审核人
                if (pendingApprovals.size() <= 1) {
                    processInstance.setStatus(ProcessInstanceStatusEnum.CLOSE_REJECTED.name());
                }else {
                    // 不是最后一个审核人
                    Long nextUserId = pendingApprovals.get(1).getUserId();
                    processInstance.setCurrentUserId(nextUserId);
                    processInstance.setCurrentUserName(processMapper.getEndUserNameById(nextUserId));
                }

            }

        } else {
            // 单人审核
            Boolean b = validateApproverIdentity(userId,currentStep, currentStepApprovals.get(0));
            if (!b) {
                throw BizExceptionEnum.PROCESS_INSTANCE_NO_PERMISSION.createException();
            }
            if (ProcessStepApproceStatusEnum.APPROVED.name().equals(action)) {
                processInstance.setCurrentStepId(nextStep.getId());
                processInstance.setCurrentStepName(nextStep.getName());
                processInstance = handleEndStep(processInstance, nextStep, action, nextStepApprovals);
            } else {
                processInstance.setStatus(ProcessInstanceStatusEnum.CLOSE_REJECTED.name());
            }
        }

        ProcessInstanceStep processInstanceStep = new ProcessInstanceStep();
        processInstanceStep.setSortNum(currentInstanceSteps.size() + 1);
        processInstanceStep.setStepId(currentStep.getId());
        processInstanceStep.setInstanceId(processInstanceId);
        processInstanceStep.setNote(comment);
        processInstanceStep.setStatus(action);
        processInstanceStep.setUserId(userId);
        processInstanceMapper.updateById(processInstance);
        processInstanceStepMapper.insert(processInstanceStep);
        return true;
    }


    /**
     * 处理结束步骤的状态更新
     *
     * @param processInstance   流程实例
     * @param nextStep          下一步骤
     * @param action            审批动作
     * @param nextStepApprovals 下个步骤审核人
     */
    private ProcessInstance handleEndStep(ProcessInstance processInstance, ProcessStep nextStep, String action, List<ProcessStepApproval> nextStepApprovals) {
        if (ProcessStepTypeEnum.END.name().equals(nextStep.getType()) || ProcessStepTypeEnum.COPY.name().equals(nextStep.getType())) {
            processInstance.setCurrentUserId(null);
            processInstance.setCurrentUserName(null);
            processInstance.setStatus(ProcessStepStatusEnum.APPROVED.name().equals(action) ? ProcessInstanceStatusEnum.CLOSE_APPROVED.name() : ProcessInstanceStatusEnum.CLOSE_REJECTED.name());
            
            // 如果是抄送类型，异步调用HTTP请求
            if (ProcessStepTypeEnum.COPY.name().equals(nextStep.getType())) {
                new Thread(() -> {
                    try {
                        // 这里调用你的HTTP请求方法
                        notifyCopyStep(processInstance.getId(), nextStep.getId());
                    } catch (Exception e) {
                        logger.error("Failed to notify copy step", e);
                    }
                }).start();
            }
        } else {
            Long userId = nextStepApprovals.get(0).getUserId();
            processInstance.setCurrentUserId(userId);
            processInstance.setCurrentUserName(processMapper.getEndUserNameById(userId));
        }
        return processInstance;
    }

    /**
     * 处理抄送步骤的通知
     *
     * @param instanceId 流程实例ID
     * @param stepId 步骤ID
     */
    private void notifyCopyStep(Long instanceId, Long stepId) {
        // TODO: 实现HTTP请求逻辑
        // 这里可以使用Spring的RestTemplate或其他HTTP客户端
        // 发送异步HTTP请求，不需要等待响应
    }


    /**
     * 验证审批人身份
     *
     * @param processStep         流程步骤
     * @param processStepApproval 审批人信息
     * @return 验证结果
     */
    private Boolean validateApproverIdentity(Long userId,ProcessStep processStep, ProcessStepApproval processStepApproval) {
        if (ProcessStepApproceTypeEnum.ROLE.name().equals(processStep.getApproverType())) {
            // 验证角色身份
            return validateRoleApprover(userId,processStepApproval);
        } else if (ProcessStepApproceTypeEnum.POSITION.name().equals(processStep.getApproverType())) {
            // 验证职位身份
            return validatePositionApprover(userId,processStepApproval);
        } else {
            // 验证用户身份
            return validateUserApprover(userId,processStepApproval);
        }
    }

    /**
     * 验证角色审批人
     */
    private Boolean validateRoleApprover(Long userId,ProcessStepApproval processStepApproval) {

        // TODO: 实现角色验证逻辑
        return true;
    }

    /**
     * 验证职位审批人
     */
    private Boolean validatePositionApprover(Long userId,ProcessStepApproval processStepApproval) {
        // TODO: 实现职位验证逻辑
        return true;
    }

    /**
     * 验证用户审批人
     */
    private Boolean validateUserApprover(Long userId,ProcessStepApproval processStepApproval) {
        if (userId==null) {
            return false;
        }
        // TODO: 实现用户验证逻辑
        return userId.equals(processStepApproval.getUserId());
    }

    private NodeAssign getIdAndName(ProcessStep processStep,ProcessStepApproval processStepApproval) {
        NodeAssign nodeAssign = new NodeAssign();

        if (processStep==null || processStepApproval==null) {

        }
        if (ProcessStepApproceTypeEnum.POSITION.name().equals(processStep.getApproverType())){

        }
        return nodeAssign;

    }


}


