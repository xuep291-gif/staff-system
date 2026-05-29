package com.jfeat.am.module.workflow.services.persistence.model;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import com.baomidou.mybatisplus.annotation.TableName;

import java.io.Serializable;
import java.util.Date;

/**
 * 流程步骤流转条件实体类
 *
 * <p>定义流程步骤之间的流转关系及条件</p>
 * <p>支持条件分支、并行网关等复杂流程场景</p>
 *
 * <p>表名：wf_process_step_transition</p>
 *
 * @author Workflow Team
 * @since 2026-02-14
 */
@TableName("wf_process_step_transition")
public class ProcessStepTransition extends Model<ProcessStepTransition> {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    private Long id;

    /**
     * 源步骤ID
     * <p>流程转出的起始步骤</p>
     */
    @TableField("from_step_id")
    private Long fromStepId;

    /**
     * 目标步骤ID
     * <p>流程转入的目标步骤</p>
     */
    @TableField("to_step_id")
    private Long toStepId;

    /**
     * 条件表达式
     * <p>当condition_type为EXPRESSION时，存储具体的SpEL表达式</p>
     * <p>示例：amount > 10000 and department == '财务部'</p>
     */
    @TableField("condition_expression")
    private String conditionExpression;

    /**
     * 条件类型
     * <p>ALWAYS - 总是满足（无条件流转）</p>
     * <p>EXPRESSION - 表达式条件</p>
     * <p>SUBMIT - 用户手动选择</p>
     *
     * @see com.jfeat.am.module.workflow.constant.ConditionType
     */
    @TableField("condition_type")
    private String conditionType;

    /**
     * 排序顺序
     * <p>用于定义多个条件分支的评估顺序</p>
     * <p>数字越小优先级越高，按顺序评估，找到第一个满足的条件即停止</p>
     * <p>建议ALWAYS类型的条件放在最后（sort_order值最大）作为默认分支</p>
     */
    @TableField("sort_order")
    private Integer sortOrder;

    /**
     * 流程ID
     * <p>所属流程的ID</p>
     */
    @TableField("process_id")
    private Long processId;

    /**
     * 条件描述
     * <p>用于界面显示，描述该条件的含义</p>
     * <p>示例："金额大于10000元"、"部门为财务部"</p>
     */
    @TableField("condition_name")
    private String conditionName;

    /**
     * 创建时间
     */
    @TableField("create_time")
    private Date createTime;

    /**
     * 更新时间
     */
    @TableField("update_time")
    private Date updateTime;

    /**
     * 获取主键ID
     */
    public Long getId() {
        return id;
    }

    /**
     * 设置主键ID
     * 支持链式调用
     */
    public ProcessStepTransition setId(Long id) {
        this.id = id;
        return this;
    }

    /**
     * 获取源步骤ID
     */
    public Long getFromStepId() {
        return fromStepId;
    }

    /**
     * 设置源步骤ID
     * 支持链式调用
     */
    public ProcessStepTransition setFromStepId(Long fromStepId) {
        this.fromStepId = fromStepId;
        return this;
    }

    /**
     * 获取目标步骤ID
     */
    public Long getToStepId() {
        return toStepId;
    }

    /**
     * 设置目标步骤ID
     * 支持链式调用
     */
    public ProcessStepTransition setToStepId(Long toStepId) {
        this.toStepId = toStepId;
        return this;
    }

    /**
     * 获取条件表达式
     */
    public String getConditionExpression() {
        return conditionExpression;
    }

    /**
     * 设置条件表达式
     * 支持链式调用
     */
    public ProcessStepTransition setConditionExpression(String conditionExpression) {
        this.conditionExpression = conditionExpression;
        return this;
    }

    /**
     * 获取条件类型
     */
    public String getConditionType() {
        return conditionType;
    }

    /**
     * 设置条件类型
     * 支持链式调用
     */
    public ProcessStepTransition setConditionType(String conditionType) {
        this.conditionType = conditionType;
        return this;
    }

    /**
     * 获取排序顺序
     */
    public Integer getSortOrder() {
        return sortOrder;
    }

    /**
     * 设置排序顺序
     * 支持链式调用
     */
    public ProcessStepTransition setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
        return this;
    }

    /**
     * 获取流程ID
     */
    public Long getProcessId() {
        return processId;
    }

    /**
     * 设置流程ID
     * 支持链式调用
     */
    public ProcessStepTransition setProcessId(Long processId) {
        this.processId = processId;
        return this;
    }

    /**
     * 获取条件描述
     */
    public String getConditionName() {
        return conditionName;
    }

    /**
     * 设置条件描述
     * 支持链式调用
     */
    public ProcessStepTransition setConditionName(String conditionName) {
        this.conditionName = conditionName;
        return this;
    }

    /**
     * 获取创建时间
     */
    public Date getCreateTime() {
        return createTime;
    }

    /**
     * 设置创建时间
     * 支持链式调用
     */
    public ProcessStepTransition setCreateTime(Date createTime) {
        this.createTime = createTime;
        return this;
    }

    /**
     * 获取更新时间
     */
    public Date getUpdateTime() {
        return updateTime;
    }

    /**
     * 设置更新时间
     * 支持链式调用
     */
    public ProcessStepTransition setUpdateTime(Date updateTime) {
        this.updateTime = updateTime;
        return this;
    }

    @Override
    protected Serializable pkVal() {
        return this.id;
    }

    @Override
    public String toString() {
        return "ProcessStepTransition{" +
                "id=" + id +
                ", fromStepId=" + fromStepId +
                ", toStepId=" + toStepId +
                ", conditionExpression='" + conditionExpression + '\'' +
                ", conditionType='" + conditionType + '\'' +
                ", sortOrder=" + sortOrder +
                ", processId=" + processId +
                ", conditionName='" + conditionName + '\'' +
                ", createTime=" + createTime +
                ", updateTime=" + updateTime +
                '}';
    }

    /**
     * 字段常量定义
     */
    public static final String ID = "id";
    public static final String FROM_STEP_ID = "from_step_id";
    public static final String TO_STEP_ID = "to_step_id";
    public static final String CONDITION_EXPRESSION = "condition_expression";
    public static final String CONDITION_TYPE = "condition_type";
    public static final String SORT_ORDER = "sort_order";
    public static final String PROCESS_ID = "process_id";
    public static final String CONDITION_NAME = "condition_name";
    public static final String CREATE_TIME = "create_time";
    public static final String UPDATE_TIME = "update_time";
}
