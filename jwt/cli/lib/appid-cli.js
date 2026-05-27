/**
 * Appid CLI - Main CLI Implementation
 *
 * Provides command-line interface for appid key generation and configuration management.
 *
 * Configuration modes (via .env file):
 * - API mode: BASE_URL=http://localhost:8080
 * - YAML mode: APP_PATH=../jwt-core
 *
 * Commands:
 *   appid-cli appid <appid> gen-key              Generate X-APPID-KEY for appid
 *   appid-cli config appid list                  List all configured appids
 *   appid-cli config appid get <appid>           Get specific appid configuration
 *   appid-cli config appid <appid> secret [key]  Set/generate secret for appid
 *   appid-cli config appid <appid> auth <days>   Set validity in days
 *   appid-cli config appid <appid> auth <date>   Set expiration date (YYYY-MM-DD)
 *
 * @since 21.0.0
 */

const chalk = require('chalk');
const crypto = require('crypto');
const configManager = require('./config-manager.js');

// Import functions from appid-key.js
const appidKeyModule = require('./appid-key.js');

// Constants
const APPID_HASH_DERIVATION_KEY = 'X7K9mP2vN8wR4tY6uJ0fG5hC1dE8sZ3oP6nQ9';
const APPID_HASH_LENGTH = 16;

/**
 * Colored console output helper
 */
function colorize(color, text) {
    const colors = {
        reset: chalk.reset,
        red: chalk.red,
        green: chalk.green,
        yellow: chalk.yellow,
        blue: chalk.blue,
        cyan: chalk.cyan,
        bold: chalk.bold
    };
    return colors[color] ? colors[color](text) : text;
}

/**
 * Draw separator line
 */
function separator(char = '─', length = 65) {
    return char.repeat(length);
}

/**
 * Generate appid hash
 */
function hashAppid(appid) {
    const hash = appidKeyModule.hmacSha256(APPID_HASH_DERIVATION_KEY, appid);
    return hash.substring(0, APPID_HASH_LENGTH);
}

/**
 * Validate appid format
 */
function validateAppid(appid) {
    if (!/^[a-zA-Z0-9_-]+$/.test(appid)) {
        console.error(colorize('red', 'Error: Invalid appid format. Only letters, numbers, hyphen and underscore are allowed.'));
        process.exit(1);
    }
    return true;
}

/**
 * Display configuration mode
 */
function displayModeInfo() {
    const modeInfo = configManager.getModeInfo();
    const modeLabel = modeInfo.mode === 'API' ? colorize('green', 'API') :
                      modeInfo.mode === 'YAML' ? colorize('cyan', 'YAML') :
                      colorize('red', 'NOT CONFIGURED');

    console.log(colorize('cyan', `Mode: ${modeLabel}`));
    if (modeInfo.mode === 'API') {
        console.log(colorize('cyan', `API Base URL: ${modeInfo.baseUrl}`));
    } else if (modeInfo.mode === 'YAML') {
        console.log(colorize('cyan', `YAML Path: ${modeInfo.yamlPath}`));
    } else {
        console.log(colorize('yellow', `Create .env file at: ${modeInfo.envFile}`));
        console.log(colorize('yellow', '  With: BASE_URL=http://localhost:8080'));
        console.log(colorize('yellow', '  Or: APP_PATH=../jwt-core'));
    }
}

/**
 * Display key information
 */
async function displayKeyInfo(appid, appidConfig) {
    console.log('');
    console.log(colorize('cyan', separator('─')));
    console.log(colorize('green', '🔑 Appid Key Information'));
    console.log(colorize('cyan', separator('─')));
    console.log(`Appid:        ${appid}`);
    console.log(`Secret:       ${appidConfig.secret || '(hidden)'}`);
    console.log(`Appid Hash:   ${hashAppid(appid)}`);

    // Generate key and save to config
    const key = await configManager.generateKey(appid, true);
    console.log(`X-APPID-KEY:  ${key}`);
    console.log(colorize('green', `✓ Key saved to configuration`));
    console.log(colorize('cyan', separator('─')));

    // Display auth info
    if (appidConfig.expireDate || appidConfig['expire-date']) {
        const expireDate = appidConfig.expireDate || appidConfig['expire-date'];
        console.log(colorize('green', `Expires: ${expireDate}`));
    } else {
        const days = appidConfig.validityDays || appidConfig['validity-days'] || 30;
        console.log(colorize('green', `Valid for: ${days} days`));
    }
    console.log('');

    // Display curl command
    const url = 'http://localhost:8080/api/endpoint';
    console.log(colorize('cyan', separator('─')));
    console.log(colorize('green', 'Test with curl:'));
    console.log(colorize('cyan', separator('─')));
    console.log(`${colorize('yellow', 'curl')} ${url} \\`);
    console.log(`  ${colorize('blue', '-H')} "X-APPID-KEY: ${key}"`);
    console.log(colorize('cyan', separator('─')));
    console.log('');

    return key;
}

/**
 * Verify X-APPID-KEY command
 * appid-cli verify <key> [appid]
 */
async function cmdVerifyKey(key, appid = null) {
    try {
        console.log(colorize('cyan', separator('─')));
        console.log(colorize('green', 'Verifying X-APPID-KEY'));
        console.log(colorize('cyan', separator('─')));
        console.log('');

        const parts = key.split('.');
        if (parts.length !== 3) {
            console.error(colorize('red', '✗ Invalid key format (expected: hashed_appid.timestamp.signature)'));
            process.exit(1);
        }

        const [appidHash, timestampStr, signature] = parts;

        // Try to parse timestamp
        let timestamp;
        try {
            timestamp = parseInt(timestampStr);
        } catch (e) {
            console.error(colorize('red', '✗ Invalid timestamp format'));
            process.exit(1);
        }

        // Get appid configuration if provided
        let secret;
        let appidName = appid;

        if (appid) {
            const appidConfig = await configManager.getAppid(appid);
            if (appidConfig) {
                secret = appidConfig.secret;
            } else {
                console.error(colorize('red', `✗ Appid '${appid}' not found in configuration`));
                console.log(colorize('yellow', 'Available appids:'));
                const allAppids = await configManager.getAllAppids();
                Object.keys(allAppids).forEach(id => {
                    console.log(`  - ${id}`);
                });
                process.exit(1);
            }
        }

        if (!secret) {
            console.error(colorize('red', '✗ Secret not found. Please provide appid or use --secret option'));
            process.exit(1);
        }

        // Verify signature
        const dataToSign = appidHash + '.' + timestampStr;
        const expectedSignature = appidKeyModule.hmacSha256(secret, dataToSign);

        if (signature === expectedSignature) {
            console.log(colorize('green', '✓ Signature is valid'));
            console.log('');
            console.log(`  Appid Hash:   ${appidHash}`);
            console.log(`  Timestamp:    ${timestampStr}`);
            console.log(`  Signature:    ${signature}`);
            console.log('');
            console.log(colorize('cyan', separator('─')));
            console.log(colorize('green', 'Test with curl:'));
            console.log(colorize('cyan', separator('─')));
            console.log(`${colorize('yellow', 'curl')} http://localhost:8080/api/endpoint \\`);
            console.log(`  ${colorize('blue', '-H')} "X-APPID-KEY: ${key}"`);
            console.log(colorize('cyan', separator('─')));
        } else {
            console.log(colorize('red', '✗ Signature mismatch'));
            console.log('');
            console.log(`  Appid Hash:   ${appidHash}`);
            console.log(`  Timestamp:    ${timestampStr}`);
            console.log(`  Expected:     ${expectedSignature}`);
            console.log(`  Provided:     ${signature}`);
            process.exit(1);
        }

    } catch (error) {
        console.error(colorize('red', `Error: ${error.message}`));
        process.exit(1);
    }
}

/**
 * Generate X-APPID-KEY command
 * appid-cli appid <appid> gen-key
 */
async function cmdAppidGenKey(appid, options = {}) {
    validateAppid(appid);

    try {
        displayModeInfo();
        console.log('');

        // Get or create appid configuration
        let appidConfig = await configManager.getAppid(appid);

        if (!appidConfig) {
            console.log(colorize('yellow', `Appid '${appid}' not found in configuration. Creating new entry...`));
            appidConfig = await configManager.setAppid(appid, {
                validityDays: options.validityDays || 30
            });
            console.log(colorize('green', `✓ Created appid configuration`));
        }

        await displayKeyInfo(appid, appidConfig);

    } catch (error) {
        console.error(colorize('red', `Error: ${error.message}`));
        process.exit(1);
    }
}

/**
 * List all appids command
 * appid-cli config appid list
 */
async function cmdConfigAppidList() {
    try {
        displayModeInfo();
        console.log('');
        console.log(colorize('cyan', separator('─')));
        console.log(colorize('green', 'Configured Appids'));
        console.log(colorize('cyan', separator('─')));

        const appids = await configManager.getAllAppids();

        if (Object.keys(appids).length === 0) {
            console.log(colorize('yellow', 'No appids configured.'));
            console.log(colorize('yellow', `Use: ${colorize('cyan', 'appid-cli config appid <appid> secret')} to add one.`));
        } else {
            Object.entries(appids).forEach(([appid, config]) => {
                const enabled = config.enabled ?? true;
                const status = enabled ? colorize('green', '✓') : colorize('red', '✗');
                const secret = config.secret || '(not set)';
                const expireDate = config.expireDate || config['expire-date'];
                const validityDays = config.validityDays || config['validity-days'];
                const authInfo = expireDate
                    ? `expires: ${expireDate}`
                    : `validity: ${validityDays || 30}d`;

                console.log(`${status} ${colorize('bold', appid.padEnd(20))} ${authInfo}`);
                console.log(`  secret: ${secret.substring(0, 20)}...`);
                console.log('');
            });
        }

        console.log(colorize('cyan', separator('─')));
        console.log('');
    } catch (error) {
        console.error(colorize('red', `Error: ${error.message}`));
        process.exit(1);
    }
}

/**
 * Get specific appid command
 * appid-cli config appid get <appid>
 */
async function cmdConfigAppidGet(appid) {
    validateAppid(appid);

    try {
        displayModeInfo();
        console.log('');

        const config = await configManager.getAppid(appid);

        if (!config) {
            console.error(colorize('red', `Appid '${appid}' not found in configuration.`));
            console.log(colorize('yellow', `Use: ${colorize('cyan', `appid-cli config appid ${appid} secret`)} to add it.`));
            process.exit(1);
        }

        console.log(colorize('cyan', separator('─')));
        console.log(colorize('green', `Appid Configuration: ${appid}`));
        console.log(colorize('cyan', separator('─')));
        console.log(`Status:       ${config.enabled ?? true ? colorize('green', 'enabled') : colorize('red', 'disabled')}`);
        console.log(`Secret:       ${config.secret}`);
        console.log(`Validity:     ${config.validityDays || config['validity-days'] || 30} days`);
        console.log(`Expire Date:  ${config.expireDate || config['expire-date'] || 'Not set'}`);
        console.log(`Appid Hash:   ${hashAppid(appid)}`);
        console.log(colorize('cyan', separator('─')));
        console.log('');
    } catch (error) {
        console.error(colorize('red', `Error: ${error.message}`));
        process.exit(1);
    }
}

/**
 * Set secret command
 * appid-cli config appid <appid> secret [secret]
 */
async function cmdConfigAppidSecret(appid, secret) {
    validateAppid(appid);

    try {
        displayModeInfo();
        console.log('');

        const finalSecret = secret || crypto.randomBytes(32).toString('base64');

        const existing = await configManager.getAppid(appid);
        if (existing) {
            await configManager.setSecret(appid, finalSecret);
            console.log(colorize('green', `✓ Secret updated for appid: ${appid}`));
        } else {
            await configManager.setAppid(appid, { secret: finalSecret });
            console.log(colorize('green', `✓ Appid '${appid}' created with new secret`));
        }

        console.log('');
        console.log(colorize('cyan', `Secret: ${finalSecret}`));
        console.log('');
    } catch (error) {
        console.error(colorize('red', `Error: ${error.message}`));
        process.exit(1);
    }
}

/**
 * Set auth command
 * appid-cli config appid <appid> auth <value>
 */
async function cmdConfigAppidAuth(appid, authValue) {
    validateAppid(appid);

    try {
        displayModeInfo();
        console.log('');

        // Check if appid exists
        const existing = await configManager.getAppid(appid);
        if (!existing) {
            console.error(colorize('red', `Appid '${appid}' not found in configuration.`));
            console.log(colorize('yellow', `Use: ${colorize('cyan', `appid-cli config appid ${appid} secret`)} to add it first.`));
            process.exit(1);
        }

        // Determine if authValue is days or date (check date format first)
        if (/^\d{4}-\d{2}-\d{2}$/.test(authValue)) {
            await configManager.setAuth(appid, authValue);
            console.log(colorize('green', `✓ Expiration date set to ${authValue} for appid: ${appid}`));
        } else {
            const numValue = parseInt(authValue, 10);
            if (!isNaN(numValue) && numValue > 0) {
                await configManager.setAuth(appid, numValue);
                console.log(colorize('green', `✓ Validity set to ${numValue} days for appid: ${appid}`));
            } else {
                console.error(colorize('red', `Invalid auth value: ${authValue}`));
                console.error(colorize('yellow', 'Expected: number of days (e.g., 30) or date (YYYY-MM-DD)'));
                process.exit(1);
            }
        }

        console.log('');
    } catch (error) {
        console.error(colorize('red', `Error: ${error.message}`));
        process.exit(1);
    }
}

/**
 * Print help message
 */
function printHelp() {
    console.log('');
    console.log(colorize('green', 'Appid CLI - JWT Authentication Key Management'));
    console.log('');
    console.log(colorize('cyan', 'Configuration:'));
    console.log('  Create .env file in CLI directory with either:');
    console.log('    BASE_URL=http://localhost:8080  (for API mode)');
    console.log('    APP_PATH=../jwt-core           (for YAML mode)');
    console.log('');
    console.log(colorize('cyan', 'Usage:'));
    console.log('  appid-cli <command> [options]');
    console.log('');
    console.log(colorize('cyan', 'Commands:'));
    console.log('');
    console.log(colorize('green', 'Appid Key Generation:'));
    console.log('  appid-cli appid <appid> gen-key              Generate X-APPID-KEY for appid');
    console.log('                                          Options: --validity-days <days>');
    console.log('');
    console.log(colorize('green', 'Key Verification:'));
    console.log('  appid-cli verify <key> [appid]               Verify X-APPID-KEY signature');
    console.log('                                          Optional: specify appid to validate');
    console.log('');
    console.log(colorize('green', 'Configuration:'));
    console.log('  appid-cli config [entry] [subcommand]        Manage configuration');
    console.log('                                          Entries: appid');
    console.log('                                          Use: appid-cli config --help');
    console.log('');
    console.log(colorize('green', 'Appid Subcommands (config appid):'));
    console.log('  list                                      List all configured appids');
    console.log('  gen-key <appid>                           Generate X-APPID-KEY for appid');
    console.log('  get <appid>                               Get specific appid configuration');
    console.log('  <appid> secret [key]                      Set/generate secret for appid');
    console.log('  <appid> auth <days>                       Set validity in days');
    console.log('  <appid> auth <date>                       Set expiration date (YYYY-MM-DD)');
    console.log('');
    console.log(colorize('cyan', 'Examples:'));
    console.log('  appid-cli appid my-app gen-key');
    console.log('  appid-cli verify 45852a1660b91064.1776701306280.7cb79f... my-app');
    console.log('  appid-cli config appid list');
    console.log('  appid-cli config appid gen-key my-app');
    console.log('  appid-cli config appid get my-app');
    console.log('  appid-cli config appid my-app secret');
    console.log('  appid-cli config appid my-app secret "my-custom-secret"');
    console.log('  appid-cli config appid my-app auth 30');
    console.log('  appid-cli config appid my-app auth 2028-12-31');
    console.log('');
}

/**
 * Main CLI entry point
 */
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === 'help' || args[0] === '-h' || args[0] === '--help') {
        printHelp();
        process.exit(0);
    }

    if (args[0] === '-V' || args[0] === '--version') {
        console.log('appid-cli v21.0.0');
        process.exit(0);
    }

    // Parse commands manually for more control
    const command = args[0];

    if (command === 'verify') {
        // verify <key> [appid]
        const key = args[1];
        const appid = args[2] || null;
        if (!key) {
            console.error(colorize('red', 'Error: Missing key argument'));
            console.log(colorize('yellow'), 'Usage: appid-cli verify <key> [appid]');
            process.exit(1);
        }
        await cmdVerifyKey(key, appid);
    } else if (command === 'appid') {
        // appid <appid> gen-key
        if (args[1] && args[2] === 'gen-key') {
            const appid = args[1];
            const options = {
                validityDays: args.includes('--validity-days')
                    ? parseInt(args[args.indexOf('--validity-days') + 1]) || 30
                    : 30
            };
            await cmdAppidGenKey(appid, options);
        } else {
            console.error(colorize('red', 'Invalid command. Use: appid-cli appid <appid> gen-key'));
            process.exit(1);
        }
    } else if (command === 'config') {
        // config appid ...
        if (!args[1] || args[1] === '--help' || args[1] === '-h') {
            // Show config subcommand help
            console.log('');
            console.log(colorize('cyan', separator('─')));
            console.log(colorize('green', 'Appid CLI - Configuration Management'));
            console.log(colorize('cyan', separator('─')));
            console.log('');
            console.log(colorize('cyan', 'Usage:'));
            console.log('  appid-cli config <entry> [options]');
            console.log('');
            console.log(colorize('cyan', 'Entries:'));
            console.log(colorize('green', '  appid') + '          Configure appid keys');
            console.log('');
            console.log(colorize('cyan', 'Appid Subcommands:'));
            console.log('  list                    List all configured appids');
            console.log('  gen-key <appid>         Generate X-APPID-KEY for appid');
            console.log('  get <appid>             Get specific appid configuration');
            console.log('  <appid> secret [key]     Set/generate secret for appid');
            console.log('  <appid> auth <days>      Set validity in days');
            console.log('  <appid> auth <date>      Set expiration date (YYYY-MM-DD)');
            console.log('');
            console.log(colorize('cyan', 'Examples:'));
            console.log('  appid-cli config appid list');
            console.log('  appid-cli config appid gen-key my-app');
            console.log('  appid-cli config appid get my-app');
            console.log('  appid-cli config appid my-app secret');
            console.log('  appid-cli config appid my-app auth 30');
            console.log('');
            process.exit(0);
        }

        if (args[1] === 'appid') {
            const subCommand = args[2];

            if (subCommand === 'list') {
                await cmdConfigAppidList();
            } else if (subCommand === 'gen-key' && args[3]) {
                const appid = args[3];
                const options = {
                    validityDays: args.includes('--validity-days')
                        ? parseInt(args[args.indexOf('--validity-days') + 1]) || 30
                        : 30
                };
                await cmdAppidGenKey(appid, options);
            } else if (subCommand === 'get' && args[3]) {
                await cmdConfigAppidGet(args[3]);
            } else if (subCommand && subCommand !== 'list' && subCommand !== 'get' && subCommand !== 'gen-key') {
                // config appid <appid> secret [secret]
                // config appid <appid> auth <value>
                const appid = subCommand;
                const action = args[3];

                if (action === 'secret') {
                    const secret = args[4];
                    await cmdConfigAppidSecret(appid, secret);
                } else if (action === 'auth' && args[4]) {
                    await cmdConfigAppidAuth(appid, args[4]);
                } else {
                    console.error(colorize('red', `Invalid command. Use: appid-cli config appid ${appid} secret [key] or appid-cli config appid ${appid} auth <value>`));
                    process.exit(1);
                }
            } else {
                // No subcommand or incomplete - show appid subcommand help
                console.log('');
                console.log(colorize('cyan', separator('─')));
                console.log(colorize('green', 'Appid CLI - Appid Configuration'));
                console.log(colorize('cyan', separator('─')));
                console.log('');
                console.log(colorize('cyan', 'Usage:'));
                console.log('  appid-cli config appid <subcommand>');
                console.log('');
                console.log(colorize('cyan', 'Subcommands:'));
                console.log(colorize('green', '  list') + '              List all configured appids');
                console.log(colorize('green', '  gen-key <appid>') + '   Generate X-APPID-KEY for appid');
                console.log(colorize('green', '  get <appid>') + '       Get specific appid configuration');
                console.log(colorize('green', '  <appid> secret [key]') + '  Set/generate secret for appid');
                console.log(colorize('green', '  <appid> auth <days>') + '   Set validity in days');
                console.log(colorize('green', '  <appid> auth <date>') + '   Set expiration date (YYYY-MM-DD)');
                console.log('');
                console.log(colorize('cyan', 'Examples:'));
                console.log('  appid-cli config appid list');
                console.log('  appid-cli config appid gen-key my-app');
                console.log('  appid-cli config appid get my-app');
                console.log('  appid-cli config appid my-app secret');
                console.log('  appid-cli config appid my-app auth 30');
                console.log('');
                process.exit(0);
            }
        } else {
            console.error(colorize('red', `Unknown config entry: ${args[1]}`));
            console.log('');
            console.log(colorize('yellow', 'Available entries:'));
            console.log(colorize('green', '  appid') + '          Configure appid keys');
            console.log('');
            console.log(colorize('yellow', 'Use: appid-cli config --help for more information'));
            process.exit(1);
        }
    } else if (command === 'export') {
        if (args[1] === 'yaml') {
            // Export YAML from configuration
            try {
                const appids = await configManager.getAllAppids();
                console.log('');
                console.log(colorize('cyan', separator('─')));
                console.log(colorize('green', 'Spring Boot Configuration (YAML)'));
                console.log(colorize('cyan', separator('─')));
                console.log('jwt:');
                console.log('  appid-key:');
                console.log('    configs:');

                Object.entries(appids).forEach(([appid, config]) => {
                    const enabled = config.enabled ?? true;
                    if (!enabled) return;

                    console.log(`      ${appid}:`);
                    console.log(`        secret: "${config.secret}"`);

                    const expireDate = config.expireDate || config['expire-date'];
                    if (expireDate) {
                        console.log(`        expire-date: "${expireDate}"`);
                    } else {
                        const days = config.validityDays || config['validity-days'] || 30;
                        console.log(`        validity-days: ${days}`);
                    }
                });

                console.log(colorize('cyan', separator('─')));
                console.log('');
            } catch (error) {
                console.error(colorize('red', `Error: ${error.message}`));
                process.exit(1);
            }
        } else {
            console.error(colorize('red', 'Invalid command. Use: appid-cli export yaml'));
            process.exit(1);
        }
    } else {
        console.error(colorize('red', `Unknown command: ${command}`));
        console.log(colorize('yellow', 'Use "appid-cli help" for usage information.'));
        process.exit(1);
    }
}

// Export for testing and module use
module.exports = {
    main,
    cmdAppidGenKey,
    cmdConfigAppidList,
    cmdConfigAppidGet,
    cmdConfigAppidSecret,
    cmdConfigAppidAuth,
    cmdVerifyKey
};

// Run main if executed directly
if (require.main === module) {
    main().catch(error => {
        console.error(colorize('red', `Fatal error: ${error.message}`));
        process.exit(1);
    });
}
