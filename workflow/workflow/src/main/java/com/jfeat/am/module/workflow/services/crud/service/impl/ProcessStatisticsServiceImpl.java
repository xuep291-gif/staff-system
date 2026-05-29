package com.jfeat.am.module.workflow.services.crud.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.jfeat.am.module.workflow.services.ProcessStatisticsService;
import com.jfeat.am.module.workflow.services.domain.dto.BottleneckNode;
import com.jfeat.am.module.workflow.services.domain.dto.ProcessExecutionStats;
import com.jfeat.am.module.workflow.services.domain.dto.UserApprovalStats;
import com.jfeat.am.module.workflow.services.persistence.dao.HistoryMapper;
import com.jfeat.am.module.workflow.services.persistence.dao.ProcessInstanceMapper;
import com.jfeat.am.module.workflow.services.persistence.dao.ProcessMapper;
import com.jfeat.am.module.workflow.services.persistence.dao.TaskMapper;
import com.jfeat.am.module.workflow.services.persistence.model.History;
import com.jfeat.am.module.workflow.services.persistence.model.Process;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;
import com.jfeat.am.module.workflow.services.persistence.model.Task;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 流程统计服务实现类
 * 提供流程执行统计、用户审批效率统计和流程瓶颈分析功能
 *
 * @author Workflow System
 * @since 2026-02-14
 */
@Service
public class ProcessStatisticsServiceImpl extends ServiceImpl<ProcessMapper, Process>
        implements ProcessStatisticsService {

    @Resource
    private ProcessInstanceMapper processInstanceMapper;

    @Resource
    private HistoryMapper historyMapper;

    @Resource
    private TaskMapper taskMapper;

    @Override
    public ProcessExecutionStats getExecutionStats(Long processId, Date startDate, Date endDate) {
        ProcessExecutionStats stats = new ProcessExecutionStats();
        stats.setProcessId(processId);
        stats.setStartDate(startDate);
        stats.setEndDate(endDate);

        // 查询流程信息
        Process process = this.getById(processId);
        if (process != null) {
            stats.setProcessName(process.getName());
        }

        // 查询流程实例
        List<ProcessInstance> instances = lambdaQuery()
                .eq(ProcessInstance::getProcessId, processId)
                .ge(startDate != null, ProcessInstance::getCreateTime, startDate)
                .le(endDate != null, ProcessInstance::getCreateTime, endDate)
                .list();

        // 统计各种状态的数量
        int totalCount = instances.size();
        int approvedCount = 0;
        int rejectedCount = 0;
        int runningCount = 0;
        long totalApprovalSeconds = 0;
        long maxApprovalSeconds = 0;
        long minApprovalSeconds = Long.MAX_VALUE;
        int validApprovalCount = 0;

        for (ProcessInstance instance : instances) {
            String status = instance.getStatus();
            if ("CLOSE_APPROVED".equals(status) || "APPROVED".equals(status)) {
                approvedCount++;
            } else if ("CLOSE_REJECTED".equals(status) || "REJECTED".equals(status)) {
                rejectedCount++;
            } else if ("RUNNING".equals(status) || "PENDING".equals(status)) {
                runningCount++;
            }

            // 统计审批时长
            if (instance.getCostSeconds() != null && instance.getCostSeconds() > 0) {
                totalApprovalSeconds += instance.getCostSeconds();
                maxApprovalSeconds = Math.max(maxApprovalSeconds, instance.getCostSeconds());
                minApprovalSeconds = Math.min(minApprovalSeconds, instance.getCostSeconds());
                validApprovalCount++;
            }
        }

        stats.setTotalCount(totalCount);
        stats.setApprovedCount(approvedCount);
        stats.setRejectedCount(rejectedCount);
        stats.setRunningCount(runningCount);

        // 计算平均审批时长
        if (validApprovalCount > 0) {
            stats.setAvgApprovalSeconds(totalApprovalSeconds / validApprovalCount);
            stats.setMaxApprovalSeconds(maxApprovalSeconds);
            stats.setMinApprovalSeconds(minApprovalSeconds);
        } else {
            stats.setAvgApprovalSeconds(0L);
            stats.setMaxApprovalSeconds(0L);
            stats.setMinApprovalSeconds(0L);
        }

        return stats;
    }

    @Override
    public UserApprovalStats getUserApprovalStats(Long userId, Date startDate, Date endDate) {
        UserApprovalStats stats = new UserApprovalStats();
        stats.setUserId(userId);
        stats.setStartDate(startDate);
        stats.setEndDate(endDate);

        // 查询待办任务
        List<Task> pendingTasks = lambdaQuery(taskMapper.selectList(null))
                .eq(Task::getUserId, userId)
                .eq(Task::getStatus, "HANDLING")
                .list();
        stats.setPendingCount(pendingTasks.size());

        // 查询历史记录
        List<History> histories = lambdaQuery()
                .eq(History::getUserId, userId)
                .ge(startDate != null, History::getHandleTime, startDate)
                .le(endDate != null, History::getHandleTime, endDate)
                .isNotNull(History::getHandleTime)
                .list();

        stats.setProcessedCount(histories.size());

        // 统计审批时长
        long totalApprovalSeconds = 0;
        long fastestApprovalSeconds = Long.MAX_VALUE;
        long slowestApprovalSeconds = 0;
        int approvedCount = 0;
        int validTimeCount = 0;

        for (History history : histories) {
            // 统计审批通过率
            if ("APPROVED".equals(history.getResult())) {
                approvedCount++;
            }

            // 统计审批时长（如果有cost_seconds字段）
            // 注意：History实体可能需要添加cost_seconds字段
            // 这里假设通过handleTime计算时长
        }

        stats.setApprovalRate(histories.size() > 0 ?
                (double) approvedCount / histories.size() * 100 : 0.0);

        if (validTimeCount > 0) {
            stats.setAvgApprovalSeconds(totalApprovalSeconds / validTimeCount);
            stats.setFastestApprovalSeconds(fastestApprovalSeconds);
            stats.setSlowestApprovalSeconds(slowestApprovalSeconds);
        } else {
            stats.setAvgApprovalSeconds(0L);
            stats.setFastestApprovalSeconds(0L);
            stats.setSlowestApprovalSeconds(0L);
        }

        return stats;
    }

    @Override
    public List<BottleneckNode> analyzeBottlenecks(Long processId) {
        List<BottleneckNode> bottlenecks = new ArrayList<>();

        // 查询流程的所有步骤
        // 这里需要根据ProcessStepMapper查询
        // 简化实现：通过历史记录分析每个步骤的处理时长

        Map<Long, BottleneckNode> stepStatsMap = new HashMap<>();

        // 查询该流程的所有历史记录
        List<History> histories = lambdaQuery()
                .eq(History::getProcessId, processId)
                .isNotNull(History::getHandleTime)
                .list();

        // 统计每个步骤的处理情况
        for (History history : histories) {
            Long stepId = history.getStepId();
            String stepName = history.getStepName();

            BottleneckNode node = stepStatsMap.computeIfAbsent(stepId, k -> {
                BottleneckNode bn = new BottleneckNode();
                bn.setStepId(stepId);
                bn.setStepName(stepName);
                bn.setProcessCount(0);
                bn.setAvgProcessSeconds(0L);
                bn.setMaxProcessSeconds(0L);
                bn.setTimeoutCount(0);
                return bn;
            });

            // 更新统计信息
            node.setProcessCount(node.getProcessCount() + 1);

            // 如果有cost_seconds，更新时长统计
            // 注意：需要确保History实体有cost_seconds字段
        }

        // 按平均处理时长降序排列
        bottlenecks = stepStatsMap.values().stream()
                .filter(node -> node.getProcessCount() > 0)
                .sorted((a, b) -> Long.compare(b.getAvgProcessSeconds(), a.getAvgProcessSeconds()))
                .collect(Collectors.toList());

        return bottlenecks;
    }

    @Override
    public Map<Long, ProcessExecutionStats> batchGetExecutionStats(List<Long> processIds, Date startDate, Date endDate) {
        Map<Long, ProcessExecutionStats> statsMap = new HashMap<>();

        for (Long processId : processIds) {
            ProcessExecutionStats stats = getExecutionStats(processId, startDate, endDate);
            statsMap.put(processId, stats);
        }

        return statsMap;
    }

    @Override
    public Map<String, Object> getOverviewStats(Date startDate, Date endDate) {
        Map<String, Object> overview = new HashMap<>();

        // 查询所有流程实例
        List<ProcessInstance> allInstances = lambdaQuery()
                .ge(startDate != null, ProcessInstance::getCreateTime, startDate)
                .le(endDate != null, ProcessInstance::getCreateTime, endDate)
                .list();

        // 统计总体情况
        int totalCount = allInstances.size();
        int approvedCount = 0;
        int rejectedCount = 0;
        int runningCount = 0;

        for (ProcessInstance instance : allInstances) {
            String status = instance.getStatus();
            if ("CLOSE_APPROVED".equals(status) || "APPROVED".equals(status)) {
                approvedCount++;
            } else if ("CLOSE_REJECTED".equals(status) || "REJECTED".equals(status)) {
                rejectedCount++;
            } else if ("RUNNING".equals(status) || "PENDING".equals(status)) {
                runningCount++;
            }
        }

        overview.put("totalCount", totalCount);
        overview.put("approvedCount", approvedCount);
        overview.put("rejectedCount", rejectedCount);
        overview.put("runningCount", runningCount);
        overview.put("approvalRate", totalCount > 0 ? (double) approvedCount / totalCount * 100 : 0.0);

        // 统计最活跃的流程
        Map<Long, Long> processCountMap = allInstances.stream()
                .collect(Collectors.groupingBy(ProcessInstance::getProcessId, Collectors.counting()));

        // 找出前5个最活跃的流程
        List<Map.Entry<Long, Long>> topProcesses = processCountMap.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .limit(5)
                .collect(Collectors.toList());

        overview.put("topProcesses", topProcesses);

        return overview;
    }
}
