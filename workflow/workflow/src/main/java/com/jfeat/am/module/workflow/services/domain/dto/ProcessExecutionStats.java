package com.jfeat.am.module.workflow.services.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;

/**
 * 流程执行统计
 * 用于统计流程在指定时间范围内的执行情况
 *
 * @author Workflow System
 * @since 2026-02-14
 */
@Data
public class ProcessExecutionStats {
    /** 流程ID */
    private Long processId;

    /** 流程名称 */
    private String processName;

    /** 总发起数 */
    private Integer totalCount;

    /** 审批通过数 */
    private Integer approvedCount;

    /** 审批拒绝数 */
    private Integer rejectedCount;

    /** 运行中数量 */
    private Integer runningCount;

    /** 平均审批时长（秒） */
    private Long avgApprovalSeconds;

    /** 最长审批时长（秒） */
    private Long maxApprovalSeconds;

    /** 最短审批时长（秒） */
    private Long minApprovalSeconds;

    /** 开始日期 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date startDate;

    /** 结束日期 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date endDate;
}
