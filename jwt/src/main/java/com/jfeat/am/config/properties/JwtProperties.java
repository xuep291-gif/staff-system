package com.jfeat.am.config.properties;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Created by jackyhuang on 2017/6/10.
 */
@Component
@ConfigurationProperties(prefix = JwtProperties.PREFIX)
public class JwtProperties {
    public static final String PREFIX = "jwt";
    private String encodedKey;
    private String normalEncodedKey;
    private String app;

    /**
     * 有效期，72 hours = 72 * 3600 * 1000
     */
    @Value("${jwt.ttl-millis:604800000}")
    private long ttlMillis;

    private String tokenType = "Bearer";

    private Boolean enableAttemptLogin = true;

//    private Boolean nonShiroPermissionCheck = false;

    public String getTokenType() {
        return this.tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getEncodedKey() {
        return this.encodedKey;
    }

    public void setEncodedKey(String encodedKey) {
        this.encodedKey = encodedKey;
    }

    public long getTtlMillis() {
        return this.ttlMillis;
    }

    public void setTtlMillis(long ttlMillis) {
        this.ttlMillis = ttlMillis;
    }

//    public Boolean getNonShiroPermissionCheck() {
//        return this.nonShiroPermissionCheck;
//    }
//
//    public JwtProperties setNonShiroPermissionCheck(Boolean nonShiroPermissionCheck) {
//        this.nonShiroPermissionCheck = nonShiroPermissionCheck;
//        return this;
//    }

    public Boolean getEnableAttemptLogin() {
        return this.enableAttemptLogin;
    }

    public void setEnableAttemptLogin(Boolean enableAttemptLogin) {
        this.enableAttemptLogin = enableAttemptLogin;
    }

    public String getNormalEncodedKey() {
        return normalEncodedKey;
    }

    public void setNormalEncodedKey(String normalEncodedKey) {
        this.normalEncodedKey = normalEncodedKey;
    }

    public String getApp() {
        return app;
    }

    public void setApp(String app) {
        this.app = app;
    }
}

