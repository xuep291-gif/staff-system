package com.jfeat.am.config;

import com.jfeat.am.core.jwt.AppidKeyResolver;
import com.jfeat.am.core.jwt.JWTKit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;

/**
 * X-APPID-KEY 自动配置
 *
 * <p>配置方式（可选）：
 * <pre>
 * # application.yml
 * jwt:
 *   appid-key:
 *     configs:
 *       school-001:
 *         secret: school-001-secret
 *         validity-days: 30
 *       school-002:
 *         secret: school-002-secret
 *         expire-date: "2027-12-31"
 *       root:
 *         secret: root-secret-key
 *       none:
 *         secret: none-secret-key
 * </pre>
 *
 * <p>说明：
 * <ul>
 *   <li>validity-days: 有效期天数（默认30天）</li>
 *   <li>expire-date: 过期日期（格式：YYYY-MM-DD），优先级高于 validity-days</li>
 *   <li>root 和 none 是永久 appid，配置后会自动跳过过期检查且 resolveAppid() 返回 null</li>
 * </ul>
 *
 * @author jwt-core
 * @since 21.0.0
 */
@Configuration
public class AppidKeyAutoConfiguration {

    private static final Logger logger = LoggerFactory.getLogger(AppidKeyAutoConfiguration.class);

    @Bean
    @ConditionalOnMissingBean
    public AppidKeyResolver appidKeyResolver(org.springframework.core.env.Environment env) {
        AppidKeyResolver resolver = new AppidKeyResolver();

        // 绑定配置
        AppidKeyProperties properties = Binder.get(env)
            .bind("jwt.appid-key", AppidKeyProperties.class)
            .orElse(new AppidKeyProperties());

        // 添加各 appid 配置
        Map<String, AppidKeyProperties.Config> configs = properties.getConfigs();
        if (configs != null && !configs.isEmpty()) {
            configs.forEach((appid, config) -> {
                // 优先使用 expireDate，如果没有则使用 validityDays
                if (config.getExpireDate() != null && !config.getExpireDate().isEmpty()) {
                    resolver.addConfig(appid, config.getSecret(), config.getExpireDate());
                } else {
                    resolver.addConfig(appid, config.getSecret(), config.getValidityDays());
                }
            });
            logger.info("AppidKeyResolver loaded {} appid config(s)", configs.size());
        } else {
            logger.info("AppidKeyResolver initialized with no appid configs");
        }

        // 注册到 JWTKit
        JWTKit.setAppidKeyResolver(resolver);
        logger.info("AppidKeyResolver registered to JWTKit");

        return resolver;
    }

    /**
     * 配置属性类
     */
    @ConfigurationProperties(prefix = "jwt.appid-key")
    public static class AppidKeyProperties {
        private Map<String, Config> configs = new HashMap<>();

        public Map<String, Config> getConfigs() {
            return configs;
        }

        public void setConfigs(Map<String, Config> configs) {
            this.configs = configs;
        }

        public static class Config {
            private String secret;
            private int validityDays = 30;
            private String expireDate;

            public String getSecret() {
                return secret;
            }

            public void setSecret(String secret) {
                this.secret = secret;
            }

            public int getValidityDays() {
                return validityDays;
            }

            public void setValidityDays(int validityDays) {
                this.validityDays = validityDays;
            }

            public String getExpireDate() {
                return expireDate;
            }

            public void setExpireDate(String expireDate) {
                this.expireDate = expireDate;
            }
        }
    }
}
