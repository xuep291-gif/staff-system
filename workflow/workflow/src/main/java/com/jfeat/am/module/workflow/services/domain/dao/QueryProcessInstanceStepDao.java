package com.jfeat.am.module.workflow.services.domain.dao;

import com.jfeat.am.module.workflow.services.domain.model.ProcessInstanceStepRecord;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jfeat.crud.plus.QueryMasterDao;
import org.apache.ibatis.annotations.Param;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstanceStep;
import com.jfeat.am.module.workflow.services.domain.model.ProcessInstanceStepModel;

import java.util.Date;
import java.util.List;

/**
 * Created by Code generator on 2021-05-20
 */
public interface QueryProcessInstanceStepDao extends QueryMasterDao<ProcessInstanceStep> {
    /*
     * Query entity list by page
     */
    List<ProcessInstanceStepRecord> findProcessInstanceStepPage(Page<ProcessInstanceStepRecord> page, @Param("record") ProcessInstanceStepRecord record,
                                                                @Param("search") String search, @Param("orderBy") String orderBy,
                                                                @Param("startTime") Date startTime, @Param("endTime") Date endTime);

    /*
     * Query entity model for details
     */
    ProcessInstanceStepModel queryMasterModel(@Param("id") Long id);

    //获取开始步骤的记录
    ProcessInstanceStepModel getStartStep(@Param("instanceId") Long instanceId);


    //根据当前实例的currentStep获取 实例步骤
    ProcessInstanceStepModel getByCurrentStep(@Param("instanceId") Long instanceId);


    //根据设定的步骤获取实例的步骤
    ProcessInstanceStepModel getInstanceStepByStepId(@Param("stepId") Long stepId, @Param("instanceId") Long instanceId);

    //根据 实例id 获取实例步骤的开始步骤
    ProcessInstanceStep getStartInstanceStepByInstanceId(@Param("instanceId") Long instanceId);

    //根据表单code 和 实例id 获取一个记录信息
    ProcessInstanceStepModel getByFormCodeAndInstanceId(@Param("instanceId") Long instanceId, @Param("code") String code);



}