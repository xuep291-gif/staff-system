package com.jfeat.processTask.dao.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;

@Data
public class TaskTransferVO {

    private Long transferId;       // 流转ID
    private Long taskId;           // 任务ID

    private String fromAssigneeType;  // 转出类型
    private String fromAssigneeName;  // 转出方名称

    private String toAssigneeType;    // 转入类型
    private String toAssigneeName;    // 转入方名称

    private String operator;        // 操作人（用户账号）
    private Date transferredAt;     // 流转时间
    private String notes;

    private TaskNoteVO processResults;
}
