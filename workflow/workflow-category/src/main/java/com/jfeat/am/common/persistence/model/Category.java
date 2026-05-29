package com.jfeat.am.common.persistence.model;

import java.io.Serializable;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;

/**
 * <p>
 * 
 * </p>
 *
 * @author admin
 * @since 2017-10-19
 */
@TableName("t_category")
public class Category extends Model<Category> {

    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
	private Long id;
    /**
     * 类别名称
     */
	private String name;
    /**
     * 父目录
     */
	private Long pid;
    /**
     * 类型
     */
	@TableField("type_id")
	private Long typeId;
    /**
     * 排序
     */
	private Long sortorder;
    /**
     * 编码
     */
	private String code;
    /**
     * 封面
     */
	private String cover;

	private Long orgId;

	public Long getOrgId() {
		return orgId;
	}

	public void setOrgId(Long orgId) {
		this.orgId = orgId;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Long getPid() {
		return pid;
	}

	public void setPid(Long pid) {
		this.pid = pid;
	}

	public Long getTypeId() {
		return typeId;
	}

	public void setTypeId(Long typeId) {
		this.typeId = typeId;
	}

	public Long getSortorder() {
		return sortorder;
	}

	public void setSortorder(Long sortorder) {
		this.sortorder = sortorder;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getCover() {
		return cover;
	}

	public void setCover(String cover) {
		this.cover = cover;
	}

	public static final String ID = "id";

	public static final String NAME = "name";

	public static final String PID = "pid";

	public static final String TYPE_ID = "type_id";

	public static final String SORTORDER = "sortorder";

	public static final String CODE = "code";

	public static final String COVER = "cover";

	@Override
	protected Serializable pkVal() {
		return this.id;
	}

	@Override
	public String toString() {
		return "Category{" +
			"id=" + id +
			", name=" + name +
			", pid=" + pid +
			", typeId=" + typeId +
			", sortorder=" + sortorder +
			", code=" + code +
			", cover=" + cover +
			"}";
	}
}
