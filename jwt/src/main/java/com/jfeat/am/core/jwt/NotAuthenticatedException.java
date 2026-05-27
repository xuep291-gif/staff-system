package com.jfeat.am.core.jwt;

/**
 * 用户未认证异常
 * 当鉴权启用时，JWTKit.getOrgId() 检测到未登录会抛出此异常
 */
public class NotAuthenticatedException extends RuntimeException {
    public NotAuthenticatedException(String message) {
        super(message);
    }
}
