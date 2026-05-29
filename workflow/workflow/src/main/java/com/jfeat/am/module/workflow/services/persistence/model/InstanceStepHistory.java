package com.jfeat.am.module.workflow.services.persistence.model;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.io.Serializable;
import java.util.Date;

/**
 * 流程实例步骤历史记录实体类
 * 用于记录流程实例在各个步骤的处理历史
 *
 * @author Workflow System
 * @since 2026-02-14
 */
@TableName("wf_instance_step_history")
public class InstanceStepHistory extends Model<InstanceStepHistory> {

    private static final long serialVersionUID = 1L;

    /** 主键ID */
    private Long id;

    /** 流程实例ID */
    @TableField("instance_id")
    private Long instanceId;

    /** 步骤ID */
    @TableField("step_id")
    private Long stepId;

    /** 步骤名称 */
    @TableField("step_name")
    private String stepName;

    /** 处理人ID */
    @TableField("user_id")
    private Long userId;

    /** 处理人姓名 */
    @TableField("user_name")
    private String userName;

    /** 处理动作 */
    @TableField("action")
    private String action;

    /** 处理意见 */
    @TableField("comment")
    private String comment;

    /** 开始时间 */
    @TableField("start_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date startTime;

    /** 结束时间 */
    @TableField("end_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date endTime;

    /** 排序顺序 */
    @TableField("sort_order")
    private Integer sortOrder;

    public Long getId() {
        return id;
    }

    public InstanceStepHistory setId(Long id) {
        this.id = id;
        return this;
    }

    public Long getInstanceId() {
        return instanceId;
    }

    public InstanceStepHistory setInstanceId(Long instanceId) {
        this.instanceId = instanceId;
        return this;
    }

    public Long getStepId() {
        return stepId;
    }

    public InstanceStepHistory setStepId(Long stepId) {
        this.stepId = stepId;
        return this;
    }

    public String getStepName() {
        return stepName;
    }

    public InstanceStepHistory setStepName(String stepName) {
        this.stepName = stepName;
        return this;
    }

    public Long getUserId() {
        return userId;
    }

    public InstanceStepHistory setUserId(Long userId) {
        this.userId = userId;
        return this;
    }

    public String getUserName() {
        return userName;
    }

    public InstanceStepHistory setUserName(String userName) {
        this.userName = userName;
        return this;
    }

    public String getAction() {
        return action;
    }

    public InstanceStepHistory setAction(String action) {
        this.action = action;
        return this;
    }

    public String getComment() {
        return comment;
    }

    public InstanceStepHistory setComment(String comment) {
        this.comment = comment;
        return this;
    }

    public Date getStartTime() {
        return startTime;
    }

    public InstanceStepHistory setStartTime(Date startTime) {
        this.startTime = startTime;
        return this;
    }

    public Date getEndTime() {
        return endTime;
    }

    public InstanceStepHistory setEndTime(Date endTime) {
        this.endTime = endTime;
        return this;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public InstanceStepHistory setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
        return this;
    }

    public static final String ID = "id";

    public static final String INSTANCE_ID = "instance_id";

    public static final String STEP_ID = "step_id";

    public static final String STEP_NAME = "step_name";

    public static final String USER_ID = "user_id";

    public static final String USER_NAME = "user_name";

    public static final String ACTION = "action";

    public static final String COMMENT = "comment";

    public static final String START_TIME = "start_time";

    public static final String END_TIME = "end_time";

    public static final String SORT_ORDER = "sort_order";

    @Override
    protected Serializable pkVal() {
        return this.id;
    }

    @Override
    public String toString() {
        return "InstanceStepHistory{" +
                "id=" + id +
                ", instanceId=" + instanceId +
                ", stepId=" + stepId +
                ", stepName=" + stepName +
                ", userId=" + userId +
                ", userName=" + userName +
                ", action=" + action +
                ", comment=" + comment +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", sortOrder=" + sortOrder +
                '}';
    }
}
