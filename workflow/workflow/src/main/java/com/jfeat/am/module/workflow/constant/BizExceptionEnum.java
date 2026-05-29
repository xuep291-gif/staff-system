package com.jfeat.am.module.workflow.constant;


import com.jfeat.crud.base.exception.BusinessException;

/**
 * Created by jackyhuang on 2017/10/24.
 */
public enum BizExceptionEnum {
    TASK_NOT_FOUND(6001, "找不到任务"),
    PROCESS_INSTANCE_NOT_FOUND(6002, "找不到流程实例"),
    PROCESS_INSTANCE_ALREADY_CLOSED(6003, "流程实例已结束"),
    PROCESS_STEP_NOT_FOUND(6004, "找不到流程步骤"),
    PROCESS_NOT_FOUND(6005, "找不到流程"),
    PROCESS_DISABLED(6006, "流程已禁用"),
    PROCESS_INSTANCE_NO_PERMISSION(6007, "无权限查看"),
    HISTORY_NOT_FOUND(6008, "找不到历史记录"),
    HISTORY_INVALID(6009, "非法历史记录"),
    PROCESS_INSTANCE_CANNOT_SUBMIT(6010, "该状态下不能提交"),
    PROCESS_INSTANCE_CANNOT_ROLLBACK(6011, "该状态下不能回退");


    private int friendlyCode;
    private String friendlyMsg;

    private BizExceptionEnum(int code, String message) {
        this.friendlyCode = code;
        this.friendlyMsg = message;
    }

    public int getCode() {
        return this.friendlyCode;
    }

    public void setCode(int code) {
        this.friendlyCode = code;
    }

    public String getMessage() {
        return this.friendlyMsg;
    }

    public void setMessage(String message) {
        this.friendlyMsg = message;
    }

    public BusinessException createException() {
        return new BusinessException(this.getCode(), this.getMessage());
    }
}
