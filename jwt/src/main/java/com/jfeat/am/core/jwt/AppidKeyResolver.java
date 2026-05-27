package com.jfeat.am.core.jwt;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.Nullable;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * X-APPID-KEY 解析器
 *
 * <p>X-APPID-KEY 格式: {appid_hash}.{timestamp}.{signature}
 * 使用 HMAC-SHA256 签名，签名数据为: {appid}.{timestamp}
 *
 * <p>appid_hash: HMAC-SHA256(appid, 使用全局固定派生密钥) 的前 16 个字符
 * 这种方式将 appid 隐式编码在 key 中，保护真实 appid 不被直接暴露
 *
 * <p>每个 appid 可配置独立密钥和过期时间
 *
 * @author jwt-core
 * @since 21.0.0
 */
public class AppidKeyResolver {

    private static final Logger logger = LoggerFactory.getLogger(AppidKeyResolver.class);

    private static final String HMAC_SHA256_ALGORITHM = "HmacSHA256";
    private static final String KEY_PART_SEPARATOR = ".";

    /**
     * appid 哈希派生密钥（固定值，用于生成 appid_hash）
     * 注意：这是一个固定的派生密钥，不是每个 appid 的密钥
     */
    private static final String APPID_HASH_DERIVATION_KEY = "X7K9mP2vN8wR4tY6uJ0fG5hC1dE8sZ3oP6nQ9";

    /**
     * appid_hash 长度（从 HMAC-SHA256 结果中截取的字符数）
     */
    private static final int APPID_HASH_LENGTH = 16;

    /**
     * 永久有效的 appid 列表（用于开发环境）
     * 这些 appid 的 X-APPID-KEY 永不过期，且 resolveAppid() 返回 null
     */
    private static final Set<String> PERMANENT_APPIDS = Set.of("root", "none");

    /**
     * 判断 appid 是否为永久有效
     *
     * @param appid 应用标识
     * @return true=永久有效，false=需要验证过期时间
     */
    private boolean isPermanentAppid(String appid) {
        return PERMANENT_APPIDS.contains(appid);
    }

    /**
     * X-APPID-KEY HTTP Header 名称
     */
    public static final String HEADER_APPID_KEY = "X-APPID-KEY";

    /**
     * Appid 配置缓存：appid -> AppidConfig
     */
    private final Map<String, AppidConfig> configCache = new ConcurrentHashMap<>();

    /**
     * 默认配置（当 appid 未在缓存中找到时使用）
     */
    private AppidConfig defaultConfig;

    /**
     * Appid 配置
     */
    public static class AppidConfig {
        private final String appid;
        private final String secret;
        private final long validityMs;
        private final boolean enabled;
        private final boolean permanent;

        public AppidConfig(String appid, String secret, long validityMs, boolean enabled, boolean permanent) {
            this.appid = appid;
            this.secret = secret;
            this.validityMs = validityMs;
            this.enabled = enabled;
            this.permanent = permanent;
        }

        public String getAppid() {
            return appid;
        }

        public String getSecret() {
            return secret;
        }

        public long getValidityMs() {
            return validityMs;
        }

        public boolean isEnabled() {
            return enabled;
        }

        public boolean isPermanent() {
            return permanent;
        }
    }

    /**
     * 设置默认配置（用于 appid 不在配置中的情况）
     *
     * @param secret 密钥
     * @param validityDays 有效期（天）
     */
    public void setDefaultConfig(String secret, int validityDays) {
        this.defaultConfig = new AppidConfig("*", secret, Duration.ofDays(validityDays).toMillis(), true, false);
        logger.info("Set default AppidKeyResolver config with validityDays={}", validityDays);
    }

    /**
     * 添加或更新 appid 配置
     *
     * @param appid 应用标识
     * @param secret 密钥
     * @param validityDays 有效期（天）
     */
    public void addConfig(String appid, String secret, int validityDays) {
        boolean permanent = isPermanentAppid(appid);
        AppidConfig config = new AppidConfig(appid, secret, Duration.ofDays(validityDays).toMillis(), true, permanent);
        configCache.put(appid, config);
        logger.info("Added appid config: appid={}, validityDays={}, permanent={}", appid, validityDays, permanent);
    }

    /**
     * 添加或更新 appid 配置（指定过期日期）
     *
     * @param appid 应用标识
     * @param secret 密钥
     * @param expireDate 过期日期（yyyy-MM-dd），对于永久 appid（dev/none）此参数被忽略
     */
    public void addConfig(String appid, String secret, String expireDate) {
        boolean permanent = isPermanentAppid(appid);
        if (!permanent) {
            LocalDate expire = LocalDate.parse(expireDate);
            long validityMs = expire.atStartOfDay(ZoneId.systemDefault())
                    .toInstant()
                    .toEpochMilli() - System.currentTimeMillis();
            if (validityMs <= 0) {
                throw new IllegalArgumentException("Expire date must be in the future: " + expireDate);
            }
            AppidConfig config = new AppidConfig(appid, secret, validityMs, true, permanent);
            configCache.put(appid, config);
            logger.info("Added appid config: appid={}, expireDate={}", appid, expireDate);
        } else {
            // For permanent appids, ignore expireDate
            AppidConfig config = new AppidConfig(appid, secret, 0, true, true);
            configCache.put(appid, config);
            logger.info("Added permanent appid config: appid={}", appid);
        }
    }

    /**
     * 批量添加配置
     *
     * @param configs 配置列表
     */
    public void addConfigs(Map<String, AppidConfig> configs) {
        configCache.putAll(configs);
        logger.info("Added {} appid configs", configs.size());
    }

    /**
     * 移除 appid 配置
     *
     * @param appid 应用标识
     */
    public void removeConfig(String appid) {
        configCache.remove(appid);
        logger.info("Removed appid config: appid={}", appid);
    }

    /**
     * 禁用 appid
     *
     * @param appid 应用标识
     */
    public void disableAppid(String appid) {
        AppidConfig config = configCache.get(appid);
        if (config != null) {
            configCache.put(appid, new AppidConfig(appid, config.getSecret(), config.getValidityMs(), false, config.isPermanent()));
            logger.info("Disabled appid: appid={}", appid);
        }
    }

    /**
     * 启用 appid
     *
     * @param appid 应用标识
     */
    public void enableAppid(String appid) {
        AppidConfig config = configCache.get(appid);
        if (config != null) {
            configCache.put(appid, new AppidConfig(appid, config.getSecret(), config.getValidityMs(), true, config.isPermanent()));
            logger.info("Enabled appid: appid={}", appid);
        }
    }

    /**
     * 刷新 appid 密钥（使旧 Key 失效）
     *
     * @param appid 应用标识
     * @param newSecret 新密钥
     */
    public void refreshSecret(String appid, String newSecret) {
        AppidConfig oldConfig = configCache.get(appid);
        if (oldConfig == null) {
            logger.warn("Cannot refresh secret for non-existent appid: appid={}", appid);
            return;
        }
        AppidConfig newConfig = new AppidConfig(appid, newSecret, oldConfig.getValidityMs(), oldConfig.isEnabled(), oldConfig.isPermanent());
        configCache.put(appid, newConfig);
        logger.info("Refreshed secret for appid: appid={}", appid);
    }

    /**
     * 生成 appid 的哈希值（用于隐式编码在 X-APPID-KEY 中）
     *
     * @param appid 应用标识
     * @return appid 的哈希值（16 位十六进制字符串）
     */
    private String hashAppid(String appid) {
        String hash = hmacSha256(APPID_HASH_DERIVATION_KEY, appid);
        return hash.substring(0, APPID_HASH_LENGTH);
    }

    /**
     * 生成 X-APPID-KEY
     *
     * @param appid 应用标识
     * @return X-APPID-KEY 字符串，格式: {appid_hash}.{timestamp}.{signature}
     * @throws IllegalArgumentException 如果 appid 不存在或已禁用
     */
    public String generateKey(String appid) {
        AppidConfig config = getConfig(appid);
        if (config == null || !config.isEnabled()) {
            throw new IllegalArgumentException("Invalid or disabled appid: " + appid);
        }

        long timestamp = System.currentTimeMillis();
        String appidHash = hashAppid(appid);

        // 签名数据: appidHash.timestamp
        String dataToSign = appidHash + KEY_PART_SEPARATOR + timestamp;
        String signature = hmacSha256(config.getSecret(), dataToSign);

        // 返回格式: appid_hash.timestamp.signature
        return appidHash + KEY_PART_SEPARATOR + timestamp + KEY_PART_SEPARATOR + signature;
    }

    /**
     * 解析 X-APPID-KEY 并验证
     *
     * X-APPID-KEY 格式: {appid_hash}.{timestamp}.{signature}
     * 通过 appid_hash 快速定位对应的 appid 配置
     *
     * @param key X-APPID-KEY 字符串
     * @return 解析出的 appid，验证失败返回 null
     */
    @Nullable
    public String resolveAppid(String key) {
        if (key == null || key.isEmpty()) {
            return null;
        }

        String[] parts = key.split("\\.");
        if (parts.length != 3) {
            logger.debug("Invalid X-APPID-KEY format: {}", key);
            return null;
        }

        String providedAppidHash = parts[0];
        long timestamp;
        try {
            timestamp = Long.parseLong(parts[1]);
        } catch (NumberFormatException e) {
            logger.debug("Invalid timestamp in X-APPID-KEY: {}", key);
            return null;
        }

        String providedSignature = parts[2];

        // 通过 appid_hash 反向查找 appid
        // 遍历所有配置的 appid，计算其 hash 并与提供的 hash 比较
        for (Map.Entry<String, AppidConfig> entry : configCache.entrySet()) {
            String appid = entry.getKey();
            AppidConfig config = entry.getValue();

            if (!config.isEnabled()) {
                continue;
            }

            // 计算该 appid 的 hash，并与 key 中的 hash 比较
            String appidHash = hashAppid(appid);
            if (!appidHash.equals(providedAppidHash)) {
                continue;  // hash 不匹配，尝试下一个 appid
            }

            // hash 匹配，验证签名
            String dataToSign = appidHash + KEY_PART_SEPARATOR + timestamp;
            String expectedSignature = hmacSha256(config.getSecret(), dataToSign);

            if (!expectedSignature.equals(providedSignature)) {
                logger.debug("Signature mismatch for appid: {}", appid);
                return null;
            }

            // 签名验证通过，检查过期时间
            if (!config.isPermanent()) {
                long currentTime = System.currentTimeMillis();
                if (currentTime - timestamp > config.getValidityMs()) {
                    logger.debug("X-APPID-KEY expired for appid: {}", appid);
                    return null;
                }
            }

            // 对于永久 appid（root, none），返回 null
            if (config.isPermanent()) {
                logger.debug("Resolved permanent appid, returning null: {}", appid);
                return null;
            }

            logger.debug("Successfully resolved appid: {}", appid);
            return appid;
        }

        // 如果缓存中没有匹配，尝试默认配置
        if (defaultConfig != null && defaultConfig.isEnabled()) {
            String appidHash = hashAppid(defaultConfig.getAppid());
            if (appidHash.equals(providedAppidHash)) {
                String dataToSign = appidHash + KEY_PART_SEPARATOR + timestamp;
                String expectedSignature = hmacSha256(defaultConfig.getSecret(), dataToSign);

                if (expectedSignature.equals(providedSignature)) {
                    if (!defaultConfig.isPermanent()) {
                        long currentTime = System.currentTimeMillis();
                        if (currentTime - timestamp > defaultConfig.getValidityMs()) {
                            logger.debug("X-APPID-KEY expired for default config");
                            return null;
                        }
                    }

                    if (defaultConfig.isPermanent()) {
                        logger.debug("Resolved permanent default appid, returning null");
                        return null;
                    }

                    logger.debug("Successfully resolved appid using default config");
                    return defaultConfig.getAppid();
                }
            }
        }

        logger.debug("No matching appid found for X-APPID-KEY: {}", key);
        return null;
    }

    /**
     * 验证 X-APPID-KEY 是否有效
     *
     * @param key X-APPID-KEY 字符串
     * @return true=有效，false=无效
     */
    public boolean isValid(String key) {
        return resolveAppid(key) != null;
    }

    /**
     * 从 X-APPID-KEY 中提取 appid（不验证签名）
     *
     * 注意：新格式 {appid_hash}.{timestamp}.{signature} 中的 appid_hash
     * 是通过 HMAC 计算的，无法直接反向推导出原始 appid。
     * 此方法始终返回 null，请使用 resolveAppid() 进行完整验证
     *
     * @param key X-APPID-KEY 字符串
     * @return null (无法从 appid_hash 反向推导 appid)
     */
    @Nullable
    public String extractAppid(String key) {
        // appid_hash 是单向哈希，无法反向推导出原始 appid
        // 必须使用 resolveAppid() 进行完整验证
        return null;
    }

    /**
     * 获取 appid 配置
     */
    private AppidConfig getConfig(String appid) {
        // 先从缓存查找
        AppidConfig config = configCache.get(appid);
        if (config != null) {
            return config;
        }
        // 使用默认配置
        return defaultConfig;
    }

    /**
     * HMAC-SHA256 签名
     *
     * @param secret 密钥
     * @param data 待签名数据
     * @return 十六进制签名字符串
     */
    private String hmacSha256(String secret, String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256_ALGORITHM);
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8),
                HMAC_SHA256_ALGORITHM
            );
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Failed to compute HMAC-SHA256", e);
        }
    }

    /**
     * 字节数组转十六进制字符串
     */
    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }

    /**
     * 获取所有已配置的 appid
     *
     * @return appid 集合
     */
    public Map<String, AppidConfig> getAllConfigs() {
        return Map.copyOf(configCache);
    }

    /**
     * 清空所有配置
     */
    public void clearConfigs() {
        configCache.clear();
        logger.info("Cleared all appid configs");
    }
}
