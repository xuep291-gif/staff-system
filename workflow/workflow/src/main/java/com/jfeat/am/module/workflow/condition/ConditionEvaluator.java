package com.jfeat.am.module.workflow.condition;

import java.util.Map;

/**
 * 条件表达式评估器接口
 * 用于评估流程流转条件，支持多种表达式语法
 *
 * <p>该接口定义了条件表达式评估的核心方法，支持各种表达式语言（如SpEL、脚本等）</p>
 * <p>实现类需要实现具体的表达式解析和评估逻辑</p>
 *
 * @author Workflow Team
 * @since 2026-02-14
 */
public interface ConditionEvaluator {

    /**
     * 评估条件表达式
     *
     * @param expression 条件表达式（如：amount > 10000）
     * @param variables  变量上下文，包含表达式中引用的所有变量及其值
     * @return true表示条件满足，false表示不满足
     *
     * @throws IllegalArgumentException 当表达式语法错误时抛出
     */
    boolean evaluate(String expression, Map<String, Object> variables);

    /**
     * 获取评估器类型
     *
     * @return 类型标识，如 "spel", "script", "simple"
     *         用于区分不同的表达式评估实现
     */
    String getType();
}
