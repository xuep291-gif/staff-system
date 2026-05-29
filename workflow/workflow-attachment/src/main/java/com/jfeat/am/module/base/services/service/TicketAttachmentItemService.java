package com.jfeat.am.module.base.services.service;

import com.jfeat.am.module.base.services.persistence.model.TicketAttachmentItem;

import java.util.List;
import java.util.Map;

/**
 * Created by Silent-Y on 2018/2/28.
 */
public interface TicketAttachmentItemService {

    Integer create(TicketAttachmentItem ticketAttachmentItem);

    TicketAttachmentItem retrieve(Long id);

    List<TicketAttachmentItem> query(Map<String,String> map);

    Integer delete(Map<String,String> map);
}
