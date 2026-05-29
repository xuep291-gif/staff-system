package com.jfeat.am.module.workflow.services.persistence.model;

import java.io.Serializable;
import java.util.Date;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * 并行网关实体类
 * 用于管理流程中的并行网关，跟踪分支执行状态
 *
 * @author Code Generator
 */
@TableName("wf_parallel_gateway")
public class ParallelGateway extends Model<ParallelGateway> {

    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    private Long id;

    /**
     * 流程实例ID
     */
    @TableField("instance_id")
    private Long instanceId;

    /**
     * 网关步骤ID
     */
    @TableField("gateway_step_id")
    private Long gatewayStepId;

    /**
     * 分支数量
     */
    @TableField("branch_count")
    private Integer branchCount;

    /**
     * 已完成分支数
     */
    @TableField("completed_count")
    private Integer completedCount;

    /**
     * 状态：ACTIVE,COMPLETED
     */
    @TableField("status")
    private String status;

    /**
     * 创建时间
     */
    @TableField("create_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date createTime;

    /**
     * 更新时间
     */
    @TableField("update_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date updateTime;

    public Long getId() {
        return id;
    }

    public ParallelGateway setId(Long id) {
        this.id = id;
        return this;
    }

    public Long getInstanceId() {
        return instanceId;
    }

    public ParallelGateway setInstanceId(Long instanceId) {
        this.instanceId = instanceId;
        return this;
    }

    public Long getGatewayStepId() {
        return gatewayStepId;
    }

    public ParallelGateway setGatewayStepId(Long gatewayStepId) {
        this.gatewayStepId = gatewayStepId;
        return this;
    }

    public Integer getBranchCount() {
        return branchCount;
    }

    public ParallelGateway setBranchCount(Integer branchCount) {
        this.branchCount = branchCount;
        return this;
    }

    public Integer getCompletedCount() {
        return completedCount;
    }

    public ParallelGateway setCompletedCount(Integer completedCount) {
        this.completedCount = completedCount;
        return this;
    }

    public String getStatus() {
        return status;
    }

    public ParallelGateway setStatus(String status) {
        this.status = status;
        return this;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public ParallelGateway setCreateTime(Date createTime) {
        this.createTime = createTime;
        return this;
    }

    public Date getUpdateTime() {
        return updateTime;
    }

    public ParallelGateway setUpdateTime(Date updateTime) {
        this.updateTime = updateTime;
        return this;
    }

    /**
     * 检查是否所有分支都已完成
     */
    public boolean isAllBranchesCompleted() {
        return branchCount != null && completedCount != null && completedCount >= branchCount;
    }

    /**
     * 增加已完成分支数
     */
    public void incrementCompletedCount() {
        if (this.completedCount == null) {
            this.completedCount = 0;
        }
        this.completedCount++;

        // 检查是否所有分支都完成
        if (isAllBranchesCompleted()) {
            this.status = "COMPLETED";
        }
    }

    public static final String ID = "id";
    public static final String INSTANCE_ID = "instance_id";
    public static final String GATEWAY_STEP_ID = "gateway_step_id";
    public static final String BRANCH_COUNT = "branch_count";
    public static final String COMPLETED_COUNT = "completed_count";
    public static final String STATUS = "status";
    public static final String CREATE_TIME = "create_time";
    public static final String UPDATE_TIME = "update_time";

    @Override
    protected Serializable pkVal() {
        return this.id;
    }

    @Override
    public String toString() {
        return "ParallelGateway{" +
                "id=" + id +
                ", instanceId=" + instanceId +
                ", gatewayStepId=" + gatewayStepId +
                ", branchCount=" + branchCount +
                ", completedCount=" + completedCount +
                ", status='" + status + '\'' +
                ", createTime=" + createTime +
                ", updateTime=" + updateTime +
                '}';
    }
}
