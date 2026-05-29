package com.jfeat.am.module.workflow.services.crud.filter;

import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.jfeat.am.module.workflow.constant.ProcessStatusEnum;
import com.jfeat.am.module.workflow.services.persistence.model.Process;
import com.jfeat.crud.plus.CRUDFilter;


/**
 * Created by Code Generator on 2017-10-25
 */
public class ProcessFilter implements CRUDFilter<Process> {

    private String[] ignoreFields = new String[]{};
    private String[] updateIgnoreFields = new String[]{};

    @Override
    public void filter(Process entity, boolean insertOrUpdate) {

        //if insertOrUpdate is true,means for insert, do this
        if (insertOrUpdate){
            entity.setStatus(ProcessStatusEnum.DISABLED.toString());
            entity.setCode(IdWorker.get32UUID());
            //then insertOrUpdate is false,means for update,do this
        }else {

        }

    }

    @Override
    public String[] ignore(boolean retrieveOrUpdate) {
        //if retrieveOrUpdate is true,means for retrieve ,do this
        if (retrieveOrUpdate){
            return ignoreFields;
            //then retrieveOrUpdate  if false ,means for update,do this
        }else {
            return updateIgnoreFields;
        }
    }
}
