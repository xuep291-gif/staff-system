package com.jfeat.am.core.sso;

import com.jfeat.am.core.model.DeviceType;

/**
 * 设备单点登录插件接口，在UserAccount模块redis中获取缓存token
 */
public interface EndUserAuthRedisPlugin {
    /**
     * 插入
     * @param userId 用户id
     * @param deviceType 设备类型枚举
     * @param token 用户token
     */
    void set(Long userId, DeviceType deviceType, String token);

    /**
     * 查询
     * @param userId
     * @param deviceType
     * @return
     */
    String get(Long userId, DeviceType deviceType);
}


