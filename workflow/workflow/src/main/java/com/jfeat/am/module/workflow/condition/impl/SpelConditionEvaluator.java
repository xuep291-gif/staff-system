package com.jfeat.am.module.workflow.condition.impl;

import com.jfeat.am.module.workflow.condition.ConditionEvaluator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * SpEL表达式条件评估器
 *
 * <p>基于Spring Expression Language（SpEL）实现的条件表达式评估器</p>
 * <p>支持复杂的布尔表达式、算术运算、方法调用等</p>
 *
 * <p>SpEL表达式示例：</p>
 * <ul>
 *   <li>简单比较：amount > 10000</li>
 *   <li>复杂表达式：amount > 10000 and department == '财务部'</li>
 *   <li>方法调用：users.?[age > 18].size() > 0</li>
 * </ul>
 *
 * @author Workflow Team
 * @since 2026-02-14
 */
@Component
public class SpelConditionEvaluator implements ConditionEvaluator {

    private static final Logger logger = LoggerFactory.getLogger(SpelConditionEvaluator.class);

    /**
     * SpEL表达式解析器
     * 使用Spring标准的SpelExpressionParser实现
     */
    private final ExpressionParser parser = new SpelExpressionParser();

    /**
     * 评估SpEL条件表达式
     *
     * @param expression SpEL条件表达式
     * @param variables  变量上下文，表达式中引用的变量
     * @return 表达式评估结果，true表示条件满足
     *
     * @implNote 该方法线程安全，每个评估调用都创建独立的EvaluationContext
     */
    @Override
    public boolean evaluate(String expression, Map<String, Object> variables) {
        // 处理空表达式，默认返回true（无条件通过）
        if (expression == null || expression.trim().isEmpty()) {
            logger.debug("Empty expression, defaulting to true");
            return true;
        }

        try {
            // 解析SpEL表达式
            Expression exp = parser.parseExpression(expression);

            // 创建评估上下文
            StandardEvaluationContext context = new StandardEvaluationContext();

            // 将变量设置到上下文中
            // 变量可以在表达式中通过 #variableName 访问
            if (variables != null) {
                variables.forEach((key, value) -> {
                    context.setVariable(key, value);
                    logger.trace("Set variable: {} = {}", key, value);
                });
            }

            // 执行表达式评估，期望返回布尔值
            Boolean result = exp.getValue(context, Boolean.class);

            // 记录评估结果（调试级别）
            logger.debug("Evaluated SpEL condition: {} = {}", expression, result);

            // 返回评估结果，null值视为false
            return result != null ? result : false;

        } catch (Exception e) {
            // 表达式解析或评估失败，记录错误并返回false
            logger.error("Failed to evaluate SpEL condition expression: {}, error: {}", expression, e.getMessage(), e);
            return false;
        }
    }

    /**
     * 获取评估器类型标识
     *
     * @return "spel" - 表示这是SpEL表达式评估器
     */
    @Override
    public String getType() {
        return "spel";
    }
}
