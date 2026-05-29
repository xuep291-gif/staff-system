package com.jfeat.am.module.workflow.services.domain.model;
import com.alibaba.fastjson.JSONArray;
import com.baomidou.mybatisplus.annotation.TableField;
import com.jfeat.am.module.workflow.services.persistence.model.NodeAssign;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;

import java.util.List;

/**
 * Created by Code Generator on 2017-10-25
 */
public class ProcessStepModel extends ProcessStep{
    private String formName;

    //标识，告诉前端这个步骤已设定了经办人
    private Boolean hasCurrentUser;

    private String currentUserName;

    private List<NodeAssign> nodeAssigneeList;

    public List<NodeAssign> getNodeAssigneeList() {
        return nodeAssigneeList;
    }

    public void setNodeAssigneeList(List<NodeAssign> nodeAssigneeList) {
        this.nodeAssigneeList = nodeAssigneeList;
    }

    public String getFormName() {
        return formName;
    }

    public void setFormName(String formName) {
        this.formName = formName;
    }

    public String getCurrentUserName() {
        return currentUserName;
    }

    public void setCurrentUserName(String currentUserName) {
        this.currentUserName = currentUserName;
    }

    private JSONArray nextStepString;

    public JSONArray getNextStepString() {
        return nextStepString;
    }

    public void setNextStepString(JSONArray nextStepString) {
        this.nextStepString = nextStepString;
    }

    public Boolean getHasCurrentUser() {
        return hasCurrentUser;
    }

    public void setHasCurrentUser(Boolean hasCurrentUser) {
        this.hasCurrentUser = hasCurrentUser;
    }
}
