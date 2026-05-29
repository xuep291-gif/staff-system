package com.jfeat.am.module.workflow.services.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.util.Date;
import java.util.List;

/**
 * 流程实例数据传输对象
 * 用于封装流程实例的完整信息，包括当前状态、历史记录等扩展字段
 *
 * @author Workflow System
 * @since 2026-02-14
 */
@Data
public class ProcessInstanceDTO {
    /** 主键ID */
    private Long id;

    /** 流程实例名称 */
    private String name;

    /** 流程实例状态 */
    private String status;

    /** 当前步骤ID */
    private Long currentStepId;

    /** 当前步骤名称 */
    private String currentStepName;

    /** 当前处理人ID */
    private Long currentUserId;

    /** 当前处理人姓名 */
    private String currentUserName;

    /** 创建时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date createTime;

    // ========== 扩展字段 ==========

    /** 待办天数 */
    private Integer pendingDays;

    /** 已耗时秒数 */
    private Long costSeconds;

    /** 流程名称 */
    private String processName;

    /** 创建人名称 */
    private String creatorName;

    /** 优先级 */
    private Integer priority;

    /** 预期完成时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date expectCompleteTime;

    /** 最近历史记录 */
    private List<HistoryItem> recentHistory;

    /**
     * 历史记录项
     * 用于记录流程实例的历史操作信息
     */
    @Data
    public static class HistoryItem {
        /** 步骤ID */
        private Long stepId;

        /** 步骤名称 */
        private String stepName;

        /** 处理人姓名 */
        private String userName;

        /** 处理结果 */
        private String result;

        /** 处理意见 */
        private String comment;

        /** 处理时间 */
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
        private Date handleTime;
    }
}
