package com.jfeat.am.modular.category.common;

import org.springframework.beans.BeanUtils;

/**
 * CRUD 工具类，替代 crud-dev 的 CRUD
 */
public class CRUD {
    
    /**
     * 对象类型转换
     */
    public static <T> T castObject(Object source, Class<T> targetClass) {
        if (source == null) {
            return null;
        }
        try {
            T target = targetClass.getDeclaredConstructor().newInstance();
            BeanUtils.copyProperties(source, target);
            return target;
        } catch (Exception e) {
            throw new BusinessException(500, "对象转换失败: " + e.getMessage());
        }
    }
}
