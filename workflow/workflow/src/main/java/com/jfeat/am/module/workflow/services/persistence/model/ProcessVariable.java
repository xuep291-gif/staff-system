package com.jfeat.am.module.workflow.services.persistence.model;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.io.Serializable;
import java.util.Date;

/**
 * 流程变量实体类
 * 用于存储流程实例运行时的变量信息
 *
 * @author Workflow System
 * @since 2026-02-14
 */
@TableName("wf_process_variable")
public class ProcessVariable extends Model<ProcessVariable> {

    private static final long serialVersionUID = 1L;

    /** 主键ID */
    private Long id;

    /** 流程实例ID */
    @TableField("instance_id")
    private Long instanceId;

    /** 变量键 */
    @TableField("variable_key")
    private String variableKey;

    /** 变量值 */
    @TableField("variable_value")
    private String variableValue;

    /** 变量类型 */
    @TableField("variable_type")
    private String variableType;

    /** 作用域 */
    @TableField("scope")
    private String scope;

    /** 创建时间 */
    @TableField("create_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date createTime;

    /** 更新时间 */
    @TableField("update_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date updateTime;

    public Long getId() {
        return id;
    }

    public ProcessVariable setId(Long id) {
        this.id = id;
        return this;
    }

    public Long getInstanceId() {
        return instanceId;
    }

    public ProcessVariable setInstanceId(Long instanceId) {
        this.instanceId = instanceId;
        return this;
    }

    public String getVariableKey() {
        return variableKey;
    }

    public ProcessVariable setVariableKey(String variableKey) {
        this.variableKey = variableKey;
        return this;
    }

    public String getVariableValue() {
        return variableValue;
    }

    public ProcessVariable setVariableValue(String variableValue) {
        this.variableValue = variableValue;
        return this;
    }

    public String getVariableType() {
        return variableType;
    }

    public ProcessVariable setVariableType(String variableType) {
        this.variableType = variableType;
        return this;
    }

    public String getScope() {
        return scope;
    }

    public ProcessVariable setScope(String scope) {
        this.scope = scope;
        return this;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public ProcessVariable setCreateTime(Date createTime) {
        this.createTime = createTime;
        return this;
    }

    public Date getUpdateTime() {
        return updateTime;
    }

    public ProcessVariable setUpdateTime(Date updateTime) {
        this.updateTime = updateTime;
        return this;
    }

    public static final String ID = "id";

    public static final String INSTANCE_ID = "instance_id";

    public static final String VARIABLE_KEY = "variable_key";

    public static final String VARIABLE_VALUE = "variable_value";

    public static final String VARIABLE_TYPE = "variable_type";

    public static final String SCOPE = "scope";

    public static final String CREATE_TIME = "create_time";

    public static final String UPDATE_TIME = "update_time";

    @Override
    protected Serializable pkVal() {
        return this.id;
    }

    @Override
    public String toString() {
        return "ProcessVariable{" +
                "id=" + id +
                ", instanceId=" + instanceId +
                ", variableKey=" + variableKey +
                ", variableValue=" + variableValue +
                ", variableType=" + variableType +
                ", scope=" + scope +
                ", createTime=" + createTime +
                ", updateTime=" + updateTime +
                '}';
    }
}
