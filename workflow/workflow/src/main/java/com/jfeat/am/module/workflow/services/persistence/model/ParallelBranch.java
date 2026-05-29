package com.jfeat.am.module.workflow.services.persistence.model;

import java.io.Serializable;
import java.util.Date;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * 并行分支实体类
 * 用于管理并行网关的各个分支执行状态
 *
 * @author Code Generator
 */
@TableName("wf_parallel_branch")
public class ParallelBranch extends Model<ParallelBranch> {

    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    private Long id;

    /**
     * 网关ID
     */
    @TableField("gateway_id")
    private Long gatewayId;

    /**
     * 分支步骤ID
     */
    @TableField("branch_step_id")
    private Long branchStepId;

    /**
     * 分支名称
     */
    @TableField("branch_name")
    private String branchName;

    /**
     * 分支顺序
     */
    @TableField("branch_order")
    private Integer branchOrder;

    /**
     * 状态：PENDING,ACTIVE,COMPLETED
     */
    @TableField("status")
    private String status;

    /**
     * 处理人ID
     */
    @TableField("assignee_id")
    private Long assigneeId;

    /**
     * 处理人名称
     */
    @TableField("assignee_name")
    private String assigneeName;

    /**
     * 创建时间
     */
    @TableField("create_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date createTime;

    /**
     * 完成时间
     */
    @TableField("complete_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date completeTime;

    public Long getId() {
        return id;
    }

    public ParallelBranch setId(Long id) {
        this.id = id;
        return this;
    }

    public Long getGatewayId() {
        return gatewayId;
    }

    public ParallelBranch setGatewayId(Long gatewayId) {
        this.gatewayId = gatewayId;
        return this;
    }

    public Long getBranchStepId() {
        return branchStepId;
    }

    public ParallelBranch setBranchStepId(Long branchStepId) {
        this.branchStepId = branchStepId;
        return this;
    }

    public String getBranchName() {
        return branchName;
    }

    public ParallelBranch setBranchName(String branchName) {
        this.branchName = branchName;
        return this;
    }

    public Integer getBranchOrder() {
        return branchOrder;
    }

    public ParallelBranch setBranchOrder(Integer branchOrder) {
        this.branchOrder = branchOrder;
        return this;
    }

    public String getStatus() {
        return status;
    }

    public ParallelBranch setStatus(String status) {
        this.status = status;
        return this;
    }

    public Long getAssigneeId() {
        return assigneeId;
    }

    public ParallelBranch setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
        return this;
    }

    public String getAssigneeName() {
        return assigneeName;
    }

    public ParallelBranch setAssigneeName(String assigneeName) {
        this.assigneeName = assigneeName;
        return this;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public ParallelBranch setCreateTime(Date createTime) {
        this.createTime = createTime;
        return this;
    }

    public Date getCompleteTime() {
        return completeTime;
    }

    public ParallelBranch setCompleteTime(Date completeTime) {
        this.completeTime = completeTime;
        return this;
    }

    /**
     * 检查分支是否已完成
     */
    public boolean isCompleted() {
        return "COMPLETED".equals(this.status);
    }

    /**
     * 标记分支为已完成
     */
    public void markAsCompleted() {
        this.status = "COMPLETED";
        this.completeTime = new Date();
    }

    /**
     * 激活分支
     */
    public void activate() {
        this.status = "ACTIVE";
    }

    public static final String ID = "id";
    public static final String GATEWAY_ID = "gateway_id";
    public static final String BRANCH_STEP_ID = "branch_step_id";
    public static final String BRANCH_NAME = "branch_name";
    public static final String BRANCH_ORDER = "branch_order";
    public static final String STATUS = "status";
    public static final String ASSIGNEE_ID = "assignee_id";
    public static final String ASSIGNEE_NAME = "assignee_name";
    public static final String CREATE_TIME = "create_time";
    public static final String COMPLETE_TIME = "complete_time";

    @Override
    protected Serializable pkVal() {
        return this.id;
    }

    @Override
    public String toString() {
        return "ParallelBranch{" +
                "id=" + id +
                ", gatewayId=" + gatewayId +
                ", branchStepId=" + branchStepId +
                ", branchName='" + branchName + '\'' +
                ", branchOrder=" + branchOrder +
                ", status='" + status + '\'' +
                ", assigneeId=" + assigneeId +
                ", assigneeName='" + assigneeName + '\'' +
                ", createTime=" + createTime +
                ", completeTime=" + completeTime +
                '}';
    }
}
