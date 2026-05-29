package com.jfeat.am.module.workflow.services.crud.filter;

import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;
import com.jfeat.crud.plus.CRUDFilter;


/**
 * Created by Code Generator on 2017-10-25
 */
public class ProcessStepFilter implements CRUDFilter<ProcessStep> {

    private String[] ignoreFields = new String[]{};
    private String[] updateIgnoreFields = new String[]{};

    @Override
    public void filter(ProcessStep entity, boolean insertOrUpdate) {

        //if insertOrUpdate is true,means for insert, do this
        if (insertOrUpdate){

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
