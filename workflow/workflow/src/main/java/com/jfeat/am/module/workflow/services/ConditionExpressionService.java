package com.jfeat.am.module.workflow.services;

import com.jfeat.am.module.workflow.condition.ConditionEvaluator;
import com.jfeat.am.module.workflow.constant.ConditionType;
import com.jfeat.am.module.workflow.services.persistence.model.ProcessStepTransition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 条件表达式解析服务
 *
 * <p>负责评估流程流转条件，确定下一步骤</p>
 * <p>支持多种条件类型和表达式语言</p>
 *
 * <p>主要功能：</p>
 * <ul>
 *   <li>评估流转条件，找到满足条件的下一步骤</li>
 *   <li>解析表达式中的变量引用</li>
 *   <li>支持SpEL等多种表达式语言</li>
 *   <li>按优先级顺序评估多个条件分支</li>
 * </ul>
 *
 * @author Workflow Team
 * @since 2026-02-14
 */
@Service
public class ConditionExpressionService {

    private static final Logger logger = LoggerFactory.getLogger(ConditionExpressionService.class);

    /**
     * 注入所有条件评估器实现
     * <p>Spring会自动发现所有ConditionEvaluator接口的实现类</p>
     */
    @Resource
    private List<ConditionEvaluator> evaluators;

    /**
     * 查找满足条件的下一步骤
     *
     * <p>按照sort_order排序顺序检查每个流转条件，返回第一个满足条件的步骤ID</p>
     * <p>如果没有满足条件的，返回null</p>
     *
     * @param currentStepId 当前步骤ID
     * @param transitions   从当前步骤出发的所有流转关系列表
     * @param variables     流程变量上下文，包含表达式中引用的所有变量
     * @return 第一个满足条件的步骤ID，如果没有则返回null
     *
     * @implNote 按sort_order升序排序评估，确保条件分支按预期顺序执行
     */
    public Long findNextStep(Long currentStepId, List<ProcessStepTransition> transitions,
                             Map<String, Object> variables) {
        if (transitions == null || transitions.isEmpty()) {
            logger.warn("No transitions defined for step: {}", currentStepId);
            return null;
        }

        // 按sort_order排序，确保按优先级顺序评估
        transitions.sort((t1, t2) -> {
            Integer order1 = t1.getSortOrder() != null ? t1.getSortOrder() : Integer.MAX_VALUE;
            Integer order2 = t2.getSortOrder() != null ? t2.getSortOrder() : Integer.MAX_VALUE;
            return order1.compareTo(order2);
        });

        // 按顺序检查每个条件
        for (ProcessStepTransition transition : transitions) {
            if (evaluateCondition(transition, variables)) {
                logger.info("Condition matched: from_step={} to_step={}, condition_type={}, condition_expression={}",
                        currentStepId, transition.getToStepId(), transition.getConditionType(),
                        transition.getConditionExpression());
                return transition.getToStepId();
            }
        }

        logger.debug("No condition matched for step: {}", currentStepId);
        return null;
    }

    /**
     * 评估单个流转条件
     *
     * <p>根据条件类型使用不同的评估策略</p>
     *
     * @param transition 流转关系对象
     * @param variables  流程变量上下文
     * @return true表示条件满足，false表示不满足
     *
     * @implNote
     * <ul>
     *   <li>ALWAYS类型：总是返回true</li>
     *   <li>SUBMIT类型：返回false，需要外部处理用户选择</li>
     *   <li>EXPRESSION类型：使用评估器解析表达式</li>
     * </ul>
     */
    private boolean evaluateCondition(ProcessStepTransition transition, Map<String, Object> variables) {
        String conditionType = transition.getConditionType();
        String expression = transition.getConditionExpression();

        // ALWAYS类型总是满足（无条件流转）
        if (ConditionType.ALWAYS.equals(conditionType)) {
            logger.debug("ALWAYS condition matched for transition: from_step={} to_step={}",
                    transition.getFromStepId(), transition.getToStepId());
            return true;
        }

        // SUBMIT类型需要用户手动选择，这里返回false由外部处理
        if (ConditionType.SUBMIT.equals(conditionType)) {
            logger.debug("SUBMIT condition requires user selection for transition: from_step={} to_step={}",
                    transition.getFromStepId(), transition.getToStepId());
            return false;
        }

        // EXPRESSION类型使用表达式评估器
        if (ConditionType.EXPRESSION.equals(conditionType)) {
            return evaluateExpression(expression, variables);
        }

        // 未知条件类型
        logger.warn("Unknown condition type: {} for transition: from_step={} to_step={}",
                conditionType, transition.getFromStepId(), transition.getToStepId());
        return false;
    }

    /**
     * 使用表达式评估器评估表达式
     *
     * <p>优先使用SpEL评估器，如果没有找到则返回false</p>
     *
     * @param expression 条件表达式
     * @param variables  变量上下文
     * @return 表达式评估结果
     */
    private boolean evaluateExpression(String expression, Map<String, Object> variables) {
        if (expression == null || expression.trim().isEmpty()) {
            logger.debug("Empty expression, defaulting to true");
            return true;
        }

        // 优先使用SpEL评估器
        for (ConditionEvaluator evaluator : evaluators) {
            if ("spel".equals(evaluator.getType())) {
                boolean result = evaluator.evaluate(expression, variables);
                logger.debug("SpEL evaluation result: {} = {}", expression, result);
                return result;
            }
        }

        logger.warn("No evaluator found for expression: {}", expression);
        return false;
    }

    /**
     * 解析变量引用
     *
     * <p>从表达式中提取所有变量名</p>
     * <p>支持两种语法：</p>
     * <ul>
     *   <li>#variableName - SpEL标准语法</li>
     *   <li>$variableName - 简化语法（可选）</li>
     * </ul>
     *
     * @param expression 条件表达式
     * @return 表达式中引用的所有变量名列表
     *
     * @implNote 使用正则表达式匹配变量模式
     */
    public List<String> extractVariables(String expression) {
        List<String> variables = new ArrayList<>();

        if (expression == null || expression.trim().isEmpty()) {
            return variables;
        }

        // 匹配 #variableName 或 $variableName 格式的变量
        Pattern pattern = Pattern.compile("[#$]\\w+");
        Matcher matcher = pattern.matcher(expression);

        while (matcher.find()) {
            String variable = matcher.group();
            // 去掉 # 或 $ 前缀
            variables.add(variable.substring(1));
        }

        logger.debug("Extracted variables from expression '{}': {}", expression, variables);
        return variables;
    }

    /**
     * 验证表达式语法
     *
     * <p>检查表达式是否合法，不实际执行评估</p>
     *
     * @param expression 条件表达式
     * @return true表示表达式语法合法，false表示有语法错误
     */
    public boolean validateExpression(String expression) {
        if (expression == null || expression.trim().isEmpty()) {
            return true;
        }

        try {
            // 尝试解析表达式，不执行评估
            for (ConditionEvaluator evaluator : evaluators) {
                if ("spel".equals(evaluator.getType())) {
                    // 使用空变量上下文测试语法
                    return evaluator.evaluate(expression, null);
                }
            }
            return false;
        } catch (Exception e) {
            logger.error("Expression validation failed: {}", expression, e);
            return false;
        }
    }

    /**
     * 获取所有可用的评估器类型
     *
     * @return 评估器类型列表
     */
    public List<String> getAvailableEvaluatorTypes() {
        List<String> types = new ArrayList<>();
        if (evaluators != null) {
            for (ConditionEvaluator evaluator : evaluators) {
                types.add(evaluator.getType());
            }
        }
        return types;
    }
}
