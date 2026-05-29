package com.jfeat.am.module.workflow.services.domain.model;
import com.jfeat.am.module.workflow.services.persistence.model.Process;

import java.util.List;

/**
 * Created by Code Generator on 2017-10-25
 */
public class ProcessModel extends Process {

    private String currentUserName;

    private String categoryName;

    private String formName;

    private List<ProcessStepModel> steps;

    public String getCurrentUserName() {
        return currentUserName;
    }

    public void setCurrentUserName(String currentUserName) {
        this.currentUserName = currentUserName;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getFormName() {
        return formName;
    }

    public void setFormName(String formName) {
        this.formName = formName;
    }

    public List<ProcessStepModel> getSteps() {
        return steps;
    }

    public void setSteps(List<ProcessStepModel> steps) {
        this.steps = steps;
    }
}
