package com.jfeat.am.module.workflow.services.crud.service;
            
import com.alibaba.fastjson.JSONObject;
import com.jfeat.am.module.workflow.services.domain.model.ProcessModel;
import com.jfeat.am.module.workflow.services.persistence.model.Process;
import com.jfeat.crud.plus.CRUDServiceOverModel;


/**
 * <p>
 *  service interface
 * </p>
 *
 * @author Code Generator
 * @since 2017-10-25
 */


public interface ProcessService  extends CRUDServiceOverModel<Process, ProcessModel> {

    JSONObject selectOne(Long id,Boolean appData);

    Boolean checkProcessInstance(Long id);

    Integer createProcess(Process process);


}
