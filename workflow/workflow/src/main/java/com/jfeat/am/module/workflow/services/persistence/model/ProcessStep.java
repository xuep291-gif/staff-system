package com.jfeat.am.module.workflow.services.persistence.model;

import java.io.Serializable;
import java.util.List;

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
@TableName("wf_process_step")
public class ProcessStep extends Model<ProcessStep> {

    private static final long serialVersionUID = 1L;

	private Long id;
	private String name;
	@TableField("process_id")
	private Long processId;
	private String type;
	@TableField("step_type")
	private String stepType;
	@TableField("next_steps")
	private String nextSteps;
	@TableField("handler_select_rule")
	private String handlerSelectRule;
	@TableField("handler_ids")
	private String handlerIds;
	@TableField("current_user_id")
	private Long currentUserId;
	@TableField("virtual_form_code")
	private String virtualFormCode;
	@TableField("pid")
	private Long pid;

	@TableField("next_id")
	private Long nextId;

	@TableField("entity_name")
	private String entityName;

	@TableField("approver_type")
	private String approverType;

	@TableField("multi_approver")
	private Boolean multiApprover;

	@TableField("multi_approve_mode")
	private String multiApproveMode;

	@TableField("allow_self_approval")
	private String allowSelfApproval;

	/** 超时时间（小时） */
	@TableField("timeout_hours")
	private Integer timeoutHours;

	/** 自动操作 */
	@TableField("auto_action")
	private String autoAction;

	/** 通知类型 */
	@TableField("notify_type")
	private String notifyType;

	@TableField(exist = false)
	private ProcessStep children;




	public Long getNextId() {
		return nextId;
	}

	public void setNextId(Long nextId) {
		this.nextId = nextId;
	}

	public Long getPid() {
		return pid;
	}

	public void setPid(Long pid) {
		this.pid = pid;
	}

	public ProcessStep getChildren() {
		return children;
	}

	public void setChildren(ProcessStep children) {
		this.children = children;
	}

	public String getStepType() {
		return stepType;
	}

	public void setStepType(String stepType) {
		this.stepType = stepType;
	}

	public String getVirtualFormCode() {
		return virtualFormCode;
	}

	public void setVirtualFormCode(String virtualFormCode) {
		this.virtualFormCode = virtualFormCode;
	}

	public Long getCurrentUserId() {
		return currentUserId;
	}

	public void setCurrentUserId(Long currentUserId) {
		this.currentUserId = currentUserId;
	}

	public Long getId() {
		return id;
	}

	public ProcessStep setId(Long id) {
		this.id = id;
		return this;
	}

	public String getName() {
		return name;
	}

	public ProcessStep setName(String name) {
		this.name = name;
		return this;
	}

	public Long getProcessId() {
		return processId;
	}

	public ProcessStep setProcessId(Long processId) {
		this.processId = processId;
		return this;
	}

	public String getType() {
		return type;
	}

	public ProcessStep setType(String type) {
		this.type = type;
		return this;
	}

	public String getNextSteps() {
		return nextSteps;
	}

	public ProcessStep setNextSteps(String nextSteps) {
		this.nextSteps = nextSteps;
		return this;
	}

	public String getHandlerSelectRule() {
		return handlerSelectRule;
	}

	public ProcessStep setHandlerSelectRule(String handlerSelectRule) {
		this.handlerSelectRule = handlerSelectRule;
		return this;
	}

	public String getHandlerIds() {
		return handlerIds;
	}

	public ProcessStep setHandlerIds(String handlerIds) {
		this.handlerIds = handlerIds;
		return this;
	}

	public String getEntityName() {
		return entityName;
	}

	public void setEntityName(String entityName) {
		this.entityName = entityName;
	}

	public String getApproverType() {
		return approverType;
	}

	public void setApproverType(String approverType) {
		this.approverType = approverType;
	}

	public Boolean getMultiApprover() {
		return multiApprover;
	}

	public void setMultiApprover(Boolean multiApprover) {
		this.multiApprover = multiApprover;
	}

	public String getMultiApproveMode() {
		return multiApproveMode;
	}

	public void setMultiApproveMode(String multiApproveMode) {
		this.multiApproveMode = multiApproveMode;
	}

	public String getAllowSelfApproval() {
		return allowSelfApproval;
	}

	public void setAllowSelfApproval(String allowSelfApproval) {
		this.allowSelfApproval = allowSelfApproval;
	}

	public Integer getTimeoutHours() {
		return timeoutHours;
	}

	public void setTimeoutHours(Integer timeoutHours) {
		this.timeoutHours = timeoutHours;
	}

	public String getAutoAction() {
		return autoAction;
	}

	public void setAutoAction(String autoAction) {
		this.autoAction = autoAction;
	}

	public String getNotifyType() {
		return notifyType;
	}

	public void setNotifyType(String notifyType) {
		this.notifyType = notifyType;
	}

	public static final String ID = "id";

	public static final String NAME = "name";

	public static final String PROCESS_ID = "process_id";

	public static final String TYPE = "type";

	public static final String NEXT_STEPS = "next_steps";

	public static final String HANDLER_SELECT_RULE = "handler_select_rule";

	public static final String HANDLER_IDS = "handler_ids";

	@Override
	protected Serializable pkVal() {
		return this.id;
	}

	@Override
	public String toString() {
		return "ProcessStep{" +
			"id=" + id +
			", name=" + name +
			", processId=" + processId +
			", type=" + type +
			", nextSteps=" + nextSteps +
			", handlerSelectRule=" + handlerSelectRule +
			", handlerIds=" + handlerIds +
			"}";
	}
}
