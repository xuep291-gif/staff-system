package com.jfeat.am.module.workflow.api.crud;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.jfeat.am.common.annotation.Permission;
import com.jfeat.am.module.workflow.constant.ProcessStepTypeEnum;
import com.jfeat.am.module.workflow.constant.WorkflowPermission;
import com.jfeat.am.module.workflow.services.crud.service.ProcessStepApprovalService;
import com.jfeat.am.module.workflow.services.crud.service.ProcessStepService;
import com.jfeat.am.module.workflow.services.domain.dao.QueryProcessStepDao;
import com.jfeat.am.module.workflow.services.domain.model.ProcessStepModel;
import com.jfeat.am.module.workflow.services.persistence.dao.ProcessStepMapper;
import com.jfeat.am.module.workflow.services.persistence.model.NodeAssign;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;
import com.jfeat.crud.base.exception.BusinessCode;
import com.jfeat.crud.base.exception.BusinessException;
import com.jfeat.crud.base.tips.SuccessTip;
import com.jfeat.crud.base.tips.Tip;
import com.jfeat.crud.plus.CRUD;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
public class ProcessStepEndpoint  {

    @Resource
    ProcessStepService processStepService;
    @Resource
    QueryProcessStepDao queryProcessStepDao;
    @Resource
    ProcessStepMapper processStepMapper;

    @Resource
    private ProcessStepApprovalService processStepApprovalService;

    @GetMapping("/{processId}/steps")
    @Permission(WorkflowPermission.WORKFLOW_VIEW)
    public Tip queryProcessSteps(@PathVariable Long processId) {
        return SuccessTip.create(processStepService.getNestedStepsByProcessId(processId));
    }


    @GetMapping("/{processId}/steps/children")
    @Permission(WorkflowPermission.WORKFLOW_VIEW)
    public Tip queryProcessStepsChildren(@PathVariable Long processId) {
        QueryWrapper<ProcessStep> processStepQueryWrapper = new QueryWrapper<>();
        processStepQueryWrapper.eq(ProcessStep.PROCESS_ID, processId);
        List<ProcessStep> processSteps = queryProcessStepDao.selectList(processStepQueryWrapper);
        JSONObject children = new JSONObject();
        children.put("children",processSteps);
        return SuccessTip.create(children);
    }

    //根据步骤id 获取可选的下一步列表（排除自身的）
    @GetMapping("/{stepId}/steps/nextStepsByStepId")
    @Permission(WorkflowPermission.WORKFLOW_VIEW)
    public Tip queryProcessNextSteps(@PathVariable Long stepId) {
        ProcessStep processStep = queryProcessStepDao.selectById(stepId);
        Map<Long, ProcessStep> stepMaps = processStepMapper.selectNextSteps(processStep.getProcessId(),null).stream().collect(Collectors.toMap(i -> i.getId(), i -> i));
        stepMaps.remove(stepId);
        return SuccessTip.create(stepMaps.values());
    }

    //根据流程id 获取可选的下一步列表 全部的步骤
    @GetMapping("/{processId}/steps/nextStepsByProcessId")
    @Permission(WorkflowPermission.WORKFLOW_VIEW)
    public Tip queryProcessNextStepsByProcessId(@PathVariable Long processId,
                                                @RequestParam(name = "search", required = false) String search) {
        return SuccessTip.create(processStepMapper.selectNextSteps(processId,search));
    }




    @PostMapping("/{processId}/steps")
    @Permission(WorkflowPermission.WORKFLOW_EDIT)
    public Tip createProcessStep(@PathVariable Long processId,
                                 @RequestBody ProcessStepModel entity) {
        entity.setProcessId(processId);
        if (entity.getNodeAssigneeList()==null || entity.getNodeAssigneeList().size()<1) {
            throw new BusinessException(4001, "缺少必填字段: " +"nodeAssigneeList" );
        }
        if (entity.getNodeAssigneeList().size()>1){
            entity.setMultiApprover(true);
        }


        if (entity.getType()==null){
            entity.setType(ProcessStepTypeEnum.MIDDLE.name());
        }else {
            ProcessStepTypeEnum processStepTypeEnum = ProcessStepTypeEnum.fromName(entity.getType());
            if (processStepTypeEnum != null && processStepTypeEnum.isUserAddable()){
                entity.setType(processStepTypeEnum.name());
            }else {
                entity.setType(ProcessStepTypeEnum.MIDDLE.name());
            }
        }

        return SuccessTip.create(processStepService.createProcessStepWithValidation(processId, entity));
    }

    //获取步骤详情
    @GetMapping("/steps/{id}")
    public Tip getProcessStep(@PathVariable Long id) {
        ProcessStepModel processStep = processStepService.getProcessStep(id);
        processStep.setNodeAssigneeList(processStepApprovalService.selectProcessStepApprovals(processStep));
        return SuccessTip.create(processStep);
    }


    @PutMapping("/steps/{id}")
    @Permission(WorkflowPermission.WORKFLOW_EDIT)
    public Tip updateProcessStep(
                                 @PathVariable Long id,
                                 @RequestBody ProcessStepModel entity) {
        
//        JSONArray nodeAssigneeList = request.getJSONArray("nodeAssigneeList");
//        request.remove("nodeAssigneeList");
//        ProcessStepModel entity = request.toJavaObject(ProcessStepModel.class);

        if (entity.getNodeAssigneeList()== null || entity.getNodeAssigneeList().size() < 1) {
            throw new BusinessException(4001, "缺少必填字段: " + "nodeAssigneeList");
        }

//        List<NodeAssign> nodeAssignList = new ArrayList<>();
//        for (int i = 0; i < nodeAssigneeList.size(); i++) {
//            NodeAssign nodeAssign = new NodeAssign();
//            nodeAssign.setId((Long) nodeAssigneeList.get(i));
//            nodeAssignList.add(nodeAssign);
//        }
//        entity.setNodeAssigneeList(nodeAssignList);


        if (entity.getNodeAssigneeList().size()>1){
            entity.setMultiApprover(true);
        }

        entity.setId(id);
        ProcessStep processStep1 = processStepMapper.selectById(entity.getId());
        if (processStep1==null){
            throw new BusinessException(BusinessCode.BadRequest,"未找到");
        }


        entity.setPid(processStep1.getPid());

//        判断是否允许前端增添的节点
        entity.setType(processStep1.getType());

        entity.setNextId(processStep1.getNextId());
        ProcessStep processStep = CRUD.castObject(entity, ProcessStep.class);
        processStepApprovalService.createProcessStepApprovals(processStep,entity.getNodeAssigneeList());
        return SuccessTip.create(processStepService.updateMaster(processStep));
    }

    @DeleteMapping("/{processId}/steps/{id}")
    @Permission(WorkflowPermission.WORKFLOW_EDIT)
    public Tip deleteProcessStep(@PathVariable Long processId,
                                 @PathVariable Long id) {
        Integer affected = processStepService.deleteMaster(id);
        processStepService.filterNextSteps(processId);
        return SuccessTip.create(affected);
    }

    @DeleteMapping("/steps/{id}")
    @Permission(WorkflowPermission.WORKFLOW_EDIT)
    public Tip deleteProcessStepById(
                                 @PathVariable Long id) {
        Integer affected = processStepService.deleteProcessStep(id);
        return SuccessTip.create(affected);
    }

}
