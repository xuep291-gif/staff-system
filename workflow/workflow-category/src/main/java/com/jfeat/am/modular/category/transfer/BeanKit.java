package com.jfeat.am.modular.category.transfer;

import com.jfeat.am.modular.category.common.BusinessException;
import com.jfeat.am.modular.category.common.StrKit;

import java.beans.PropertyDescriptor;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

import static org.springframework.beans.BeanUtils.getPropertyDescriptors;

public class BeanKit {
    public static <T> Map<String, Object> beanToMap(T bean, boolean isToUnderlineCase) {
        if (bean == null) {
            return null;
        } else {
            HashMap map = new HashMap();

            try {
                PropertyDescriptor[] propertyDescriptors = getPropertyDescriptors(bean.getClass());
                PropertyDescriptor[] var4 = propertyDescriptors;
                int var5 = propertyDescriptors.length;

                for(int var6 = 0; var6 < var5; ++var6) {
                    PropertyDescriptor property = var4[var6];
                    String key = property.getName();
                    if (!key.equals("class")) {
                        Method getter = property.getReadMethod();
                        Object value = getter.invoke(bean);
                        if (null != value) {
                            map.put(isToUnderlineCase ? StrKit.toUnderlineCase(key) : key, value);
                        }
                    }
                }

                return map;
            } catch (Exception var11) {
                throw new BusinessException(4024,"转换失败");
            }
        }
    }
}
