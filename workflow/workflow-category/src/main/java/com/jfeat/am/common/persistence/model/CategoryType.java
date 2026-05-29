package com.jfeat.am.common.persistence.model;

import java.io.Serializable;

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
@TableName("t_category_type")
public class CategoryType extends Model<CategoryType> {

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
     * 类别名称
     */
	private String identifier;


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

	public String getIdentifier() {
		return identifier;
	}

	public void setIdentifier(String identifier) {
		this.identifier = identifier;
	}

	public static final String ID = "id";

	public static final String NAME = "name";

	public static final String IDENTIFIER = "identifier";

	@Override
	protected Serializable pkVal() {
		return this.id;
	}

	@Override
	public String toString() {
		return "CategoryType{" +
			"id=" + id +
			", name=" + name +
			", identifier=" + identifier +
			"}";
	}
}
