package com.jfeat.am.module.workflow.services.crud.service.impl;

import com.jfeat.am.module.workflow.services.domain.dao.QueryProcessInstanceStepDao;
import com.jfeat.am.module.workflow.services.domain.model.ProcessStepModel;
import com.jfeat.am.module.workflow.services.crud.service.ProcessInstanceStepService;
import com.jfeat.am.module.workflow.services.domain.model.ProcessInstanceStepModel;
import com.jfeat.am.module.workflow.services.domain.service.impl.CRUDProcessInstanceStepServiceImpl;
import com.jfeat.am.module.workflow.services.persistence.dao.ProcessInstanceStepMapper;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstanceStep;
import com.jfeat.am.module.workflow.services.persistence.dao.ProcessStepMapper;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;

/**
 * <p>
 * 服务实现类
 * </p>
 *
 * @author admin
 * @since 2017-10-16
 */

@Service("processInstanceStepService")
public class ProcessInstanceStepServiceImpl extends CRUDProcessInstanceStepServiceImpl implements ProcessInstanceStepService {

    @Resource
    ProcessInstanceStepMapper processInstanceStepMapper;
    @Resource
    ProcessStepMapper processStepMapper;
    @Resource
    QueryProcessInstanceStepDao queryProcessInstanceStepDao;

    @Override
    public Integer createInstanceStep(Long instanceId, Long rowId, ProcessStep step){
        Long entityId = processStepMapper.getEntityIdByStepId(step.getId());
        ProcessInstanceStep processInstanceStep = new ProcessInstanceStep();
        processInstanceStep.setInstanceId(instanceId);
        processInstanceStep.setEntityId(entityId);
        processInstanceStep.setRowId(rowId);
        processInstanceStep.setStepId(step.getId());
        processInstanceStep.setVirtualFormCode(step.getVirtualFormCode());

        Integer i = processInstanceStepMapper.insert(processInstanceStep);
        return i;
    }


    //获取申请时信息
    @Override
    public ProcessInstanceStepModel getStartStep(Long instanceId){
        return queryProcessInstanceStepDao.getStartStep(instanceId);
    }

    @Override
    public ProcessInstanceStepModel getStepByCurrent(Long instanceId){
        return queryProcessInstanceStepDao.getByCurrentStep(instanceId);
    }

    @Override
    public ProcessInstanceStepModel getInstanceStepByStep(ProcessStepModel step, Long instanceId){
        if(instanceId == null){
            return null;
        }
        return queryProcessInstanceStepDao.getInstanceStepByStepId(step.getId(),instanceId);
    }

}
