package com.jfeat.processTask.enums;

import com.jfeat.crud.base.exception.BusinessCode;
import com.jfeat.crud.base.exception.BusinessException;

/**
 * 负责人类型枚举
 */
public enum AssigneeType {
    USER("用户"),
    ORGANIZATION("组织"),
    ROLE("角色");

    private final String description;

    AssigneeType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public static void checkValid(String type) {
        try {
            AssigneeType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(BusinessCode.BadRequest, "负责人类型不合法");
        }
    }

}