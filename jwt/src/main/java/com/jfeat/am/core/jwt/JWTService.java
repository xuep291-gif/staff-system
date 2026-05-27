package com.jfeat.am.core.jwt;

import com.jfeat.am.config.properties.JwtProperties;
import com.jfeat.am.core.util.JwtSpringContextHolder;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.util.Base64;
import java.util.Date;

/**
 * Created by jackyhuang on 2017/6/7.
 */
@Service
@DependsOn("jwtSpringContextHolder")
public class JWTService {
    Logger log = LoggerFactory.getLogger(JWTService.class.getSimpleName());

    @Autowired
    private JwtProperties jwtProperties;

    public static JWTService me() {
        return JwtSpringContextHolder.getBean(JWTService.class);
    }

    public String createToken(Long orgId, Long userId, String account,Integer userType, Long tenantOrgId, Integer devUserType, String appid) {
        return createJWT(orgId, userId, account, userType, jwtProperties.getTtlMillis(), tenantOrgId, devUserType, appid, null);
    }

    /**
     * insert date: 2023-04-10
     * 新增业务：需要获取后台管理用户的appid
     */
    public String createToken(Long orgId, Long userId, String account,Integer userType, Long tenantOrgId, Integer devUserType, String appid, Long partyOrganizationId) {
        return createJWT(orgId, userId, account, userType, jwtProperties.getTtlMillis(), tenantOrgId, devUserType, appid, partyOrganizationId);
    }

    @Deprecated
    public String createToken(Long orgId, Long userId, String account,Integer userType, Long tenantOrgId, Integer devUserType) {
        return createJWT(orgId, userId, account, userType, jwtProperties.getTtlMillis(), tenantOrgId, devUserType, "", null);
    }

    public Claims parseToken(String token) {
        try {
            Claims claims = parseJWT(token);
            return claims;
        } catch (Exception e) {
            //e.printStackTrace();
            //log.debug("current token not match the signature key, go ahead next chain filter ..");
            return null;
        }
    }

    public long getExpiresIn() {
        return jwtProperties.getTtlMillis();
    }

    public String getTokenType() {
        return jwtProperties.getTokenType();
    }

    private String createJWT(Long orgId, Long userId, String account,Integer userType, long ttlMillis, Long tenantOrgId, Integer devUserType, String appid, Long partyOrganizationId) {
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        JwtBuilder builder = Jwts.builder()
                .setHeaderParam("typ", "JWT")
                .claim("orgId", orgId + "")
                .claim("userId", userId + "")
                .claim("tenantOrgId", tenantOrgId)
                .claim("account", account)
                .claim("userType", userType)
                .claim("devUserType",devUserType)  // [1=Tester, 2=developer, 3=operator]
                .claim("appid", appid)
                .claim("partyOrganizationId", partyOrganizationId)
                .setIssuedAt(now)
                .setId(userId.toString())
                .setSubject(account)
                .signWith(getSecretKey());
        if (ttlMillis >= 0) {
            long expMillis = nowMillis + ttlMillis;
            Date exp = new Date(expMillis);
            builder.setExpiration(exp);
        }
        return builder.compact();
    }

    private Claims parseJWT(String jwt) throws Exception{
        Claims claims = Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(jwt).getPayload();
        return claims;
    }

    private SecretKey deserializeKey(String encodedKey) {
        if (encodedKey == null) {
            throw new IllegalArgumentException("Encoded key cannot be null");
        }
        //byte[] decodedKey = Base64.getDecoder().decode(encodedKey);
        byte[] decodedKey = Base64.getMimeDecoder().decode(encodedKey);
        return Keys.hmacShaKeyFor(decodedKey);
    }

    private SecretKey getSecretKey() {
        String encodedKey = jwtProperties.getEncodedKey();
        if (encodedKey == null) {
            log.warn("JWT encoded key is not configured. Generating a default secret key. " +
                     "Please configure 'jwt.encoded-key' property for production use.");
            SecretKey defaultKey = Keys.secretKeyFor(SignatureAlgorithm.HS512);
            encodedKey = serializeKey(defaultKey);
        }
        return deserializeKey(encodedKey);
    }

    private String serializeKey(Key key) {
        String encodedKey = Base64.getEncoder().encodeToString(key.getEncoded());
        return encodedKey;
    }
}
