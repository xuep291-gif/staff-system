package com.jfeat.am.module.workflow.services.persistence.model;

import java.io.Serializable;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * <p>
 * 
 * </p>
 *
 * @author Code Generator
 * @since 2017-11-10
 */
@TableName("wf_process")
public class Process extends Model<Process> {

    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
	private Long id;
    /**
     * 流程编码
     */
	private String code;

	@TableField("form_group")
	private String formGroup;

    /**
     * 表单类型
     */
	@TableField("form_type")
	private String formType;
    /**
     * 流程名
     */
	private String name;
    /**
     * 分类ID
     */
	@TableField("category_id")
	private Long categoryId;
    /**
     * 流程状态 ：ENABLED-启用,DISABLED-停用
     */
	private String status;
    /**
     * 开放范围ALL, DEPARTMENT, USER
     */
	@TableField("open_to")
	private String openTo;
    /**
     * 指定开放部门
     */
	@TableField("open_to_ids")
	private String openToIds;

	@TableField("current_user_id")
	private Long currentUserId;

	@TableField("org_id")
	private Long orgId;

	@TableField("code_rule")
	private String codeRule;

	@TableField("allow_delete")
	private Boolean allowDelete;

	@TableField("process_type")
	private String processType;

	@TableField("entity_name")
	private String entityName;

	/** 版本号 */
	@TableField("version")
	private Integer version;

	/** 是否锁定（运行中的流程不可修改） */
	@TableField("is_locked")
	private Boolean isLocked;

	/** 基于的版本ID */
	@TableField("based_on_id")
	private Long basedOnId;

	/** 生效时间 */
	@TableField("effective_date")
	private java.util.Date effectiveDate;

	/** 失效时间 */
	@TableField("expiry_date")
	private java.util.Date expiryDate;

	/** 状态变更原因 */
	@TableField("status_reason")
	private String statusReason;


	public String getProcessType() {
		return processType;
	}

	public void setProcessType(String processType) {
		this.processType = processType;
	}

	public String getEntityName() {
		return entityName;
	}

	public void setEntityName(String entityName) {
		this.entityName = entityName;
	}

	public Boolean getAllowDelete() {
		return allowDelete;
	}

	public void setAllowDelete(Boolean allowDelete) {
		this.allowDelete = allowDelete;
	}

	public String getCodeRule() {
		return codeRule;
	}

	public void setCodeRule(String codeRule) {
		this.codeRule = codeRule;
	}

	public Long getOrgId() {
		return orgId;
	}

	public void setOrgId(Long orgId) {
		this.orgId = orgId;
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

	public Process setId(Long id) {
		this.id = id;
		return this;
	}

	public String getCode() {
		return code;
	}

	public Process setCode(String code) {
		this.code = code;
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

	public Process setFormType(String formType) {
		this.formType = formType;
		return this;
	}

	public String getName() {
		return name;
	}

	public Process setName(String name) {
		this.name = name;
		return this;
	}

	public Long getCategoryId() {
		return categoryId;
	}

	public Process setCategoryId(Long categoryId) {
		this.categoryId = categoryId;
		return this;
	}

	public String getStatus() {
		return status;
	}

	public Process setStatus(String status) {
		this.status = status;
		return this;
	}

	public String getOpenTo() {
		return openTo;
	}

	public Process setOpenTo(String openTo) {
		this.openTo = openTo;
		return this;
	}

	public String getOpenToIds() {
		return openToIds;
	}

	public Process setOpenToIds(String openToIds) {
		this.openToIds = openToIds;
		return this;
	}

	public Integer getVersion() {
		return version;
	}

	public Process setVersion(Integer version) {
		this.version = version;
		return this;
	}

	public Boolean getIsLocked() {
		return isLocked;
	}

	public Process setIsLocked(Boolean isLocked) {
		this.isLocked = isLocked;
		return this;
	}

	public Long getBasedOnId() {
		return basedOnId;
	}

	public Process setBasedOnId(Long basedOnId) {
		this.basedOnId = basedOnId;
		return this;
	}

	public java.util.Date getEffectiveDate() {
		return effectiveDate;
	}

	public Process setEffectiveDate(java.util.Date effectiveDate) {
		this.effectiveDate = effectiveDate;
		return this;
	}

	public java.util.Date getExpiryDate() {
		return expiryDate;
	}

	public Process setExpiryDate(java.util.Date expiryDate) {
		this.expiryDate = expiryDate;
		return this;
	}

	public String getStatusReason() {
		return statusReason;
	}

	public Process setStatusReason(String statusReason) {
		this.statusReason = statusReason;
		return this;
	}

	public static final String ID = "id";

	public static final String CODE = "code";

	public static final String FORM_GROUP = "form_group";

	public static final String FORM_TYPE = "form_type";

	public static final String NAME = "name";

	public static final String CATEGORY_ID = "category_id";

	public static final String STATUS = "status";

	public static final String OPEN_TO = "open_to";

	public static final String OPEN_TO_IDS = "open_to_ids";

	@Override
	protected Serializable pkVal() {
		return this.id;
	}

	@Override
	public String toString() {
		return "Process{" +
			"id=" + id +
			", code=" + code +
			", formGroup=" + formGroup +
			", formType=" + formType +
			", name=" + name +
			", categoryId=" + categoryId +
			", status=" + status +
			", openTo=" + openTo +
			", openToIds=" + openToIds +
			"}";
	}
}
