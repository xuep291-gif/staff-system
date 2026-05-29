package com.jfeat.am.module.workflow.api.crud;

import com.alibaba.fastjson.JSONObject;
import com.jfeat.am.common.annotation.Permission;
import com.jfeat.am.core.jwt.JWTKit;
import com.jfeat.am.module.log.annotation.BusinessLog;
import com.jfeat.am.module.workflow.constant.ProcessStatusEnum;
import com.jfeat.am.module.workflow.constant.WorkflowPermission;
import com.jfeat.am.module.workflow.services.crud.filter.ProcessFilter;
import com.jfeat.am.module.workflow.services.crud.service.ProcessService;
import com.jfeat.am.module.workflow.services.crud.service.ProcessStepService;
import com.jfeat.am.module.workflow.services.domain.service.QueryProcessService;
import com.jfeat.am.module.workflow.services.persistence.dao.ProcessMapper;
import com.jfeat.am.module.workflow.services.persistence.model.Process;
import com.jfeat.crud.base.exception.BusinessCode;
import com.jfeat.crud.base.exception.BusinessException;
import com.jfeat.crud.base.tips.SuccessTip;
import com.jfeat.crud.base.tips.Tip;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

/**
 * <p>
 * api
 * </p>
 *
 * @author Code Generator
 * @since 2017-10-25
 */
@RestController
@RequestMapping("/api/adm/wf/processes")
public class ProcessEndpoint  {

    @Resource
    ProcessService processService;

    @Resource
    QueryProcessService queryProcessService;
    @Resource
    ProcessMapper processMapper;
    @Resource
    ProcessStepService processStepService;

    @PostMapping
    @BusinessLog(name = "工作流",value = "新增流程")
    @Permission(WorkflowPermission.WORKFLOW_EDIT)
    public Tip createProcess(@RequestBody Process entity) {
        Long orgId = JWTKit.getTenantOrgId();
        orgId = orgId == null ? JWTKit.getOrgId():orgId;
        entity.setOrgId(orgId);
        processService.createProcess(entity);
        return SuccessTip.create(entity.getId());
    }

    //根据id查看流程
    @GetMapping("/{id}")
    public Tip getProcess(@PathVariable Long id) {
        JSONObject processInfo = processService.selectOne(id,false);
        return SuccessTip.create(processInfo);
    }


    @PutMapping("/{id}")
    @BusinessLog(name = "工作流",value = "修改流程")
    @Permission(WorkflowPermission.WORKFLOW_EDIT)
    public Tip updateProcess(@PathVariable Long id, @RequestBody Process entity) {
        entity.setId(id);
        return SuccessTip.create(processService.updateMaster(entity));
    }

    @DeleteMapping("/{id}")
    @BusinessLog(name = "工作流",value = "删除流程")
    @Permission(WorkflowPermission.WORKFLOW_EDIT)
    public Tip deleteProcess(@PathVariable Long id) {
        // 需要检查删除条件, 哪些流程不能删除？
        // 中电设备项目已知：
        //   设备入库 设备出库 设备盘点  库存调整  库存移库
        //   工单计划 工单执行 工单验收
        //   设备申请 设备借用 设备租用 设备停用 设备报废 设备革新
        //   故障
        //  TODO, 属于应用层，这里属基础层无法控制
        //        any idea ?
        Process process = processService.retrieveMaster(id);
        if(!process.getAllowDelete()){
            throw new BusinessException(BusinessCode.CRUD_DELETE_FAILURE,"该项不允许删除");
        }
        Boolean processInstanceFlag = processService.checkProcessInstance(id);
        if(!processInstanceFlag){
            throw new BusinessException(BusinessCode.CRUD_DELETE_FAILURE,"该流程已存在实例，请删除实例后再删除此流程");
        }


        return SuccessTip.create(processService.deleteMaster(id));
    }

    @GetMapping
    //此方法可能需要自行添加需要的参数,按需要使用
    @Permission(WorkflowPermission.WORKFLOW_VIEW)
    public Tip queryProcesses(@RequestParam(required = false) String formType,
            @RequestParam(name = "search" , required = false)String search,
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "status", required = false) String status) {

        return SuccessTip.create(queryProcessService.findProcesses(search,formType, name, status));
    }

    @PutMapping("/status/{id}")
    @BusinessLog(name = "工作流",value = "修改状态")
    @Permission(WorkflowPermission.WORKFLOW_EDIT)
    public Tip updateProcessStatus(@PathVariable Long id) {
        Process process = processMapper.selectById(id);
        //
        if( process.getStatus()!=null &&  process.getStatus().equals(ProcessStatusEnum.DISABLED.toString())){
            process.setStatus(ProcessStatusEnum.ENABLED.toString());
        }else if(process.getStatus()!=null){
            process.setStatus(ProcessStatusEnum.DISABLED.toString());
        }
        int i = processMapper.updateById(process);
        return SuccessTip.create(i);
    }


}
