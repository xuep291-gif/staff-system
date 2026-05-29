package com.jfeat.am.module.workflow.services.crud.service;

import com.alibaba.fastjson.JSONObject;
import com.jfeat.am.module.base.services.persistence.model.TicketAttachmentItem;
import com.jfeat.am.module.workflow.services.domain.model.ProcessInstanceModel;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Created by Code Generator on 2017-10-25
 */
public interface PatchProcessInstanceService {

    public ProcessInstance createProcessInstance(Long userId, String account, ProcessInstanceModel entity);

    public ProcessInstance submit(Long instanceId, Long userId, String account, ProcessInstanceModel entity);

    public ProcessInstance approve(Long instanceId, Long approverId, String approverName,
                                   Long nextStepId, Long nextUserId, String nextUserName, String note,List<TicketAttachmentItem> ticketAttachmentItems);

    public ProcessInstance reject(Long instanceId, Long approverId, String approverName,
                                   Long nextStepId, Long nextUserId, String nextUserName, String note,List<TicketAttachmentItem> ticketAttachmentItems);

    public ProcessInstance rollback(Long instanceId, Long userId, String account, String comment);

    /**
     * 回退到指定步骤
     * @param instanceId 流程实例ID
     * @param userId 操作人ID
     * @param account 操作人名称
     * @param targetStepId 目标步骤ID（null表示回退到开始状态）
     * @param reason 回退原因（必填，至少5个字符）
     * @return 流程实例
     */
    public ProcessInstance rollbackToStep(Long instanceId, Long userId, String account,
                                    Long targetStepId, String reason);

    @Transactional
    Integer createInstanceAndFormValue(JSONObject request);

    //根据实例id推进进度
    @Transactional
    Integer pushInstanceAndCreateFormValue(JSONObject request);
}

