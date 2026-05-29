package com.jfeat.processTask.enums;

/**
 * 任务状态枚举
 */
public enum TaskStatus {
    PENDING("待处理"),
    IN_PROGRESS("进行中"),
    COMPLETED("完成");

    private final String description;

    TaskStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}