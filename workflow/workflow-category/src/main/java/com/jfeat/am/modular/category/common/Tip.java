package com.jfeat.am.modular.category.common;

/**
 * 简单的返回结果封装类，替代 crud-dev 的 Tip
 */
public class Tip {
    private Integer code;
    private String message;
    private Object data;

    public Tip() {
    }

    public Tip(Integer code, String message, Object data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public static Tip success(Object data) {
        return new Tip(200, "success", data);
    }

    public static Tip error(Integer code, String message) {
        return new Tip(code, message, null);
    }

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }
}
