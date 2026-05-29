package com.jfeat.am.module.workflow.services;

import com.jfeat.am.module.workflow.services.persistence.model.ProcessMonitor;

import java.util.List;
import java.util.Map;

/**
 * 流程监控服务接口
 * 提供流程执行过程中的监控功能
 * 包括超时监控、错误监控、警告监控等
 *
 * @author Workflow System
 * @since 2026-02-14
 */
public interface ProcessMonitorService {

    /**
     * 记录监控信息
     *
     * @param instanceId 流程实例ID
     * @param type 监控类型：TIMEOUT,ERROR,WARNING
     * @param level 监控级别：INFO,WARN,ERROR
     * @param message 监控消息
     */
    void recordMonitor(Long instanceId, String type, String level, String message);

    /**
     * 记录监控信息（带详细信息）
     *
     * @param instanceId 流程实例ID
     * @param type 监控类型：TIMEOUT,ERROR,WARNING
     * @param level 监控级别：INFO,WARN,ERROR
     * @param message 监控消息
     * @param details 详细信息（Map格式，会被转换为JSON）
     */
    void recordMonitor(Long instanceId, String type, String level, String message, Map<String, Object> details);

    /**
     * 记录超时监控
     *
     * @param instanceId 流程实例ID
     * @param timeoutHours 超时小时数
     */
    void recordTimeout(Long instanceId, Long timeoutHours);

    /**
     * 记录错误监控
     *
     * @param instanceId 流程实例ID
     * @param e 异常对象
     */
    void recordError(Long instanceId, Exception e);

    /**
     * 记录警告监控
     *
     * @param instanceId 流程实例ID
     * @param message 警告消息
     */
    void recordWarning(Long instanceId, String message);

    /**
     * 记录信息监控
     *
     * @param instanceId 流程实例ID
     * @param message 信息消息
     */
    void recordInfo(Long instanceId, String message);

    /**
     * 标记监控为已处理
     *
     * @param monitorId 监控ID
     * @param handlerId 处理人ID
     */
    void markAsHandled(Long monitorId, Long handlerId);

    /**
     * 获取未处理的监控列表
     *
     * @return 未处理的监控列表
     */
    List<ProcessMonitor> getUnhandledMonitors();

    /**
     * 获取指定流程实例的监控列表
     *
     * @param instanceId 流程实例ID
     * @return 监控列表
     */
    List<ProcessMonitor> getMonitorsByInstanceId(Long instanceId);

    /**
     * 获取指定类型的监控列表
     *
     * @param monitorType 监控类型
     * @return 监控列表
     */
    List<ProcessMonitor> getMonitorsByType(String monitorType);

    /**
     * 获取未处理的超时监控列表
     *
     * @return 未处理的超时监控列表
     */
    List<ProcessMonitor> getUnhandledTimeoutMonitors();

    /**
     * 获取未处理的错误监控列表
     *
     * @return 未处理的错误监控列表
     */
    List<ProcessMonitor> getUnhandledErrorMonitors();

    /**
     * 获取未处理的警告监控列表
     *
     * @return 未处理的警告监控列表
     */
    List<ProcessMonitor> getUnhandledWarningMonitors();

    /**
     * 根据ID获取监控记录
     *
     * @param monitorId 监控ID
     * @return 监控记录
     */
    ProcessMonitor getMonitorById(Long monitorId);
}
