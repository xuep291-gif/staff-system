package com.jfeat.am.module.workflow.services.crud.service.impl;

import com.alibaba.fastjson.JSON;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.jfeat.am.module.workflow.services.OperationAuditService;
import com.jfeat.am.module.workflow.services.persistence.dao.OperationAuditMapper;
import com.jfeat.am.module.workflow.services.persistence.model.OperationAudit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 操作审计服务实现类
 *
 * @author Workflow System
 * @since 2026-02-14
 */
@Service
public class OperationAuditServiceImpl extends ServiceImpl<OperationAuditMapper, OperationAudit>
        implements OperationAuditService {

    private static final Logger logger = LoggerFactory.getLogger(OperationAuditServiceImpl.class);

    @Resource
    private OperationAuditMapper operationAuditMapper;

    @Resource
    private HttpServletRequest request;

    @Override
    public void logAudit(String operationType, Long operatorId, String operatorName,
                        String targetType, Long targetId, Object requestData,
                        Object responseData, Integer executionTimeMs, Boolean success) {
        try {
            OperationAudit audit = new OperationAudit();
            audit.setOperationType(operationType);
            audit.setOperatorId(operatorId);
            audit.setOperatorName(operatorName);
            audit.setTargetType(targetType);
            audit.setTargetId(targetId);

            // 序列化请求数据
            if (requestData != null) {
                try {
                    audit.setRequestData(JSON.toJSONString(requestData));
                } catch (Exception e) {
                    logger.warn("Failed to serialize request data: {}", e.getMessage());
                    audit.setRequestData(requestData.toString());
                }
            }

            // 序列化响应数据
            if (responseData != null) {
                try {
                    audit.setResponseData(JSON.toJSONString(responseData));
                } catch (Exception e) {
                    logger.warn("Failed to serialize response data: {}", e.getMessage());
                    audit.setResponseData(responseData.toString());
                }
            }

            // 获取请求信息
            if (request != null) {
                audit.setIpAddress(getIpAddress(request));
                audit.setUserAgent(request.getHeader("User-Agent"));
            }

            audit.setExecutionTimeMs(executionTimeMs);
            audit.setSuccess(success);
            audit.setCreateTime(new Date());

            // 保存审计记录
            this.save(audit);

            // 记录日志
            if (logger.isDebugEnabled()) {
                logger.debug("Operation audit logged: {}", audit);
            }

        } catch (Exception e) {
            logger.error("Failed to log operation audit: {}", e.getMessage(), e);
        }
    }

    @Override
    public void logSuccess(String operationType, Long operatorId, String operatorName,
                           String targetType, Long targetId, Object requestData) {
        logAudit(operationType, operatorId, operatorName, targetType, targetId,
                requestData, null, null, true);
    }

    @Override
    public void logFailure(String operationType, Long operatorId, String operatorName,
                           String targetType, Long targetId, Object requestData, Exception e) {
        logAudit(operationType, operatorId, operatorName, targetType, targetId,
                requestData, null, null, false);
    }

    @Override
    public List<OperationAudit> queryAudits(Date startDate, Date endDate, String operationType, Long operatorId) {
        // 使用 MyBatis-Plus 查询构造器
        return lambdaQuery()
                .ge(startDate != null, OperationAudit::getCreateTime, startDate)
                .le(endDate != null, OperationAudit::getCreateTime, endDate)
                .eq(operationType != null, OperationAudit::getOperationType, operationType)
                .eq(operatorId != null, OperationAudit::getOperatorId, operatorId)
                .orderByDesc(OperationAudit::getCreateTime)
                .list();
    }

    @Override
    public List<OperationAudit> queryByTarget(String targetType, Long targetId) {
        return operationAuditMapper.findByTarget(targetType, targetId);
    }

    @Override
    public Map<String, Object> getOperationStats(Date startDate, Date endDate) {
        Map<String, Object> stats = new HashMap<>();

        // 查询操作类型分布
        List<OperationAuditMapper.OperationTypeStats> typeStats =
                operationAuditMapper.statsByOperationType(startDate, endDate);

        stats.put("operationTypeStats", typeStats);

        // 查询总数
        long totalCount = this.count(
                lambdaQuery()
                        .ge(startDate != null, OperationAudit::getCreateTime, startDate)
                        .le(endDate != null, OperationAudit::getCreateTime, endDate)
                        .getWrapper()
        );

        stats.put("totalCount", totalCount);

        // 查询成功数
        long successCount = this.count(
                lambdaQuery()
                        .ge(startDate != null, OperationAudit::getCreateTime, startDate)
                        .le(endDate != null, OperationAudit::getCreateTime, endDate)
                        .eq(OperationAudit::getSuccess, true)
                        .getWrapper()
        );

        stats.put("successCount", successCount);
        stats.put("failureCount", totalCount - successCount);

        return stats;
    }

    @Override
    public Map<String, Object> getPerformanceStats(String operationType, Date startDate, Date endDate) {
        Map<String, Object> stats = new HashMap<>();

        // 查询该类型的所有审计记录
        List<OperationAudit> audits = operationAuditMapper.findByOperationType(
                operationType, startDate, endDate);

        if (audits.isEmpty()) {
            stats.put("count", 0);
            stats.put("avgExecutionTime", 0);
            stats.put("maxExecutionTime", 0);
            stats.put("minExecutionTime", 0);
            return stats;
        }

        // 计算统计信息
        long count = audits.size();
        long totalExecutionTime = 0;
        long maxExecutionTime = 0;
        long minExecutionTime = Long.MAX_VALUE;

        for (OperationAudit audit : audits) {
            if (audit.getExecutionTimeMs() != null) {
                totalExecutionTime += audit.getExecutionTimeMs();
                maxExecutionTime = Math.max(maxExecutionTime, audit.getExecutionTimeMs());
                minExecutionTime = Math.min(minExecutionTime, audit.getExecutionTimeMs());
            }
        }

        stats.put("count", count);
        stats.put("avgExecutionTime", count > 0 ? totalExecutionTime / count : 0);
        stats.put("maxExecutionTime", maxExecutionTime);
        stats.put("minExecutionTime", minExecutionTime == Long.MAX_VALUE ? 0 : minExecutionTime);

        return stats;
    }

    /**
     * 获取客户端IP地址
     */
    private String getIpAddress(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }

        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }

        // 处理多个IP的情况，取第一个
        if (ip != null && ip.length() > 0 && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }

        return ip;
    }
}
