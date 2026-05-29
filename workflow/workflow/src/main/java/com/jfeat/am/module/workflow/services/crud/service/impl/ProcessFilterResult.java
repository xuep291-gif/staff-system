package com.jfeat.am.module.workflow.services.crud.service.impl;

import com.alibaba.fastjson.JSONObject;
import com.jfeat.am.module.workflow.services.persistence.model.Process;
import com.jfeat.crud.plus.CRUDFilterResult;

/**
 * Created by jackyhuang on 2017/10/25.
 */
public class ProcessFilterResult implements CRUDFilterResult<Process> {

    private String[] mIgnoreFields = new String[]{  };
    private String[] mUpdateIgnoreFields = new String[]{ };


    @Override
    public JSONObject result() {
        return new JSONObject();
    }

    @Override
    public void filter(Process process, boolean insertOrUpdate) {

    }

    @Override
    public String[] ignore(boolean retrieveOrUpdate) {
        if (retrieveOrUpdate) { //retrieve
            return mIgnoreFields;
        } else { //update
            return mUpdateIgnoreFields;
        }
    }
}
