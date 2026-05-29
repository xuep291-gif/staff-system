package com.jfeat.am.module.workflow.services.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;

/**
 * 用户审批效率统计
 * 用于统计用户在指定时间范围内的审批效率
 *
 * @author Workflow System
 * @since 2026-02-14
 */
@Data
public class UserApprovalStats {
    /** 用户ID */
    private Long userId;

    /** 用户姓名 */
    private String userName;

    /** 待办数量 */
    private Integer pendingCount;

    /** 已办数量 */
    private Integer processedCount;

    /** 平均审批时长（秒） */
    private Long avgApprovalSeconds;

    /** 最快审批时长（秒） */
    private Long fastestApprovalSeconds;

    /** 最慢审批时长（秒） */
    private Long slowestApprovalSeconds;

    /** 审批通过率（百分比） */
    private Double approvalRate;

    /** 开始日期 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date startDate;

    /** 结束日期 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date endDate;
}
