package com.jfeat.am.module.workflow.services.crud.service;

import com.alibaba.fastjson.JSONObject;
import com.jfeat.am.module.workflow.services.domain.model.ProcessStepModel;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;
import com.jfeat.crud.plus.CRUDServiceOnly;

import java.util.List;


/**
 * <p>
 * service interface
 * </p>
 *
 * @author Code Generator
 * @since 2017-10-25
 */


public interface ProcessStepService extends CRUDServiceOnly<ProcessStep> {
    
    /**
     * 创建流程步骤并进行验证
     * @param processId 流程ID
     * @param entity 流程步骤模型
     * @return 创建后的流程步骤
     */
    ProcessStep createProcessStepWithValidation(Long processId, ProcessStepModel entity);

    public String filterNextSteps(String nextStepsStr);

    public void filterNextSteps(Long processId);


    //获取开始步骤对应的App设计 json
    String getStartStepDesignJson(Long processId);

    //获取开始步骤对应的表单json
    String getStartStepFormJson(Long processId);

    //获取开始步骤
    ProcessStepModel getStartStep(Long processId);

    List<ProcessStepModel> findNextStep(Long processId, Long stepId);

    ProcessStepModel getProcessStep(Long id);

    ProcessStep selectOne(Long id);

    ProcessStepModel selectModel(Long id);

    String getDesignJsonByStepId(Long stepId);



    Integer deleteProcessStep(Long id);


    ProcessStep getNestedStepsByProcessId(Long processId);


    List<ProcessStep> getSortedStepsByProcessId(Long processId);
}
