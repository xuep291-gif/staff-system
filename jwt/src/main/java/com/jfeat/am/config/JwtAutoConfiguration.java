package com.jfeat.am.config;

import com.jfeat.am.config.properties.JwtProperties;
import com.jfeat.am.core.jwt.JWTKit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

/**
 * JWT 自动配置
 *
 * <p>配置方式（可选）：
 * <pre>
 * # application.yml
 * jwt:
 *   app: mdm              # 设置默认 appid
 *   app: none             # 设置为 null，getAppid() 直接返回 null
 *   app: null             # 同上
 * </pre>
 *
 * <p>说明：
 * <ul>
 *   <li>当配置为 "none"、"null"（不区分大小写）时，getAppid() 返回 null</li>
 *   <li>未配置时，使用默认行为</li>
 * </ul>
 *
 * @author jwt-core
 * @since 21.0.0
 */
@Configuration
@ConditionalOnProperty(prefix = JwtProperties.PREFIX, name = "encoded-key")
public class JwtAutoConfiguration {

    private static final Logger logger = LoggerFactory.getLogger(JwtAutoConfiguration.class);

    @Autowired
    private JwtProperties jwtProperties;

    @PostConstruct
    public void initAuthenticationAppid() {
        String app = jwtProperties.getApp();
        if (app != null && !app.isEmpty()) {
            // 处理特殊 null 值
            String normalized = app.trim().toLowerCase();
            if ("none".equals(normalized) || "null".equals(normalized)) {
                logger.info("JWT app is configured as null (value: {})", app);
                JWTKit.setAuthenticationAppid(null);
            } else {
                logger.info("JWT app is configured as: {}", app);
                JWTKit.setAuthenticationAppid(app);
            }
        } else {
            logger.debug("JWT app is not configured, using default behavior");
        }
    }
}
