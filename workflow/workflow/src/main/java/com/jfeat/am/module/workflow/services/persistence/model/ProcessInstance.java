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
@TableName("wf_process_instance")
public class ProcessInstance extends Model<ProcessInstance> {

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

	@TableField("form_group")
	private String formGroup;

    /**
     * ????
     */
	@TableField("form_type")
	private String formType;
    /**
     * ??ID
     */
	@TableField("form_id")
	private Long formId;
    /**
     * ??????
     */
	private String name;
    /**
     * ???
     */
	private String status;
    /**
     * ???ID
     */
	@TableField("creator_id")
	private Long creatorId;
    /**
     * ?????
     */
	private String creator;
    /**
     * ???ID
     */
	@TableField("executor_id")
	private Long executorId;
    /**
     * ?????
     */
	private String executor;
    /**
     * ????ID
     */
	@TableField("current_step_id")
	private Long currentStepId;
    /**
     * ?????ID
     */
	@TableField("current_user_id")
	private Long currentUserId;
    /**
     * ???????
     */
	@TableField("current_user_name")
	private String currentUserName;
    /**
     * ??????
     */
	@TableField("current_step_name")
	private String currentStepName;
    /**
     * ????
     */
	@TableField("create_time")
	@JsonFormat(pattern="yyyy-MM-dd HH:mm:ss",timezone = "GMT+8")
	private Date createTime;

	@TableField("handled_steps")
	private String handledSteps;

	@TableField("handled_users")
	private String handledUsers;

	@TableField("org_id")
	private Long orgId;

	@TableField("auto_code")
	private Long autoCode;

	@TableField("code")
	private String code;

	@TableField("row_id")
	private Long rowId;

	/** 优先级 */
	@TableField("priority")
	private Integer priority;

	/** 预期完成时间 */
	@TableField("expect_complete_time")
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
	private Date expectCompleteTime;

	/** 业务键 */
	@TableField("business_key")
	private String businessKey;

	/** 开始时间 */
	@TableField("start_time")
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
	private Date startTime;

	/** 结束时间 */
	@TableField("end_time")
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
	private Date endTime;

	/** 已耗时秒数 */
	@TableField("cost_seconds")
	private Integer costSeconds;


	public Long getRowId() {
		return rowId;
	}

	public void setRowId(Long rowId) {
		this.rowId = rowId;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public Long getAutoCode() {
		return autoCode;
	}

	public void setAutoCode(Long autoCode) {
		this.autoCode = autoCode;
	}

	public Long getOrgId() {
		return orgId;
	}

	public void setOrgId(Long orgId) {
		this.orgId = orgId;
	}

	public Long getId() {
		return id;
	}

	public ProcessInstance setId(Long id) {
		this.id = id;
		return this;
	}

	public Long getProcessId() {
		return processId;
	}

	public ProcessInstance setProcessId(Long processId) {
		this.processId = processId;
		return this;
	}

	public String getFormGroup() {
		return formGroup;
	}

	public void setFormGroup(String formGroup) {
		this.formGroup = formGroup;
	}

	public String getFormType() {
		return formType;
	}

	public ProcessInstance setFormType(String formType) {
		this.formType = formType;
		return this;
	}

	public Long getFormId() {
		return formId;
	}

	public ProcessInstance setFormId(Long formId) {
		this.formId = formId;
		return this;
	}

	public String getName() {
		return name;
	}

	public ProcessInstance setName(String name) {
		this.name = name;
		return this;
	}

	public String getStatus() {
		return status;
	}

	public ProcessInstance setStatus(String status) {
		this.status = status;
		return this;
	}

	public Long getCreatorId() {
		return creatorId;
	}

	public ProcessInstance setCreatorId(Long creatorId) {
		this.creatorId = creatorId;
		return this;
	}

	public String getCreator() {
		return creator;
	}

	public ProcessInstance setCreator(String creator) {
		this.creator = creator;
		return this;
	}

	public Long getExecutorId() {
		return executorId;
	}

	public ProcessInstance setExecutorId(Long executorId) {
		this.executorId = executorId;
		return this;
	}

	public String getExecutor() {
		return executor;
	}

	public ProcessInstance setExecutor(String executor) {
		this.executor = executor;
		return this;
	}

	public Long getCurrentStepId() {
		return currentStepId;
	}

	public ProcessInstance setCurrentStepId(Long currentStepId) {
		this.currentStepId = currentStepId;
		return this;
	}

	public Long getCurrentUserId() {
		return currentUserId;
	}

	public ProcessInstance setCurrentUserId(Long currentUserId) {
		this.currentUserId = currentUserId;
		return this;
	}

	public String getCurrentUserName() {
		return currentUserName;
	}

	public ProcessInstance setCurrentUserName(String currentUserName) {
		this.currentUserName = currentUserName;
		return this;
	}

	public String getCurrentStepName() {
		return currentStepName;
	}

	public ProcessInstance setCurrentStepName(String currentStepName) {
		this.currentStepName = currentStepName;
		return this;
	}

	public Date getCreateTime() {
		return createTime;
	}

	public ProcessInstance setCreateTime(Date createTime) {
		this.createTime = createTime;
		return this;
	}

	public String getHandledSteps() {
		return handledSteps;
	}

	public void setHandledSteps(String handledSteps) {
		this.handledSteps = handledSteps;
	}

	public String getHandledUsers() {
		return handledUsers;
	}

	public void setHandledUsers(String handledUsers) {
		this.handledUsers = handledUsers;
	}

	public Integer getPriority() {
		return priority;
	}

	public ProcessInstance setPriority(Integer priority) {
		this.priority = priority;
		return this;
	}

	public Date getExpectCompleteTime() {
		return expectCompleteTime;
	}

	public ProcessInstance setExpectCompleteTime(Date expectCompleteTime) {
		this.expectCompleteTime = expectCompleteTime;
		return this;
	}

	public String getBusinessKey() {
		return businessKey;
	}

	public ProcessInstance setBusinessKey(String businessKey) {
		this.businessKey = businessKey;
		return this;
	}

	public Date getStartTime() {
		return startTime;
	}

	public ProcessInstance setStartTime(Date startTime) {
		this.startTime = startTime;
		return this;
	}

	public Date getEndTime() {
		return endTime;
	}

	public ProcessInstance setEndTime(Date endTime) {
		this.endTime = endTime;
		return this;
	}

	public Integer getCostSeconds() {
		return costSeconds;
	}

	public ProcessInstance setCostSeconds(Integer costSeconds) {
		this.costSeconds = costSeconds;
		return this;
	}

	public static final String ID = "id";

	public static final String PROCESS_ID = "process_id";

	public static final String FORM_GROUP = "form_group";

	public static final String FORM_TYPE = "form_type";

	public static final String FORM_ID = "form_id";

	public static final String NAME = "name";

	public static final String STATUS = "status";

	public static final String CREATOR_ID = "creator_id";

	public static final String CREATOR = "creator";

	public static final String EXECUTOR_ID = "executor_id";

	public static final String EXECUTOR = "executor";

	public static final String CURRENT_STEP_ID = "current_step_id";

	public static final String CURRENT_USER_ID = "current_user_id";

	public static final String CURRENT_USER_NAME = "current_user_name";

	public static final String CURRENT_STEP_NAME = "current_step_name";

	public static final String CREATE_TIME = "create_time";

	public static final String HANDLED_STEPS = "handled_steps";

	public static final String HANDLED_USERS = "handled_users";

	@Override
	protected Serializable pkVal() {
		return this.id;
	}

	@Override
	public String toString() {
		return "ProcessInstance{" +
			"id=" + id +
			", processId=" + processId +
			", formGroup=" + formGroup +
			", formType=" + formType +
			", formId=" + formId +
			", name=" + name +
			", status=" + status +
			", creatorId=" + creatorId +
			", creator=" + creator +
			", executorId=" + executorId +
			", executor=" + executor +
			", currentStepId=" + currentStepId +
			", currentUserId=" + currentUserId +
			", currentUserName=" + currentUserName +
			", currentStepName=" + currentStepName +
			", createTime=" + createTime +
			", handledSteps=" + handledSteps +
			", handledUsers=" + handledUsers +
			"}";
	}
}
