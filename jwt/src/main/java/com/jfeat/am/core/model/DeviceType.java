package com.jfeat.am.core.model;

/**
 * @description: 设备型号枚举类
 * @project: perm-core
 * @date: 2025/1/15 13:08
 * @author: hhhhhtao
 */
public enum DeviceType {
    IPHONE("IPHONE", "iPhone", true),
    IPAD("IPAD", "iPad", true),
    MAC("MAC", "Mac", true),
    ANDROID("ANDROID", "Android", true),
    ANDROID_PAD("ANDROID_PAD", "Android Pad", true),
    ANDROID_TV("TV", "TV", true), //means OPS, ANDROID_TV
    LARGE_SCREEN("LARGE_SCREEN", "Large Screen", true),  // not a platform
    WINDOWS("WINDOWS", "Windows", true),
    WEB("WEB", "Web", false),
    MINI_APP("MINI_APP", "Mini App", false),  //微信小程序
    UNKNOWN("UNKNOWN", "Unknown", true);

    /**
     * 名称
     */
    private final String name;

    /**
     * 显示名称
     */
    private final String displayName;

    /**
     * 是否启用 SSO 单点登录
     * WEB 和 MINI_APP 默认不启用，因为它们通常没有固定的客户端标识或不需要单点登录限制
     */
    private final boolean ssoEnabled;

    DeviceType(String name, String displayName, boolean ssoEnabled) {
        this.name = name;
        this.displayName = displayName;
        this.ssoEnabled = ssoEnabled;
    }

    public String getName(){
        return this.name;
    }

    public String getDisplayName(){
        return this.displayName;
    }

    /**
     * 判断当前设备类型是否启用 SSO 单点登录
     * @return true 表示启用 SSO，false 表示跳过 SSO 检查
     */
    public boolean isSsoEnabled() {
        return this.ssoEnabled;
    }
}
