package com.jfeat.am.module.workflow.services.persistence.model;

import java.io.Serializable;

import java.util.Date;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import com.baomidou.mybatisplus.annotation.TableName;

/**
 * <p>
 * 
 * </p>
 *
 * @author Code Generator
 * @since 2017-11-10
 */
@TableName("wf_task")
public class Task extends Model<Task> {

    private static final long serialVersionUID = 1L;

    /**
     * ??
     */
	private Long id;
    /**
     * ??ID
     */
	@TableField("user_id")
	private Long userId;
    /**
     * ????ID
     */
	@TableField("process_instance_id")
	private Long processInstanceId;
    /**
     * ??ID
     */
	@TableField("step_id")
	private Long stepId;
    /**
     * ??ID
     */
	@TableField("form_id")
	private Long formId;
    /**
     * ????
     */
	@TableField("form_type")
	private String formType;
    /**
     * ??: HANDLING, HANDLED
     */
	private String status;
    /**
     * ??
     */
	private String name;
    /**
     * ????
     */
	@TableField("handle_time")
	private Date handleTime;


	public Long getId() {
		return id;
	}

	public Task setId(Long id) {
		this.id = id;
		return this;
	}

	public Long getUserId() {
		return userId;
	}

	public Task setUserId(Long userId) {
		this.userId = userId;
		return this;
	}

	public Long getProcessInstanceId() {
		return processInstanceId;
	}

	public Task setProcessInstanceId(Long processInstanceId) {
		this.processInstanceId = processInstanceId;
		return this;
	}

	public Long getStepId() {
		return stepId;
	}

	public Task setStepId(Long stepId) {
		this.stepId = stepId;
		return this;
	}

	public Long getFormId() {
		return formId;
	}

	public Task setFormId(Long formId) {
		this.formId = formId;
		return this;
	}

	public String getFormType() {
		return formType;
	}

	public Task setFormType(String formType) {
		this.formType = formType;
		return this;
	}

	public String getStatus() {
		return status;
	}

	public Task setStatus(String status) {
		this.status = status;
		return this;
	}

	public String getName() {
		return name;
	}

	public Task setName(String name) {
		this.name = name;
		return this;
	}

	public Date getHandleTime() {
		return handleTime;
	}

	public Task setHandleTime(Date handleTime) {
		this.handleTime = handleTime;
		return this;
	}

	public static final String ID = "id";

	public static final String USER_ID = "user_id";

	public static final String PROCESS_INSTANCE_ID = "process_instance_id";

	public static final String STEP_ID = "step_id";

	public static final String FORM_ID = "form_id";

	public static final String FORM_TYPE = "form_type";

	public static final String STATUS = "status";

	public static final String NAME = "name";

	public static final String HANDLE_TIME = "handle_time";

	@Override
	protected Serializable pkVal() {
		return this.id;
	}

	@Override
	public String toString() {
		return "Task{" +
			"id=" + id +
			", userId=" + userId +
			", processInstanceId=" + processInstanceId +
			", stepId=" + stepId +
			", formId=" + formId +
			", formType=" + formType +
			", status=" + status +
			", name=" + name +
			", handleTime=" + handleTime +
			"}";
	}
}
