package com.jfeat.am.module.workflow.services.crud.service.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.jfeat.am.module.virtualForm.services.gen.persistence.dao.VirtualFormMapper;
import com.jfeat.am.module.workflow.constant.ProcessStepApproceTypeEnum;
import com.jfeat.am.module.workflow.constant.ProcessStepTypeEnum;
import com.jfeat.am.module.workflow.services.crud.service.ProcessStepApprovalService;
import com.jfeat.am.module.workflow.services.crud.service.ProcessStepService;
import com.jfeat.am.module.workflow.services.domain.model.ProcessStepModel;
import com.jfeat.am.module.workflow.services.persistence.dao.ProcessStepApprovalMapper;
import com.jfeat.am.module.workflow.services.persistence.dao.ProcessStepMapper;
import com.jfeat.am.module.workflow.services.persistence.model.NodeAssign;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStepApproval;
import com.jfeat.crud.base.exception.BusinessCode;
import com.jfeat.crud.base.exception.BusinessException;
import com.jfeat.crud.base.tips.SuccessTip;
import com.jfeat.crud.base.util.StrKit;
import com.jfeat.crud.plus.CRUD;
import com.jfeat.crud.plus.impl.CRUDServiceOnlyImpl;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * <p>
 * implementation
 * </p>
 *
 * @author Code Generator
 * @since 2017-10-25
 */

@Service
public class ProcessStepServiceImpl extends CRUDServiceOnlyImpl<ProcessStep> implements ProcessStepService {

    @Resource
    private ProcessStepMapper processStepMapper;


    @Resource
    private ProcessStepApprovalMapper processStepApprovalMapper;

    @Resource
    private ProcessStepApprovalService processStepApprovalService;



    @Override
    public ProcessStep createProcessStepWithValidation(Long processId, ProcessStepModel entity) {
        logger.info("开始创建流程步骤，流程ID: {}, 步骤名称: {}", processId, entity.getName());

        if (entity.getPid() == null || entity.getPid()<1) {
            logger.error("创建流程步骤失败，父节点不存在或不属于当前流程");
            throw new BusinessException(BusinessCode.BadRequest,"父节点不存在或不属于当前流程");
        }
        // 一次性获取所有相关步骤
        List<ProcessStep> allSteps = processStepMapper.selectList(
            new QueryWrapper<ProcessStep>().eq("process_id", processId));

        Map<Long, ProcessStep> stepMap = allSteps.stream()
            .collect(Collectors.toMap(ProcessStep::getId, step -> step));



        // 验证pid是否存在
        ProcessStep parentStep = stepMap.get(entity.getPid());
        if (parentStep == null || !parentStep.getProcessId().equals(processId)) {
            throw new BusinessException(BusinessCode.BadRequest,"父节点不存在或不属于当前流程");
        }

        // 验证nextId
        if (entity.getNextId() != null) {
            if (!stepMap.containsKey(entity.getNextId())) {
                throw new BusinessException(BusinessCode.BadRequest,"下一步骤不存在或不属于当前流程");
            }
        }
        ProcessStepTypeEnum processStepTypeEnum = ProcessStepTypeEnum.fromName(entity.getType());
        if (processStepTypeEnum!=null && ProcessStepTypeEnum.COPY.name().equals(processStepTypeEnum.name())) {
//            判断下一个节点是否是最后节点 ，上一个节点是否抄送节点
            ProcessStep processStep = stepMap.get(parentStep.getNextId());
            ProcessStep processStep1 = stepMap.get(parentStep.getId());
            if (processStep == null || !ProcessStepTypeEnum.END.name().equals(processStep.getType()) || ProcessStepTypeEnum.COPY.name().equals(processStep1.getType())) {
                throw new BusinessException(BusinessCode.BadRequest,"抄送节点必须在最后节点前一个");
            }
        }


        // 创建新步骤
        ProcessStep processStep = CRUD.castObject(entity, ProcessStep.class);
        
        // 处理nextId关系
        processStep.setNextId(parentStep.getNextId());
        parentStep.setNextId(processStep.getId());


       processStepMapper.insertAndReturnId(processStep);
       processStepApprovalService.createProcessStepApprovals(processStep,entity.getNodeAssigneeList());

        // 批量更新所有修改过的步骤
        List<ProcessStep> stepsToUpdate = new ArrayList<>();

        // 更新子节点
        if (processStep.getNextId() != null) {
            ProcessStep nextStep = stepMap.get(processStep.getNextId());
            if (nextStep != null) {
                nextStep.setPid(processStep.getId());
                stepsToUpdate.add(nextStep);
            }
        }

        // 更新父节点
        if (entity.getPid() != null) {
            ProcessStep pid = stepMap.get(processStep.getPid());
            if (pid != null) {
                pid.setNextId(processStep.getId());
                stepsToUpdate.add(pid);
            }
        }



        if (!stepsToUpdate.isEmpty()) {
            for (ProcessStep step : stepsToUpdate) {
                processStepMapper.updateById(step);
            }
        }


        return processStep;
    }




    @Override
    protected BaseMapper<ProcessStep> getMasterMapper() {
        return processStepMapper;
    }
    
    @Override
    public List<ProcessStep> getSortedStepsByProcessId(Long processId) {
        QueryWrapper<ProcessStep> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("process_id", processId);
        List<ProcessStep> steps = processStepMapper.selectList(queryWrapper);
        
        // 创建步骤ID到步骤对象的映射
        Map<Long, ProcessStep> stepMap = steps.stream()
            .collect(Collectors.toMap(ProcessStep::getId, step -> step));
        
        // 构建链表顺序
        List<ProcessStep> sortedSteps = new ArrayList<>();
        // 找到根节点(pid为null或0的节点)
        ProcessStep current = steps.stream()
            .filter(step -> step.getPid() == null || step.getPid() == -1)
            .findFirst().orElse(null);
            
        // 按照链表顺序遍历
        while(current != null) {
            sortedSteps.add(current);
            current = stepMap.get(current.getNextId());
        }
        
        return sortedSteps;
    }
    
    @Override
    public ProcessStep getNestedStepsByProcessId(Long processId) {
        List<ProcessStep> steps = getSortedStepsByProcessId(processId);
        
        // 创建步骤ID到步骤对象的映射
        Map<Long, ProcessStep> stepMap = steps.stream()
            .collect(Collectors.toMap(ProcessStep::getId, step -> step));
        
        // 构建嵌套结构
        ProcessStep rootStep = null;
        for (ProcessStep step : steps) {
            if (step.getPid() == null || step.getPid() == -1) {
                rootStep = step;
            } else {
                ProcessStep parent = stepMap.get(step.getPid());
                if (parent != null) {
                    parent.setChildren(step);
                }
            }
        }
        
        return rootStep;
    }

    /**
     * 若nextStepStr，比如["12345", "11111", "222"]中某一个元素（id）对应的ProcessStep在数据库中已经不存在了，则把此id删除
     */
    @Override
    public String filterNextSteps(String nextStepsStr) {
        String nextStepStrAfterTrim = StrKit.trim(nextStepsStr);  // "["12345", "111111", "222"]"
        if (StrKit.isBlank(nextStepStrAfterTrim) || nextStepStrAfterTrim.equals("[]")) {
            return nextStepStrAfterTrim;
        }
        String subStepStrTemp = nextStepStrAfterTrim.substring(1, nextStepStrAfterTrim.length() - 1);
        String subStepStr = subStepStrTemp.replace("\"", "");

        String[] arr = subStepStr.split(",");
        List<String> result = new ArrayList<>();
        for (String strId : arr) {
            String strIdAfterTrim = StrKit.trim(strId);
            ProcessStep processStep = processStepMapper.selectById(strIdAfterTrim);
            if (processStep != null) {
                result.add("\"" + strIdAfterTrim + "\"");
            }
        }
        return result.toString();
    }
    
    @Override
    public Integer deleteProcessStep(Long id) {
        logger.info("开始删除流程步骤，步骤ID: {}", id);
        ProcessStep step = processStepMapper.selectById(id);
        if (step == null) {
            logger.error("删除流程步骤失败，节点不存在");
            throw new BusinessException(BusinessCode.BadRequest, "节点不存在");
        }
        
        // 检查是否为根节点或尾节点
        if ((step.getPid() == null || step.getPid() == -1L) 
            || (step.getNextId() == null || step.getNextId() == -1L)) {
            throw new BusinessException(BusinessCode.BadRequest, "根节点和尾节点不能删除");
        }
        
        // 获取相邻节点
        ProcessStep prevStep = processStepMapper.selectById(step.getPid());
        ProcessStep nextStep = step.getNextId() != null ? processStepMapper.selectById(step.getNextId()) : null;
        
        // 更新相邻节点关系
        if (prevStep != null && nextStep != null) {
            // 将前驱节点的nextId指向后继节点
            prevStep.setNextId(nextStep.getId());
            // 将后继节点的pid指向前驱节点
            nextStep.setPid(prevStep.getId());
            
            // 更新前驱节点的nextSteps
            JSONArray nextSteps = prevStep.getNextSteps() != null 
                ? JSONArray.parseArray(prevStep.getNextSteps()) 
                : new JSONArray();
            nextSteps.remove(step.getId());
            nextSteps.add(nextStep.getId());
            prevStep.setNextSteps(nextSteps.toJSONString());
            
            processStepMapper.updateById(prevStep);
            processStepMapper.updateById(nextStep);
        }
        QueryWrapper<ProcessStepApproval> approvalQueryWrapper = new QueryWrapper<>();
        approvalQueryWrapper.eq("step_id", id);
        processStepApprovalMapper.delete(approvalQueryWrapper);
        return processStepMapper.deleteById(id);
    }

    /**
     * 检查某个流程的所有步骤，如果该步骤的nextStep字符串中某个id对应的ProcessStep在数据库中已经不存在了，则删除这个id
     */
    public void filterNextSteps(Long processId) {
        List<ProcessStep> processSteps = processStepMapper.selectList(
                new QueryWrapper<ProcessStep>().eq(ProcessStep.PROCESS_ID, processId)
        );
        for (ProcessStep processStep : processSteps) {
            if (StrKit.isBlank(processStep.getNextSteps())) {
                continue;
            }
            processStep.setNextSteps(filterNextSteps(processStep.getNextSteps()));
            processStepMapper.updateById(processStep);
        }
    }

    //获取开始步骤对应的App设计 json
    @Override
    public String getStartStepDesignJson(Long processId){
        String designData = processStepMapper.selectStartStepDesignJson(processId);
        return designData;
    }

    //获取开始步骤对应的表单json
    @Override
    public String getStartStepFormJson(Long processId){
        String designData = processStepMapper.selectStartStepFormJson(processId);
        return designData;
    }


    //获取开始步骤
    @Override
    public ProcessStepModel getStartStep(Long processId){
        List<ProcessStepModel> processSteps = processStepMapper.selectStartStepByProcessId(processId);
        if(processSteps!=null&&processSteps.size()>0) {
            return processSteps.get(0);
        }else{
            return null;
        }
    }

    //获取下一步
    @Override
    public List<ProcessStepModel> findNextStep(Long processId,Long stepId){
        if(stepId == null){
            //根据流程id获取开始步骤的信息
            ProcessStepModel startStep = getStartStep(processId);
                if(startStep!=null){
                    String nextSteps = startStep.getNextSteps();
                    if(StringUtils.isEmpty(nextSteps)||nextSteps.equals("[]")){
                        //获取开始步骤的默认下一步信息
                        ProcessStepModel processStep = processStepMapper.selectStartStepNextStep(processId);
                        List<ProcessStepModel> processStepList =new ArrayList<>();
                        processStepList.add(processStep);
                        return processStepList;
                    }else{
                        //获取开始步骤的配置下一步信息
                        JSONArray idArray = JSONArray.parseArray(nextSteps);
                        List<Long> ids = idArray.toJavaList(Long.class);
                        List<ProcessStepModel> processStepList =  processStepMapper.selectNextStepsById(ids);
                        return processStepList;
                    }
                }else{
                    return null;
                }

        }else{
            return null;
        }

    }


    @Override
    public ProcessStepModel getProcessStep(Long id){

        ProcessStepModel processStepModel = selectModel(id);

        if(processStepModel!=null){
            String nextSteps = processStepModel.getNextSteps();
            JSONArray nextStepsArray = JSONArray.parseArray(nextSteps);
            if(nextStepsArray!=null){
                List<Long> ids = nextStepsArray.toJavaList(Long.class);
                 if(ids!=null&&ids.size()>0){
                     List<ProcessStep> processSteps = processStepMapper.selectStepsInIds(ids);
                     JSONArray array= JSONArray.parseArray(JSON.toJSONString(processSteps));
                     processStepModel.setNextStepString(array);
                 }
            }
        }

        return processStepModel;
    }

    @Override
    public ProcessStep selectOne(Long id){
        ProcessStep processStep = processStepMapper.selectById(id);
        return processStep;
    }

    @Override
    public ProcessStepModel selectModel(Long id) {
        ProcessStepModel processStepModel = processStepMapper.selectModel(id);
        return processStepModel;
    }

    @Override
    public String getDesignJsonByStepId(Long stepId){
        String designString = processStepMapper.getDesignJsonByStepId(stepId);
        return designString;
    }

}


