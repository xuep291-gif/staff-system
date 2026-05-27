package com.jfeat.am.core.model;

/**
 * 用户第二维度类型 (有关注册来源, 权限限制等)
 */
public interface EndUserScopeType {

    /**
     * 公共注册渠道
     */
    Integer NORMAL = 1;

    /**
     * 渠道用户
     */
    Integer CHANNEL = 2;

    /**
     * 后台内部创建（或批量导入）的用户
     */
    Integer INTERNAL = 3;



    /**
     * 通过微信小程序注册用户
     */
    Integer REG_WECHAT = 4;

    /**
     * 通过抖音引流用户
     */
    Integer IN_DOUYIN = 5;

    /**
     * 能过YOUTUBE 引流用户
     */
    Integer IN_YOUTUBE = 6;




    /**
     * 保留 
     */
    Integer RESERVED = 7;
    // Integer RESERVED_8 = 8;
    // Integer RESERVED_9 = 9;

    /**
     * 设备关联用户
     */
    Integer BIND_DEVICE = 10;

    /**
     * 党建关联用户
     */
    Integer BIND_PARTY = 11;

    /**
     * 临时用户 (通常是内部创建的用户)
     */
    Integer TEMP = 100;
    
}
