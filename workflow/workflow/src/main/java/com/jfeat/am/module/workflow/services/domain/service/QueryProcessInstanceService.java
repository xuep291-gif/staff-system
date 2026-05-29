package com.jfeat.am.module.workflow.services.domain.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;

/**
 * Created by vincent on 2017/10/19.
 */
public interface QueryProcessInstanceService {
    Page<ProcessInstance> findProcessInstances(int pageNum, int pageSize,
                                               Long userId,
                                               Long creatorId,
                                               Long processId,
                                               Long formId,
                                               String formGroup,
                                               String formType,
                                               String status,
                                               String name,
                                               String creator,
                                               String executor,
                                               String currentUserName,
                                               Long currentId,
                                               Long orgId
                                               );

    Page<ProcessInstance> findSelfProcessInstances(int pageNum, int pageSize,
                                               Long userId, Long creatorId,
                                               Long processId,
                                               Long formId,
                                               String formGroup,
                                               String formType,
                                               String status,
                                               String name,
                                               String creator,
                                               String executor,
                                               Long orgId
    );



    ProcessInstance getProcessInstanceByFormId(Long formId,String formType);
}