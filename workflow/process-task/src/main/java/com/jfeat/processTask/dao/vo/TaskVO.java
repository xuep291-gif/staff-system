package com.jfeat.processTask.dao.vo;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class TaskVO {
    private Long taskId;
    private String title;
    private String attachmentUrl; // 可访问的完整URL
    private String imageUrl;
    private String description;

    // 状态显示文本
    private String statusLabel;

    // 优先级显示文本
    private String priorityLabel;

    // 格式化时间
    private String formattedStartTime;
    private String formattedDeadline;

    // 关联信息
    private String creatorName;
    private String assigneeName;
    private String assigneeRoleName;

    // 计算字段
    private Boolean isExpired;
}