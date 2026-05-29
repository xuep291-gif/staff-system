package com.jfeat.am.module.workflow.services.domain.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jfeat.am.module.workflow.services.persistence.model.Task;

import java.util.List;

/**
 * Created by vincent on 2017/10/19.
 */
public interface QueryTaskService {
    Page<Task> findTasks(int pageNum, int pageSize, Long userId, Long formId, String status);
}