package com.jfeat.am.module.base.services.persistence.model;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.io.Serializable;

import java.util.Date;
import java.io.Serializable;

/**
 * <p>
 * 
 * </p>
 *
 * @author admin
 * @since 2017-12-09
 */
@TableName("ticket_attachment_item")
public class TicketAttachmentItem extends Model<TicketAttachmentItem> {

    private static final long serialVersionUID = 1L;

	private Long id;
    /**
     * 表单ID
     */
	@TableField("ticket_id")
	private Long ticketId;
    /**
     * 文档属性版本号
     */
	private Integer version;
    /**
     * 文件名
     */
	private String title;
    /**
     * 大小
     */
	private Integer size;
    /**
     * 格式[文件后缀]
     */
	private String format;
    /**
     * 上传时间
     */
	@TableField("upload_time")
	@JsonFormat(pattern="yyyy-MM-dd HH:mm:ss",timezone = "GMT+8")
	private Date uploadTime;
    /**
     * 文件路径
     */
	private String url;


	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getTicketId() {
		return ticketId;
	}

	public void setTicketId(Long ticketId) {
		this.ticketId = ticketId;
	}

	public Integer getVersion() {
		return version;
	}

	public void setVersion(Integer version) {
		this.version = version;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public Integer getSize() {
		return size;
	}

	public void setSize(Integer size) {
		this.size = size;
	}

	public String getFormat() {
		return format;
	}

	public void setFormat(String format) {
		this.format = format;
	}

	public Date getUploadTime() {
		return uploadTime;
	}

	public void setUploadTime(Date uploadTime) {
		this.uploadTime = uploadTime;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public static final String ID = "id";

	public static final String TICKET_ID = "ticket_id";

	public static final String VERSION = "version";

	public static final String TITLE = "title";

	public static final String SIZE = "size";

	public static final String FORMAT = "format";

	public static final String UPLOAD_TIME = "upload_time";

	public static final String URL = "url";

	@Override
	protected Serializable pkVal() {
		return this.id;
	}

	@Override
	public String toString() {
		return "TicketAttachmentItem{" +
			"id=" + id +
			", ticketId=" + ticketId +
			", version=" + version +
			", title=" + title +
			", size=" + size +
			", format=" + format +
			", uploadTime=" + uploadTime +
			", url=" + url +
			"}";
	}
}
