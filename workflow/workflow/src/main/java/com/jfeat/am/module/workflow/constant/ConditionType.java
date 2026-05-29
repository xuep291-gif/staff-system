package com.jfeat.am.module.workflow.constant;

/**
 * 条件类型常量
 *
 * <p>定义工作流中步骤流转条件的各种类型</p>
 * <p>用于标识流程步骤间的流转规则和条件判断方式</p>
 *
 * @author Workflow Team
 * @since 2026-02-14
 */
public class ConditionType {

    /**
     * 总是满足（无条件流转）
     *
     * <p>表示该流转路径不需要任何条件判断，总是会执行</p>
     * <p>适用于流程的默认流转路径或兜底路径</p>
     * <p>通常应该放在所有条件分支的最后作为默认分支</p>
     */
    public static final String ALWAYS = "ALWAYS";

    /**
     * 表达式条件（使用SpEL等表达式语言）
     *
     * <p>使用表达式语言定义流转条件</p>
     * <p>支持复杂的逻辑判断、算术运算、字符串比较等</p>
     * <p>表达式示例：</p>
     * <ul>
     *   <li>amount > 10000</li>
     *   <li>department == '财务部' and amount < 50000</li>
     *   <li>#user.age >= 18</li>
     * </ul>
     *
     * @see com.jfeat.am.module.workflow.condition.ConditionEvaluator
     */
    public static final String EXPRESSION = "EXPRESSION";

    /**
     * 根据提交人选择（用于用户手动选择下一步）
     *
     * <p>表示该流转路径需要用户手动选择</p>
     * <p>适用于需要人工判断的决策点</p>
     * <p>系统会向用户展示可选的下一步骤，由用户决定流转方向</p>
     * <p>常用于会签、分支选择等场景</p>
     */
    public static final String SUBMIT = "SUBMIT";

    /**
     * 私有构造函数，防止实例化
     *
     * <p>这是一个常量类，不应该被实例化</p>
     */
    private ConditionType() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }
}
