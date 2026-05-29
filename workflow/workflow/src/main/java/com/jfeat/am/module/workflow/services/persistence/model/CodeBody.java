package com.jfeat.am.module.workflow.services.persistence.model;

public class CodeBody {

    private Long autoNumber;

    private String codeRule;

    private String code;

    private String transferInfo;

    public String getTransferInfo() {
        return transferInfo;
    }

    public void setTransferInfo(String transferInfo) {
        this.transferInfo = transferInfo;
    }

    public Long getAutoNumber() {
        return autoNumber;
    }

    public void setAutoNumber(Long autoNumber) {
        this.autoNumber = autoNumber;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getCodeRule() {
        return codeRule;
    }

    public void setCodeRule(String codeRule) {
        this.codeRule = codeRule;
    }
}
