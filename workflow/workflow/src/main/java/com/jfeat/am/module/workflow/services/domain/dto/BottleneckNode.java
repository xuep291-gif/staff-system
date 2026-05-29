package com.jfeat.am.module.workflow.services.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;

/**
 * 流程瓶颈节点
 * 用于标识流程中的瓶颈步骤
 *
 * @author Workflow System
 * @since 2026-02-14
 */
@Data
public class BottleneckNode {
    /** 步骤ID */
    private Long stepId;

    /** 步骤名称 */
    private String stepName;

    /** 处理次数 */
    private Integer processCount;

    /** 平均处理时长（秒） */
    private Long avgProcessSeconds;

    /** 最大处理时长（秒） */
    private Long maxProcessSeconds;

    /** 超时次数 */
    private Integer timeoutCount;

    /** 开始日期 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date startDate;

    /** 结束日期 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date endDate;
}
