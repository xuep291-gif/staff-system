package com.jfeat.am.module.workflow.services.persistence.model;

import java.io.Serializable;
import java.util.Date;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * 流程监控实体类
 * 用于记录流程执行过程中的监控信息
 *
 * @author Code Generator
 */
@TableName("wf_process_monitor")
public class ProcessMonitor extends Model<ProcessMonitor> {

    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    private Long id;

    /**
     * 流程定义ID
     */
    @TableField("process_id")
    private Long processId;

    /**
     * 流程实例ID
     */
    @TableField("instance_id")
    private Long instanceId;

    /**
     * 监控类型：TIMEOUT,ERROR,WARNING
     */
    @TableField("monitor_type")
    private String monitorType;

    /**
     * 监控级别：INFO,WARN,ERROR
     */
    @TableField("monitor_level")
    private String monitorLevel;

    /**
     * 监控消息
     */
    @TableField("message")
    private String message;

    /**
     * 详细信息（JSON）
     */
    @TableField("details")
    private String details;

    /**
     * 是否已处理
     */
    @TableField("is_handled")
    private Boolean isHandled;

    /**
     * 处理时间
     */
    @TableField("handle_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date handleTime;

    /**
     * 处理人ID
     */
    @TableField("handler_id")
    private Long handlerId;

    /**
     * 创建时间
     */
    @TableField("create_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date createTime;

    public Long getId() {
        return id;
    }

    public ProcessMonitor setId(Long id) {
        this.id = id;
        return this;
    }

    public Long getProcessId() {
        return processId;
    }

    public ProcessMonitor setProcessId(Long processId) {
        this.processId = processId;
        return this;
    }

    public Long getInstanceId() {
        return instanceId;
    }

    public ProcessMonitor setInstanceId(Long instanceId) {
        this.instanceId = instanceId;
        return this;
    }

    public String getMonitorType() {
        return monitorType;
    }

    public ProcessMonitor setMonitorType(String monitorType) {
        this.monitorType = monitorType;
        return this;
    }

    public String getMonitorLevel() {
        return monitorLevel;
    }

    public ProcessMonitor setMonitorLevel(String monitorLevel) {
        this.monitorLevel = monitorLevel;
        return this;
    }

    public String getMessage() {
        return message;
    }

    public ProcessMonitor setMessage(String message) {
        this.message = message;
        return this;
    }

    public String getDetails() {
        return details;
    }

    public ProcessMonitor setDetails(String details) {
        this.details = details;
        return this;
    }

    public Boolean getIsHandled() {
        return isHandled;
    }

    public ProcessMonitor setIsHandled(Boolean isHandled) {
        this.isHandled = isHandled;
        return this;
    }

    public Date getHandleTime() {
        return handleTime;
    }

    public ProcessMonitor setHandleTime(Date handleTime) {
        this.handleTime = handleTime;
        return this;
    }

    public Long getHandlerId() {
        return handlerId;
    }

    public ProcessMonitor setHandlerId(Long handlerId) {
        this.handlerId = handlerId;
        return this;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public ProcessMonitor setCreateTime(Date createTime) {
        this.createTime = createTime;
        return this;
    }

    /**
     * 标记为已处理
     */
    public void markAsHandled(Long handlerId) {
        this.isHandled = true;
        this.handlerId = handlerId;
        this.handleTime = new Date();
    }

    public static final String ID = "id";
    public static final String PROCESS_ID = "process_id";
    public static final String INSTANCE_ID = "instance_id";
    public static final String MONITOR_TYPE = "monitor_type";
    public static final String MONITOR_LEVEL = "monitor_level";
    public static final String MESSAGE = "message";
    public static final String DETAILS = "details";
    public static final String IS_HANDLED = "is_handled";
    public static final String HANDLE_TIME = "handle_time";
    public static final String HANDLER_ID = "handler_id";
    public static final String CREATE_TIME = "create_time";

    @Override
    protected Serializable pkVal() {
        return this.id;
    }

    @Override
    public String toString() {
        return "ProcessMonitor{" +
                "id=" + id +
                ", processId=" + processId +
                ", instanceId=" + instanceId +
                ", monitorType='" + monitorType + '\'' +
                ", monitorLevel='" + monitorLevel + '\'' +
                ", message='" + message + '\'' +
                ", details='" + details + '\'' +
                ", isHandled=" + isHandled +
                ", handleTime=" + handleTime +
                ", handlerId=" + handlerId +
                ", createTime=" + createTime +
                '}';
    }
}
