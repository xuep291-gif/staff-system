package com.jfeat.am.module.workflow.listener;

import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;

/**
 * Created by jackyhuang on 2017/10/27.
 */
public interface InstanceChangeListener {
    void notify(Long formId, ProcessInstance processInstance);

    /**
     * 获取优先级（数字越小优先级越高）
     * 默认优先级为100
     */
    default int getPriority() {
        return 100;
    }

    /**
     * 是否异步执行
     * 默认为同步执行
     */
    default boolean isAsync() {
        return false;
    }

}
