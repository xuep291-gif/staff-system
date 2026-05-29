package com.jfeat.am.module.virtualForm.services.domain.model;

import com.jfeat.am.module.virtualForm.services.gen.persistence.model.VirtualForm;

/**
 * Created by Code generator on 2021-04-26
 */
public class VirtualFormRecord extends VirtualForm{
    private String docName;

    private Boolean hasDocument;

    private Long formId;

    public Long getFormId() {
        return formId;
    }

    public void setFormId(Long formId) {
        this.formId = formId;
    }

    public Boolean getHasDocument() {
        return hasDocument;
    }

    public void setHasDocument(Boolean hasDocument) {
        this.hasDocument = hasDocument;
    }

    public String getDocName() {
        return docName;
    }

    public void setDocName(String docName) {
        this.docName = docName;
    }
}
