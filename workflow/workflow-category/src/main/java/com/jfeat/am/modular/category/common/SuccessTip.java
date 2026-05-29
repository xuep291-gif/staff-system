package com.jfeat.am.modular.category.common;

/**
 * 成功结果封装类，替代 crud-dev 的 SuccessTip
 */
public class SuccessTip extends Tip {
    
    public SuccessTip() {
        super(200, "success", null);
    }

    public SuccessTip(Object data) {
        super(200, "success", data);
    }

    public static SuccessTip create(Object data) {
        return new SuccessTip(data);
    }
}
