package com.jfeat.processTask.dao.model;

import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.activerecord.Model;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 任务主表实体类
 * 对应数据库表：t_tasks
 */
@Data
@TableName("t_tasks")
public class ProcessTask extends Model<ProcessTask> {

    private static final long serialVersionUID = 1L;
    /**
     * 任务唯一ID（主键，自增）
     */
    @TableId(type = IdType.AUTO)
    private Long taskId;

    /**
     * 任务标题（非空）
     */
    private String title;

    /**
     * 附件URL（如OSS路径）
     */
    private String attachment;

    /**
     * 问题截图URL（如OSS路径）
     */
    private String imageUrl;

    /**
     * 任务详细描述
     */
    private String description;

    /**
     * 任务状态（PENDING:待处理, IN_PROGRESS:进行中, COMPLETED:完成）
     */
    private String status;

    /**
     * 优先级（LOW:低, MEDIUM:中, HIGH:高）
     */
    private String priority;

    /**
     * 开始时间
     */
    private LocalDateTime startTime;

    /**
     * 到期时间
     */
    private LocalDateTime deadline;

    /**
     * 创建人ID（关联users.user_id）
     */
    private Long createdBy;

    /**
     * 任务创建时间（自动填充）
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 最后更新时间（自动填充）
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    /**
     * 当前负责人类型（USER:用户, ORGANIZATION:组织）
     */
    private String assigneeType;

    /**
     * 当前负责人ID（根据类型关联users或organizations表）
     */
    private Long assigneeId;
    /**
     * 如果是组织可以选择这个组织里面的角色
     */
    private Integer assigneeRole;



}