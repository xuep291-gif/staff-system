package com.jfeat.am.module.workflow.services.crud.service;

import com.jfeat.am.module.workflow.services.persistence.model.NodeAssign;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStepApproval;

import java.util.List;

public interface ProcessStepApprovalService {


    Integer createProcessStepApprovals(ProcessStep processStep, List<NodeAssign> nodeAssigneeList);

    List<NodeAssign> selectProcessStepApprovals(ProcessStep processStep);
}
