package com.jfeat.am.module.workflow.services.domain.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jfeat.am.module.virtualForm.services.gen.persistence.model.VirtualForm;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Created by Code Generator on 2017-10-26
 */
public interface QueryProcessInstanceDao extends BaseMapper<ProcessInstance> {

    List<ProcessInstance> findProcessInstances(Page<ProcessInstance> page,
                                               @Param("userId") Long userId,
                                               @Param("creatorId") Long creatorId,
                                               @Param("processId") Long processId,
                                               @Param("formId") Long formId,
                                               @Param("formGroup") String formGroup,
                                               @Param("formType") String formType,
                                               @Param("status") String status,
                                               @Param("name") String name,
                                               @Param("creator") String creator,
                                               @Param("executor") String executor,
                                               @Param("currentUserName") String currentUserName,
                                               @Param("currentId")Long currentId,
                                               @Param("orgId")Long orgId);

    List<ProcessInstance> findSelfProcessInstances(Page<ProcessInstance> page,
                                               @Param("userId") Long userId, @Param("creatorId")   Long creatorId,
                                               @Param("processId") Long processId,
                                               @Param("formId") Long formId,
                                               @Param("formGroup") String formGroup,
                                               @Param("formType") String formType,
                                               @Param("status") String status,
                                               @Param("name") String name,
                                               @Param("creator") String creator,
                                               @Param("executor") String executor,
                                               @Param("orgId")Long orgId);


    List<String> getRoleNameByUserId(@Param("userId") Long userId);

    Long getMaxFormId();

    String getUserNameById(@Param("id")Long id);

    Long getMaxAutoCode();

    Long getEntityIdByCurrentId(@Param("currentId")Long currentId);

    VirtualForm getVirtualFormByCurrentId(@Param("currentId")Long currentId);

    int insertProcessInstance(ProcessInstance instance);
}