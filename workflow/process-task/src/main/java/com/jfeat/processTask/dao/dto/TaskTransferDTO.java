package com.jfeat.processTask.dao.dto;


import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 任务流转记录表实体类
 * 对应数据库表：t_task_transfers
 */
@Data
@TableName("t_task_transfers")
public class TaskTransferDTO  {
    /**
     * 流转记录唯一ID（主键，自增）
     */
    @TableId(type = IdType.AUTO)
    private Long transferId;

    /**
     * 任务ID（关联tasks.task_id）
     */
    private Long taskId;

    /**
     * 原负责人类型（USER:用户, ORGANIZATION:组织）
     */
    private String fromAssigneeType;

    /**
     * 原负责人ID
     */
    private Long fromAssigneeId;

    /**
     * 新负责人类型
     */
    private String toAssigneeType;

    /**
     * 新负责人ID
     */
    private Long toAssigneeId;

    /**
     * 操作人ID（关联users.user_id）
     */
    private Long transferredBy;

    /**
     * 流转时间（自动填充）
     */
//    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime transferredAt;

    /**
     * 流转备注（如转交原因）
     */
    private String notes;
}