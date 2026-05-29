package com.jfeat.am.modular.category.common;

/**
 * 字符串工具类，替代 crud-dev 的 StrKit
 */
public class StrKit {
    
    /**
     * 将驼峰命名转换为下划线命名
     */
    public static String toUnderlineCase(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < str.length(); i++) {
            char c = str.charAt(i);
            if (Character.isUpperCase(c)) {
                if (i > 0) {
                    sb.append('_');
                }
                sb.append(Character.toLowerCase(c));
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }
}
