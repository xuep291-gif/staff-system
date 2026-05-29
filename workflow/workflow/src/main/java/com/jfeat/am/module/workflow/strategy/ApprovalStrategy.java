package com.jfeat.am.module.workflow.strategy;

import com.jfeat.am.module.workflow.services.persistence.model.ProcessInstance;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStep;

/**
 * 审批处理策略接口
 * 使用策略模式将不同类型的审批处理逻辑解耦
 *
 * @author Code Generator
 * @date 2026-02-14
 */
public interface ApprovalStrategy {

    /**
     * 处理审批逻辑
     *
     * @param instance 流程实例
     * @param request  审批请求参数
     * @return 处理后的流程实例
     */
    ProcessInstance handle(ProcessInstance instance, ApprovalRequest request);

    /**
     * 判断是否支持该步骤类型
     *
     * @param step 流程步骤
     * @return true-支持该步骤类型, false-不支持
     */
    boolean supports(ProcessStep step);
}
