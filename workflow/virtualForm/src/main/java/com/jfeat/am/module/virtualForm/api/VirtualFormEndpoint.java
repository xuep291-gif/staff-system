package com.jfeat.am.module.virtualForm.api;


import com.jfeat.am.module.virtualForm.services.gen.crud.model.VirtualFormModel;
import com.jfeat.crud.plus.META;
import com.jfeat.am.core.jwt.JWTKit;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.web.bind.annotation.GetMapping;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.dao.DuplicateKeyException;
import com.jfeat.am.module.virtualForm.services.domain.dao.QueryVirtualFormDao;
import com.jfeat.crud.base.tips.SuccessTip;
import com.jfeat.crud.base.tips.Tip;
import com.jfeat.am.module.log.annotation.BusinessLog;
import com.jfeat.crud.base.exception.BusinessCode;
import com.jfeat.crud.base.exception.BusinessException;
import com.jfeat.am.module.virtualForm.api.permission.*;
import com.jfeat.am.common.annotation.Permission;

import com.jfeat.am.module.virtualForm.services.domain.service.*;
import com.jfeat.am.module.virtualForm.services.domain.model.VirtualFormRecord;
import com.jfeat.am.module.virtualForm.services.gen.persistence.model.VirtualForm;

import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.Date;
import java.util.List;

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
@RequestMapping("/api/adm/crud/virtualForm/virtualForms")
public class VirtualFormEndpoint {

    @Resource
    VirtualFormService virtualFormService;


    @Resource
    QueryVirtualFormDao queryVirtualFormDao;

    @BusinessLog(name = "表单", value = "新建表单")
    @Permission(VirtualFormPermission.VIRTUALFORM_NEW)
    @PostMapping
    @ApiOperation(value = "新建 VirtualForm", response = VirtualFormModel.class)
    public Tip createVirtualForm(@RequestBody VirtualFormModel entity) {
        Integer affected = 0;
//        entity.setOrgId(JWTKit.getOrgId());
        try {
            affected = virtualFormService.createForm(entity);
        } catch (DuplicateKeyException e) {
            throw new BusinessException(BusinessCode.DuplicateKey);
        }
        return SuccessTip.create(affected);
    }

    @Permission(VirtualFormPermission.VIRTUALFORM_VIEW)
    @GetMapping("/{id}")
    @ApiOperation(value = "查看 VirtualForm", response = VirtualForm.class)
    public Tip getVirtualForm(@PathVariable Long id) {
        return SuccessTip.create(virtualFormService.getOneToJSON(id));
    }

    @BusinessLog(name = "表单", value = "更新表单")
    @Permission(VirtualFormPermission.VIRTUALFORM_EDIT)
    @PutMapping("/{id}")
    @ApiOperation(value = "修改 VirtualForm", response = VirtualForm.class)
    public Tip updateVirtualForm(@PathVariable Long id, @RequestBody VirtualFormModel entity) {
        entity.setId(id);
        entity.setOrgId(null);
        return SuccessTip.create(virtualFormService.updateForm(entity));
    }

    @BusinessLog(name = "表单", value = "删除表单")
    @Permission(VirtualFormPermission.VIRTUALFORM_DELETE)
    @DeleteMapping("/{id}")
    @ApiOperation("删除 VirtualForm")
    public Tip deleteVirtualForm(@PathVariable Long id) {
        return SuccessTip.create(virtualFormService.deleteForm(id));
    }

    @Permission(VirtualFormPermission.VIRTUALFORM_VIEW)
    @ApiOperation(value = "VirtualForm 列表信息", response = VirtualFormRecord.class)
    @GetMapping
    public Tip queryVirtualForms(Page<VirtualFormRecord> page,
                                 @RequestParam(name = "pageNum", required = false, defaultValue = "1") Integer pageNum,
                                 @RequestParam(name = "pageSize", required = false, defaultValue = "10") Integer pageSize,
                                 @RequestParam(name = "search", required = false) String search,
                                 @RequestParam(name = "id", required = false) Long id,
                                 @RequestParam(name = "typeId", required = false) Long typeId,
                                 @RequestParam(name = "code", required = false) String code,
                                 @RequestParam(name = "designData", required = false) String designData,
                                 @RequestParam(name = "entityId", required = false) Long entityId,
                                 @RequestParam(name = "type", required = false) String type,
                                 @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
                                 @RequestParam(name = "createTime", required = false) Date createTime,
                                 @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
                                 @RequestParam(name = "updateTime", required = false) Date updateTime,
                                 @RequestParam(name = "orderBy", required = false) String orderBy,
                                 @RequestParam(name = "sort", required = false) String sort) {

        if (orderBy != null && orderBy.length() > 0) {
            if (sort != null && sort.length() > 0) {
                String pattern = "(ASC|DESC|asc|desc)";
                if (!sort.matches(pattern)) {
                    throw new BusinessException(BusinessCode.BadRequest.getCode(), "sort must be ASC or DESC");//此处异常类型根据实际情况而定
                }
            } else {
                sort = "ASC";
            }
            orderBy = "`" + orderBy + "`" + " " + sort;
        }
        page.setCurrent(pageNum);
        page.setSize(pageSize);

        VirtualFormRecord record = new VirtualFormRecord();
        record.setId(id);
        record.setCode(code);
        record.setDesignData(designData);
        record.setEntityId(entityId);
        record.setType(type);
        if (META.enabledSaas()) {
            record.setOrgId(JWTKit.getOrgId());
        }
        record.setCreateTime(createTime);
        record.setUpdateTime(updateTime);


        List<VirtualFormRecord> virtualFormPage = queryVirtualFormDao.findVirtualFormPage(page, record, search, orderBy, null, null,typeId);

        page.setRecords(virtualFormPage);

        return SuccessTip.create(page);
    }
}
