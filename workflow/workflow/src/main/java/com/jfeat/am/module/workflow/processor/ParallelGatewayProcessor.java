package com.jfeat.am.module.workflow.processor;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.jfeat.am.module.workflow.services.ProcessMonitorService;
import com.jfeat.am.module.workflow.services.crud.service.ProcessInstanceService;
import com.jfeat.am.module.workflow.services.crud.service.ProcessStepService;
import com.jfeat.am.module.workflow.services.persistence.dao.ParallelBranchMapper;
import com.jfeat.am.module.workflow.services.persistence.dao.ParallelGatewayMapper;
import com.jfeat.am.module.workflow.services.persistence.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.*;

/**
 * 并行网关处理器
 * 负责处理流程中的并行网关逻辑
 * 功能包括：
 * - 创建并行网关记录
 * - 创建多个并行分支
 * - 分支分配处理人
 * - 检测所有分支完成
 * - 合并分支结果
 *
 * @author Workflow System
 * @since 2026-02-14
 */
@Service
public class ParallelGatewayProcessor {

    private static final Logger logger = LoggerFactory.getLogger(ParallelGatewayProcessor.class);

    @Resource
    private ParallelGatewayMapper parallelGatewayMapper;

    @Resource
    private ParallelBranchMapper parallelBranchMapper;

    @Resource
    private ProcessStepService processStepService;

    @Resource
    private ProcessInstanceService processInstanceService;

    @Resource
    private ProcessMonitorService processMonitorService;

    /**
     * 并行网关状态常量
     */
    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_COMPLETED = "COMPLETED";
    public static final String STATUS_PENDING = "PENDING";

    /**
     * 并行分支状态常量
     */
    public static final String BRANCH_STATUS_PENDING = "PENDING";
    public static final String BRANCH_STATUS_ACTIVE = "ACTIVE";
    public static final String BRANCH_STATUS_COMPLETED = "COMPLETED";

    /**
     * 创建并行网关
     *
     * @param instanceId 流程实例ID
     * @param gatewayStepId 网关步骤ID
     * @param branchSteps 分支步骤列表
     * @param assigneeMap 分支处理人映射（分支步骤ID -> 处理人ID）
     * @return 创建的并行网关
     */
    @Transactional(rollbackFor = Exception.class)
    public ParallelGateway createParallelGateway(Long instanceId, Long gatewayStepId,
                                                  List<ProcessStep> branchSteps,
                                                  Map<Long, Long> assigneeMap) {
        if (instanceId == null) {
            throw new IllegalArgumentException("流程实例ID不能为空");
        }
        if (gatewayStepId == null) {
            throw new IllegalArgumentException("网关步骤ID不能为空");
        }
        if (branchSteps == null || branchSteps.isEmpty()) {
            throw new IllegalArgumentException("分支步骤列表不能为空");
        }

        logger.info("开始创建并行网关，实例ID: {}, 网关步骤ID: {}, 分支数量: {}",
                instanceId, gatewayStepId, branchSteps.size());

        // 1. 创建并行网关记录
        ParallelGateway gateway = new ParallelGateway();
        gateway.setInstanceId(instanceId);
        gateway.setGatewayStepId(gatewayStepId);
        gateway.setBranchCount(branchSteps.size());
        gateway.setCompletedCount(0);
        gateway.setStatus(STATUS_ACTIVE);
        gateway.setCreateTime(new Date());
        gateway.setUpdateTime(new Date());

        parallelGatewayMapper.insert(gateway);
        logger.info("并行网关创建成功，网关ID: {}", gateway.getId());

        // 2. 创建并行分支
        int order = 0;
        for (ProcessStep branchStep : branchSteps) {
            createParallelBranch(gateway.getId(), branchStep, order++, assigneeMap);
        }

        // 3. 记录监控信息
        processMonitorService.recordInfo(instanceId,
                String.format("创建并行网关，共 %d 个分支", branchSteps.size()));

        return gateway;
    }

    /**
     * 创建并行分支
     *
     * @param gatewayId 网关ID
     * @param branchStep 分支步骤
     * @param order 分支顺序
     * @param assigneeMap 处理人映射
     */
    private void createParallelBranch(Long gatewayId, ProcessStep branchStep,
                                      int order, Map<Long, Long> assigneeMap) {
        ParallelBranch branch = new ParallelBranch();
        branch.setGatewayId(gatewayId);
        branch.setBranchStepId(branchStep.getId());
        branch.setBranchName(branchStep.getName());
        branch.setBranchOrder(order);
        branch.setStatus(BRANCH_STATUS_PENDING);
        branch.setCreateTime(new Date());

        // 设置处理人
        Long assigneeId = assigneeMap != null ? assigneeMap.get(branchStep.getId()) : null;
        if (assigneeId != null) {
            branch.setAssigneeId(assigneeId);
            // 这里可以从用户服务获取处理人姓名
            // branch.setAssigneeName(userService.getUserName(assigneeId));
        }

        parallelBranchMapper.insert(branch);
        logger.info("并行分支创建成功，分支ID: {}, 分支名称: {}, 处理人ID: {}",
                branch.getId(), branch.getBranchName(), assigneeId);
    }

    /**
     * 激活并行分支
     *
     * @param branchId 分支ID
     */
    @Transactional(rollbackFor = Exception.class)
    public void activateBranch(Long branchId) {
        if (branchId == null) {
            throw new IllegalArgumentException("分支ID不能为空");
        }

        ParallelBranch branch = parallelBranchMapper.selectById(branchId);
        if (branch == null) {
            logger.warn("激活分支时分支不存在，分支ID: {}", branchId);
            return;
        }

        branch.activate();
        parallelBranchMapper.updateById(branch);

        logger.info("并行分支已激活，分支ID: {}, 分支名称: {}",
                branchId, branch.getBranchName());
    }

    /**
     * 完成并行分支
     * 当某个分支完成时调用，检测是否所有分支都已完成
     *
     * @param branchId 分支ID
     * @return 是否所有分支都已完成
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean completeBranch(Long branchId) {
        if (branchId == null) {
            throw new IllegalArgumentException("分支ID不能为空");
        }

        // 1. 获取分支信息
        ParallelBranch branch = parallelBranchMapper.selectById(branchId);
        if (branch == null) {
            logger.warn("完成分支时分支不存在，分支ID: {}", branchId);
            return false;
        }

        logger.info("开始完成并行分支，分支ID: {}, 分支名称: {}",
                branchId, branch.getBranchName());

        // 2. 标记分支为已完成
        branch.markAsCompleted();
        parallelBranchMapper.updateById(branch);

        // 3. 更新网关的已完成计数
        ParallelGateway gateway = parallelGatewayMapper.selectById(branch.getGatewayId());
        if (gateway == null) {
            logger.error("网关不存在，网关ID: {}", branch.getGatewayId());
            return false;
        }

        gateway.incrementCompletedCount();
        gateway.setUpdateTime(new Date());
        parallelGatewayMapper.updateById(gateway);

        logger.info("并行分支已完成，网关ID: {}, 已完成分支数: {}, 总分支数: {}",
                gateway.getId(), gateway.getCompletedCount(), gateway.getBranchCount());

        // 4. 检查是否所有分支都已完成
        boolean allCompleted = gateway.isAllBranchesCompleted();
        if (allCompleted) {
            logger.info("所有并行分支已完成，网关ID: {}", gateway.getId());
            processMonitorService.recordInfo(gateway.getInstanceId(),
                    "并行网关所有分支已完成");
        }

        return allCompleted;
    }

    /**
     * 检查并行网关是否已完成
     *
     * @param gatewayId 网关ID
     * @return 是否已完成
     */
    public boolean isGatewayCompleted(Long gatewayId) {
        if (gatewayId == null) {
            return false;
        }

        ParallelGateway gateway = parallelGatewayMapper.selectById(gatewayId);
        return gateway != null && STATUS_COMPLETED.equals(gateway.getStatus());
    }

    /**
     * 获取指定流程实例的活跃并行网关
     *
     * @param instanceId 流程实例ID
     * @return 活跃的并行网关列表
     */
    public List<ParallelGateway> getActiveGateways(Long instanceId) {
        if (instanceId == null) {
            return new ArrayList<>();
        }

        return parallelGatewayMapper.findByInstanceIdAndStatus(instanceId, STATUS_ACTIVE);
    }

    /**
     * 获取指定网关的所有分支
     *
     * @param gatewayId 网关ID
     * @return 分支列表
     */
    public List<ParallelBranch> getGatewayBranches(Long gatewayId) {
        if (gatewayId == null) {
            return new ArrayList<>();
        }

        return parallelBranchMapper.findByGatewayId(gatewayId);
    }

    /**
     * 获取指定网关的已完成分支
     *
     * @param gatewayId 网关ID
     * @return 已完成分支列表
     */
    public List<ParallelBranch> getCompletedBranches(Long gatewayId) {
        if (gatewayId == null) {
            return new ArrayList<>();
        }

        return parallelBranchMapper.findByGatewayIdAndStatus(gatewayId, BRANCH_STATUS_COMPLETED);
    }

    /**
     * 获取指定网关的未完成分支
     *
     * @param gatewayId 网关ID
     * @return 未完成分支列表
     */
    public List<ParallelBranch> getPendingBranches(Long gatewayId) {
        if (gatewayId == null) {
            return new ArrayList<>();
        }

        QueryWrapper<ParallelBranch> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("gateway_id", gatewayId)
                .in("status", Arrays.asList(BRANCH_STATUS_PENDING, BRANCH_STATUS_ACTIVE))
                .orderByAsc("branch_order");

        return parallelBranchMapper.selectList(queryWrapper);
    }

    /**
     * 获取指定处理人的待处理分支
     *
     * @param assigneeId 处理人ID
     * @return 待处理分支列表
     */
    public List<ParallelBranch> getPendingBranchesByAssignee(Long assigneeId) {
        if (assigneeId == null) {
            return new ArrayList<>();
        }

        QueryWrapper<ParallelBranch> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("assignee_id", assigneeId)
                .in("status", Arrays.asList(BRANCH_STATUS_PENDING, BRANCH_STATUS_ACTIVE))
                .orderByAsc("create_time");

        return parallelBranchMapper.selectList(queryWrapper);
    }

    /**
     * 获取并行网关的执行状态
     * 返回各分支的执行状态信息
     *
     * @param gatewayId 网关ID
     * @return 状态信息Map
     */
    public Map<String, Object> getGatewayStatus(Long gatewayId) {
        Map<String, Object> status = new HashMap<>();

        ParallelGateway gateway = parallelGatewayMapper.selectById(gatewayId);
        if (gateway == null) {
            return status;
        }

        status.put("gatewayId", gateway.getId());
        status.put("instanceId", gateway.getInstanceId());
        status.put("branchCount", gateway.getBranchCount());
        status.put("completedCount", gateway.getCompletedCount());
        status.put("status", gateway.getStatus());

        List<ParallelBranch> branches = parallelBranchMapper.findByGatewayId(gatewayId);
        List<Map<String, Object>> branchStatusList = new ArrayList<>();

        for (ParallelBranch branch : branches) {
            Map<String, Object> branchStatus = new HashMap<>();
            branchStatus.put("branchId", branch.getId());
            branchStatus.put("branchName", branch.getBranchName());
            branchStatus.put("branchOrder", branch.getBranchOrder());
            branchStatus.put("status", branch.getStatus());
            branchStatus.put("assigneeId", branch.getAssigneeId());
            branchStatus.put("assigneeName", branch.getAssigneeName());
            branchStatus.put("createTime", branch.getCreateTime());
            branchStatus.put("completeTime", branch.getCompleteTime());
            branchStatusList.add(branchStatus);
        }

        status.put("branches", branchStatusList);

        return status;
    }

    /**
     * 获取指定流程实例的所有并行网关状态
     *
     * @param instanceId 流程实例ID
     * @return 网关状态列表
     */
    public List<Map<String, Object>> getInstanceGatewayStatus(Long instanceId) {
        List<ParallelGateway> gateways = parallelGatewayMapper.findByInstanceId(instanceId);
        List<Map<String, Object>> statusList = new ArrayList<>();

        for (ParallelGateway gateway : gateways) {
            statusList.add(getGatewayStatus(gateway.getId()));
        }

        return statusList;
    }

    /**
     * 记录并行网关的执行日志
     * 用于调试和审计
     *
     * @param gatewayId 网关ID
     * @param message 日志消息
     */
    public void logGatewayExecution(Long gatewayId, String message) {
        if (gatewayId == null || message == null) {
            return;
        }

        ParallelGateway gateway = parallelGatewayMapper.selectById(gatewayId);
        if (gateway != null) {
            processMonitorService.recordInfo(gateway.getInstanceId(),
                    String.format("[并行网关] %s", message));
        }
    }

    /**
     * 检查并行网关是否超时
     * 如果网关创建时间超过指定阈值且未完成，则认为超时
     *
     * @param gatewayId 网关ID
     * @param timeoutHours 超时小时数
     * @return 是否超时
     */
    public boolean isGatewayTimeout(Long gatewayId, int timeoutHours) {
        if (gatewayId == null) {
            return false;
        }

        ParallelGateway gateway = parallelGatewayMapper.selectById(gatewayId);
        if (gateway == null || STATUS_COMPLETED.equals(gateway.getStatus())) {
            return false;
        }

        long timeoutMillis = timeoutHours * 3600 * 1000L;
        long elapsedMillis = System.currentTimeMillis() - gateway.getCreateTime().getTime();

        boolean timeout = elapsedMillis > timeoutMillis;
        if (timeout) {
            processMonitorService.recordTimeout(gateway.getInstanceId(), (long) timeoutHours);
        }

        return timeout;
    }
}
