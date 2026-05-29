package com.jfeat.am.module.workflow.services.crud.service;

import com.jfeat.am.module.workflow.services.domain.model.ProcessStepModel;
import com.jfeat.am.module.workflow.services.domain.model.ProcessInstanceStepModel;
import com.jfeat.am.module.workflow.services.domain.service.CRUDProcessInstanceStepService;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;

/**
 * Created by vincent on 2017/10/19.
 */
public interface ProcessInstanceStepService extends CRUDProcessInstanceStepService{

    Integer createInstanceStep(Long instanceId, Long rowId, ProcessStep step);

    //获取申请时信息
    ProcessInstanceStepModel getStartStep(Long instanceId);

    ProcessInstanceStepModel getStepByCurrent(Long instanceId);

    ProcessInstanceStepModel getInstanceStepByStep(ProcessStepModel step,Long instanceId);

//    审核

}