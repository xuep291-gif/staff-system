package com.jfeat.processTask.enums;
/**
 * 任务优先级枚举
 */
public enum TaskPriority {
    LOW("低"),
    MEDIUM("中"),
    HIGH("高");

    private final String description;

    TaskPriority(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}