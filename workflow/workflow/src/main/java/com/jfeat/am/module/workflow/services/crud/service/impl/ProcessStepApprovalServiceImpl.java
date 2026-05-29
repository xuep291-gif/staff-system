package com.jfeat.am.module.workflow.services.crud.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.jfeat.am.module.workflow.constant.ProcessStepApproceTypeEnum;
import com.jfeat.am.module.workflow.services.crud.service.ProcessStepApprovalService;
import com.jfeat.am.module.workflow.services.crud.service.ProcessStepService;
import com.jfeat.am.module.workflow.services.persistence.dao.ProcessMapper;
import com.jfeat.am.module.workflow.services.persistence.dao.ProcessStepApprovalMapper;
import com.jfeat.am.module.workflow.services.persistence.model.NodeAssign;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStepApproval;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProcessStepApprovalServiceImpl implements ProcessStepApprovalService {

    @Resource
    private ProcessStepApprovalMapper processStepApprovalMapper;

    @Resource
    private ProcessMapper processMapper;

    public Integer createProcessStepApprovals(ProcessStep processStep, List<NodeAssign> nodeAssigneeList) {

        QueryWrapper<ProcessStepApproval> approvalQueryWrapper = new QueryWrapper<>();
        approvalQueryWrapper.eq("step_id", processStep.getId());
        processStepApprovalMapper.delete(approvalQueryWrapper);

        List<ProcessStepApproval> processStepApprovals = new ArrayList<>();
        Integer sortNum = 1;
        for (NodeAssign step : nodeAssigneeList) {
            ProcessStepApproval processStepApproval = new ProcessStepApproval();
            processStepApproval.setStepId(processStep.getId());
            processStepApproval.setSortNum(sortNum);
            if (ProcessStepApproceTypeEnum.ROLE.name().equals(processStep.getApproverType())) {
                processStepApproval.setRoleId(step.getId());
            } else if (ProcessStepApproceTypeEnum.POSITION.name().equals(processStep.getApproverType())) {
                processStepApproval.setPositionId(step.getId());
            } else {
                processStepApproval.setUserId(step.getId());
            }
            sortNum++;
            processStepApprovals.add(processStepApproval);
        }
        return processStepApprovalMapper.insertBatch(processStepApprovals);
    }

    @Override
    public List<NodeAssign> selectProcessStepApprovals(ProcessStep processStep) {

        QueryWrapper<ProcessStepApproval> approvalQueryWrapper = new QueryWrapper<>();
        approvalQueryWrapper.eq("step_id", processStep.getId());
        List<ProcessStepApproval> processStepApprovals = processStepApprovalMapper.selectList(approvalQueryWrapper);
        List<NodeAssign> nodeAssigns = new ArrayList<>();

        if (ProcessStepApproceTypeEnum.ROLE.name().equals(processStep.getApproverType())) {
            List<Long> ids = processStepApprovals.stream().filter(a -> a.getRoleId() != null).map(ProcessStepApproval::getUserId).collect(Collectors.toList());
            nodeAssigns = processMapper.getEndRoleNamesByIds(ids);
        }else if (ProcessStepApproceTypeEnum.POSITION.name().equals(processStep.getApproverType())) {
            List<Long> ids = processStepApprovals.stream().filter(a -> a.getPositionId() != null).map(ProcessStepApproval::getUserId).collect(Collectors.toList());
            nodeAssigns = processMapper.getEndPositionNamesByIds(ids);
        }else {
            List<Long> ids = processStepApprovals.stream().filter(a -> a.getUserId() != null).map(ProcessStepApproval::getUserId).collect(Collectors.toList());
            nodeAssigns = processMapper.getEndUserNamesByIds(ids);
        }

        return nodeAssigns;
    }
}
