package com.jfeat.am.module.workflow.services.persistence.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;

/**
 * <p>
 * 流程步骤审批人表
 * </p>
 *
 * @author Code Generator
 * @since 2023-07-26
 */
@TableName("wf_process_step_approval")
public class ProcessStepApproval extends Model<ProcessStepApproval> {

    @TableId(value = "approval_id", type = IdType.AUTO)
    private Long approvalId;
    
    /**
     * 指定人员表ID
     */
    @TableField("user_id")
    private Long userId;
    
    /**
     * 自定角色表ID
     */
    @TableField("role_id")
    private Long roleId;
    
    /**
     * 指定职位表ID
     */
    @TableField("position_id")
    private Long positionId;
    
    /**
     * 排序号
     */
    @TableField("sort_num")
    private Integer sortNum;

    @TableField("step_id")
    private Long stepId;

    public Long getStepId() {
        return stepId;
    }

    public void setStepId(Long stepId) {
        this.stepId = stepId;
    }

    public Long getApprovalId() {
        return approvalId;
    }

    public void setApprovalId(Long approvalId) {
        this.approvalId = approvalId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getRoleId() {
        return roleId;
    }

    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }

    public Long getPositionId() {
        return positionId;
    }

    public void setPositionId(Long positionId) {
        this.positionId = positionId;
    }

    public Integer getSortNum() {
        return sortNum;
    }

    public void setSortNum(Integer sortNum) {
        this.sortNum = sortNum;
    }

    @Override
    public String toString() {
        return "ProcessStepApproval{" +
                "approvalId=" + approvalId +
                ", userId=" + userId +
                ", roleId=" + roleId +
                ", positionId=" + positionId +
                ", sortNum=" + sortNum +
                '}';
    }
}