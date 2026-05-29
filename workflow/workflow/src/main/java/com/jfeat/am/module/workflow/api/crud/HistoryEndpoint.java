package com.jfeat.am.module.workflow.api.crud;

import com.jfeat.am.module.base.services.persistence.model.TicketAttachmentItem;
import com.jfeat.am.module.base.services.service.TicketAttachmentItemService;
import com.jfeat.am.module.workflow.services.crud.service.HistoryService;
import com.jfeat.am.module.workflow.services.domain.model.HistoryModel;
import com.jfeat.am.module.workflow.services.domain.service.QueryHistoryService;
import com.jfeat.am.module.workflow.services.persistence.model.History;
import com.jfeat.crud.base.tips.SuccessTip;
import com.jfeat.crud.base.tips.Tip;
import com.jfeat.crud.plus.CRUD;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * <p>
 * api
 * </p>
 *
 * @author Code Generator
 * @since 2017-10-25
 */

@RestController
@RequestMapping("/api/wf/histories")
public class HistoryEndpoint {

    @Resource
    HistoryService historyService;

    @Resource
    QueryHistoryService queryHistoryService;

    @Resource
    TicketAttachmentItemService ticketAttachmentItemService;

    @PostMapping
    public Tip createHistory(@RequestBody History entity) {
        return SuccessTip.create(historyService.createMaster(entity));
    }

    @GetMapping
    //此方法可能需要自行添加需要的参数,按需要使用
    public Tip queryHistories(@RequestParam(required = false) Long formId,@RequestParam(required = false) Long instanceId) {

        List<HistoryModel> historyModels = new ArrayList();
        List<History> historys = queryHistoryService.findHistories(formId,instanceId);
        historys.forEach(hi -> {
            Map<String,String> map = new HashMap<>();
            map.put("ticket_id",hi.getId().toString());
            List<TicketAttachmentItem> ticketAttachmentItems = ticketAttachmentItemService.query(map);
            HistoryModel historyModel = CRUD.castObject(hi, HistoryModel.class);
            historyModel.setAttachments(ticketAttachmentItems);
            historyModels.add(historyModel);
        });
        return SuccessTip.create(historyModels);
    }


}
