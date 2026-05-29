package com.jfeat.am.module.workflow.constant;

/**
 * Created by jackyhuang on 2017/10/27.
 */
public enum ProcessStepTypeEnum {
    START("开始节点", false),
    MIDDLE("中间节点", true),
    END("结束节点", false),
    COPY("抄送节点", true);

    private final String description;
    private final boolean userAddable;

    ProcessStepTypeEnum(String description, boolean userAddable) {
        this.description = description;
        this.userAddable = userAddable;
    }

    public String getDescription() {
        return description;
    }

    public boolean isUserAddable() {
        return userAddable;
    }

    /**
     * 根据 name（如 "START"、"COPY"）获取对应的枚举
     * @param name 前端传入的节点名称（不区分大小写）
     * @return 对应的枚举值，如果找不到则返回 null
     */
    public static ProcessStepTypeEnum fromName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return null;
        }
        try {
            return ProcessStepTypeEnum.valueOf(name.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null; // 无效的 name 返回 null
        }
    }
}
