package com.jfeat.am.module.workflow.services.domain.model;
import com.jfeat.am.module.base.services.persistence.model.TicketAttachmentItem;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;

import java.util.List;

/**
 * Created by Code Generator on 2017-10-26
 */
public class ProcessInstanceModel extends ProcessInstance {

    /**
     * 审核结果
     */
    private String result;
    /**
     * 审核意见
     */
    private String note;
    /**
     *
     */
    private String userName;

    private List<TicketAttachmentItem> attachments;

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public List<TicketAttachmentItem> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<TicketAttachmentItem> attachments) {
        this.attachments = attachments;
    }
}
