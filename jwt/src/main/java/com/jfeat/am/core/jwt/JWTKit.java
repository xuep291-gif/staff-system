package com.jfeat.am.core.jwt;

import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.ServletRequest;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Date;
import java.net.URL;
import java.net.MalformedURLException;

/**
 * Created by jackyhuang on 2017/6/24.
 */
public class JWTKit {
    private static final Logger logger = LoggerFactory.getLogger(JWTKit.class);

    // 保留字段字义
    public static final String ADMIN = "admin";
    public static final Long SYS_ORG_ID = 1L;

    // 鉴权配置
    private static boolean authenticationEnabled = false;
    private static boolean authenticationConfigured = false; // 防止被恶意修改
    private static String authenticationAppid = null; // 无鉴权时的默认 appid

    // X-APPID-KEY 解析器
    private static AppidKeyResolver appidKeyResolver = null;

    // not claims, token type
    public static final String TAG_TOKEN_TYPE_USER = "user";
    public static final String TAG_TOKEN_TYPE_DEVICE = "device";
    

    // jwt claims
    public static final String APPID="appid"; // 当前登录用户所属的 APPID

    public static final String ISSUED_AT = "issuedAt";
    public static final String ORG_ID = "orgId";
    public static final String USER_ID = "userId";
    public static final String ACCOUNT = "account";
    public static final String TENANT_ORG_ID = "tenantOrgId";     // 租户组织ID
    
    // 平台用户类型
    //public static final String USER_TYPE = "userType";            // 平台用户类型  0-平台用户或租户用户（普通个人用户）1-组织管理员 2-个人用户 3-个人组织用户 101-管理员（租户管理员）

    //@when 2025-12, 重新定义用户类型
    public static final String USER_TYPE = "userType"; // 系统用户类型：0-普通个人用户 1-组织负责人 2-租户管理员 5-客服  10-平台或应用管理员(最高级别，自动跳过权限检查）100-平台管理员(没有必要定义，由ADMIN+SYS_ORG_ID标识）
    public static final int USER_TYPE_DEFAULT = 0;
    public static final int USER_TYPE_ORG_LEADER = 1;
    public static final int USER_TYPE_TENANT_ADMIN = 2;
    public static final int USER_TYPE_CUSTOMER_SUPPORT = 5;
    public static final int USER_TYPE_APP_ADMIN = 10;  // 指应用由租户域名定义，不属行平台租户，但存在租户表中（属于平台的租户将由appid过滤掉), 应用平台管理员跟平台管理员一样可直接跳过应用内的权限检查
    public static final int USER_TYPE_ADMIN = 100;     // 没有实际意义

    
    // 第二维度用户类型 [1=inspector 只有查看权限, 2=developer具备运维权限]
    public static final String DEV_USER_TYPE = "devUserType";
    

    /**
     * 终端用户定义
     */
    
    //限终端用户类型, 比如超级管理员, 公众用户, 供应商, 租客, 房东, 中介, 代理, 运维, 体验用户, 租户管理员 社区管理员, 销售, 二房东, 团长, 开发者, 团友, 品牌商, 投资商, 社区居民, 普通用户, 组织管理人, 个人用户, 个人组织用户, 等
    public static final String TYPE ="type";

    //@when 2025-10-30 add new claim for channelNo
    //新增 用户所属渠道编号
    public static final String CHANNEL_NO = "channelNo";

    // 第三方用户集成
    public static final String THIRD_PARTY_USER_ID = "thirdpartyUserId";   // 第三方用户ID
    public static final String PERSONAL_NO = "personalNo";                 // 个人编号
    public static final String PHONE = "phone";                            // 手机号码

    // 单点登录 引用
    public static final String CLIENT_ID = "clientId"; // 客户端id,单点登录
    public static final String DEVICE_TYPE = "deviceType"; // 终端类型，单点登录允许多设备类型同时登录比如 android, ios, web, mini_program, etc.

    
    // // @when 2021-12-23 add claim for DOMAIN_USER_ID from domain
    // @Deprecated
    // public static final String DOMAIN_USER_ID = "domainUserId";   // 业务逻辑上的 UserId, 相当于 PARTY_MEMBER_ID 用法

    // 第三方党员信息
    public static final String PARTY_MEMBER_ID = "partyMemberId"; // 党员id
    public static final String PARTY_ORGANIZATION_ID = "partyOrganizationId"; // 党组织id

    // 设备信息
    public static final String DEVICE_ID = "deviceId";      // 设备id
    public static final String DEVICE_NAME = "deviceName";  // 设备名称
    public static final String DEVICE_SN = "sn";            // 设备序列号
    public static final String TOKEN_TYPE = "tokenType";    // token类型 user, device
    public static final String TOKEN_TYPE_USER = "user"; // 分区ID, 用于分布式系统中标识数据分区
    public static final String TOKEN_TYPE_DEVICE = "device"; // 分区ID, 用于分布式系统中标识数据分区
    //@end jwt claims


    /**
     * 设置鉴权启用状态（仅允许调用一次，由 perm-core 在初始化时调用）
     * @param enabled true=启用鉴权，false=禁用鉴权
     * @throws IllegalStateException 如果已经配置过则拒绝修改
     */
    public static synchronized void setAuthenticationEnabled(boolean enabled) {
        if (authenticationConfigured) {
            // 防止被重复设置或恶意修改
            throw new IllegalStateException("Authentication setting is already configured");
        }
        authenticationEnabled = enabled;
        authenticationConfigured = true;
    }

    /**
     * 获取鉴权启用状态
     */
    public static boolean isAuthenticationEnabled() {
        return authenticationEnabled;
    }

    /**
     * 设置无鉴权时的默认 appid（仅在没有 perm-core 依赖时允许调用）
     * @param appid 默认的 appid 值
     * @throws IllegalStateException 如果已配置鉴权（有 perm-core 依赖）则拒绝设置
     */
    public static synchronized void setAuthenticationAppid(String appid) {
        if (authenticationConfigured) {
            throw new IllegalStateException("Cannot set authenticationAppid when authentication is configured (perm-core is present)");
        }
        authenticationAppid = appid;
    }

    /**
     * 设置 X-APPID-KEY 解析器
     * @param resolver AppidKeyResolver 实例
     */
    public static synchronized void setAppidKeyResolver(AppidKeyResolver resolver) {
        appidKeyResolver = resolver;
    }

    /**
     * 获取 X-APPID-KEY 解析器
     * @return AppidKeyResolver 实例，未设置返回 null
     */
    public static AppidKeyResolver getAppidKeyResolver() {
        return appidKeyResolver;
    }

    public static HttpServletRequest getRequest() {
        return ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
    }

    public static void setData(Claims claims) {
        setData(getRequest(), claims);
    }

    public static Date getIssuedAt() {
        return getIssuedAt(getRequest());
    }

    public static void setIssuedAt(Object issuedAt) {
        setIssuedAt(getRequest(), issuedAt);
    }

    public static void setUserId(Object userId) {
        setUserId(getRequest(), userId);
    }

    public static void setOrgId(Object orgId) {
        setOrgId(getRequest(), orgId);
    }

    public static void setAccount(Object account) {
        setAccount(getRequest(), account);
    }

    public static Long getUserId() {
        final String X_USER_ID = "X-USER-ID";
        HttpServletRequest request = getRequest();

        Long userId = getUserId(request);
        if(userId==null){
            return toLong(request.getHeader(X_USER_ID), null);
        }
        return userId;
    }

    public static Long getOrgId() {
        final String X_ORG_ID = "X-ORG-ID";
        HttpServletRequest request = getRequest();

        Long orgId = getOrgId(request);
        if (orgId == null) {
            orgId = toLong(request.getHeader(X_ORG_ID), null);
        }

        // 如果鉴权已配置且启用，orgId 为 null 时抛出异常
        // 注意：如果未配置（authenticationConfigured=false），说明没有 perm-core 依赖
        //       此时保持兼容性，返回默认值 1L
        if (authenticationConfigured && authenticationEnabled && orgId == null) {
            throw new NotAuthenticatedException("用户未登录");
        }

        // 如果未配置鉴权或禁用鉴权且 orgId 为 null，返回默认值
        if (orgId == null) {
            return 1L;
        }

        return orgId;
    }

    public static Integer  getType(){
        return getType(getRequest());
    }

    public static String getAccount() {
        return getAccount(getRequest())==null?"admin":getAccount(getRequest());
    }

    public static Integer getUserType(){return getUserType(getRequest()); }
    @Deprecated
    public static Long getTenantId() {
        return getTenantId(getRequest());
    }

    public static Long getTenantOrgId() {
        return getTenantOrgId(getRequest())==null?getOrgId():getTenantOrgId(getRequest());
    }

    public static Long getDefaultTenantOrgId(){
        Long id = getTenantOrgId();
        return id==null?1L:id;
    }

    //@Deprecated
    //public static String getBUserType(){return getBUserType(getRequest()); }

    //@Deprecated
    //public static Long getBUserId(){return getBUserId(getRequest()); }

    public static void setPartyMemberId(ServletRequest request, Object partyMemberId) {
        request.setAttribute(PARTY_MEMBER_ID, partyMemberId);
    }

    public static Integer getPartyMemberId() {
        HttpServletRequest request = getRequest();
        if (StringUtils.isEmpty(request.getAttribute(PARTY_MEMBER_ID))) {
            return null;
        }
        return Integer.parseInt(request.getAttribute(PARTY_MEMBER_ID).toString());
    }

    public static void setPartyOrganizationId(ServletRequest request, Object partyOrganizationId) {
        request.setAttribute(PARTY_ORGANIZATION_ID, partyOrganizationId);
    }

    public static Integer getPartyOrganizationId() {
        HttpServletRequest request = getRequest();
        if (StringUtils.isEmpty(request.getAttribute(PARTY_ORGANIZATION_ID))) {
            return null;
        }
        return Integer.parseInt(request.getAttribute(PARTY_ORGANIZATION_ID).toString());
    }

    public static void setDeviceId(ServletRequest request, Object deviceId) {
        request.setAttribute(DEVICE_ID, deviceId);
    }

    public static Long getDeviceId() {
        HttpServletRequest request = getRequest();
        return toLong(request.getAttribute(DEVICE_ID),null);
    }

    public static void setDeviceName(ServletRequest request, Object deviceName) {
        request.setAttribute(DEVICE_NAME, deviceName);
    }

    public static String getDeviceName() {
        HttpServletRequest request = getRequest();
        return request.getAttribute(DEVICE_NAME) != null ? request.getAttribute(DEVICE_NAME).toString() : null;
    }

    public static void setDeviceSn(ServletRequest request, Object deviceSn) {
        request.setAttribute(DEVICE_SN, deviceSn);
    }

    public static String getDeviceSn() {
        HttpServletRequest request = getRequest();
        return request.getAttribute(DEVICE_SN) != null ? request.getAttribute(DEVICE_NAME).toString() : null;
    }

    public static void setTokenType(ServletRequest request, Object tokenType) {
        request.setAttribute(TOKEN_TYPE, tokenType);
    }

    public static String getTokenType() {
        HttpServletRequest request = getRequest();
        return request.getAttribute(TOKEN_TYPE) != null ? request.getAttribute(TOKEN_TYPE).toString() : null;
    }

    public static void setDeviceType(ServletRequest request, Object deviceType) {
        request.setAttribute(DEVICE_TYPE, deviceType);
    }

    public static String getDeviceType() {
        return getDeviceType(getRequest());
    }

    public static String getDeviceType(ServletRequest request) {
        Object value = request.getAttribute(DEVICE_TYPE);
        return value == null ? null : value.toString();
    }

    public static void setData(ServletRequest request, Claims claims) {
        setUserId(request, claims.get(USER_ID));
        setAppid(request, claims.get(APPID));
        setOrgId(request, claims.get(ORG_ID));
        setAccount(request, claims.get(ACCOUNT));
        setUserType(request,claims.get(USER_TYPE));
        setTenantOrgId(request,claims.get(TENANT_ORG_ID));
        setDevUserType(request,claims.get(DEV_USER_TYPE));
        setIssuedAt(request, claims.getIssuedAt());
        
        setType(request,claims.get(TYPE));

        // @when 2021-10,channelNo
        setChannelNo(request, claims.get(CHANNEL_NO));
        // END

        // // @when 2021-12-23, + setDevUserType+setDomainUserId
        // setDomainUserId(request, claims.get(DOMAIN_USER_ID));

        setThirdpartyUserId(request, claims.get(THIRD_PARTY_USER_ID));
        setPersonalNo(request, claims.get(PERSONAL_NO));
        setPhone(request, claims.get(PHONE));

        setPartyMemberId(request, claims.get(PARTY_MEMBER_ID));
        setPartyOrganizationId(request, claims.get(PARTY_ORGANIZATION_ID));
        setDeviceId(request, claims.get(DEVICE_ID));
        setDeviceName(request, claims.get(DEVICE_NAME));
        setDeviceType(request, claims.get(DEVICE_TYPE));
        setTokenType(request, claims.get(TOKEN_TYPE));
    }

    public static Date getIssuedAt(ServletRequest request) {
        return (Date) request.getAttribute(ISSUED_AT);
    }

    public static void setIssuedAt(ServletRequest request, Object issuedAt) {request.setAttribute(ISSUED_AT, issuedAt);}

    public static void setUserId(ServletRequest request, Object userId) {request.setAttribute(USER_ID, userId);}

    public static void setOrgId(ServletRequest request, Object orgId) {
        request.setAttribute(ORG_ID, orgId);
    }

    public static void setAccount(ServletRequest request, Object account) {request.setAttribute(ACCOUNT, account);}

    public static void setUserType(ServletRequest request, Object userType) {request.setAttribute(USER_TYPE, userType);}

    public static void setType(ServletRequest request, Object type) {
        request.setAttribute(TYPE, type);
    }
    
    public static void setAppid(ServletRequest request, Object appid) {
        request.setAttribute(APPID, appid);
    }

    public static void setTenantOrgId(ServletRequest request, Object tenantOrgId) {request.setAttribute(TENANT_ORG_ID, tenantOrgId);}

    public static void setChannelNo(ServletRequest request, Object channelNo) {
        request.setAttribute(CHANNEL_NO, channelNo);
    }

    @Deprecated
    public static void setDevUserType(ServletRequest request, Object userType) {request.setAttribute(DEV_USER_TYPE, userType);}

    public static Integer getDevUserType(ServletRequest request) {
        if(request.getAttribute(DEV_USER_TYPE)!=null) {
            return Integer.parseInt(request.getAttribute(DEV_USER_TYPE).toString());
        }
        return null;
    }

    public static Integer getDevUserType() {
        return getDevUserType(getRequest());
    }

    public static Long getTenantOrgId(ServletRequest request) {
        return toLong(request.getAttribute(TENANT_ORG_ID),null);
    }

    public static Long getUserId(ServletRequest request) {
        return toLong(request.getAttribute(USER_ID), null);
    }

    public static Integer getUserType(ServletRequest request) {
        if(request.getAttribute(USER_TYPE)!=null) {
            return Integer.parseInt(request.getAttribute(USER_TYPE).toString());
        }
        return null;
    }

    public static Long getOrgId(ServletRequest request) {
        return toLong(request.getAttribute(ORG_ID), null);
    }

    public static String getAccount(ServletRequest request) {
        return (String) request.getAttribute(ACCOUNT);
    }

    

    public static Integer getType(ServletRequest request) {
        return (Integer) request.getAttribute(TYPE);
    }

    public static String getAppid(ServletRequest request) {
        return (String) request.getAttribute(APPID);
    }

    public static String getAppid() {
        HttpServletRequest request = getRequest();

        // 1. 优先从 X-APPID-KEY header 解析
        if (appidKeyResolver != null) {
            String appidKey = request.getHeader(AppidKeyResolver.HEADER_APPID_KEY);
            logger.debug("JWTKit.getAppid() - appidKeyResolver registered, X-APPID-KEY header: {}", appidKey);
            if (appidKey != null && !appidKey.isEmpty()) {
                String resolvedAppid = appidKeyResolver.resolveAppid(appidKey);
                logger.debug("JWTKit.getAppid() - resolveAppid() returned: {}", resolvedAppid);
                if (resolvedAppid != null) {
                    // 缓存到 request attribute 避免重复解析
                    request.setAttribute(APPID, resolvedAppid);
                    logger.debug("JWTKit.getAppid() - returning from X-APPID-KEY: {}", resolvedAppid);
                    return resolvedAppid;
                }
                // X-APPID-KEY 存在但验证失败，拒绝请求
                logger.warn("JWTKit.getAppid() - X-APPID-KEY present but validation failed, rejecting request");
                throw new NotAuthenticatedException("Invalid X-APPID-KEY: signature verification failed or appid not found");
            }
        } else {
            logger.debug("JWTKit.getAppid() - appidKeyResolver is NULL");
        }

        // 2. 从 request attribute 获取（JWT claims 解析后设置）
        String appid = (String) request.getAttribute(APPID);
        if (appid != null) {
            logger.debug("JWTKit.getAppid() - returning from request attribute: {}", appid);
            return appid;
        }

        // 3. 默认逻辑
        if (authenticationConfigured && authenticationEnabled) {
            logger.debug("JWTKit.getAppid() - authentication enabled, returning null");
            return null;
        }
        logger.debug("JWTKit.getAppid() - returning authenticationAppid: {}", authenticationAppid);
        return authenticationAppid;
    }

    public static String getChannelNo(ServletRequest request) {
        Object value = request.getAttribute(CHANNEL_NO);
        return value == null ? null : value.toString();
    }

    public static String getChannelNo() {
        return getChannelNo(getRequest());
    }

    public static void setThirdpartyUserId(ServletRequest request, Object thirdpartyUserId) {
        request.setAttribute(THIRD_PARTY_USER_ID, thirdpartyUserId);
    }

    public static Long getThirdpartyUserId(ServletRequest request) {
        return toLong(request.getAttribute(THIRD_PARTY_USER_ID), null);
    }

    public static Long getThirdpartyUserId() {
        return getThirdpartyUserId(getRequest());
    }

    public static void setPersonalNo(ServletRequest request, Object personalNo) {
        request.setAttribute(PERSONAL_NO, personalNo);
    }

    public static String getPersonalNo(ServletRequest request) {
        Object value = request.getAttribute(PERSONAL_NO);
        return value == null ? null : value.toString();
    }

    public static String getPersonalNo() {
        return getPersonalNo(getRequest());
    }

    public static void setPhone(ServletRequest request, Object phone) {
        request.setAttribute(PHONE, phone);
    }

    public static String getPhone(ServletRequest request) {
        Object value = request.getAttribute(PHONE);
        return value == null ? null : value.toString();
    }

    public static String getPhone() {
        return getPhone(getRequest());
    }

    @Deprecated
    public static Long getTenantId(ServletRequest request) {
        return getOrgId(request);
    }

    // /**
    //  * DOMAIN_USER_ID
    //  * @param request
    //  */
    // public static Long getDomainUserId(ServletRequest request) {
    //     var id = toLong(request.getAttribute(DOMAIN_USER_ID), null);
    //     return id;
    // }

    // public static void setDomainUserId(ServletRequest request, Object userId) {
    //     request.setAttribute(DOMAIN_USER_ID, userId);
    // }

    // public static Long getDomainUserId() {
    //     return getDomainUserId(getRequest());
    // }


    /***
     * super admin
     * @return
     */
    public static boolean checkIsAdmin(){
        String account = JWTKit.getAccount();
        Integer userType = JWTKit.getUserType();

        // 平台组织或 用户类型是 应用平台管理员
        return ADMIN.equals(account) && (SYS_ORG_ID.equals(JWTKit.getOrgId()) || USER_TYPE_APP_ADMIN == userType);
    }

    /**
     * 用于将`token claims`转换为`long`值
     * @param value
     * @param defaultValue
     * @return
     */
    private static Long toLong(Object value, Long defaultValue) {
        try {
            if (value == null) {
                return defaultValue;
            }

            String str = value.toString().trim();
            if (StringUtils.isEmpty(str) || "null".equals(str.toLowerCase())) {
                return defaultValue;
            }
            if (str.startsWith("N") || str.startsWith("n")) {
                return -Long.parseLong(str.substring(1));
            }

            return Long.parseLong(value.toString().trim());
        }
        catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }



    /**
     * 获取请求的域名
     */
    public static String getDomain() {
        HttpServletRequest request = getRequest();
        return getDomain(request);
    }

    public static String getDomain(HttpServletRequest request){
        /**
         * update date: 2023-4-6
         * update content: 只获取域名，不再获取端口
         */
        // StringBuffer requestURL = request.getRequestURL();
        // int api = requestURL.indexOf("/api/");
        // int http = requestURL.indexOf("/");
        // String hostName = requestURL.substring(http+2,api);
        String hostName = request.getServerName();
        // logger.info("-------------- 获取到的域名："+hostName+" ---------------------");
        return hostName;
    }

    /**
     * 获取请求的域名（包含端口）
     */
    public static String getEndpoint() {
        HttpServletRequest request = getRequest();
        return getEndpoint(request);
    }


    /**
     * 获取请求的域名
     * 
     * @param request HTTP请求对象
     * @return 域名字符串，如果解析失败则返回null
     */
    public static String getEndpoint(HttpServletRequest request) {
        try {
            // 获取完整请求URL
            String requestURLString = request.getRequestURL().toString();
            URL url = new URL(requestURLString);
            
            // 获取域名（包含端口，如果有的话）
            String domain = url.getHost();
            int port = url.getPort();
            
            // 如果端口不是默认端口（-1表示未指定），则添加端口号
            if (port != -1) {
                domain = domain + ":" + port;
            }
            return domain;
        } catch (MalformedURLException e) {
            return null;
        }
    }

    
    /**
     * 获取请求的完整域名（包含协议）
     */
    public static String getFullUrl() {
        HttpServletRequest request = getRequest();
        return getFullUrl(request);
    }

    /**
     * 获取请求的完整域名（包含协议）
     * 
     * @param request HTTP请求对象
     * @return 完整域名字符串，如果解析失败则返回null
     */
    public static String getFullUrl(HttpServletRequest request) {
        try {
            // 获取完整请求URL
            String requestURLString = request.getRequestURL().toString();
            URL url = new URL(requestURLString);
            
            // 构建完整域名（协议 + 域名 + 端口）
            String protocol = url.getProtocol();
            String domain = url.getHost();
            int port = url.getPort();
            
            StringBuilder fullUrl = new StringBuilder();
            fullUrl.append(protocol).append("://").append(domain);
            
            // 如果端口不是默认端口（-1表示未指定），则添加端口号
            if (port != -1) {
                fullUrl.append(":").append(port);
            }
            
            return fullUrl.toString();
        } catch (MalformedURLException e) {
            return null;
        }
    }



    /**
     * 将相对路径与基础 URL 拼接成完整 URL
     * 
     * 该方法会检查路径是否已经是完整 URL（以 http:// 或 https:// 开头），
     * 如果是则直接返回原路径，否则将其与基础 URL 拼接。
     * 
     * @param relativePath 相对路径或资源路径，如 "api/users" 或 "/images/logo.png"
     * @return 拼接后的完整 URL，如果输入无效或路径已是完整 URL 则返回原路径
     */
    public static String getFullUrl(String relativePath) {
        return getFullUrl(relativePath, getFullUrl());
    }

    public static String getFullUrl(String relativePath, String _domainUrl) {
        final String HTTP_PREFIX = "http://";
        final String HTTPS_PREFIX = "https://";

        Assert.isTrue(!(relativePath == null || relativePath.isBlank()), "relativePath is required !");

        String domainUrl = (_domainUrl==null || _domainUrl.isBlank()) ? getFullUrl() : _domainUrl;
        
        // 检查是否已是完整 URL
        if (relativePath.startsWith(HTTP_PREFIX) || relativePath.startsWith(HTTPS_PREFIX)) {
            return relativePath;
        }
        
        // 标准化路径和域名格式
        String normalizedPath = relativePath.startsWith("/") ? relativePath : "/" + relativePath;
        String normalizedDomain = domainUrl.endsWith("/") ? domainUrl.substring(0, domainUrl.length() - 1) : domainUrl;
        
        // 拼接并返回完整 URL
        return normalizedDomain + normalizedPath;
    }
}
