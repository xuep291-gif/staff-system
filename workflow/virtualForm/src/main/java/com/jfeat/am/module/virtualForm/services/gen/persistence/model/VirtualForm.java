package com.jfeat.am.module.virtualForm.services.gen.persistence.model;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import java.util.Date;
import com.baomidou.mybatisplus.annotation.TableId;
import java.io.Serializable;

/**
 * <p>
 * 
 * </p>
 *
 * @author Code generator
 * @since 2021-04-26
 */
@TableName("t_virtual_form")
public class VirtualForm extends Model<VirtualForm> {

    private static final long serialVersionUID=1L;

      @TableId(value = "id", type = IdType.AUTO)
      private Long id;

    private String code;

    private String designData;

    private Long entityId;

    private String type;

    private Long orgId;

    private Date createTime;

    private Date updateTime;

    @TableField("form_name")
    private String formName;


    private String note;

    @TableField("doc_id")
    private Long docId;


    private Boolean deleteFlag;

    private String htmlUrl;

    private String appDesignData;

    public String getAppDesignData() {
        return appDesignData;
    }

    public void setAppDesignData(String appDesignData) {
        this.appDesignData = appDesignData;
    }

    public String getHtmlUrl() {
        return htmlUrl;
    }

    public void setHtmlUrl(String htmlUrl) {
        this.htmlUrl = htmlUrl;
    }

    public Boolean getDeleteFlag() {
        return deleteFlag;
    }

    public void setDeleteFlag(Boolean deleteFlag) {
        this.deleteFlag = deleteFlag;
    }

    public Long getDocId() {
        return docId;
    }

    public void setDocId(Long docId) {
        this.docId = docId;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getFormName() {
        return formName;
    }

    public void setFormName(String formName) {
        this.formName = formName;
    }

    public Long getId() {
        return id;
    }

      public VirtualForm setId(Long id) {
          this.id = id;
          return this;
      }
    
    public String getCode() {
        return code;
    }

      public VirtualForm setCode(String code) {
          this.code = code;
          return this;
      }
    
    public String getDesignData() {
        return designData;
    }

      public VirtualForm setDesignData(String designData) {
          this.designData = designData;
          return this;
      }
    
    public Long getEntityId() {
        return entityId;
    }

      public VirtualForm setEntityId(Long entityId) {
          this.entityId = entityId;
          return this;
      }
    
    public String getType() {
        return type;
    }

      public VirtualForm setType(String type) {
          this.type = type;
          return this;
      }
    
    public Long getOrgId() {
        return orgId;
    }

      public VirtualForm setOrgId(Long orgId) {
          this.orgId = orgId;
          return this;
      }
    
    public Date getCreateTime() {
        return createTime;
    }

      public VirtualForm setCreateTime(Date createTime) {
          this.createTime = createTime;
          return this;
      }
    
    public Date getUpdateTime() {
        return updateTime;
    }

      public VirtualForm setUpdateTime(Date updateTime) {
          this.updateTime = updateTime;
          return this;
      }

      public static final String ID = "id";

      public static final String CODE = "code";

      public static final String DESIGN_DATA = "design_data";

      public static final String ENTITY_ID = "entity_id";

      public static final String TYPE = "type";

      public static final String ORG_ID = "org_id";

      public static final String CREATE_TIME = "create_time";

      public static final String UPDATE_TIME = "update_time";

      @Override
    protected Serializable pkVal() {
          return this.id;
      }

    @Override
    public String toString() {
        return "VirtualForm{" +
              "id=" + id +
                  ", code=" + code +
                  ", designData=" + designData +
                  ", entityId=" + entityId +
                  ", type=" + type +
                  ", orgId=" + orgId +
                  ", createTime=" + createTime +
                  ", updateTime=" + updateTime +
              "}";
    }
}
