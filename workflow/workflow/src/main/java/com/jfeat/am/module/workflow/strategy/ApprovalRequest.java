package com.jfeat.am.module.workflow.strategy;

import com.jfeat.am.module.base.services.persistence.model.TicketAttachmentItem;
import lombok.Data;

import java.util.List;

/**
 * 审批请求DTO
 * 封装审批操作所需的所有参数
 *
 * @author Code Generator
 * @date 2026-02-14
 */
@Data
public class ApprovalRequest {

    /**
     * 审批人ID
     */
    private Long approverId;

    /**
     * 审批人姓名
     */
    private String approverName;

    /**
     * 下一步骤ID
     */
    private Long nextStepId;

    /**
     * 下一步处理人ID
     */
    private Long nextUserId;

    /**
     * 下一步处理人姓名
     */
    private String nextUserName;

    /**
     * 审批意见/备注
     */
    private String note;

    /**
     * 审批结果: APPROVED(通过), REJECTED(拒绝)
     */
    private String result;

    /**
     * 附件列表
     */
    private List<TicketAttachmentItem> attachments;
}
