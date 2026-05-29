package com.jfeat.am.module.workflow.services.crud.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.jfeat.am.module.workflow.constant.ProcessStatusEnum;
import com.jfeat.am.module.workflow.services.ProcessVersionService;
import com.jfeat.am.module.workflow.services.crud.service.ProcessStepService;
import com.jfeat.am.module.workflow.services.persistence.dao.ProcessMapper;
import com.jfeat.am.module.workflow.services.persistence.dao.ProcessStepApprovalMapper;
import com.jfeat.am.module.workflow.services.persistence.dao.ProcessStepMapper;
import com.jfeat.am.module.workflow.services.persistence.model.Process;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStepApproval;
import com.jfeat.crud.base.exception.BusinessCode;
import com.jfeat.crud.base.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.Date;
import java.util.List;

/**
 * 流程版本管理服务实现
 */
@Service
public class ProcessVersionServiceImpl implements ProcessVersionService {

    private static final Logger logger = LoggerFactory.getLogger(ProcessVersionServiceImpl.class);

    @Resource
    private ProcessMapper processMapper;

    @Resource
    private ProcessStepMapper processStepMapper;

    @Resource
    private ProcessStepApprovalMapper processStepApprovalMapper;

    @Resource
    private ProcessStepService processStepService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Process createNewVersion(Long originalProcessId) {
        logger.info("Creating new version for process id: {}", originalProcessId);

        // 1. 获取原流程
        Process originalProcess = processMapper.selectById(originalProcessId);
        if (originalProcess == null) {
            throw new BusinessException(BusinessCode.BadRequest, "原流程不存在");
        }

        // 2. 查询该流程的所有版本，确定新版本号
        QueryWrapper<Process> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("code", originalProcess.getCode());
        queryWrapper.orderByDesc("version");
        List<Process> existingVersions = processMapper.selectList(queryWrapper);

        int nextVersionNumber = 1;
        if (!existingVersions.isEmpty()) {
            nextVersionNumber = existingVersions.get(0).getVersion() + 1;
        }

        // 3. 创建新版本流程
        Process newProcess = new Process();
        newProcess.setCode(originalProcess.getCode());
        newProcess.setName(originalProcess.getName());
        newProcess.setFormGroup(originalProcess.getFormGroup());
        newProcess.setFormType(originalProcess.getFormType());
        newProcess.setCategoryId(originalProcess.getCategoryId());
        newProcess.setStatus(ProcessStatusEnum.ENABLED.name());
        newProcess.setOpenTo(originalProcess.getOpenTo());
        newProcess.setOpenToIds(originalProcess.getOpenToIds());
        newProcess.setOrgId(originalProcess.getOrgId());
        newProcess.setCodeRule(originalProcess.getCodeRule());
        newProcess.setAllowDelete(originalProcess.getAllowDelete());
        newProcess.setProcessType(originalProcess.getProcessType());
        newProcess.setEntityName(originalProcess.getEntityName());
        newProcess.setCurrentUserId(originalProcess.getCurrentUserId());
        newProcess.setVersion(nextVersionNumber);
        newProcess.setIsLocked(false);
        newProcess.setBasedOnId(originalProcess.getId());

        processMapper.insert(newProcess);

        logger.info("Created new process version {} with id: {}", nextVersionNumber, newProcess.getId());

        // 4. 复制所有步骤
        copySteps(originalProcess.getId(), newProcess.getId());

        // 5. 更新旧版本状态为LOCKED
        if (originalProcess.getStatus().equals(ProcessStatusEnum.ENABLED.name())) {
            originalProcess.setStatus("LOCKED");
            originalProcess.setIsLocked(true);
            processMapper.updateById(originalProcess);
            logger.info("Locked old process version id: {}", originalProcess.getId());
        }

        return newProcess;
    }

    /**
     * 复制流程步骤
     */
    private void copySteps(Long originalProcessId, Long newProcessId) {
        QueryWrapper<ProcessStep> stepQueryWrapper = new QueryWrapper<>();
        stepQueryWrapper.eq("process_id", originalProcessId);
        List<ProcessStep> originalSteps = processStepMapper.selectList(stepQueryWrapper);

        for (ProcessStep originalStep : originalSteps) {
            ProcessStep newStep = new ProcessStep();
            newStep.setProcessId(newProcessId);
            newStep.setName(originalStep.getName());
            newStep.setType(originalStep.getType());
            newStep.setStepType(originalStep.getStepType());
            newStep.setNextSteps(originalStep.getNextSteps());
            newStep.setHandlerSelectRule(originalStep.getHandlerSelectRule());
            newStep.setHandlerIds(originalStep.getHandlerIds());
            newStep.setCurrentUserId(originalStep.getCurrentUserId());
            newStep.setVirtualFormCode(originalStep.getVirtualFormCode());
            newStep.setPid(originalStep.getPid());
            newStep.setNextId(originalStep.getNextId());
            newStep.setEntityName(originalStep.getEntityName());
            newStep.setApproverType(originalStep.getApproverType());
            newStep.setMultiApprover(originalStep.getMultiApprover());
            newStep.setMultiApproveMode(originalStep.getMultiApproveMode());
            newStep.setAllowSelfApproval(originalStep.getAllowSelfApproval());
            newStep.setTimeoutHours(originalStep.getTimeoutHours());
            newStep.setAutoAction(originalStep.getAutoAction());
            newStep.setNotifyType(originalStep.getNotifyType());

            processStepMapper.insert(newStep);

            // 复制步骤审批人配置
            copyStepApprovals(originalStep.getId(), newStep.getId());
        }

        logger.info("Copied {} steps from process {} to {}", originalSteps.size(), originalProcessId, newProcessId);
    }

    /**
     * 复制步骤审批人配置
     */
    private void copyStepApprovals(Long originalStepId, Long newStepId) {
        QueryWrapper<ProcessStepApproval> approvalQueryWrapper = new QueryWrapper<>();
        approvalQueryWrapper.eq("step_id", originalStepId);
        List<ProcessStepApproval> originalApprovals = processStepApprovalMapper.selectList(approvalQueryWrapper);

        for (ProcessStepApproval originalApproval : originalApprovals) {
            ProcessStepApproval newApproval = new ProcessStepApproval();
            newApproval.setStepId(newStepId);
            newApproval.setApproverId(originalApproval.getApproverId());
            newApproval.setApproverName(originalApproval.getApproverName());
            newApproval.setApproverType(originalApproval.getApproverType());
            newApproval.setSortOrder(originalApproval.getSortOrder());

            processStepApprovalMapper.insert(newApproval);
        }
    }

    @Override
    public Process getRunningVersion(String processCode) {
        QueryWrapper<Process> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("code", processCode);
        queryWrapper.eq("status", ProcessStatusEnum.ENABLED.name());
        queryWrapper.orderByDesc("version");
        queryWrapper.last("LIMIT 1");

        return processMapper.selectOne(queryWrapper);
    }

    @Override
    public List<Process> getAllVersions(String processCode) {
        QueryWrapper<Process> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("code", processCode);
        queryWrapper.orderByDesc("version");

        return processMapper.selectList(queryWrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void activateVersion(Long processId) {
        Process process = processMapper.selectById(processId);
        if (process == null) {
            throw new BusinessException(BusinessCode.BadRequest, "流程不存在");
        }

        // 禁用该流程的所有其他版本
        QueryWrapper<Process> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("code", process.getCode());
        queryWrapper.ne("id", processId);
        queryWrapper.eq("status", ProcessStatusEnum.ENABLED.name());

        List<Process> otherVersions = processMapper.selectList(queryWrapper);
        for (Process other : otherVersions) {
            other.setStatus("LOCKED");
            other.setIsLocked(true);
            processMapper.updateById(other);
        }

        // 启用指定版本
        process.setStatus(ProcessStatusEnum.ENABLED.name());
        process.setIsLocked(false);
        processMapper.updateById(process);

        logger.info("Activated process version {} with id: {}", process.getVersion(), processId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void archiveOldVersion(Long processId) {
        Process process = processMapper.selectById(processId);
        if (process == null) {
            throw new BusinessException(BusinessCode.BadRequest, "流程不存在");
        }

        // 将旧版本标记为LOCKED
        process.setStatus("LOCKED");
        process.setIsLocked(true);
        processMapper.updateById(process);

        logger.info("Archived process version {} with id: {}", process.getVersion(), processId);
    }

    @Override
    public Process getLatestVersion(String processCode) {
        QueryWrapper<Process> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("code", processCode);
        queryWrapper.orderByDesc("version");
        queryWrapper.last("LIMIT 1");

        return processMapper.selectOne(queryWrapper);
    }
}
