package com.jfeat.am.module.workflow.services.crud.service.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.jfeat.am.module.virtualForm.services.domain.dao.QueryVirtualFormDao;
import com.jfeat.am.module.virtualForm.services.domain.model.VirtualFormRecord;
import com.jfeat.am.module.workflow.services.crud.service.EavProcessService;
import com.jfeat.am.module.workflow.services.crud.service.ProcessInstanceService;
import com.jfeat.am.module.workflow.services.crud.service.ProcessStepService;
import com.jfeat.am.module.workflow.services.domain.dao.QueryProcessInstanceStepDao;
import com.jfeat.am.module.workflow.services.domain.dao.QueryProcessStepDao;
import com.jfeat.am.module.workflow.services.domain.model.ProcessInstanceRecord;
import com.jfeat.am.module.workflow.services.crud.service.ProcessInstanceStepService;
import com.jfeat.am.module.workflow.services.domain.model.ProcessInstanceStepModel;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstanceStep;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;
import com.jfeat.eav.config.FieldType;
import com.jfeat.eav.services.domain.model.TitleInfo;
import com.jfeat.eav.services.domain.service.AlibabaEavService;
import com.jfeat.eav.services.domain.service.EavEntityService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * <p>
 *  implementation
 * </p>
 *
 * @author Code Generator
 * @since 2017-10-25
 */

@Service
public class EavProcessServiceImpl implements EavProcessService {

    @Resource
    ProcessInstanceService processInstanceService;
    @Resource
    ProcessInstanceStepService processInstanceStepService;
    @Resource
    ProcessStepService processStepService;
    @Resource
    EavEntityService eavEntityService;
    @Resource
    AlibabaEavService alibabaEavService;
    @Resource
    QueryProcessInstanceStepDao queryProcessInstanceStepDao;
    @Resource
    QueryVirtualFormDao queryVirtualFormDao;

    @Resource
    QueryProcessStepDao queryProcessStepDao;

    @Override
    public JSONObject getInstanceJson(Long id,Boolean currentFlag){
        ProcessInstanceRecord processInstance = processInstanceService.getProcessInstance(id);
        JSONObject resJSON = (JSONObject) JSON.toJSON(processInstance);
        //获取开始步骤的信息
        if(currentFlag) {
            //startStep = processInstanceStepService.getStepByCurrent(id);
            ProcessStep processStep = processStepService.selectOne(processInstance.getCurrentStepId());
            String designString = processStepService.getDesignJsonByStepId(processInstance.getCurrentStepId());
            JSONArray layoutJson = alibabaEavService.transform(designString, false, TitleInfo.EDIT_TITLE,true);
            JSONObject layout = new JSONObject();
            layout.put(FieldType.LAYOUT_JSON,layoutJson);
            resJSON.put("formInfo",layout);
            resJSON.put("stepType",processStep.getStepType());
        }
        else{
            ProcessInstanceStepModel startStep = processInstanceStepService.getStartStep(id);
            ProcessStep processStep = processStepService.selectOne(startStep.getStepId());
            if(startStep!=null && startStep.getEntityId()!=null && startStep.getRowId()!=null){
                //通过entityId和rowId获取申请表单信息
                //JSONArray layoutJson = eavEntityService.getEavEntityRowValue(startStep.getEntityId(), startStep.getRowId(), startStep.getDesignData(), TitleInfo.DETAIL_TITLE, id, true);
                String designString = processStepService.getDesignJsonByStepId(processStep.getId());
                JSONArray layoutJson = alibabaEavService.transform(designString, true, TitleInfo.DETAIL_TITLE,true);
                JSONObject layout = new JSONObject();
                layout.put(FieldType.LAYOUT_JSON,layoutJson);
                resJSON.put("formInfo",layout);
                resJSON.put("stepType",processStep.getStepType());
            }else{
                resJSON.put("formInfo",null);
            }
        }
        //审核默认值为通过
        resJSON.put("auditInfo","APPROVE");



        return resJSON;
    }


    //获取某个实例开始步骤的表单值
    @Override
    public Map<String, String> getInstanceStartFormValue(Long id){
        //获取当前步骤实例
        ProcessInstanceStep instanceStep = queryProcessInstanceStepDao.getStartInstanceStepByInstanceId(id);
        Map<String, String> attrValueMaps = eavEntityService.getEntityValueByEntityIdRowId(instanceStep.getEntityId(), instanceStep.getRowId());
        String  oldCode = instanceStep.getVirtualFormCode();
        //处理子表单中的值
         addChiMap(oldCode,attrValueMaps, id);
        return attrValueMaps;
    }

    //根据当前步骤获取信息
    @Override
    public Map<String,String> getInstanceCurrentFormValue(Long id){
        ProcessStep step = queryProcessStepDao.findProcessStepsByCurrent(id);
        //处理子表单中的值
        Map<String, String> attrValueMaps = new HashMap<>();

        addChiMap(step.getVirtualFormCode(),attrValueMaps, id);
        return attrValueMaps;
    }

    @Override
    public void addChiMap(String oldCode,Map<String, String> attrValueMaps,Long instanceId){

        //根据code获取表 得到设计
        VirtualFormRecord thisForm = queryVirtualFormDao.queryVirtualFormByCode(oldCode);
        //根据设计解析得到子表单Code列表
        List<String> childFormCodeList = alibabaEavService.getChildFormList(thisForm.getDesignData());
        for (String code:childFormCodeList){
            ProcessInstanceStepModel chiStep = queryProcessInstanceStepDao.getByFormCodeAndInstanceId(instanceId, code);
            Map<String, String> chiMap = eavEntityService.getEntityValueByEntityIdRowId(chiStep.getEntityId(), chiStep.getRowId());
            attrValueMaps.putAll(chiMap);
        }
    }



}


