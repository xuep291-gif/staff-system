package com.jfeat.am.module.base.services.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.jfeat.am.module.base.services.persistence.dao.TicketAttachmentItemMapper;
import com.jfeat.am.module.base.services.persistence.model.TicketAttachmentItem;
import com.jfeat.am.module.base.services.service.TicketAttachmentItemService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

/**
 * Created by Silent-Y on 2018/2/28.
 */
@Service
public class TicketAttachmentItemImpl implements TicketAttachmentItemService {

    @Resource
    TicketAttachmentItemMapper ticketAttachmentItemMapper;

    @Override
    public Integer create(TicketAttachmentItem ticketAttachmentItem) {
        return ticketAttachmentItemMapper.insert(ticketAttachmentItem);
    }

    @Override
    public TicketAttachmentItem retrieve(Long id) {
        return ticketAttachmentItemMapper.selectById(id);
    }

    @Override
    public List<TicketAttachmentItem> query(Map<String, String> map) {
        QueryWrapper<TicketAttachmentItem> entityWrapper = new QueryWrapper<TicketAttachmentItem>();
        map.forEach((k, v) -> entityWrapper.eq(k, v));
        return ticketAttachmentItemMapper.selectList(entityWrapper);
    }

    @Override
    public Integer delete(Map<String, String> map) {
        QueryWrapper<TicketAttachmentItem> entityWrapper = new QueryWrapper<>();
        map.forEach((k,v) -> entityWrapper.eq(k,v));
        return ticketAttachmentItemMapper.delete(entityWrapper);
    }
}
