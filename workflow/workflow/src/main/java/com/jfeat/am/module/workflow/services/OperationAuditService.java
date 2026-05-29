package com.jfeat.am.module.workflow.services;

import com.jfeat.am.module.workflow.services.persistence.model.OperationAudit;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * 操作审计服务接口
 * 提供操作日志记录、查询和统计功能
 *
 * @author Workflow System
 * @since 2026-02-14
 */
public interface OperationAuditService {

    /**
     * 记录操作审计
     *
     * @param operationType    操作类型
     * @param operatorId       操作人ID
     * @param operatorName     操作人姓名
     * @param targetType       目标类型
     * @param targetId         目标ID
     * @param requestData      请求数据
     * @param responseData     响应数据
     * @param executionTimeMs  执行耗时（毫秒）
     * @param success          是否成功
     */
    void logAudit(String operationType, Long operatorId, String operatorName,
                  String targetType, Long targetId, Object requestData,
                  Object responseData, Integer executionTimeMs, Boolean success);

    /**
     * 记录成功操作
     *
     * @param operationType 操作类型
     * @param operatorId    操作人ID
     * @param operatorName  操作人姓名
     * @param targetType    目标类型
     * @param targetId      目标ID
     * @param requestData   请求数据
     */
    void logSuccess(String operationType, Long operatorId, String operatorName,
                   String targetType, Long targetId, Object requestData);

    /**
     * 记录失败操作
     *
     * @param operationType 操作类型
     * @param operatorId    操作人ID
     * @param operatorName  操作人姓名
     * @param targetType    目标类型
     * @param targetId      目标ID
     * @param requestData   请求数据
     * @param e             异常信息
     */
    void logFailure(String operationType, Long operatorId, String operatorName,
                   String targetType, Long targetId, Object requestData, Exception e);

    /**
     * 查询审计日志
     *
     * @param startDate     开始时间
     * @param endDate       结束时间
     * @param operationType 操作类型
     * @param operatorId    操作人ID
     * @return 审计日志列表
     */
    List<OperationAudit> queryAudits(Date startDate, Date endDate, String operationType, Long operatorId);

    /**
     * 查询指定目标的审计日志
     *
     * @param targetType 目标类型
     * @param targetId   目标ID
     * @return 审计日志列表
     */
    List<OperationAudit> queryByTarget(String targetType, Long targetId);

    /**
     * 统计操作类型分布
     *
     * @param startDate 开始时间
     * @param endDate   结束时间
     * @return 统计结果
     */
    Map<String, Object> getOperationStats(Date startDate, Date endDate);

    /**
     * 获取操作性能统计
     *
     * @param operationType 操作类型
     * @param startDate     开始时间
     * @param endDate       结束时间
     * @return 性能统计信息
     */
    Map<String, Object> getPerformanceStats(String operationType, Date startDate, Date endDate);
}
