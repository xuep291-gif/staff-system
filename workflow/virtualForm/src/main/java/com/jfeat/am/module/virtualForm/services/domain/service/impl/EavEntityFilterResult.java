package com.jfeat.am.module.virtualForm.services.domain.service.impl;

import com.alibaba.fastjson.JSONObject;
import com.jfeat.eav.services.domain.filter.FilterResult;
import com.jfeat.eav.services.gen.persistence.model.EavEntity;

public class EavEntityFilterResult implements FilterResult<EavEntity> {

    public JSONObject result = new JSONObject();

    private String[] mIgnoreFields = new String[]{  };
    private String[] mUpdateIgnoreFields = new String[]{ };

    @Override
    public JSONObject result() {
        return result;
    }

    @Override
    public void filter(EavEntity eavEntity, boolean b) {

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
