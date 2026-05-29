package com.jfeat.am.module.workflow.api;


import com.jfeat.am.module.workflow.services.crud.service.ProcessInstanceStepService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
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
import org.springframework.dao.DuplicateKeyException;
import com.jfeat.am.module.workflow.services.domain.dao.QueryProcessInstanceStepDao;
import com.jfeat.crud.base.tips.SuccessTip;
import com.jfeat.crud.base.tips.Tip;
import com.jfeat.am.module.log.annotation.BusinessLog;
import com.jfeat.crud.base.exception.BusinessCode;
import com.jfeat.crud.base.exception.BusinessException;
import com.jfeat.am.module.workflow.api.permission.*;
import com.jfeat.am.common.annotation.Permission;

import com.jfeat.am.module.workflow.services.domain.model.ProcessInstanceStepRecord;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstanceStep;

import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.List;

/**
 * <p>
 * api
 * </p>
 *
 * @author Code generator
 * @since 2021-05-20
 */
@RestController

@Api("ProcessInstanceStep")
@RequestMapping("/api/crud/processInstanceStep/processInstanceSteps")
public class ProcessInstanceStepEndpoint {

    @Resource
    ProcessInstanceStepService processInstanceStepService;


    @Resource
    QueryProcessInstanceStepDao queryProcessInstanceStepDao;

    @BusinessLog(name = "ProcessInstanceStep", value = "create ProcessInstanceStep")
    @Permission(ProcessInstanceStepPermission.PROCESSINSTANCESTEP_NEW)
    @PostMapping
    @ApiOperation(value = "新建 ProcessInstanceStep", response = ProcessInstanceStep.class)
    public Tip createProcessInstanceStep(@RequestBody ProcessInstanceStep entity) {

        Integer affected = 0;
        try {
            affected = processInstanceStepService.createMaster(entity);

        } catch (DuplicateKeyException e) {
            throw new BusinessException(BusinessCode.DuplicateKey);
        }

        return SuccessTip.create(affected);
    }

    @Permission(ProcessInstanceStepPermission.PROCESSINSTANCESTEP_VIEW)
    @GetMapping("/{id}")
    @ApiOperation(value = "查看 ProcessInstanceStep", response = ProcessInstanceStep.class)
    public Tip getProcessInstanceStep(@PathVariable Long id) {
        return SuccessTip.create(processInstanceStepService.queryMasterModel(queryProcessInstanceStepDao, id));
    }

    @BusinessLog(name = "ProcessInstanceStep", value = "update ProcessInstanceStep")
    @Permission(ProcessInstanceStepPermission.PROCESSINSTANCESTEP_EDIT)
    @PutMapping("/{id}")
    @ApiOperation(value = "修改 ProcessInstanceStep", response = ProcessInstanceStep.class)
    public Tip updateProcessInstanceStep(@PathVariable Long id, @RequestBody ProcessInstanceStep entity) {
        entity.setId(id);
        return SuccessTip.create(processInstanceStepService.updateMaster(entity));
    }

    @BusinessLog(name = "ProcessInstanceStep", value = "delete ProcessInstanceStep")
    @Permission(ProcessInstanceStepPermission.PROCESSINSTANCESTEP_DELETE)
    @DeleteMapping("/{id}")
    @ApiOperation("删除 ProcessInstanceStep")
    public Tip deleteProcessInstanceStep(@PathVariable Long id) {
        return SuccessTip.create(processInstanceStepService.deleteMaster(id));
    }

    @Permission(ProcessInstanceStepPermission.PROCESSINSTANCESTEP_VIEW)
    @ApiOperation(value = "ProcessInstanceStep 列表信息", response = ProcessInstanceStepRecord.class)
    @GetMapping
    @ApiImplicitParams({
            @ApiImplicitParam(name = "pageNum", dataType = "Integer"),
            @ApiImplicitParam(name = "pageSize", dataType = "Integer"),
            @ApiImplicitParam(name = "search", dataType = "String"),
            @ApiImplicitParam(name = "id", dataType = "Long"),
            @ApiImplicitParam(name = "stepId", dataType = "Long"),
            @ApiImplicitParam(name = "instanceId", dataType = "Long"),
            @ApiImplicitParam(name = "entityId", dataType = "Long"),
            @ApiImplicitParam(name = "rowId", dataType = "Long"),
            @ApiImplicitParam(name = "virtualFormCode", dataType = "String"),
            @ApiImplicitParam(name = "orderBy", dataType = "String"),
            @ApiImplicitParam(name = "sort", dataType = "String")
    })
    public Tip queryProcessInstanceSteps(Page<ProcessInstanceStepRecord> page,
                                         @RequestParam(name = "pageNum", required = false, defaultValue = "1") Integer pageNum,
                                         @RequestParam(name = "pageSize", required = false, defaultValue = "10") Integer pageSize,
                                         @RequestParam(name = "search", required = false) String search,
                                         @RequestParam(name = "id", required = false) Long id,

                                         @RequestParam(name = "stepId", required = false) Long stepId,

                                         @RequestParam(name = "instanceId", required = false) Long instanceId,

                                         @RequestParam(name = "entityId", required = false) Long entityId,

                                         @RequestParam(name = "rowId", required = false) Long rowId,

                                         @RequestParam(name = "virtualFormCode", required = false) String virtualFormCode,
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

        ProcessInstanceStepRecord record = new ProcessInstanceStepRecord();
        record.setId(id);
        record.setStepId(stepId);
        record.setInstanceId(instanceId);
        record.setEntityId(entityId);
        record.setRowId(rowId);
        record.setVirtualFormCode(virtualFormCode);


        List<ProcessInstanceStepRecord> processInstanceStepPage = queryProcessInstanceStepDao.findProcessInstanceStepPage(page, record, search, orderBy, null, null);

        page.setRecords(processInstanceStepPage);

        return SuccessTip.create(page);
    }
}
