package com.jfeat.am.module.workflow.services.domain.dao;

import com.jfeat.am.module.workflow.services.persistence.model.Task;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * Created by Code Generator on 2017-10-25
 */
public interface QueryTaskDao extends BaseMapper<Task> {

    List<Task> findTasks(Page<Task> page,
                         @Param("userId") Long userId,
                         @Param("formId") Long formId,
                         @Param("status") String status);

}