package com.jfeat.am.module.workflow.services.domain.service;

import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;

import java.util.List;

/**
 * Created by vincent on 2017/10/19.
 */
public interface QueryProcessStepService {
    List<ProcessStep> findProcessSteps(Long processId, String status);
}