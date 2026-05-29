package com.jfeat.am.module.workflow.services.domain.service;

import com.jfeat.am.module.workflow.services.domain.model.ProcessModel;
import com.jfeat.am.module.workflow.services.persistence.model.Process;

import java.util.List;

/**
 * Created by vincent on 2017/10/19.
 */
public interface QueryProcessService {
    List<ProcessModel> findProcesses(String search,String formType, String name, String status);
}