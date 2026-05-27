package com.jfeat.am.common.annotation;

import java.lang.annotation.*;

/**
 * 权限注解 用于检查权限 规定访问权限
 *
 * @example @EndUserPermission({perm1,perm2})
 * @example @EndUserPermission
 */
@Inherited
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
public @interface EndUserPermission {
    String[] value();
}
