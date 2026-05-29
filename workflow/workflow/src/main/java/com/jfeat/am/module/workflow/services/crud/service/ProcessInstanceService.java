package com.jfeat.am.module.workflow.services.crud.service;
            
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.jfeat.am.module.workflow.services.domain.model.ProcessInstanceRecord;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;
import com.jfeat.crud.plus.CRUDServiceOnly;

import java.util.ArrayList;
import java.util.List;


/**
 * <p>
 *  service interface
 * </p>
 *
 * @author Code Generator
 * @since 2017-10-26
 */


public interface ProcessInstanceService extends CRUDServiceOnly<ProcessInstance> {

    /**
     * 查询抄送给指定用户且已审批完成的流程实例
     * @param userId 用户ID
     * @return 流程实例列表
     */
    List<ProcessInstance> findCopyProcessInstances(Long userId);


    ProcessInstanceRecord getProcessInstance(Long id);

    ProcessInstanceRecord getV2ProcessInstance(Long id);

    JSONArray getStepArray(ProcessInstanceRecord processInstanceRecord);

    Integer updateAllColumn(ProcessInstance processInstance);




    Integer submitApproval(Long processId, JSONObject request) ;


    Integer approve(Long userId,Long processId, Long processInstanceId,String action, String comment,JSONObject request) ;


    List<ProcessInstance> getMySubmissions() ;


    List<ProcessInstance> getPendingApprovals() ;
}
