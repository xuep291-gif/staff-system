package com.jfeat.am.module.workflow.services.crud.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.jfeat.am.module.workflow.services.ProcessValidationService;
import com.jfeat.am.module.workflow.services.crud.service.ProcessService;
import com.jfeat.am.module.workflow.services.crud.service.ProcessStepService;
import com.jfeat.am.module.workflow.services.domain.dao.QueryProcessDao;
import com.jfeat.am.module.workflow.services.persistence.model.Process;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;
import com.jfeat.crud.base.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
 * 流程校验服务实现类
 * 提供流程可用性、权限、定义完整性等校验功能
 *
 * @author Workflow System
 * @since 2026-02-14
 */
@Service
public class ProcessValidationServiceImpl implements ProcessValidationService {

    private static final Logger logger = LoggerFactory.getLogger(ProcessValidationServiceImpl.class);

    @Resource
    private ProcessService processService;

    @Resource
    private ProcessStepService processStepService;

    @Resource
    private QueryProcessDao queryProcessDao;

    /**
     * 验证流程是否可用
     * 检查流程是否存在、状态是否启用、是否被锁定
     *
     * @param processId 流程ID
     * @throws RuntimeException 流程不存在或已禁用
     */
    @Override
    public void validateProcessAvailable(Long processId) {
        logger.debug("开始验证流程可用性，流程ID: {}", processId);

        Process process = processService.retrieveMaster(processId);
        if (process == null) {
            logger.error("流程不存在，流程ID: {}", processId);
            throw new BusinessException("流程不存在");
        }

        // 检查流程状态
        if ("DISABLED".equals(process.getStatus())) {
            logger.error("流程已禁用，流程ID: {}, 流程名称: {}", processId, process.getName());
            throw new BusinessException("流程已禁用");
        }

        // 检查是否锁定
        if (isProcessLocked(processId)) {
            logger.error("流程已锁定，无法修改，流程ID: {}, 流程名称: {}", processId, process.getName());
            throw new BusinessException("流程已锁定，无法修改");
        }

        logger.debug("流程可用性验证通过，流程ID: {}, 流程名称: {}", processId, process.getName());
    }

    /**
     * 验证用户是否有权限发起流程
     * 检查流程的开放范围（ALL/DEPARTMENT/USER）
     *
     * @param processId 流程ID
     * @param userId 用户ID
     * @throws RuntimeException 无权限发起流程
     */
    @Override
    public void validateStartPermission(Long processId, Long userId) {
        logger.debug("开始验证用户发起流程权限，流程ID: {}, 用户ID: {}", processId, userId);

        // 先验证流程可用性
        validateProcessAvailable(processId);

        Process process = processService.retrieveMaster(processId);

        // 检查开放范围
        String openTo = process.getOpenTo();
        if (openTo == null || "ALL".equals(openTo)) {
            logger.debug("流程开放范围：所有人可发起，流程ID: {}", processId);
            return; // 所有人可发起
        }

        // 检查指定用户
        if ("USER".equals(openTo)) {
            String openToIds = process.getOpenToIds();
            if (openToIds != null && openToIds.contains(userId.toString())) {
                logger.debug("用户在指定用户列表中，有权限发起，流程ID: {}, 用户ID: {}", processId, userId);
                return;
            }
            logger.error("用户不在指定用户列表中，无权限发起，流程ID: {}, 用户ID: {}", processId, userId);
            throw new BusinessException("无权限发起此流程");
        }

        // 检查指定部门
        if ("DEPARTMENT".equals(openTo)) {
            // 获取用户部门ID并验证
            Long userDeptId = queryProcessDao.getUserDepartmentId(userId);
            if (userDeptId == null) {
                logger.error("用户部门信息不存在，流程ID: {}, 用户ID: {}", processId, userId);
                throw new BusinessException("用户部门信息不存在，无法验证权限");
            }

            String openToIds = process.getOpenToIds();
            if (openToIds != null && openToIds.contains(userDeptId.toString())) {
                logger.debug("用户所在部门在指定部门列表中，有权限发起，流程ID: {}, 用户ID: {}, 部门ID: {}",
                        processId, userId, userDeptId);
                return;
            }
            logger.error("用户所在部门不在指定部门列表中，无权限发起，流程ID: {}, 用户ID: {}, 部门ID: {}",
                    processId, userId, userDeptId);
            throw new BusinessException("无权限发起此流程");
        }

        logger.error("未知的开放范围类型，流程ID: {}, 开放范围: {}", processId, openTo);
        throw new BusinessException("无权限发起此流程");
    }

    /**
     * 验证流程定义完整性
     * 检查是否包含开始节点、结束节点，以及节点连通性
     *
     * @param processId 流程ID
     * @throws RuntimeException 流程定义不完整
     */
    @Override
    public void validateProcessDefinition(Long processId) {
        logger.debug("开始验证流程定义完整性，流程ID: {}", processId);

        List<ProcessStep> steps = processStepService.getSortedStepsByProcessId(processId);

        if (steps == null || steps.isEmpty()) {
            logger.error("流程没有任何步骤，流程ID: {}", processId);
            throw new BusinessException("流程没有任何步骤");
        }

        // 检查是否有开始节点
        boolean hasStart = steps.stream()
                .anyMatch(s -> "START".equals(s.getType()));
        if (!hasStart) {
            logger.error("流程缺少开始节点，流程ID: {}", processId);
            throw new BusinessException("流程缺少开始节点");
        }

        // 检查是否有结束节点
        boolean hasEnd = steps.stream()
                .anyMatch(s -> "END".equals(s.getType()));
        if (!hasEnd) {
            logger.error("流程缺少结束节点，流程ID: {}", processId);
            throw new BusinessException("流程缺少结束节点");
        }

        // 检查步骤连通性（简化版）
        if (steps.size() < 2) {
            logger.error("流程步骤数量不足，至少需要2个节点，实际数量: {}, 流程ID: {}", steps.size(), processId);
            throw new BusinessException("流程至少需要2个节点");
        }

        // 验证链表连通性
        ProcessStep current = steps.get(0);
        int connectedCount = 1;
        while (current.getNextId() != null && !current.getNextId().equals(-1L)) {
            boolean foundNext = false;
            for (ProcessStep step : steps) {
                if (step.getId().equals(current.getNextId())) {
                    current = step;
                    connectedCount++;
                    foundNext = true;
                    break;
                }
            }
            if (!foundNext) {
                logger.error("流程步骤链表断裂，流程ID: {}", processId);
                throw new BusinessException("流程步骤链表断裂");
            }
        }

        if (connectedCount != steps.size()) {
            logger.warn("流程存在孤立节点，总步骤数: {}, 连通步骤数: {}, 流程ID: {}",
                    steps.size(), connectedCount, processId);
        }

        logger.debug("流程定义完整性验证通过，流程ID: {}, 步骤数量: {}", processId, steps.size());
    }

    /**
     * 验证流程是否已锁定
     * 运行中的流程不可修改定义
     *
     * @param processId 流程ID
     * @return true表示已锁定，false表示未锁定
     */
    @Override
    public boolean isProcessLocked(Long processId) {
        Process process = processService.retrieveMaster(processId);
        if (process == null) {
            logger.warn("检查流程锁定状态时发现流程不存在，流程ID: {}", processId);
            return false;
        }

        // 检查是否有运行中的实例
        Integer runningCount = queryProcessDao.countRunningInstances(processId);
        boolean isLocked = runningCount != null && runningCount > 0;

        if (isLocked) {
            logger.debug("流程已锁定，存在运行中的实例，流程ID: {}, 运行中实例数: {}", processId, runningCount);
        } else {
            logger.debug("流程未锁定，流程ID: {}", processId);
        }

        return isLocked;
    }
}
