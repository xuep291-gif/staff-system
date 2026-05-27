package com.jfeat.am.core.jwt;

/**
 * @when 2021-12-24 from perm-core:0.1.2 to jwt-core:0.1.2
 */
public class AccessToken {
    private String accessToken;
    private String tokenType;
    private long expiresIn;

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }
}