package com.jfeat.am.module.workflow.services.domain.dao;

import com.jfeat.am.module.workflow.services.persistence.model.History;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * Created by Code Generator on 2017-10-25
 */
public interface QueryHistoryDao extends BaseMapper<History> {

    List<History> findHistories(@Param("formId") Long formId
            , @Param("stepId") Long stepId
            , @Param("userId") Long userId
            , @Param("instanceId")Long instanceId);

}