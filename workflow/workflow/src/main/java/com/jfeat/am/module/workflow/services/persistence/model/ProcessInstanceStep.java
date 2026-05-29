package com.jfeat.am.module.workflow.services.persistence.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import com.baomidou.mybatisplus.annotation.TableId;

import java.io.Serializable;

/**
 * <p>
 *
 * </p>
 *
 * @author Code generator
 * @since 2021-05-20
 */
@TableName("wf_process_instance_step")
public class ProcessInstanceStep extends Model<ProcessInstanceStep> {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private Long stepId;

    private Long instanceId;

    private Long entityId;

    private Long rowId;

    private String virtualFormCode;

    private String status;

    private String note;

    private Integer sortNum;

    private Long userId;


    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getId() {
        return id;
    }

    public ProcessInstanceStep setId(Long id) {
        this.id = id;
        return this;
    }

    public Long getStepId() {
        return stepId;
    }

    public ProcessInstanceStep setStepId(Long stepId) {
        this.stepId = stepId;
        return this;
    }

    public Long getInstanceId() {
        return instanceId;
    }

    public ProcessInstanceStep setInstanceId(Long instanceId) {
        this.instanceId = instanceId;
        return this;
    }

    public Long getEntityId() {
        return entityId;
    }

    public ProcessInstanceStep setEntityId(Long entityId) {
        this.entityId = entityId;
        return this;
    }

    public Long getRowId() {
        return rowId;
    }

    public ProcessInstanceStep setRowId(Long rowId) {
        this.rowId = rowId;
        return this;
    }

    public String getVirtualFormCode() {
        return virtualFormCode;
    }

    public ProcessInstanceStep setVirtualFormCode(String virtualFormCode) {
        this.virtualFormCode = virtualFormCode;
        return this;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }


    public Integer getSortNum() {
        return sortNum;
    }

    public void setSortNum(Integer sortNum) {
        this.sortNum = sortNum;
    }

    public static final String ID = "id";

    public static final String STEP_ID = "step_id";

    public static final String INSTANCE_ID = "instance_id";

    public static final String ENTITY_ID = "entity_id";

    public static final String ROW_ID = "row_id";

    public static final String VIRTUAL_FORM_CODE = "virtual_form_code";

    @Override
    protected Serializable pkVal() {
        return this.id;
    }

    @Override
    public String toString() {
        return "ProcessInstanceStep{" +
                "id=" + id +
                ", stepId=" + stepId +
                ", instanceId=" + instanceId +
                ", entityId=" + entityId +
                ", rowId=" + rowId +
                ", virtualFormCode=" + virtualFormCode +
                "}";
    }
}
