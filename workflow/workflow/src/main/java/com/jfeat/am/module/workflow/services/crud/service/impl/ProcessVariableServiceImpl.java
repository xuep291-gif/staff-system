package com.jfeat.am.module.workflow.services.crud.service.impl;

import com.jfeat.am.module.workflow.services.ProcessVariableService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 流程变量服务实现类
 * 提供流程实例变量的增删改查功能
 * 注意：当前使用内存Map存储，重启后数据会丢失
 * 生产环境建议使用数据库表 wf_process_variable 持久化存储
 *
 * @author Workflow System
 * @since 2026-02-14
 */
@Service
public class ProcessVariableServiceImpl implements ProcessVariableService {

    private static final Logger logger = LoggerFactory.getLogger(ProcessVariableServiceImpl.class);

    // 使用内存Map存储（生产环境应使用数据库）
    // 结构：Map<实例Key, Map<变量名, 变量值>>
    private final Map<String, Map<String, Object>> variableStore = new ConcurrentHashMap<>();

    /**
     * 获取实例存储键
     *
     * @param instanceId 流程实例ID
     * @return 存储键
     */
    private String getInstanceKey(Long instanceId) {
        return "instance_" + instanceId;
    }

    /**
     * 设置流程变量
     * 支持基本类型和Map类型的变量值
     *
     * @param instanceId 流程实例ID
     * @param key 变量键
     * @param value 变量值（支持基本类型和Map）
     */
    @Override
    public void setVariable(Long instanceId, String key, Object value) {
        if (instanceId == null) {
            throw new IllegalArgumentException("流程实例ID不能为空");
        }
        if (key == null || key.trim().isEmpty()) {
            throw new IllegalArgumentException("变量键不能为空");
        }

        String instanceKey = getInstanceKey(instanceId);
        variableStore.computeIfAbsent(instanceKey, k -> new ConcurrentHashMap<>()).put(key, value);

        logger.debug("设置流程变量成功，实例ID: {}, 变量名: {}, 变量类型: {}",
                instanceId, key, value != null ? value.getClass().getSimpleName() : "null");
    }

    /**
     * 批量设置流程变量
     * 一次性设置多个变量
     *
     * @param instanceId 流程实例ID
     * @param variables 变量Map
     */
    @Override
    public void setVariables(Long instanceId, Map<String, Object> variables) {
        if (instanceId == null) {
            throw new IllegalArgumentException("流程实例ID不能为空");
        }
        if (variables == null || variables.isEmpty()) {
            logger.warn("批量设置流程变量时变量Map为空，实例ID: {}", instanceId);
            return;
        }

        String instanceKey = getInstanceKey(instanceId);
        Map<String, Object> instanceVars = variableStore.computeIfAbsent(instanceKey, k -> new ConcurrentHashMap<>());
        instanceVars.putAll(variables);

        logger.debug("批量设置流程变量成功，实例ID: {}, 变量数量: {}", instanceId, variables.size());
    }

    /**
     * 获取流程变量
     *
     * @param instanceId 流程实例ID
     * @param key 变量键
     * @return 变量值，不存在返回null
     */
    @Override
    public Object getVariable(Long instanceId, String key) {
        if (instanceId == null) {
            throw new IllegalArgumentException("流程实例ID不能为空");
        }
        if (key == null || key.trim().isEmpty()) {
            throw new IllegalArgumentException("变量键不能为空");
        }

        String instanceKey = getInstanceKey(instanceId);
        Map<String, Object> vars = variableStore.get(instanceKey);
        Object value = vars != null ? vars.get(key) : null;

        logger.debug("获取流程变量，实例ID: {}, 变量名: {}, 是否存在: {}",
                instanceId, key, value != null);

        return value;
    }

    /**
     * 获取指定类型的流程变量
     *
     * @param instanceId 流程实例ID
     * @param key 变量键
     * @param clazz 变量类型
     * @param <T> 泛型类型
     * @return 变量值，不存在或类型不匹配返回null
     */
    @Override
    public <T> T getVariable(Long instanceId, String key, Class<T> clazz) {
        Object value = getVariable(instanceId, key);

        if (value == null) {
            return null;
        }

        if (!clazz.isInstance(value)) {
            logger.warn("流程变量类型不匹配，实例ID: {}, 变量名: {}, 期望类型: {}, 实际类型: {}",
                    instanceId, key, clazz.getSimpleName(), value.getClass().getSimpleName());
            return null;
        }

        return clazz.cast(value);
    }

    /**
     * 获取所有流程变量
     *
     * @param instanceId 流程实例ID
     * @return 变量Map，不存在返回空Map
     */
    @Override
    public Map<String, Object> getVariables(Long instanceId) {
        if (instanceId == null) {
            throw new IllegalArgumentException("流程实例ID不能为空");
        }

        String instanceKey = getInstanceKey(instanceId);
        Map<String, Object> vars = variableStore.getOrDefault(instanceKey, new HashMap<>());

        logger.debug("获取所有流程变量，实例ID: {}, 变量数量: {}", instanceId, vars.size());

        // 返回副本避免外部修改
        return new HashMap<>(vars);
    }

    /**
     * 删除流程变量
     *
     * @param instanceId 流程实例ID
     * @param key 变量键
     */
    @Override
    public void removeVariable(Long instanceId, String key) {
        if (instanceId == null) {
            throw new IllegalArgumentException("流程实例ID不能为空");
        }
        if (key == null || key.trim().isEmpty()) {
            throw new IllegalArgumentException("变量键不能为空");
        }

        String instanceKey = getInstanceKey(instanceId);
        Map<String, Object> vars = variableStore.get(instanceKey);
        if (vars != null) {
            Object removed = vars.remove(key);
            logger.debug("删除流程变量，实例ID: {}, 变量名: {}, 是否存在: {}",
                    instanceId, key, removed != null);
        } else {
            logger.warn("删除流程变量时实例变量Map不存在，实例ID: {}, 变量名: {}", instanceId, key);
        }
    }

    /**
     * 清空流程实例的所有变量
     * 通常在流程结束时调用
     *
     * @param instanceId 流程实例ID
     */
    @Override
    public void clearVariables(Long instanceId) {
        if (instanceId == null) {
            throw new IllegalArgumentException("流程实例ID不能为空");
        }

        String instanceKey = getInstanceKey(instanceId);
        Map<String, Object> removed = variableStore.remove(instanceKey);

        logger.debug("清空流程实例变量，实例ID: {}, 清空变量数: {}",
                instanceId, removed != null ? removed.size() : 0);
    }

    /**
     * 检查变量是否存在
     *
     * @param instanceId 流程实例ID
     * @param key 变量键
     * @return true表示存在，false表示不存在
     */
    @Override
    public boolean hasVariable(Long instanceId, String key) {
        if (instanceId == null) {
            throw new IllegalArgumentException("流程实例ID不能为空");
        }
        if (key == null || key.trim().isEmpty()) {
            throw new IllegalArgumentException("变量键不能为空");
        }

        String instanceKey = getInstanceKey(instanceId);
        Map<String, Object> vars = variableStore.get(instanceKey);
        boolean exists = vars != null && vars.containsKey(key);

        logger.debug("检查流程变量是否存在，实例ID: {}, 变量名: {}, 存在: {}",
                instanceId, key, exists);

        return exists;
    }

    /**
     * 获取当前存储的实例数量
     * 用于监控和调试
     *
     * @return 实例数量
     */
    public int getInstanceCount() {
        return variableStore.size();
    }

    /**
     * 获取指定实例的变量数量
     * 用于监控和调试
     *
     * @param instanceId 流程实例ID
     * @return 变量数量
     */
    public int getVariableCount(Long instanceId) {
        String instanceKey = getInstanceKey(instanceId);
        Map<String, Object> vars = variableStore.get(instanceKey);
        return vars != null ? vars.size() : 0;
    }
}
