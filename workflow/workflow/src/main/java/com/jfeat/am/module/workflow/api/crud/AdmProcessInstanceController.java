package com.jfeat.am.module.workflow.api.crud;


import com.alibaba.fastjson.JSONObject;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jfeat.am.core.jwt.JWTKit;
import com.jfeat.am.module.workflow.constant.ProcessInstanceType;
import com.jfeat.am.module.workflow.constant.ProcessStepApproceStatusEnum;
import com.jfeat.am.module.workflow.services.crud.service.ProcessInstanceService;
import com.jfeat.am.module.workflow.services.crud.service.ProcessUserService;
import com.jfeat.am.module.workflow.services.domain.model.ProcessInstanceRecord;
import com.jfeat.am.module.workflow.services.domain.service.QueryProcessInstanceService;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;
import com.jfeat.crud.base.exception.BusinessCode;
import com.jfeat.crud.base.exception.BusinessException;
import com.jfeat.crud.base.tips.SuccessTip;
import com.jfeat.crud.base.tips.Tip;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

@RestController
@RequestMapping("/api/adm/v2/wf/instances")
public class AdmProcessInstanceController {


    @Resource
    ProcessInstanceService processInstanceService;


    @Resource
    QueryProcessInstanceService queryProcessInstanceService;

    @Resource
    ProcessUserService processUserService;

    /**
     * 审批操作
     */
    @PostMapping("/{processInstanceId}/approve/{processStepId}")
    public Tip approve(@PathVariable Long processInstanceId,@PathVariable Long processStepId, @RequestBody JSONObject request) {
        String note = request.getString("note");
        Long userId = JWTKit.getUserId();
        Long endUserId = processUserService.sysEndConvertEndUser(userId);
        if (endUserId==null){
            throw new BusinessException(4023,"未找到该用户");
        }
        Integer result = processInstanceService.approve(endUserId,processInstanceId, processStepId, ProcessStepApproceStatusEnum.APPROVED.name(), note, request);
        return SuccessTip.create(result);
    }

    @PostMapping("/{processInstanceId}/reject/{processStepId}")
    public Tip reject(@PathVariable Long processInstanceId,@PathVariable Long processStepId, @RequestBody JSONObject request) {
        String note = request.getString("note");
        Long userId = JWTKit.getUserId();
        Long endUserId = processUserService.sysEndConvertEndUser(userId);
        if (endUserId==null){
            throw new BusinessException(4023,"未找到该用户");
        }
        Integer result = processInstanceService.approve(endUserId,processInstanceId, processStepId, ProcessStepApproceStatusEnum.REJECTED.name(), note, request);
        return SuccessTip.create(result);
    }



    @GetMapping("/{id}")
    public Tip getProcessInstance(@PathVariable Long id) {
        ProcessInstanceRecord processInstance = processInstanceService.getV2ProcessInstance(id);
        return SuccessTip.create(processInstance);
    }


    /**
     * 查询抄送给当前用户且已审批完成的流程实例
     */
    @GetMapping("/copy")
    public Tip getCopyProcessInstances() {
        Long userId = JWTKit.getUserId();
        if (userId==null){
            throw new BusinessException(BusinessCode.NoPermission,"请携带token请求");
        }
        Long endUserId = processUserService.sysEndConvertEndUser(userId);
        if (endUserId==null){
            throw new BusinessException(4023,"未找到该用户");
        }
        List<ProcessInstance> instances = processInstanceService.findCopyProcessInstances(userId);
        return SuccessTip.create(instances);
    }


    @GetMapping
    //此方法可能需要自行添加需要的参数,按需要使用
    public Tip queryProcessInstances(
            @RequestParam(name = "pageNum", required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(name = "pageSize", required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(name = "processId", required = false) Long processId,
            @RequestParam(name = "formId", required = false) Long formId,
            @RequestParam(name = "formGroup", required = false) String formGroup,
            @RequestParam(name = "formType", required = false) String formType,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "creator", required = false) String creator,
            @RequestParam(name = "executor", required = false) String executor,
            @RequestParam(name = "currentUserName", required = false) String currentUserName,
            @RequestParam(name = "type") String type) {
        Long userId = JWTKit.getUserId();
        if (userId==null){
            throw new BusinessException(BusinessCode.NoPermission,"请携带token请求");
        }
        Long endUserId = processUserService.sysEndConvertEndUser(userId);
        if (endUserId==null){
            throw new BusinessException(4023,"未找到该用户");
        }
        Page<ProcessInstance> processInstances = null;
        switch(type){
            case ProcessInstanceType.CREATOR_IS_ME:
                 processInstances = queryProcessInstanceService.findSelfProcessInstances
                        (pageNum, pageSize, null,endUserId,
                                processId, formId, formGroup, formType, status, name, creator, executor,null);
                break;
            case ProcessInstanceType.CURRENT_IS_ME:
                processInstances = queryProcessInstanceService.findSelfProcessInstances
                        (pageNum, pageSize, endUserId,null,
                                processId, formId, formGroup, formType, status, name, creator, executor,null);
                break;
            default:throw new BusinessException(4023,"错误的type");
        }

        return SuccessTip.create(processInstances);
    }
}
