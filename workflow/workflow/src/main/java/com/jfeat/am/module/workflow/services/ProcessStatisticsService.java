package com.jfeat.am.module.workflow.services;

import com.jfeat.am.module.workflow.services.domain.dto.BottleneckNode;
import com.jfeat.am.module.workflow.services.domain.dto.ProcessExecutionStats;
import com.jfeat.am.module.workflow.services.domain.dto.UserApprovalStats;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * 流程统计服务接口
 * 提供流程执行统计、用户审批效率统计和流程瓶颈分析功能
 *
 * @author Workflow System
 * @since 2026-02-14
 */
public interface ProcessStatisticsService {

    /**
     * 流程执行统计
     * 统计指定流程在时间范围内的执行情况
     *
     * @param processId 流程ID
     * @param startDate 开始日期
     * @param endDate   结束日期
     * @return 流程执行统计信息
     */
    ProcessExecutionStats getExecutionStats(Long processId, Date startDate, Date endDate);

    /**
     * 用户审批效率统计
     * 统计指定用户在时间范围内的审批效率
     *
     * @param userId    用户ID
     * @param startDate 开始日期
     * @param endDate   结束日期
     * @return 用户审批统计信息
     */
    UserApprovalStats getUserApprovalStats(Long userId, Date startDate, Date endDate);

    /**
     * 流程瓶颈分析
     * 分析指定流程的瓶颈节点
     *
     * @param processId 流程ID
     * @return 瓶颈节点列表，按平均处理时长降序排列
     */
    List<BottleneckNode> analyzeBottlenecks(Long processId);

    /**
     * 批量获取流程执行统计
     *
     * @param processIds 流程ID列表
     * @param startDate  开始日期
     * @param endDate    结束日期
     * @return 流程ID -> 统计信息的映射
     */
    Map<Long, ProcessExecutionStats> batchGetExecutionStats(List<Long> processIds, Date startDate, Date endDate);

    /**
     * 获取流程概览统计
     * 统计所有流程的总体情况
     *
     * @param startDate 开始日期
     * @param endDate   结束日期
     * @return 流程概览统计信息
     */
    Map<String, Object> getOverviewStats(Date startDate, Date endDate);
}
