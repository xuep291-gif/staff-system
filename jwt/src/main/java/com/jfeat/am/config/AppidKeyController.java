package com.jfeat.am.config;

import com.jfeat.am.core.jwt.AppidKeyResolver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * X-APPID-KEY Configuration REST API
 *
 * <p>Provides REST endpoints for managing appid configurations.
 * This is intended for development and operations use.
 *
 * <p>Base path: /dev/cfg/appid
 *
 * <p>Endpoints:
 * <ul>
 *   <li>GET    /dev/cfg/appid           - List all appid configs</li>
 *   <li>GET    /dev/cfg/appid/{appid}   - Get specific appid config</li>
 *   <li>POST   /dev/cfg/appid/{appid}   - Create/update appid config</li>
 *   <li>DELETE /dev/cfg/appid/{appid}   - Remove appid config</li>
 *   <li>POST   /dev/cfg/appid/{appid}/secret  - Update secret</li>
 *   <li>POST   /dev/cfg/appid/{appid}/auth    - Update auth (validity)</li>
 *   <li>POST   /dev/cfg/appid/{appid}/enable  - Enable appid</li>
 *   <li>POST   /dev/cfg/appid/{appid}/disable - Disable appid</li>
 *   <li>POST   /dev/cfg/appid/{appid}/generate - Generate X-APPID-KEY</li>
 * </ul>
 *
 * <p>To enable this controller, set:
 * <pre>
 * jwt.appid-key.api-enabled: true
 * </pre>
 *
 * @author jwt-core
 * @since 21.0.0
 */
@RestController
@RequestMapping("/dev/cfg/appid")
@ConditionalOnProperty(prefix = "jwt.appid-key", name = "api-enabled", havingValue = "true", matchIfMissing = false)
public class AppidKeyController {

    private static final Logger logger = LoggerFactory.getLogger(AppidKeyController.class);

    @Autowired
    private AppidKeyResolver appidKeyResolver;

    /**
     * List all appid configurations
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> listAppids() {
        Map<String, AppidKeyResolver.AppidConfig> configs = appidKeyResolver.getAllConfigs();

        Map<String, Object> response = new HashMap<>();
        response.put("total", configs.size());
        response.put("appids", configs);

        return ResponseEntity.ok(response);
    }

    /**
     * Get specific appid configuration
     */
    @GetMapping("/{appid}")
    public ResponseEntity<?> getAppid(@PathVariable String appid) {
        Map<String, AppidKeyResolver.AppidConfig> configs = appidKeyResolver.getAllConfigs();
        AppidKeyResolver.AppidConfig config = configs.get(appid);

        if (config == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(config);
    }

    /**
     * Create or update appid configuration
     *
     * Request body:
     * {
     *   "secret": "base64-encoded-secret",
     *   "validityDays": 30,
     *   "expireDate": "2027-12-31"
     * }
     */
    @PostMapping("/{appid}")
    public ResponseEntity<Map<String, Object>> setAppid(
            @PathVariable String appid,
            @RequestBody AppidConfigRequest request) {

        if (request.getSecret() == null || request.getSecret().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "secret is required");
            return ResponseEntity.badRequest().body(error);
        }

        // Add configuration
        if (request.getExpireDate() != null && !request.getExpireDate().isEmpty()) {
            appidKeyResolver.addConfig(appid, request.getSecret(), request.getExpireDate());
        } else {
            int days = request.getValidityDays() != null ? request.getValidityDays() : 30;
            appidKeyResolver.addConfig(appid, request.getSecret(), days);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("appid", appid);
        response.put("message", "Configuration updated");

        return ResponseEntity.ok(response);
    }

    /**
     * Remove appid configuration
     */
    @DeleteMapping("/{appid}")
    public ResponseEntity<Map<String, Object>> removeAppid(@PathVariable String appid) {
        appidKeyResolver.removeConfig(appid);

        Map<String, Object> response = new HashMap<>();
        response.put("appid", appid);
        response.put("message", "Configuration removed");

        return ResponseEntity.ok(response);
    }

    /**
     * Update secret for an appid
     *
     * Request body:
     * {
     *   "secret": "new-base64-encoded-secret"
     * }
     */
    @PostMapping("/{appid}/secret")
    public ResponseEntity<Map<String, Object>> updateSecret(
            @PathVariable String appid,
            @RequestBody Map<String, String> request) {

        String secret = request.get("secret");
        if (secret == null || secret.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "secret is required");
            return ResponseEntity.badRequest().body(error);
        }

        appidKeyResolver.refreshSecret(appid, secret);

        Map<String, Object> response = new HashMap<>();
        response.put("appid", appid);
        response.put("message", "Secret updated");

        return ResponseEntity.ok(response);
    }

    /**
     * Update authentication validity for an appid
     *
     * Request body:
     * {
     *   "validityDays": 30
     * }
     * or
     * {
     *   "expireDate": "2027-12-31"
     * }
     */
    @PostMapping("/{appid}/auth")
    public ResponseEntity<Map<String, Object>> updateAuth(
            @PathVariable String appid,
            @RequestBody Map<String, Object> request) {

        // Get current config to preserve secret
        Map<String, AppidKeyResolver.AppidConfig> configs = appidKeyResolver.getAllConfigs();
        AppidKeyResolver.AppidConfig current = configs.get(appid);

        if (current == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Appid not found");
            return ResponseEntity.notFound().build();
        }

        // Update with new auth settings
        String expireDate = (String) request.get("expireDate");
        if (expireDate != null && !expireDate.isEmpty()) {
            appidKeyResolver.addConfig(appid, current.getSecret(), expireDate);
        } else {
            int days = request.get("validityDays") != null
                ? ((Number) request.get("validityDays")).intValue()
                : 30;
            appidKeyResolver.addConfig(appid, current.getSecret(), days);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("appid", appid);
        response.put("message", "Auth configuration updated");

        return ResponseEntity.ok(response);
    }

    /**
     * Enable an appid
     */
    @PostMapping("/{appid}/enable")
    public ResponseEntity<Map<String, Object>> enableAppid(@PathVariable String appid) {
        appidKeyResolver.enableAppid(appid);

        Map<String, Object> response = new HashMap<>();
        response.put("appid", appid);
        response.put("message", "Appid enabled");

        return ResponseEntity.ok(response);
    }

    /**
     * Disable an appid
     */
    @PostMapping("/{appid}/disable")
    public ResponseEntity<Map<String, Object>> disableAppid(@PathVariable String appid) {
        appidKeyResolver.disableAppid(appid);

        Map<String, Object> response = new HashMap<>();
        response.put("appid", appid);
        response.put("message", "Appid disabled");

        return ResponseEntity.ok(response);
    }

    /**
     * Generate X-APPID-KEY for an appid
     */
    @PostMapping("/{appid}/generate")
    public ResponseEntity<Map<String, Object>> generateKey(@PathVariable String appid) {
        try {
            String key = appidKeyResolver.generateKey(appid);

            Map<String, Object> response = new HashMap<>();
            response.put("appid", appid);
            response.put("key", key);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Verify an X-APPID-KEY
     *
     * Request body:
     * {
     *   "key": "appid.hash.timestamp.signature"
     * }
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyKey(@RequestBody Map<String, String> request) {
        String key = request.get("key");
        if (key == null || key.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "key is required");
            return ResponseEntity.badRequest().body(error);
        }

        String resolvedAppid = appidKeyResolver.resolveAppid(key);
        boolean isValid = resolvedAppid != null;

        Map<String, Object> response = new HashMap<>();
        response.put("valid", isValid);
        response.put("appid", resolvedAppid);

        return ResponseEntity.ok(response);
    }

    /**
     * Request body for setAppid
     */
    public static class AppidConfigRequest {
        private String secret;
        private Integer validityDays;
        private String expireDate;

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public Integer getValidityDays() {
            return validityDays;
        }

        public void setValidityDays(Integer validityDays) {
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
