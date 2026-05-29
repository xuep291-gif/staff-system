package com.jfeat.am.modular.category.common;

/**
 * 业务异常类，替代 crud-dev 的 BusinessException
 */
public class BusinessException extends RuntimeException {
    private Integer code;

    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }
}
