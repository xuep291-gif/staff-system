package com.jfeat.am.module.workflow.listener;

import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 监听器失败记录器
 * 用于记录工作流监听器执行失败的情况
 *
 * Created by workflow system
 */
@Component
public class ListenerFailureLogger {

    private static final Logger failureLogger = LoggerFactory.getLogger("WORKFLOW_LISTENER_FAILURE");
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * 记录监听器执行失败信息
     *
     * @param instanceId 工作流实例ID
     * @param listener 失败的监听器
     * @param e 异常信息
     */
    public void logFailure(Long instanceId, InstanceChangeListener listener, Exception e) {
        String listenerName = listener.getClass().getSimpleName();
        String timestamp = LocalDateTime.now().format(FORMATTER);

        failureLogger.error("==================================================");
        failureLogger.error("Listener Execution Failure");
        failureLogger.error("Timestamp: {}", timestamp);
        failureLogger.error("Instance ID: {}", instanceId);
        failureLogger.error("Listener: {}", listenerName);
        failureLogger.error("Priority: {}", listener.getPriority());
        failureLogger.error("Async: {}", listener.isAsync());
        failureLogger.error("Error Type: {}", e.getClass().getName());
        failureLogger.error("Error Message: {}", e.getMessage());
        failureLogger.error("==================================================");

        if (e.getCause() != null) {
            failureLogger.error("Caused by: {} - {}", e.getCause().getClass().getName(), e.getCause().getMessage());
        }

        failureLogger.error("Stack Trace:", e);
        failureLogger.error("");
    }

    /**
     * 记录监听器执行失败信息（带ProcessInstance详情）
     *
     * @param processInstance 工作流实例
     * @param listener 失败的监听器
     * @param e 异常信息
     */
    public void logFailure(ProcessInstance processInstance, InstanceChangeListener listener, Exception e) {
        String listenerName = listener.getClass().getSimpleName();
        String timestamp = LocalDateTime.now().format(FORMATTER);

        failureLogger.error("==================================================");
        failureLogger.error("Listener Execution Failure (Detailed)");
        failureLogger.error("Timestamp: {}", timestamp);
        failureLogger.error("Instance ID: {}", processInstance.getId());
        failureLogger.error("Form Type: {}", processInstance.getFormType());
        failureLogger.error("Form ID: {}", processInstance.getFormId());
        failureLogger.error("Listener: {}", listenerName);
        failureLogger.error("Priority: {}", listener.getPriority());
        failureLogger.error("Async: {}", listener.isAsync());
        failureLogger.error("Error Type: {}", e.getClass().getName());
        failureLogger.error("Error Message: {}", e.getMessage());
        failureLogger.error("==================================================");

        if (e.getCause() != null) {
            failureLogger.error("Caused by: {} - {}", e.getCause().getClass().getName(), e.getCause().getMessage());
        }

        failureLogger.error("Stack Trace:", e);
        failureLogger.error("");
    }

    /**
     * 检查是否有失败的记录（用于监控）
     *
     * @return 如果失败logger可用返回true
     */
    public boolean isAvailable() {
        return failureLogger != null;
    }
}
