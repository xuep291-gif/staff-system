package com.jfeat.am.core.jwt;

import com.jfeat.am.config.properties.JwtProperties;
import com.jfeat.am.core.sso.EndUserAuthRedisPlugin;
import com.jfeat.am.core.util.JwtSpringContextHolder;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;

import io.jsonwebtoken.lang.Assert;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Service;

/**
 * NormalJwtService 属移动前端用户,没有权限访问系统源
 */

@Service
@DependsOn({"jwtSpringContextHolder"})
public class UserJwtService {
    Logger log = LoggerFactory.getLogger(JWTService.class.getSimpleName());

    @Resource
    private JwtProperties jwtProperties;

    public static UserJwtService me() {
        return JwtSpringContextHolder.getBean(UserJwtService.class);
    }

    public String createToken(Long orgId, Long userId, String account,Integer type) {
        return this.createJWT(orgId, userId, account, null, this.jwtProperties.getTtlMillis(),type, "", "", null, null, null, null, null, null);
    }
    public String createToken(Long orgId, Long userId, String account,Integer type, String appid) {
        return this.createJWT(orgId, userId, account, null, this.jwtProperties.getTtlMillis(),type, appid, "", null, null, null, null, null, null);
    }
    /**
     * @when 2021-12-23 add claim for domainUserId
     * @when 2025-05-17 renamed to thirdpartyUserId
     * @param thirdpartyUserId 业务层用户ID (第三方用户ID)
     * @return
     */
    public String createToken(Long orgId, Long userId, String account, Long thirdpartyUserId,Integer type) {
        return this.createJWT(orgId, userId, account, thirdpartyUserId, this.jwtProperties.getTtlMillis(),type, "", "", null, null, null, null, null, null, null);
    }
    public String createToken(Long orgId, Long userId, String account, Long thirdpartyUserId,Integer type, String appid) {
        return this.createJWT(orgId, userId, account, thirdpartyUserId, this.jwtProperties.getTtlMillis(),type, appid, "", null, null, null, null, null, null, null);
    }

    /**
     * added in 2024.10.10
     * 创建token，根据新的业务(融合App)要求增加 userName 和 organizationUser
     * @param orgId 组织id
     * @param userId 用户id
     * @param account 用户账号
     * @param type 用户类型
     * @param userName 用户名
     * @param organizationUser 是否是组织用户
     * @return
     */
    public String createToken(Long orgId, Long userId, String account, Integer type, String userName, Integer organizationUser) {
        return this.createJWT(orgId, userId, account, null, this.jwtProperties.getTtlMillis(),type, "", userName, organizationUser, null, null, null, null, null, null);
    }

    /**
     * added in 2025.1.3
     * 增加 partyMemberId(党员id) 和 partyOrganizationId(党组织id)
     * @param orgId
     * @param userId
     * @param account
     * @param type
     * @param userName
     * @param organizationUser
     * @param partyMemberId
     * @param partyOrganizationId
     * @return
     */
    public String createToken(Long orgId, Long userId, String account, Integer type, String userName, Integer organizationUser, Integer partyMemberId, Integer partyOrganizationId) {
        return this.createJWT(orgId, userId, account, null, this.jwtProperties.getTtlMillis(),type, "", userName, organizationUser, partyMemberId, partyOrganizationId, null, null, null, null);
    }

    /**
     * 增加deviceType 和 clientId
     * @param orgId
     * @param userId
     * @param account
     * @param type
     * @param userName
     * @param organizationUser
     * @param partyMemberId
     * @param partyOrganizationId
     * @param deviceType
     * @param clientId
     * @return
     */
    public String createToken(Long orgId, Long userId, String account, Integer type, String userName, Integer organizationUser, Integer partyMemberId, Integer partyOrganizationId, String deviceType, String clientId) {
        return this.createJWT(orgId, userId, account, null, this.jwtProperties.getTtlMillis(),type, "", userName, organizationUser, partyMemberId, partyOrganizationId, deviceType, clientId, null, null);
    }

    /**
     * 新增 channelNo 透传
     */
    public String createToken(Long orgId, Long userId, String account, Integer type, String userName, Integer organizationUser, Integer partyMemberId, Integer partyOrganizationId, String deviceType, String clientId, String channelNo) {
        return this.createJWT(orgId, userId, account, null, this.jwtProperties.getTtlMillis(),type, "", userName, organizationUser, partyMemberId, partyOrganizationId, deviceType, clientId, channelNo, null);
    }

    /**
     * 新增 personalNo 和 thirdpartyUserId 透传
     * @param orgId
     * @param userId
     * @param account
     * @param type
     * @param userName
     * @param organizationUser
     * @param partyMemberId
     * @param partyOrganizationId
     * @param deviceType
     * @param clientId
     * @param channelNo
     * @param personalNo
     * @param thirdpartyUserId
     * @return
     */
    public String createToken(Long orgId, Long userId, String account, Integer type, String userName, Integer organizationUser, Integer partyMemberId, Integer partyOrganizationId, String deviceType, String clientId, String channelNo, String personalNo, Long thirdpartyUserId) {
        return this.createJWT(orgId, userId, account, thirdpartyUserId, this.jwtProperties.getTtlMillis(),type, "", userName, organizationUser, partyMemberId, partyOrganizationId, deviceType, clientId, channelNo, personalNo, null);
    }

    /**
     * 新增 phone 透传
     * @param orgId
     * @param userId
     * @param account
     * @param type
     * @param deviceType
     * @param clientId
     * @param channelNo
     * @param personalNo
     * @param thirdpartyUserId
     * @param phone
     * @return
     */
    public String createToken(Long orgId, Long userId, String account, Integer type, String deviceType, String clientId, String channelNo, String personalNo, Long thirdpartyUserId, String phone) {
        return this.createJWT(orgId, userId, account, thirdpartyUserId, this.jwtProperties.getTtlMillis(),type, "", null, null, null, null, deviceType, clientId, channelNo, personalNo, phone);
    }

    public String createDeviceToken(String deviceId, String deviceSn, String deviceName, Long orgId, String channelNo) {
        long nowMillis = System.currentTimeMillis();
        long ttlMillis = this.jwtProperties.getTtlMillis();
        Date now = new Date(nowMillis);
        JwtBuilder builder = Jwts.builder().setHeaderParam("type", "JWT")
                .claim(JWTKit.DEVICE_ID, deviceId)
                .claim(JWTKit.DEVICE_SN, deviceSn)
                .claim(JWTKit.DEVICE_NAME, deviceName)
                .claim(JWTKit.ORG_ID, orgId==null?"":orgId)
                .claim(JWTKit.CHANNEL_NO, channelNo)
                .claim("tokenType", "device")
                .setIssuedAt(now)
                .setId(deviceId.toString())
                .setSubject(deviceName.toString())
                .signWith(this.getSecretKey());
        if (ttlMillis >= 0L) {
            long expMillis = nowMillis + ttlMillis;
            Date exp = new Date(expMillis);
            builder.setExpiration(exp);
        }
        return builder.compact();
    }

    public Claims parseToken(String token) {
        try {
            return this.parseJWT(token);
        } catch (Exception ex) {
            // ex.printStackTrace();
            // log.debug("current token not match the signature key, go ahead next chain filter ..");
            return null;
        }
    }

    public long getExpiresIn() {
        return this.jwtProperties.getTtlMillis();
    }

    public String getTokenType() {
        return this.jwtProperties.getTokenType();
    }

    private String createJWT(Long orgId, Long userId, String account, Long thirdpartyUserId, long ttlMillis,Integer type, String appid, String userName, Integer organizationUser, Integer partyMemberId, Integer partyOrganizationId, String deviceType, String clientId) {
        return createJWT(orgId, userId, account, thirdpartyUserId, ttlMillis, type, appid, userName, organizationUser, partyMemberId, partyOrganizationId, deviceType, clientId, null, null);
    }

    // overload with channelNo
    private String createJWT(Long orgId, Long userId, String account, Long thirdpartyUserId, long ttlMillis,Integer type, String appid, String userName, Integer organizationUser, Integer partyMemberId, Integer partyOrganizationId, String deviceType, String clientId, String channelNo) {
        return createJWT(orgId, userId, account, thirdpartyUserId, ttlMillis, type, appid, userName, organizationUser, partyMemberId, partyOrganizationId, deviceType, clientId, channelNo, null);
    }

    // overload with personalNo and thirdpartyUserId
    private String createJWT(Long orgId, Long userId, String account, Long thirdpartyUserId, long ttlMillis,Integer type, String appid, String userName, Integer organizationUser, Integer partyMemberId, Integer partyOrganizationId, String deviceType, String clientId, String channelNo, String personalNo) {
        return createJWT(orgId, userId, account, thirdpartyUserId, ttlMillis, type, appid, userName, organizationUser, partyMemberId, partyOrganizationId, deviceType, clientId, channelNo, personalNo, null);
    }

    // overload with phone
    private String createJWT(Long orgId, Long userId, String account, Long thirdpartyUserId, long ttlMillis,Integer type, String appid, String userName, Integer organizationUser, Integer partyMemberId, Integer partyOrganizationId, String deviceType, String clientId, String channelNo, String personalNo, String phone) {
        Assert.isTrue(userId!=null, "user.id is null !");
        Assert.isTrue(account!=null, "user.account is null !");

        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        JwtBuilder builder = Jwts.builder().setHeaderParam("type", "JWT")
                .claim("orgId", orgId==null?"":orgId)
                .claim("userId", userId)
                .claim("account", account)
                .claim("thirdpartyUserId", thirdpartyUserId==null?"":thirdpartyUserId)
                .claim("type",type==null?"":type)
                .claim("appid",appid==null?"":appid)
                .claim("name", userName == null ? "" : userName)
                .claim("organizationUser", organizationUser == null ? 0 : organizationUser)
                .claim("partyMemberId", partyMemberId == null ? "" : partyMemberId)
                .claim("partyOrganizationId", partyOrganizationId == null ? "" : partyOrganizationId)
                .claim("deviceType", deviceType == null || deviceType.isBlank() ? "" : deviceType)
                .claim("clientId", clientId == null || clientId.isBlank() ? "" : clientId)
                .claim("channelNo", channelNo)
                .claim("personalNo", personalNo == null || personalNo.isBlank() ? "" : personalNo)
                .claim("phone", phone == null || phone.isBlank() ? "" : phone)
                .claim("tokenType", "user")
                .setIssuedAt(now)
                .setId(userId.toString())
                .setSubject(account)
                .signWith(this.getSecretKey());

        if (ttlMillis >= 0L) {
            long expMillis = nowMillis + ttlMillis;
            Date exp = new Date(expMillis);
            builder.setExpiration(exp);
        }

        return builder.compact();
    }

    private Claims parseJWT(String jwt) {
        return Jwts.parser()
                .verifyWith(this.getSecretKey())
                .build()
                .parseSignedClaims(jwt).getPayload();
    }

    private SecretKey deserializeKey(String encodedKey) {
        byte[] decodedKey = Base64.getDecoder().decode(encodedKey);
        return Keys.hmacShaKeyFor(decodedKey);
    }

    private SecretKey getSecretKey() {
        // try {
        //     return this.deserializeKey(new String(this.jwtProperties.getNormalEncodedKey().getBytes(Charset.forName("UTF-8")),"UTF-8"));
        // } catch (UnsupportedEncodingException e) {
        //     e.printStackTrace();
        // }
        return this.deserializeKey(this.jwtProperties.getNormalEncodedKey());
    }

    private String serializeKey(Key key) {
        return Base64.getEncoder().encodeToString(key.getEncoded());
    }


    /**
     * check Token for cut point
     */
    public static void checkToken() {
        HttpServletRequest request = JWTKit.getRequest();
        String token = request.getParameter("access_token");
        if (token == null || "".equals(token)) {
            String authHeader = request.getHeader("authorization");
            Assert.isTrue(authHeader!=null && authHeader.startsWith("Bearer "), "Missing or invalid Authorization header");

            token = authHeader.substring(7);
            Claims claims = UserJwtService.me().parseToken(token);
            Assert.isTrue(claims!=null, "Missing or invalid Authorization header");
            Assert.isTrue(!claims.getExpiration().before(new Date(System.currentTimeMillis())), "token was expired");

            JWTKit.setData(request, claims);
        }
    }


    /**
     * 设备单点登录插件接口，在UserAccount模块redis中获取缓存token
     */
//    public static class AuthRedisPluginTool {
//        private EndUserAuthRedisPlugin _plugin = null;
//
//        // 服务是否已注入
//        public boolean injected() {
//            return _plugin != null;
//        }
//
//        public EndUserAuthRedisPlugin setTokenTool(EndUserAuthRedisPlugin plugin) {
//            _plugin = plugin;
//            return _plugin;
//        }
//
//        public EndUserAuthRedisPlugin get() {
//            Assert.isTrue(_plugin != null, "终端用户授权token插件未初始化，请检查是否依赖了user-account模块!");
//            return _plugin;
//        }
//    }
//
//    private AuthRedisPluginTool tokenTool = new AuthRedisPluginTool();
//
//    public AuthRedisPluginTool getTokenTool(){
//        return tokenTool;
//    }

    private EndUserAuthRedisPlugin _tokenTool = null;

    // 服务是否已注入
    public boolean tokenToolInjected() {
        return _tokenTool != null;
    }

    public EndUserAuthRedisPlugin setTokenTool(EndUserAuthRedisPlugin plugin) {
        _tokenTool = plugin;
        return _tokenTool;
    }

    public EndUserAuthRedisPlugin getTokenTool() {
        Assert.isTrue(_tokenTool != null, "终端用户授权token插件未初始化，请检查是否依赖了user-account模块!");
        return _tokenTool;
    }
}
