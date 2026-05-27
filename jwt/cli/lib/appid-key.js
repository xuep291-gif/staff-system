/**
 * X-APPID-KEY Generator (Node.js CLI)
 *
 * Unified X-APPID-KEY generation tool with .env integration
 *
 * Generates X-APPID-KEY in format: {appid_hash}.{timestamp}.{signature}
 *
 * Commands:
 *   generate    Generate X-APPID-KEY (default)
 *   env         Generate and update .env file
 *   help        Show help message
 *
 * @since 21.0.0
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Constants
const HMAC_SHA256_ALGORITHM = 'sha256';
const KEY_PART_SEPARATOR = '.';
const APPID_HASH_DERIVATION_KEY = 'X7K9mP2vN8wR4tY6uJ0fG5hC1dE8sZ3oP6nQ9';
const APPID_HASH_LENGTH = 16;
const DEFAULT_SECRET_BYTES = 32;

// ANSI Color codes
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

// Disable colors in non-TTY environments
if (!process.stdout.isTTY) {
    Object.keys(colors).forEach(key => {
        colors[key] = '';
    });
}

/**
 * Colored console output
 */
function colorize(color, text) {
    return `${colors[color]}${text}${colors.reset}`;
}

/**
 * Generate appid hash (for implicit encoding in X-APPID-KEY)
 */
function hashAppid(appid) {
    const hash = hmacSha256(APPID_HASH_DERIVATION_KEY, appid);
    return hash.substring(0, APPID_HASH_LENGTH);
}

/**
 * Generate a secure random secret key
 */
function generateSecret() {
    const secretBytes = crypto.randomBytes(DEFAULT_SECRET_BYTES);
    return secretBytes.toString('base64');
}

/**
 * HMAC-SHA256 signature
 */
function hmacSha256(secret, data) {
    const hmac = crypto.createHmac(HMAC_SHA256_ALGORITHM, secret);
    hmac.update(data);
    return hmac.digest('hex');
}

/**
 * Generate X-APPID-KEY
 */
function generateKey(appid, secret) {
    const timestamp = Date.now();
    const appidHash = hashAppid(appid);
    const dataToSign = appidHash + KEY_PART_SEPARATOR + timestamp;
    const signature = hmacSha256(secret, dataToSign);
    return appidHash + KEY_PART_SEPARATOR + timestamp + KEY_PART_SEPARATOR + signature;
}

/**
 * Generate X-APPID-KEY with auto-generated secret
 */
function generateKeyWithSecret(appid) {
    const secret = generateSecret();
    const key = generateKey(appid, secret);
    return { appid, secret, key };
}

/**
 * Find .env file in common locations
 */
function findEnvFile() {
    const searchPaths = [
        path.join(process.cwd(), '.env'),
        path.join(process.cwd(), 'cli', '.env'),
        path.join(process.cwd(), '..', 'cli', '.env'),
        path.join(process.env.HOME || process.env.USERPROFILE, 'workspace', 'clis', 'category', '.env')
    ];

    for (const envPath of searchPaths) {
        if (fs.existsSync(envPath)) {
            return envPath;
        }
    }
    return null;
}

/**
 * Update .env file with key-value pair
 */
function updateEnvFile(envFilePath, key, value) {
    let content = '';
    let updated = false;

    if (fs.existsSync(envFilePath)) {
        content = fs.readFileSync(envFilePath, 'utf8');
    }

    const lines = content.split('\n');
    const newLines = [];

    for (const line of lines) {
        if (line.startsWith(`${key}=`)) {
            newLines.push(`${key}=${value}`);
            updated = true;
            console.log(colorize('green', `  Updated: ${key}=${value.substring(0, 50)}...`));
        } else {
            newLines.push(line);
        }
    }

    if (!updated) {
        if (newLines.length > 0 && newLines[newLines.length - 1] !== '') {
            newLines.push('');
        }
        newLines.push(`${key}=${value}`);
        console.log(colorize('green', `  Added: ${key}=${value.substring(0, 50)}...`));
    }

    fs.writeFileSync(envFilePath, newLines.join('\n'));
}

/**
 * Generate YAML configuration snippet
 */
function toYamlConfig(keyInfo) {
    return `jwt:
  appid-key:
    configs:
      ${keyInfo.appid}:
        secret: "${keyInfo.secret}"`;
}

/**
 * Generate curl test command
 */
function toCurlCommand(keyInfo, url = 'http://localhost:8080/api/endpoint') {
    return `curl ${url} -H "X-APPID-KEY: ${keyInfo.key}"`;
}

/**
 * Format key information as string
 */
function formatKeyInfo(keyInfo) {
    return `
${colorize('cyan', '━'.repeat(65))}
${colorize('green', '🔑 Appid Key Information')}
${colorize('cyan', '━'.repeat(65))}
Appid:        ${keyInfo.appid}
Secret:       ${keyInfo.secret}
Appid Hash:   ${hashAppid(keyInfo.appid)}
X-APPID-KEY:  ${keyInfo.key}
${colorize('cyan', '━'.repeat(65))}`;
}

/**
 * Print usage information
 */
function printUsage() {
    console.log(colorize('green', 'Usage:'));
    console.log('  appid-key <command> [options]');
    console.log('  appid-key <appid> [secret]           # Shortcut for generate');
    console.log('');
    console.log(colorize('green', 'Commands:'));
    console.log('  generate    Generate X-APPID-KEY (default)');
    console.log('  env         Generate and update .env file');
    console.log('  help        Show this help message');
    console.log('');
    console.log(colorize('green', 'Arguments:'));
    console.log('  appid       Application identifier (required)');
    console.log('  secret      Secret key for signing (optional, auto-generated if not provided)');
    console.log('');
    console.log(colorize('green', 'Examples:'));
    console.log('  appid-key generate my-app                    # Auto-generate secret');
    console.log('  appid-key generate my-app "my-secret"        # Custom secret');
    console.log('  appid-key env my-app                         # Generate and update .env');
    console.log('  appid-key my-app                             # Shortcut for generate');
    console.log('');
    console.log(colorize('green', 'Output:'));
    console.log('  - X-APPID-KEY value');
    console.log('  - Generated secret (if auto-generated)');
    console.log('  - Curl test command');
    console.log('  - YAML configuration snippet');
}

/**
 * Print curl command
 */
function printCurlCommand(key) {
    const url = 'http://localhost:8080/api/endpoint';
    console.log('');
    console.log(colorize('cyan', '━'.repeat(65)));
    console.log(colorize('green', 'Test with curl:'));
    console.log(colorize('cyan', '━'.repeat(65)));
    console.log(`${colorize('yellow', 'curl')} ${url} \\`);
    console.log(`  ${colorize('blue', '-H')} "X-APPID-KEY: ${key}"`);
    console.log(colorize('cyan', '━'.repeat(65)));
    console.log('');
}

/**
 * Main CLI entry point
 */
function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        printUsage();
        process.exit(1);
    }

    // Parse command
    let command = 'generate';
    let argIndex = 0;

    if (args[0] === 'help' || args[0] === '-h' || args[0] === '--help') {
        printUsage();
        process.exit(0);
    }

    if (args[0] === 'generate' || args[0] === 'env') {
        command = args[0];
        argIndex = 1;
    }

    // Get appid
    if (argIndex >= args.length) {
        console.error(colorize('red', 'Error: appid is required'));
        printUsage();
        process.exit(1);
    }

    const appid = args[argIndex];
    const secret = args[argIndex + 1];

    // Validate appid format
    if (!/^[a-zA-Z0-9_-]+$/.test(appid)) {
        console.error(colorize('red', 'Error: Invalid appid format. Only letters, numbers, hyphen and underscore are allowed.'));
        process.exit(1);
    }

    // Generate key
    console.log(colorize('cyan', '━'.repeat(65)));
    console.log(colorize('green', `Generating X-APPID-KEY for: ${appid}`));
    console.log(colorize('cyan', '━'.repeat(65)));
    console.log('');

    let keyInfo;
    if (secret) {
        const key = generateKey(appid, secret);
        keyInfo = { appid, secret, key };
    } else {
        keyInfo = generateKeyWithSecret(appid);
    }

    console.log(formatKeyInfo(keyInfo));
    console.log('');
    console.log(colorize('cyan', '# application.yml'));
    console.log(toYamlConfig(keyInfo));
    console.log('');
    console.log(colorize('cyan', '# Test with curl:'));
    console.log(toCurlCommand(keyInfo));
    printCurlCommand(keyInfo.key);

    // Update .env if requested
    if (command === 'env') {
        console.log(colorize('cyan', '━'.repeat(65)));
        console.log(colorize('cyan', 'Updating .env file...'));
        console.log(colorize('cyan', '━'.repeat(65)));

        const envFile = findEnvFile();

        if (!envFile) {
            console.log(colorize('yellow', 'Warning: No .env file found'));
            console.log(colorize('yellow', 'Searched paths:'));
            console.log(colorize('yellow', '  - ./.env'));
            console.log(colorize('yellow', '  - ./cli/.env'));
            console.log(colorize('yellow', '  - ../cli/.env'));
            console.log(colorize('yellow', '  - ~/workspace/clis/category/.env'));
        } else {
            console.log(colorize('green', `Found: ${envFile}`));
            updateEnvFile(envFile, 'CATEGORY_APPID', appid);
            updateEnvFile(envFile, 'CATEGORY_APPID_KEY', keyInfo.key);
            console.log(colorize('cyan', '━'.repeat(65)));
            console.log(colorize('green', 'Configuration complete'));
            console.log(colorize('cyan', '━'.repeat(65)));
        }
    }
}

// Export functions for use as module
module.exports = {
    main,
    hashAppid,
    generateSecret,
    hmacSha256,
    generateKey,
    generateKeyWithSecret,
    verifyKey(appidKey, secret) {
        if (!appidKey || appidKey.length === 0) return null;
        const parts = appidKey.split('.');
        if (parts.length !== 3) return null;
        const [appidHash, timestampStr, signature] = parts;
        const dataToSign = appidHash + KEY_PART_SEPARATOR + timestampStr;
        const expectedSignature = hmacSha256(secret, dataToSign);
        return expectedSignature === signature ? appidHash : null;
    },
    parseKey(appidKey) {
        if (!appidKey || appidKey.length === 0) return null;
        const parts = appidKey.split('.');
        return parts.length === 3 ? parts[0] : null;
    },
    toYamlConfig,
    toCurlCommand,
    formatKeyInfo,
    findEnvFile,
    updateEnvFile
};
