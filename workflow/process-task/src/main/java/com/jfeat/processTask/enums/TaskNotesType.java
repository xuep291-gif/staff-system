package com.jfeat.processTask.enums;

import java.util.Arrays;
import java.util.stream.Collectors;

public enum TaskNotesType {
    /**
     * 任务状态类型枚举
     * 新增 canTransfer 字段表示该状态是否允许转交
     */
    NEW("新建", true),
    ASSIGNED("待分配", true),
    PENDING_RESPONSE("待响应", false),
    IN_PROGRESS("处理中", true),
    NEXT("流转",true),
    COMPLETED("完成", true),
    CLOSED("关闭", false),
    SUSPENDED("挂起", false);

    private final String description;
    private final boolean canTransfer; // 新增字段：是否允许转交

    TaskNotesType(String description, boolean canTransfer) {
        this.description = description;
        this.canTransfer = canTransfer;
    }

    public String getDescription() {
        return description;
    }

    /**
     * 新增方法：判断该状态是否允许转交
     */
    public boolean canTransfer() {
        return canTransfer;
    }

    /**
     * 通过字符串判断是否允许转交
     * @param value
     * @return
     */
    public static boolean isTransferAllowed(String value) {
        return fromValue(value).canTransfer();
    }
    /**
     * 根据字符串值解析枚举（忽略大小写）
     */
    public static TaskNotesType fromValue(String value) {
        try {
            return TaskNotesType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "无效的任务状态: " + value +
                            "，合法状态为: " + Arrays.stream(values())
                            .map(Enum::name)
                            .collect(Collectors.toList())
            );
        }
    }
}