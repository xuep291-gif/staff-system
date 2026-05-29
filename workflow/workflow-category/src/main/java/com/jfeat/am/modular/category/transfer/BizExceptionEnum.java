package com.jfeat.am.modular.category.transfer;


/** @deprecated */
@Deprecated
public enum BizExceptionEnum {
    SERVER_ERROR(1000, "服务器异常"),
    DATABASE_CONNECT_ERROR(1001, "数据库连接异常"),
    INVALID_TUPLE_ID(1002, "无效的查询ID"),
    PARTIALLY_AFFECTED_ERROR(1003, "部分操作有效"),
    REQUEST_INVALIDATE(1004, "请求数据格式不正确"),
    OUT_OF_RANGE(1005, "超出范围"),
    NO_PERMISSION(1006, "权限异常"),
    USER_ALREADY_REG(1007, "该用户已经注册"),
    USER_NOT_EXISTED(1008, "没有此用户"),
    OLD_PWD_NOT_RIGHT(1009, "原密码不正确"),
    TWO_PWD_NOT_MATCH(1010, "两次输入密码不一致"),
    LOGIN_FAIL(1011, "登录失败"),
    INVALID_TOKEN(1012, "非法token"),
    FILE_READING_ERROR(1013, "读取文件出错"),
    FILE_NOT_FOUND(1014, "找不到文件"),
    UPLOAD_ERROR(1015, "上传图片出错"),
    ALREADY_EXIST(1016, "记录已存在");

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
}

