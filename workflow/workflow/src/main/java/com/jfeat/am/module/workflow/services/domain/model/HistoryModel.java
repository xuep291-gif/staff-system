package com.jfeat.am.module.workflow.services.domain.model;
import com.jfeat.am.module.base.services.persistence.model.TicketAttachmentItem;
import com.jfeat.am.module.workflow.services.persistence.model.History;

import java.util.List;

/**
 * Created by Code Generator on 2017-10-25
 */
public class HistoryModel extends History{
    public List<TicketAttachmentItem> attachments;

    public List<TicketAttachmentItem> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<TicketAttachmentItem> attachments) {
        this.attachments = attachments;
    }
}
