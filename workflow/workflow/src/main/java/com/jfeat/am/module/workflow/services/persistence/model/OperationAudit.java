package com.jfeat.am.module.workflow.services.persistence.model;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.io.Serializable;
import java.util.Date;

/**
 * 操作审计实体类
 * 记录工作流系统中的关键操作，用于审计和性能分析
 *
 * @author Workflow System
 * @since 2026-02-14
 */
@TableName("wf_operation_audit")
public class OperationAudit extends Model<OperationAudit> {

    private static final long serialVersionUID = 1L;

    /** 主键 */
    private Long id;

    /** 操作类型：CREATE,SUBMIT,APPROVE,REJECT,ROLLBACK,TRANSFER */
    @TableField("operation_type")
    private String operationType;

    /** 操作人ID */
    @TableField("operator_id")
    private Long operatorId;

    /** 操作人姓名 */
    @TableField("operator_name")
    private String operatorName;

    /** 目标类型：PROCESS,INSTANCE,STEP */
    @TableField("target_type")
    private String targetType;

    /** 目标ID */
    @TableField("target_id")
    private Long targetId;

    /** 请求数据（JSON） */
    @TableField("request_data")
    private String requestData;

    /** 响应数据（JSON） */
    @TableField("response_data")
    private String responseData;

    /** IP地址 */
    @TableField("ip_address")
    private String ipAddress;

    /** 用户代理 */
    @TableField("user_agent")
    private String userAgent;

    /** 执行耗时（毫秒） */
    @TableField("execution_time_ms")
    private Integer executionTimeMs;

    /** 是否成功 */
    @TableField("success")
    private Boolean success;

    /** 错误信息 */
    @TableField("error_message")
    private String errorMessage;

    /** 操作时间 */
    @TableField("create_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date createTime;

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public OperationAudit setId(Long id) {
        this.id = id;
        return this;
    }

    public String getOperationType() {
        return operationType;
    }

    public OperationAudit setOperationType(String operationType) {
        this.operationType = operationType;
        return this;
    }

    public Long getOperatorId() {
        return operatorId;
    }

    public OperationAudit setOperatorId(Long operatorId) {
        this.operatorId = operatorId;
        return this;
    }

    public String getOperatorName() {
        return operatorName;
    }

    public OperationAudit setOperatorName(String operatorName) {
        this.operatorName = operatorName;
        return this;
    }

    public String getTargetType() {
        return targetType;
    }

    public OperationAudit setTargetType(String targetType) {
        this.targetType = targetType;
        return this;
    }

    public Long getTargetId() {
        return targetId;
    }

    public OperationAudit setTargetId(Long targetId) {
        this.targetId = targetId;
        return this;
    }

    public String getRequestData() {
        return requestData;
    }

    public OperationAudit setRequestData(String requestData) {
        this.requestData = requestData;
        return this;
    }

    public String getResponseData() {
        return responseData;
    }

    public OperationAudit setResponseData(String responseData) {
        this.responseData = responseData;
        return this;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public OperationAudit setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
        return this;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public OperationAudit setUserAgent(String userAgent) {
        this.userAgent = userAgent;
        return this;
    }

    public Integer getExecutionTimeMs() {
        return executionTimeMs;
    }

    public OperationAudit setExecutionTimeMs(Integer executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
        return this;
    }

    public Boolean getSuccess() {
        return success;
    }

    public OperationAudit setSuccess(Boolean success) {
        this.success = success;
        return this;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public OperationAudit setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
        return this;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public OperationAudit setCreateTime(Date createTime) {
        this.createTime = createTime;
        return this;
    }

    public static final String ID = "id";
    public static final String OPERATION_TYPE = "operation_type";
    public static final String OPERATOR_ID = "operator_id";
    public static final String TARGET_TYPE = "target_type";
    public static final String CREATE_TIME = "create_time";

    @Override
    protected Serializable pkVal() {
        return this.id;
    }

    @Override
    public String toString() {
        return "OperationAudit{" +
                "id=" + id +
                ", operationType='" + operationType + '\'' +
                ", operatorId=" + operatorId +
                ", operatorName='" + operatorName + '\'' +
                ", targetType='" + targetType + '\'' +
                ", targetId=" + targetId +
                ", executionTimeMs=" + executionTimeMs +
                ", success=" + success +
                ", createTime=" + createTime +
                '}';
    }
}
