package com.jfeat.am.module.workflow.processor;

import com.jfeat.am.module.workflow.services.crud.service.ProcessStepService;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;
import com.jfeat.am.module.workflow.strategy.ApprovalRequest;
import com.jfeat.am.module.workflow.strategy.ApprovalStrategy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
 * 审批处理器
 * 负责根据步骤类型选择合适的审批策略进行处理
 *
 * 使用策略模式将审批逻辑解耦，使代码更易维护和扩展
 *
 * @author Code Generator
 * @date 2026-02-14
 */
@Service
public class ApprovalProcessor {

    private static final Logger logger = LoggerFactory.getLogger(ApprovalProcessor.class);

    @Resource
    private List<ApprovalStrategy> strategies;

    @Resource
    private ProcessStepService processStepService;

    /**
     * 处理审批请求
     * 自动根据当前步骤类型选择合适的审批策略
     *
     * @param instance 流程实例
     * @param request  审批请求参数
     * @return 处理后的流程实例
     * @throws RuntimeException 如果找不到匹配的策略
     */
    public ProcessInstance process(ProcessInstance instance, ApprovalRequest request) {
        if (instance == null) {
            throw new IllegalArgumentException("ProcessInstance cannot be null");
        }
        if (request == null) {
            throw new IllegalArgumentException("ApprovalRequest cannot be null");
        }

        // 获取当前步骤
        ProcessStep currentStep = getCurrentStep(instance);
        if (currentStep == null) {
            logger.error("Current step not found for instance: {}", instance.getId());
            throw new RuntimeException("Current step not found for instance: " + instance.getId());
        }

        // 查找匹配的策略
        ApprovalStrategy strategy = findStrategy(currentStep);
        if (strategy == null) {
            logger.error("No strategy found for step type: {}", currentStep.getType());
            throw new RuntimeException("No strategy found for step type: " + currentStep.getType());
        }

        logger.debug("Using strategy: {} for step type: {}",
                strategy.getClass().getSimpleName(), currentStep.getType());

        // 执行策略
        return strategy.handle(instance, request);
    }

    /**
     * 处理审批请求(指定步骤ID)
     *
     * @param instanceId 流程实例ID
     * @param stepId     当前步骤ID
     * @param request    审批请求参数
     * @return 处理后的流程实例
     */
    public ProcessInstance process(Long instanceId, Long stepId, ApprovalRequest request) {
        if (instanceId == null) {
            throw new IllegalArgumentException("Instance ID cannot be null");
        }
        if (stepId == null) {
            throw new IllegalArgumentException("Step ID cannot be null");
        }
        if (request == null) {
            throw new IllegalArgumentException("ApprovalRequest cannot be null");
        }

        // 获取步骤
        ProcessStep step = processStepService.retrieveMaster(stepId);
        if (step == null) {
            logger.error("Step not found: {}", stepId);
            throw new RuntimeException("Step not found: " + stepId);
        }

        // 查找匹配的策略
        ApprovalStrategy strategy = findStrategy(step);
        if (strategy == null) {
            logger.error("No strategy found for step type: {}", step.getType());
            throw new RuntimeException("No strategy found for step type: " + step.getType());
        }

        // 注意: 这里需要通过instanceId获取完整的ProcessInstance对象
        // 实际使用时应该注入ProcessInstanceService来获取
        // 这里简化处理，调用方需要提供完整的ProcessInstance
        throw new UnsupportedOperationException(
                "Please use process(ProcessInstance, ApprovalRequest) method instead");
    }

    /**
     * 获取当前步骤
     */
    private ProcessStep getCurrentStep(ProcessInstance instance) {
        if (instance.getCurrentStepId() == null) {
            logger.error("Current step ID is null for instance: {}", instance.getId());
            return null;
        }
        return processStepService.retrieveMaster(instance.getCurrentStepId());
    }

    /**
     * 根据步骤类型查找匹配的策略
     *
     * @param step 流程步骤
     * @return 匹配的审批策略，如果找不到则返回null
     */
    private ApprovalStrategy findStrategy(ProcessStep step) {
        return strategies.stream()
                .filter(strategy -> strategy.supports(step))
                .findFirst()
                .orElse(null);
    }

    /**
     * 获取所有已注册的审批策略
     * 用于调试和监控
     *
     * @return 策略列表
     */
    public List<ApprovalStrategy> getRegisteredStrategies() {
        return strategies;
    }

    /**
     * 检查是否有策略支持指定步骤
     *
     * @param step 流程步骤
     * @return true-有支持策略, false-无支持策略
     */
    public boolean hasStrategyFor(ProcessStep step) {
        return strategies.stream().anyMatch(strategy -> strategy.supports(step));
    }
}
