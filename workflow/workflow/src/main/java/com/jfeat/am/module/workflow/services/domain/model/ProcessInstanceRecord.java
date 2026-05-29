package com.jfeat.am.module.workflow.services.domain.model;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;

import java.util.Map;

public class ProcessInstanceRecord extends ProcessInstance {

    JSONArray nextSteps;

    Map<String,String> commitDate;

    public Map<String, String> getCommitDate() {
        return commitDate;
    }

    public void setCommitDate(Map<String, String> commitDate) {
        this.commitDate = commitDate;
    }

    public JSONArray getNextSteps() {
        return nextSteps;
    }

    public void setNextSteps(JSONArray nextSteps) {
        this.nextSteps = nextSteps;
    }
}
