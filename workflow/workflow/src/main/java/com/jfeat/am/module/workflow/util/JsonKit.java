package com.jfeat.am.module.workflow.util;


import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.serializer.SerializerFeature;
import com.alibaba.fastjson.serializer.ValueFilter;

public class JsonKit {
    private static ValueFilter valueFilter = (object, name, value) -> {
        if (null == value) {
            value = "";
        }

        return value instanceof Long ? value.toString() : value;
    };

    public JsonKit() {
    }

    public static String toJson(Object object) {
        return JSONObject.toJSONString(object, valueFilter, new SerializerFeature[]{SerializerFeature.PrettyFormat, SerializerFeature.WriteMapNullValue, SerializerFeature.WriteDateUseDateFormat});
    }

    public static <T> T parseObject(String text, Class<T> clazz) {
        return JSON.parseObject(text, clazz);
    }
}
