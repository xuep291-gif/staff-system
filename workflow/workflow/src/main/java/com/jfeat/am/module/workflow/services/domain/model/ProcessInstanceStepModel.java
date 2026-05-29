package com.jfeat.am.module.workflow.services.domain.model;
// this is serviceModel.java.vm




import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstanceStep;

/**
 * Created by Code generator on 2021-05-20
 *  * slaves.size() : 0
 *  * modelpack : $modelpack
 */
public class ProcessInstanceStepModel extends ProcessInstanceStep{
    private String designData;

    public String getDesignData() {
        return designData;
    }

    public void setDesignData(String designData) {
        this.designData = designData;
    }
}
