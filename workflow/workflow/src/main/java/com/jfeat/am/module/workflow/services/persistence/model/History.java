package com.jfeat.am.module.workflow.services.persistence.model;

import java.io.Serializable;

import java.util.Date;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * <p>
 * 
 * </p>
 *
 * @author Code Generator
 * @since 2017-11-10
 */
@TableName("wf_history")
public class History extends Model<History> {

    private static final long serialVersionUID = 1L;

    /**
     * ??
     */
	private Long id;
    /**
     * ??ID
     */
	@TableField("process_id")
	private Long processId;
    /**
     * ????ID
     */
	@TableField("process_instance_id")
	private Long processInstanceId;
    /**
     * ??????
     */
	@TableField("process_instance_name")
	private String processInstanceName;

	@TableField("previous_step_id")
	private Long previousStepId;

	@TableField("previous_step_name")
	private String previousStepName;

    /**
     * ??ID
     */
	@TableField("step_id")
	private Long stepId;
    /**
     * ????
     */
	@TableField("step_name")
	private String stepName;
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
     * ???ID
     */
	@TableField("user_id")
	private Long userId;
    /**
     * ?????
     */
	@TableField("user_name")
	private String userName;
    /**
     * ????: APPROVED, REJECTED
     */
	private String result;
    /**
     * ????
     */
	private String comment;
    /**
     * ????
     */
	@TableField("handle_time")
	@JsonFormat(pattern="yyyy-MM-dd HH:mm:ss",timezone = "GMT+8")
	private Date handleTime;


	public Long getId() {
		return id;
	}

	public History setId(Long id) {
		this.id = id;
		return this;
	}

	public Long getProcessId() {
		return processId;
	}

	public History setProcessId(Long processId) {
		this.processId = processId;
		return this;
	}

	public Long getProcessInstanceId() {
		return processInstanceId;
	}

	public History setProcessInstanceId(Long processInstanceId) {
		this.processInstanceId = processInstanceId;
		return this;
	}

	public String getProcessInstanceName() {
		return processInstanceName;
	}

	public History setProcessInstanceName(String processInstanceName) {
		this.processInstanceName = processInstanceName;
		return this;
	}

	public Long getPreviousStepId() {
		return previousStepId;
	}

	public void setPreviousStepId(Long previousStepId) {
		this.previousStepId = previousStepId;
	}

	public String getPreviousStepName() {
		return previousStepName;
	}

	public void setPreviousStepName(String previousStepName) {
		this.previousStepName = previousStepName;
	}

	public Long getStepId() {
		return stepId;
	}

	public History setStepId(Long stepId) {
		this.stepId = stepId;
		return this;
	}

	public String getStepName() {
		return stepName;
	}

	public History setStepName(String stepName) {
		this.stepName = stepName;
		return this;
	}

	public Long getFormId() {
		return formId;
	}

	public History setFormId(Long formId) {
		this.formId = formId;
		return this;
	}

	public String getFormType() {
		return formType;
	}

	public History setFormType(String formType) {
		this.formType = formType;
		return this;
	}

	public Long getUserId() {
		return userId;
	}

	public History setUserId(Long userId) {
		this.userId = userId;
		return this;
	}

	public String getUserName() {
		return userName;
	}

	public History setUserName(String userName) {
		this.userName = userName;
		return this;
	}

	public String getResult() {
		return result;
	}

	public History setResult(String result) {
		this.result = result;
		return this;
	}

	public String getComment() {
		return comment;
	}

	public History setComment(String comment) {
		this.comment = comment;
		return this;
	}

	public Date getHandleTime() {
		return handleTime;
	}

	public History setHandleTime(Date handleTime) {
		this.handleTime = handleTime;
		return this;
	}

	public static final String ID = "id";

	public static final String PROCESS_ID = "process_id";

	public static final String PROCESS_INSTANCE_ID = "process_instance_id";

	public static final String PROCESS_INSTANCE_NAME = "process_instance_name";

	public static final String STEP_ID = "step_id";

	public static final String STEP_NAME = "step_name";

	public static final String FORM_ID = "form_id";

	public static final String FORM_TYPE = "form_type";

	public static final String USER_ID = "user_id";

	public static final String USER_NAME = "user_name";

	public static final String RESULT = "result";

	public static final String COMMENT = "comment";

	public static final String HANDLE_TIME = "handle_time";

	public static final String PREVIOUS_STEP_ID = "previous_step_id";

	public static final String PREVIOUS_STEP_NAME = "previous_step_name";


	@Override
	protected Serializable pkVal() {
		return this.id;
	}

	@Override
	public String toString() {
		return "History{" +
			"id=" + id +
			", processId=" + processId +
			", processInstanceId=" + processInstanceId +
			", processInstanceName=" + processInstanceName +
			", previousStepId=" + previousStepId +
			", previousStepName=" + previousStepName +
			", stepId=" + stepId +
			", stepName=" + stepName +
			", formId=" + formId +
			", formType=" + formType +
			", userId=" + userId +
			", userName=" + userName +
			", result=" + result +
			", comment=" + comment +
			", handleTime=" + handleTime +
			"}";
	}
}
