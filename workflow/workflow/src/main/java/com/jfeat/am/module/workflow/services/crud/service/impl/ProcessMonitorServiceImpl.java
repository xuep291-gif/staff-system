package com.jfeat.am.module.workflow.services.crud.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jfeat.am.module.workflow.services.ProcessMonitorService;
import com.jfeat.am.module.workflow.services.persistence.dao.ProcessMonitorMapper;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessMonitor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.*;

/**
 * 流程监控服务实现类
 * 提供流程执行过程中的监控功能
 *
 * @author Workflow System
 * @since 2026-02-14
 */
@Service
public class ProcessMonitorServiceImpl implements ProcessMonitorService {

    private static final Logger logger = LoggerFactory.getLogger(ProcessMonitorServiceImpl.class);

    @Resource
    private ProcessMonitorMapper processMonitorMapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 记录监控信息
     *
     * @param instanceId 流程实例ID
     * @param type 监控类型：TIMEOUT,ERROR,WARNING
     * @param level 监控级别：INFO,WARN,ERROR
     * @param message 监控消息
     */
    @Override
    public void recordMonitor(Long instanceId, String type, String level, String message) {
        recordMonitor(instanceId, type, level, message, null);
    }

    /**
     * 记录监控信息（带详细信息）
     *
     * @param instanceId 流程实例ID
     * @param type 监控类型：TIMEOUT,ERROR,WARNING
     * @param level 监控级别：INFO,WARN,ERROR
     * @param message 监控消息
     * @param details 详细信息（Map格式，会被转换为JSON）
     */
    @Override
    public void recordMonitor(Long instanceId, String type, String level, String message, Map<String, Object> details) {
        if (instanceId == null) {
            throw new IllegalArgumentException("流程实例ID不能为空");
        }
        if (type == null || type.trim().isEmpty()) {
            throw new IllegalArgumentException("监控类型不能为空");
        }
        if (level == null || level.trim().isEmpty()) {
            throw new IllegalArgumentException("监控级别不能为空");
        }

        ProcessMonitor monitor = new ProcessMonitor();
        monitor.setInstanceId(instanceId);
        monitor.setMonitorType(type);
        monitor.setMonitorLevel(level);
        monitor.setMessage(message);
        monitor.setIsHandled(false);
        monitor.setCreateTime(new Date());

        // 转换详细信息为JSON
        if (details != null && !details.isEmpty()) {
            try {
                monitor.setDetails(objectMapper.writeValueAsString(details));
            } catch (JsonProcessingException e) {
                logger.error("转换监控详细信息为JSON失败", e);
                monitor.setDetails("{\"error\":\"无法序列化详细信息\"}");
            }
        }

        processMonitorMapper.insert(monitor);
        logger.info("记录流程监控成功，实例ID: {}, 类型: {}, 级别: {}, 消息: {}",
                instanceId, type, level, message);
    }

    /**
     * 记录超时监控
     *
     * @param instanceId 流程实例ID
     * @param timeoutHours 超时小时数
     */
    @Override
    public void recordTimeout(Long instanceId, Long timeoutHours) {
        if (timeoutHours == null || timeoutHours <= 0) {
            throw new IllegalArgumentException("超时时间必须大于0");
        }

        Map<String, Object> details = new HashMap<>();
        details.put("timeoutHours", timeoutHours);
        details.put("timeoutSeconds", timeoutHours * 3600);

        recordMonitor(instanceId, "TIMEOUT", "WARN",
                String.format("流程实例超时 %d 小时", timeoutHours), details);
    }

    /**
     * 记录错误监控
     *
     * @param instanceId 流程实例ID
     * @param e 异常对象
     */
    @Override
    public void recordError(Long instanceId, Exception e) {
        if (e == null) {
            throw new IllegalArgumentException("异常对象不能为空");
        }

        Map<String, Object> details = new HashMap<>();
        details.put("exceptionClass", e.getClass().getName());
        details.put("exceptionMessage", e.getMessage());

        // 获取堆栈跟踪
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        e.printStackTrace(pw);
        details.put("stackTrace", sw.toString());

        recordMonitor(instanceId, "ERROR", "ERROR",
                "流程执行异常: " + e.getMessage(), details);
    }

    /**
     * 记录警告监控
     *
     * @param instanceId 流程实例ID
     * @param message 警告消息
     */
    @Override
    public void recordWarning(Long instanceId, String message) {
        recordMonitor(instanceId, "WARNING", "WARN", message);
    }

    /**
     * 记录信息监控
     *
     * @param instanceId 流程实例ID
     * @param message 信息消息
     */
    @Override
    public void recordInfo(Long instanceId, String message) {
        recordMonitor(instanceId, "INFO", "INFO", message);
    }

    /**
     * 标记监控为已处理
     *
     * @param monitorId 监控ID
     * @param handlerId 处理人ID
     */
    @Override
    public void markAsHandled(Long monitorId, Long handlerId) {
        if (monitorId == null) {
            throw new IllegalArgumentException("监控ID不能为空");
        }
        if (handlerId == null) {
            throw new IllegalArgumentException("处理人ID不能为空");
        }

        ProcessMonitor monitor = processMonitorMapper.selectById(monitorId);
        if (monitor == null) {
            logger.warn("标记监控为已处理时监控记录不存在，监控ID: {}", monitorId);
            return;
        }

        monitor.markAsHandled(handlerId);
        processMonitorMapper.updateById(monitor);

        logger.info("标记流程监控为已处理，监控ID: {}, 处理人ID: {}", monitorId, handlerId);
    }

    /**
     * 获取未处理的监控列表
     *
     * @return 未处理的监控列表
     */
    @Override
    public List<ProcessMonitor> getUnhandledMonitors() {
        QueryWrapper<ProcessMonitor> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("is_handled", false)
                .orderByDesc("create_time");
        return processMonitorMapper.selectList(queryWrapper);
    }

    /**
     * 获取指定流程实例的监控列表
     *
     * @param instanceId 流程实例ID
     * @return 监控列表
     */
    @Override
    public List<ProcessMonitor> getMonitorsByInstanceId(Long instanceId) {
        return processMonitorMapper.findByInstanceId(instanceId);
    }

    /**
     * 获取指定类型的监控列表
     *
     * @param monitorType 监控类型
     * @return 监控列表
     */
    @Override
    public List<ProcessMonitor> getMonitorsByType(String monitorType) {
        return processMonitorMapper.findByMonitorType(monitorType);
    }

    /**
     * 获取未处理的超时监控列表
     *
     * @return 未处理的超时监控列表
     */
    @Override
    public List<ProcessMonitor> getUnhandledTimeoutMonitors() {
        return processMonitorMapper.findByTypeAndHandled("TIMEOUT", false);
    }

    /**
     * 获取未处理的错误监控列表
     *
     * @return 未处理的错误监控列表
     */
    @Override
    public List<ProcessMonitor> getUnhandledErrorMonitors() {
        return processMonitorMapper.findByTypeAndHandled("ERROR", false);
    }

    /**
     * 获取未处理的警告监控列表
     *
     * @return 未处理的警告监控列表
     */
    @Override
    public List<ProcessMonitor> getUnhandledWarningMonitors() {
        return processMonitorMapper.findByTypeAndHandled("WARNING", false);
    }

    /**
     * 根据ID获取监控记录
     *
     * @param monitorId 监控ID
     * @return 监控记录
     */
    @Override
    public ProcessMonitor getMonitorById(Long monitorId) {
        if (monitorId == null) {
            return null;
        }
        return processMonitorMapper.selectById(monitorId);
    }
}
