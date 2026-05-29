package com.jfeat.am.module.workflow.aspect;

import com.alibaba.fastjson.JSON;
import com.jfeat.am.module.workflow.services.OperationAuditService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;

/**
 * 操作审计切面
 * 拦截关键操作并记录审计日志
 *
 * @author Workflow System
 * @since 2026-02-14
 */
@Aspect
@Component
public class OperationAuditAspect {

    private static final Logger logger = LoggerFactory.getLogger(OperationAuditAspect.class);

    @Resource
    private OperationAuditService auditService;

    /**
     * 定义切点：拦截Service层的关键操作
     * 关键操作包括：审批、拒绝、提交、回退、创建流程实例等
     */
    @Pointcut("execution(* com.jfeat.am.module.workflow.services..*.*(..))")
    public void serviceLayer() {
    }

    /**
     * 拦截关键操作并记录审计日志
     */
    @Around("serviceLayer()")
    public Object auditOperation(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        Object[] args = joinPoint.getArgs();

        // 判断是否为关键操作
        if (!isKeyOperation(methodName)) {
            return joinPoint.proceed();
        }

        // 获取当前用户信息
        Long currentUserId = getCurrentUserId();
        String currentUserName = getCurrentUserName();

        try {
            // 执行目标方法
            Object result = joinPoint.proceed();

            // 记录成功操作
            long executionTime = System.currentTimeMillis() - startTime;
            String operationType = extractOperationType(methodName);
            String targetInfo = extractTargetInfo(args);

            auditService.logSuccess(
                    operationType,
                    currentUserId,
                    currentUserName,
                    className,
                    null,
                    buildRequestData(methodName, args)
            );

            // 记录日志
            if (logger.isDebugEnabled()) {
                logger.debug("Operation audited: type={}, user={}, class={}, method={}, time={}ms",
                        operationType, currentUserName, className, methodName, executionTime);
            }

            return result;

        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            String operationType = extractOperationType(methodName);

            // 记录失败操作
            auditService.logFailure(
                    operationType,
                    currentUserId,
                    currentUserName,
                    className,
                    null,
                    buildRequestData(methodName, args),
                    e
            );

            logger.error("Operation failed: type={}, user={}, class={}, method={}, error={}",
                    operationType, currentUserName, className, methodName, e.getMessage());

            throw e;
        }
    }

    /**
     * 判断是否为关键操作
     */
    private boolean isKeyOperation(String methodName) {
        return methodName.contains("approve") ||
                methodName.contains("reject") ||
                methodName.contains("submit") ||
                methodName.contains("rollback") ||
                methodName.contains("transfer") ||
                methodName.contains("create") && methodName.contains("Instance") ||
                methodName.contains("delete") && methodName.contains("Instance") ||
                methodName.contains("terminate");
    }

    /**
     * 从方法名提取操作类型
     */
    private String extractOperationType(String methodName) {
        if (methodName.contains("approve")) {
            return "APPROVE";
        } else if (methodName.contains("reject")) {
            return "REJECT";
        } else if (methodName.contains("submit")) {
            return "SUBMIT";
        } else if (methodName.contains("rollback")) {
            return "ROLLBACK";
        } else if (methodName.contains("transfer")) {
            return "TRANSFER";
        } else if (methodName.contains("create")) {
            return "CREATE";
        } else if (methodName.contains("delete")) {
            return "DELETE";
        } else if (methodName.contains("terminate")) {
            return "TERMINATE";
        }
        return methodName.toUpperCase();
    }

    /**
     * 提取目标信息
     */
    private String extractTargetInfo(Object[] args) {
        if (args == null || args.length == 0) {
            return "UNKNOWN";
        }
        // 可以根据实际参数提取目标ID等信息
        return "SERVICE_METHOD";
    }

    /**
     * 构建请求数据
     */
    private Object buildRequestData(String methodName, Object[] args) {
        // 避免记录敏感信息
        Map<String, Object> requestData = new java.util.HashMap<>();
        requestData.put("method", methodName);
        requestData.put("argumentCount", args != null ? args.length : 0);

        // 只记录参数类型，避免记录敏感的参数值
        if (args != null && args.length > 0) {
            String[] argTypes = new String[args.length];
            for (int i = 0; i < args.length; i++) {
                argTypes[i] = args[i] != null ? args[i].getClass().getSimpleName() : "null";
            }
            requestData.put("argumentTypes", argTypes);
        }

        return requestData;
    }

    /**
     * 获取当前用户ID
     */
    private Long getCurrentUserId() {
        try {
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                // 从请求头或属性中获取用户ID
                Object userId = request.getAttribute("userId");
                if (userId != null) {
                    return Long.valueOf(userId.toString());
                }
            }
        } catch (Exception e) {
            logger.warn("Failed to get current user id: {}", e.getMessage());
        }
        return null;
    }

    /**
     * 获取当前用户名
     */
    private String getCurrentUserName() {
        try {
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                // 从请求头或属性中获取用户名
                Object userName = request.getAttribute("userName");
                if (userName != null) {
                    return userName.toString();
                }
            }
        } catch (Exception e) {
            logger.warn("Failed to get current user name: {}", e.getMessage());
        }
        return "system";
    }
}
