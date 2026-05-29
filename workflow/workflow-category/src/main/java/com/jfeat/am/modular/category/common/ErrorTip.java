package com.jfeat.am.modular.category.common;

/**
 * 错误结果封装类，替代 crud-dev 的 ErrorTip
 */
public class ErrorTip extends Tip {
    
    public ErrorTip(Integer code, String message) {
        super(code, message, null);
    }

    public static ErrorTip create(Integer code, String message) {
        return new ErrorTip(code, message);
    }
}
