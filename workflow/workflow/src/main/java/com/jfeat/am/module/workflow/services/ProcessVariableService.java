package com.jfeat.am.module.workflow.services;

import java.util.Map;

/**
 * 流程变量服务接口
 * 提供流程实例变量的增删改查功能
 * 用于在流程执行过程中存储和获取业务数据
 *
 * @author Workflow System
 * @since 2026-02-14
 */
public interface ProcessVariableService {

    /**
     * 设置流程变量
     * 支持基本类型和Map类型的变量值
     *
     * @param instanceId 流程实例ID
     * @param key 变量键
     * @param value 变量值（支持基本类型和Map）
     */
    void setVariable(Long instanceId, String key, Object value);

    /**
     * 批量设置流程变量
     * 一次性设置多个变量
     *
     * @param instanceId 流程实例ID
     * @param variables 变量Map
     */
    void setVariables(Long instanceId, Map<String, Object> variables);

    /**
     * 获取流程变量
     *
     * @param instanceId 流程实例ID
     * @param key 变量键
     * @return 变量值，不存在返回null
     */
    Object getVariable(Long instanceId, String key);

    /**
     * 获取指定类型的流程变量
     *
     * @param instanceId 流程实例ID
     * @param key 变量键
     * @param clazz 变量类型
     * @param <T> 泛型类型
     * @return 变量值，不存在或类型不匹配返回null
     */
    <T> T getVariable(Long instanceId, String key, Class<T> clazz);

    /**
     * 获取所有流程变量
     *
     * @param instanceId 流程实例ID
     * @return 变量Map，不存在返回空Map
     */
    Map<String, Object> getVariables(Long instanceId);

    /**
     * 删除流程变量
     *
     * @param instanceId 流程实例ID
     * @param key 变量键
     */
    void removeVariable(Long instanceId, String key);

    /**
     * 清空流程实例的所有变量
     * 通常在流程结束时调用
     *
     * @param instanceId 流程实例ID
     */
    void clearVariables(Long instanceId);

    /**
     * 检查变量是否存在
     *
     * @param instanceId 流程实例ID
     * @param key 变量键
     * @return true表示存在，false表示不存在
     */
    boolean hasVariable(Long instanceId, String key);
}
