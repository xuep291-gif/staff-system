package com.jfeat.am.modular.category.common;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 分组工具类，替代 crud-dev 的 GROUP
 */
public class GROUP {
    
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 将列表转换为 JSON 对象格式
     */
    public static Object toJSONObject(List<?> list) {
        if (list == null) {
            return new ArrayList<>();
        }
        return list;
    }
    
    /**
     * 将对象转换为 Map
     */
    public static Map<String, Object> toMap(Object obj) {
        if (obj == null) {
            return new HashMap<>();
        }
        return objectMapper.convertValue(obj, Map.class);
    }
}
