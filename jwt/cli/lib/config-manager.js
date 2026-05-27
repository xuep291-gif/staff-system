/**
 * Appid Configuration Manager
 *
 * Manages appid configurations through:
 * 1. REST API (when BASE_URL is set)
 * 2. Direct YAML file modification (when APP_PATH is set)
 *
 * Configuration is read from .env file in the CLI directory.
 *
 * @since 21.0.0
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const http = require('http');
const https = require('https');

// Configuration file (.env in CLI directory)
const CLI_DIR = path.dirname(__dirname);
const ENV_FILE = path.join(CLI_DIR, '.env');

// Default YAML path (relative to jwt-core)
const DEFAULT_YAML_PATH = 'src/main/resources/application.yml';

/**
 * Load .env configuration
 * @returns {Object} Environment variables {BASE_URL, APP_PATH}
 */
function loadEnvConfig() {
    const config = {
        BASE_URL: null,
        APP_PATH: null
    };

    if (!fs.existsSync(ENV_FILE)) {
        return config;
    }

    const content = fs.readFileSync(ENV_FILE, 'utf8');
    content.split('\n').forEach(line => {
        const match = line.match(/^(\w+)=(.*)$/);
        if (match) {
            const [, key, value] = match;
            if (key === 'BASE_URL' || key === 'APP_PATH') {
                config[key] = value.trim();
            }
        }
    });

    return config;
}

/**
 * Get YAML file path from APP_PATH
 * @returns {string|null} Full path to application.yml
 */
function getYamlPath() {
    const env = loadEnvConfig();
    if (!env.APP_PATH) {
        return null;
    }

    const yamlPath = path.join(env.APP_PATH, DEFAULT_YAML_PATH);
    if (fs.existsSync(yamlPath)) {
        return yamlPath;
    }

    return null;
}

/**
 * Load YAML configuration
 * @returns {Object|null} Parsed YAML content
 */
function loadYamlConfig() {
    const yamlPath = getYamlPath();
    if (!yamlPath) {
        return null;
    }

    try {
        const content = fs.readFileSync(yamlPath, 'utf8');
        return yaml.load(content);
    } catch (error) {
        console.error(`Error loading YAML: ${error.message}`);
        return null;
    }
}

/**
 * Save YAML configuration
 * @param {Object} config - Configuration object to save
 * @returns {boolean} Success status
 */
function saveYamlConfig(config) {
    const yamlPath = getYamlPath();
    if (!yamlPath) {
        console.error('APP_PATH not set or application.yml not found');
        return false;
    }

    try {
        const content = yaml.dump(config, {
            indent: 2,
            lineWidth: -1,
            noRefs: true
        });
        fs.writeFileSync(yamlPath, content, 'utf8');
        return true;
    } catch (error) {
        console.error(`Error saving YAML: ${error.message}`);
        return false;
    }
}

/**
 * Make HTTP request to API
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 * @param {Object} data - Request body
 * @returns {Object} Response data
 */
function apiRequest(method, path, data = null) {
    const env = loadEnvConfig();
    if (!env.BASE_URL) {
        throw new Error('BASE_URL not set in .env file');
    }

    const url = new URL(path, env.BASE_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    return new Promise((resolve, reject) => {
        const options = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search,
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            const jsonData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(jsonData);
        }

        const req = client.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const response = body ? JSON.parse(body) : {};
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(response);
                    } else {
                        reject(new Error(`API error: ${res.statusCode} - ${response.error || response.message || 'Unknown error'}`));
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${e.message}`));
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

/**
 * Check if using API mode
 * @returns {boolean}
 */
function isApiMode() {
    const env = loadEnvConfig();
    return !!env.BASE_URL;
}

/**
 * Check if using YAML mode
 * @returns {boolean}
 */
function isYamlMode() {
    const env = loadEnvConfig();
    return !!env.APP_PATH;
}

/**
 * Get all appid configurations
 * @returns {Promise<Object.<string, AppidConfig>>} Map of appid to configuration
 */
async function getAllAppids() {
    if (isApiMode()) {
        const response = await apiRequest('GET', '/dev/cfg/appid');
        return response.appids || {};
    } else if (isYamlMode()) {
        const config = loadYamlConfig();
        if (!config || !config.jwt || !config.jwt['appid-key'] || !config.jwt['appid-key'].configs) {
            return {};
        }
        return config.jwt['appid-key'].configs;
    } else {
        console.error('Neither BASE_URL nor APP_PATH is configured');
        console.error(`Please create .env file in: ${ENV_FILE}`);
        console.error('Example:');
        console.error('  BASE_URL=http://localhost:8080');
        console.error('  or');
        console.error('  APP_PATH=../jwt-core');
        throw new Error('No configuration mode available');
    }
}

/**
 * Get a specific appid configuration
 * @param {string} appid - Application identifier
 * @returns {Promise<AppidConfig|null>} Configuration object or null if not found
 */
async function getAppid(appid) {
    if (isApiMode()) {
        try {
            const response = await apiRequest('GET', `/dev/cfg/appid/${appid}`);
            return response;
        } catch (error) {
            if (error.message.includes('404')) {
                return null;
            }
            throw error;
        }
    } else if (isYamlMode()) {
        const appids = await getAllAppids();
        return appids[appid] || null;
    } else {
        throw new Error('No configuration mode available');
    }
}

/**
 * Add or update an appid configuration
 * @param {string} appid - Application identifier
 * @param {Object} options - Configuration options
 * @param {string} options.secret - Secret key (auto-generated if not provided)
 * @param {number} options.validityDays - Validity in days (default: 30)
 * @param {string} options.expireDate - Expiration date in YYYY-MM-DD format
 * @returns {Promise<AppidConfig>} The created/updated configuration
 */
async function setAppid(appid, options = {}) {
    const crypto = require('crypto');

    if (isApiMode()) {
        const secret = options.secret || crypto.randomBytes(32).toString('base64');
        const data = {
            secret,
            validityDays: options.validityDays || 30,
            expireDate: options.expireDate || null
        };

        await apiRequest('POST', `/dev/cfg/appid/${appid}`, data);

        return {
            appid,
            secret,
            validityDays: data.validityDays,
            expireDate: data.expireDate,
            enabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    } else if (isYamlMode()) {
        const config = loadYamlConfig();
        if (!config.jwt) config.jwt = {};
        if (!config.jwt['appid-key']) config.jwt['appid-key'] = {};
        if (!config.jwt['appid-key'].configs) config.jwt['appid-key'].configs = {};

        const existing = config.jwt['appid-key'].configs[appid];
        const secret = options.secret || (existing?.secret) || crypto.randomBytes(32).toString('base64');

        const appidConfig = {
            secret,
            enabled: options.enabled ?? true
        };

        if (options.expireDate) {
            appidConfig['expire-date'] = options.expireDate;
        } else {
            appidConfig['validity-days'] = options.validityDays || 30;
        }

        config.jwt['appid-key'].configs[appid] = appidConfig;
        saveYamlConfig(config);

        return {
            appid,
            secret,
            validityDays: options.validityDays || 30,
            expireDate: options.expireDate || null,
            enabled: true,
            createdAt: existing?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    } else {
        throw new Error('No configuration mode available');
    }
}

/**
 * Remove an appid configuration
 * @param {string} appid - Application identifier
 * @returns {Promise<boolean>} True if removed, false if not found
 */
async function removeAppid(appid) {
    if (isApiMode()) {
        await apiRequest('DELETE', `/dev/cfg/appid/${appid}`);
        return true;
    } else if (isYamlMode()) {
        const config = loadYamlConfig();
        if (!config.jwt?.['appid-key']?.configs || !config.jwt['appid-key'].configs[appid]) {
            return false;
        }
        delete config.jwt['appid-key'].configs[appid];
        saveYamlConfig(config);
        return true;
    } else {
        throw new Error('No configuration mode available');
    }
}

/**
 * Enable an appid
 * @param {string} appid - Application identifier
 * @returns {Promise<boolean>} True if enabled, false if not found
 */
async function enableAppid(appid) {
    if (isApiMode()) {
        await apiRequest('POST', `/dev/cfg/appid/${appid}/enable`);
        return true;
    } else if (isYamlMode()) {
        const config = loadYamlConfig();
        if (!config.jwt?.['appid-key']?.configs?.[appid]) {
            return false;
        }
        config.jwt['appid-key'].configs[appid].enabled = true;
        saveYamlConfig(config);
        return true;
    } else {
        throw new Error('No configuration mode available');
    }
}

/**
 * Disable an appid
 * @param {string} appid - Application identifier
 * @returns {Promise<boolean>} True if disabled, false if not found
 */
async function disableAppid(appid) {
    if (isApiMode()) {
        await apiRequest('POST', `/dev/cfg/appid/${appid}/disable`);
        return true;
    } else if (isYamlMode()) {
        const config = loadYamlConfig();
        if (!config.jwt?.['appid-key']?.configs?.[appid]) {
            return false;
        }
        config.jwt['appid-key'].configs[appid].enabled = false;
        saveYamlConfig(config);
        return true;
    } else {
        throw new Error('No configuration mode available');
    }
}

/**
 * Set secret for an appid
 * @param {string} appid - Application identifier
 * @param {string} secret - New secret key
 * @returns {Promise<boolean>} True if updated, false if not found
 */
async function setSecret(appid, secret) {
    if (isApiMode()) {
        await apiRequest('POST', `/dev/cfg/appid/${appid}/secret`, { secret });
        return true;
    } else if (isYamlMode()) {
        const config = loadYamlConfig();
        if (!config.jwt?.['appid-key']?.configs?.[appid]) {
            return false;
        }
        config.jwt['appid-key'].configs[appid].secret = secret;
        saveYamlConfig(config);
        return true;
    } else {
        throw new Error('No configuration mode available');
    }
}

/**
 * Set authentication validity for an appid
 * @param {string} appid - Application identifier
 * @param {number|string} authValue - Days (number) or expire date (YYYY-MM-DD)
 * @returns {Promise<boolean>} True if updated, false if not found
 */
async function setAuth(appid, authValue) {
    if (isApiMode()) {
        let data;
        if (typeof authValue === 'number') {
            data = { validityDays: authValue };
        } else {
            data = { expireDate: authValue };
        }
        await apiRequest('POST', `/dev/cfg/appid/${appid}/auth`, data);
        return true;
    } else if (isYamlMode()) {
        const config = loadYamlConfig();
        if (!config.jwt?.['appid-key']?.configs?.[appid]) {
            return false;
        }

        if (typeof authValue === 'number') {
            config.jwt['appid-key'].configs[appid]['validity-days'] = authValue;
            delete config.jwt['appid-key'].configs[appid]['expire-date'];
        } else {
            config.jwt['appid-key'].configs[appid]['expire-date'] = authValue;
            delete config.jwt['appid-key'].configs[appid]['validity-days'];
        }
        saveYamlConfig(config);
        return true;
    } else {
        throw new Error('No configuration mode available');
    }
}

/**
 * Generate X-APPID-KEY for an appid
 * @param {string} appid - Application identifier
 * @param {boolean} saveKey - Whether to save the generated key to config
 * @returns {Promise<string>} X-APPID-KEY
 */
async function generateKey(appid, saveKey = false) {
    if (isApiMode()) {
        const response = await apiRequest('POST', `/dev/cfg/appid/${appid}/generate`, { saveKey });
        return response.key;
    } else if (isYamlMode()) {
        const appidKeyModule = require('./appid-key.js');
        const appids = await getAllAppids();
        const config = appids[appid];
        if (!config) {
            throw new Error(`Appid '${appid}' not found in configuration`);
        }
        const key = appidKeyModule.generateKey(appid, config.secret);

        // Save generated key to config if requested
        if (saveKey) {
            await saveGeneratedKey(appid, key);
        }

        return key;
    } else {
        throw new Error('No configuration mode available');
    }
}

/**
 * Save generated X-APPID-KEY to configuration
 * @param {string} appid - Application identifier
 * @param {string} key - X-APPID-KEY to save
 * @returns {Promise<boolean>} True if saved successfully
 */
async function saveGeneratedKey(appid, key) {
    if (isApiMode()) {
        await apiRequest('POST', `/dev/cfg/appid/${appid}/key`, { key });
        return true;
    } else if (isYamlMode()) {
        const config = loadYamlConfig();
        if (!config.jwt?.['appid-key']?.configs?.[appid]) {
            throw new Error(`Appid '${appid}' not found in configuration`);
        }
        config.jwt['appid-key'].configs[appid].key = key;
        saveYamlConfig(config);
        return true;
    } else {
        throw new Error('No configuration mode available');
    }
}

/**
 * Get configuration mode info
 * @returns {Object} Mode information
 */
function getModeInfo() {
    const env = loadEnvConfig();
    return {
        mode: env.BASE_URL ? 'API' : (env.APP_PATH ? 'YAML' : 'NONE'),
        baseUrl: env.BASE_URL,
        appPath: env.APP_PATH,
        yamlPath: getYamlPath(),
        envFile: ENV_FILE
    };
}

module.exports = {
    loadEnvConfig,
    getAllAppids,
    getAppid,
    setAppid,
    removeAppid,
    enableAppid,
    disableAppid,
    setSecret,
    setAuth,
    generateKey,
    getModeInfo,
    isApiMode,
    isYamlMode,
    ENV_FILE,
    DEFAULT_YAML_PATH
};
