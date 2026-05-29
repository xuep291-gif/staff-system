package com.jfeat.am.module.workflow.services.crud.service;
            
import com.alibaba.fastjson.JSONObject;

import java.util.Map;


public interface EavProcessService{


    JSONObject getInstanceJson(Long id,Boolean currentFlag);

    //获取某个实例开始步骤的表单值
    Map<String, String> getInstanceStartFormValue(Long id);

    //根据当前步骤获取信息
    Map<String,String> getInstanceCurrentFormValue(Long id);

    void addChiMap(String oldCode, Map<String, String> attrValueMaps, Long instanceId);
}
