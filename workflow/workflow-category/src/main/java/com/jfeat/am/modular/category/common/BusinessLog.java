package com.jfeat.am.modular.category.common;

import java.lang.annotation.*;

/**
 * 业务日志注解，替代 crud-dev 的 BusinessLog
 */
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface BusinessLog {
    String name() default "";
    String value() default "";
}
