package com.jfeat.am.module.virtualForm.api;


import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jfeat.am.module.virtualForm.services.domain.dao.QueryVirtualFormDao;
import com.jfeat.am.module.virtualForm.services.domain.model.VirtualFormRecord;
import com.jfeat.am.module.virtualForm.services.domain.service.VirtualFormService;
import com.jfeat.am.module.virtualForm.services.gen.persistence.dao.VirtualFormMapper;
import com.jfeat.am.module.virtualForm.services.gen.persistence.model.VirtualForm;
import com.jfeat.crud.base.exception.BusinessCode;
import com.jfeat.crud.base.exception.BusinessException;
import com.jfeat.crud.base.tips.SuccessTip;
import com.jfeat.crud.base.tips.Tip;
import com.jfeat.eav.services.domain.dao.QueryEavAttributeDao;
import com.jfeat.eav.services.domain.model.EavAttributeRecord;
import io.swagger.annotations.Api;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

/**
 * <p>
 * api
 * </p>
 *
 * @author Code generator
 * @since 2021-04-26
 */
@RestController

@Api("VirtualForm")
@RequestMapping("/api/adm/doc")
public class VirtualFormDocEndpoint {

    @Resource
    VirtualFormService virtualFormService;
    @Resource
    VirtualFormMapper virtualFormMapper;
    @Resource
    QueryVirtualFormDao queryVirtualFormDao;
    @Resource
    QueryEavAttributeDao queryEavAttributeDao;

    //修改表单模板
    @PutMapping("/editFormDoc")
    public Tip editFormDoc(@RequestBody VirtualFormRecord virtualFormRecord){
        virtualFormRecord.setOrgId(null);
        virtualFormRecord.setCode(null);
        virtualFormRecord.setUpdateTime(null);
        virtualFormRecord.setCreateTime(null);
        int i = virtualFormMapper.updateById(virtualFormRecord);
        return SuccessTip.create(i);
    }

    //根据表单id获取信息
    @GetMapping("/form/{formId}")
    public Tip getAttachmentByEntityId(@PathVariable("formId") Long formId){
        VirtualFormRecord virtualFormRecord = virtualFormService.getOne(formId);
        return SuccessTip.create(virtualFormRecord);
    }

    //根据formId获取attribute列表
    @GetMapping("/attributes/{formId}")
    public Tip getAttributeList(Page<EavAttributeRecord> page,
                                @RequestParam(name = "pageNum", required = false, defaultValue = "1") Integer pageNum,
                                @RequestParam(name = "pageSize", required = false, defaultValue = "10") Integer pageSize,
                                @RequestParam(name = "search", required = false) String search,
                                @RequestParam(name = "id", required = false) Long id,
                                @PathVariable(name = "formId", required = false) Long formId,
                                @RequestParam(name = "attributeName", required = false) String attributeName,
                                @RequestParam(name = "orderBy", required = false) String orderBy,
                                @RequestParam(name = "sort", required = false) String sort){

        page.setCurrent(pageNum);
        page.setSize(pageSize);
        VirtualFormRecord virtualFormRecord = queryVirtualFormDao.queryMasterRecord(formId);
        EavAttributeRecord record = new EavAttributeRecord();
        record.setId(id);
        record.setEntityId(virtualFormRecord.getEntityId());
        record.setAttributeName(attributeName);

        page.setRecords(queryEavAttributeDao.findEavAttributePage(page, record, search, orderBy));

        return SuccessTip.create(page);
    }

}
