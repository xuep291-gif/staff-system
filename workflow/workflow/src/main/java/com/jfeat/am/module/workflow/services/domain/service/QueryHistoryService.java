package com.jfeat.am.module.workflow.services.domain.service;

import com.jfeat.am.module.workflow.services.persistence.model.History;

import java.util.List;

/**
 * Created by vincent on 2017/10/19.
 */
public interface QueryHistoryService {
    List<History> findHistories(Long formId,Long instanceId);
    History getHistory(Long formId, Long stepId, Long userId,Long instanceId);
}