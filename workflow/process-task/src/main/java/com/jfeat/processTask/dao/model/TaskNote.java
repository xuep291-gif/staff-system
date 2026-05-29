package com.jfeat.processTask.dao.model;

import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 任务处理记录表实体类
 * 对应数据库表：t_task_notes
 */
@Data
@TableName("t_task_notes")
public class TaskNote extends Model<TaskNote> {
    /**
     * 主键ID（自增）
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 任务ID（关联tasks.task_id）
     */
//    private Long taskId;
    private Long transferId;

    /**
     * 处理人ID（关联users.user_id）
     */
    private Long handlerId;

    /**
     * 处理人姓名（冗余存储，避免关联查询）
     */
    private String handlerName;

    /**
     * 处理前状态（如PENDING）
     */
    private String fromStatus;

    /**
     * 处理后状态（如IN_PROGRESS）
     */
    private String toStatus;

    /**
     * 处理意见
     */
    private String note;

    /**
     * 问题截图URL（如OSS路径）
     */
    private String imageUrl;

    /**
     * 附件URL
     */
    private String attachment;
    /**
     * 记录创建时间（自动填充）
     */
    private LocalDateTime  createTime;

    /**
     *
     */
    private String status;
}