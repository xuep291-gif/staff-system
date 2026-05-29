package com.jfeat.am.module.workflow.services.domain.dao;

import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * Created by Code Generator on 2017-10-25
 */
public interface QueryProcessStepDao extends BaseMapper<ProcessStep> {

    List<ProcessStep> findProcessSteps(@Param("processId") Long processId,
                                       @Param("status") String status);

    //根据实例id获取当前步骤的步骤
    ProcessStep findProcessStepsByCurrent(@Param("instanceId")Long instanceId);
}