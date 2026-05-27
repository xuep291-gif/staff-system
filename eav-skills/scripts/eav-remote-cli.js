#!/usr/bin/env node

/**
 * EAV Remote CLI
 *
 * Transparent remote wrapper for eav-cli commands via HTTP proxy.
 * Provides identical experience to local eav-cli execution.
 *
 * Usage:
 *   export EAV_PROXY_URL=http://host:3333
 *   node eav-remote-cli.js <command> [subcommand] [args...] [--options...]
 *
 * Special parameters:
 *   --skill           Display eav-cli-skill.md content (bypasses CLI execution)
 *
 * Examples:
 *   node eav-remote-cli.js cfg entity list
 *   node eav-remote-cli.js row list college_student --page 1 --page-size 10
 *   node eav-remote-cli.js query --domain system --query list-tables
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const os = require('os');

/**
 * Load environment variables from .env files (per-key merge).
 * Shell / parent process env always wins and is never overwritten by files.
 *
 * For each KEY, the first file in this list that defines KEY supplies the value:
 * 1. process.cwd() + "/.env"  (repository / service checkout — highest precedence among files)
 * 2. os.homedir() + "/.env"
 * 3. __dirname + "/.env"      (scripts/.env beside this wrapper — fallback)
 *
 * Later files only fill keys that are still undefined after earlier files.
 */
function loadEnvFile() {
    const envPaths = [
        path.join(process.cwd(), '.env'),           // Current working directory: ./.env (highest)
        path.join(os.homedir(), '.env'),            // Home directory: ~/.env (medium)
        path.join(__dirname, '.env'),               // Script directory: scripts/.env (lowest)
    ];

    for (const envPath of envPaths) {
        if (!fs.existsSync(envPath)) {
            continue;
        }

        const content = fs.readFileSync(envPath, 'utf8');
        for (const line of content.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) {
                continue;
            }
            const eqIndex = trimmed.indexOf('=');
            if (eqIndex === -1) {
                continue;
            }
            const key = trimmed.substring(0, eqIndex).trim();
            let value = trimmed.substring(eqIndex + 1).trim();
            // Remove surrounding quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            // Only set if not already defined in environment
            if (process.env[key] === undefined) {
                process.env[key] = value;
            }
        }
    }
}

loadEnvFile();

/**
 * Mapping of short flags to long flags for EAV CLI commands
 * This ensures that short flags are properly expanded before sending to the proxy
 */
const SHORT_FLAG_MAP = {
    // Global flags
    'v': 'version',
    // Query command flags
    'd': 'db-url',
    'D': 'domain',
    'q': 'query',
    'p': 'param',
    'o': 'org-id',
    'a': 'appid',
    'f': 'format',
    // Row command flags
    's': 'page-size',
    'S': 'sort',
    'O': 'order',
    'i': 'row-id',
    'y': 'yes',
    'k': 'key-field',
    'c': 'on-conflict',
    // Import/Export flags
    'm': 'mode',
    't': 'table',
    'e': 'entity',
    // YAML import flags
    // 'f': 'file',  (handled specially)
    // 'd': 'dir',   (handled specially)
    // Export flags
    // 'o': 'output', (handled specially)
    // Org command flags
    'n': 'name',
    // Pagination flags
    // 'p': 'page',  (handled specially)
    // 's': 'page-size',  (handled specially)
    // Filter flags
    // 'f': 'filter',  (handled specially)
    // Data flags
    'D': 'data-file',
};

/**
 * Flag options that don't take a value (boolean flags)
 * These options are standalone and should not consume the next argument
 * Note: Only include flags that are ALWAYS boolean. Don't include short flags
 * that might be aliased to long flags that take values.
 */
const FLAG_OPTIONS = new Set([
    // Global/common flags
    'help', 'version', 'verbose', 'quiet', 'silent',
    'yes', 'force',
    // DDL import specific
    'dry-run', 'dry_run', 'dryrun',
    // Other boolean flags that might be used
    'interactive', 'no-interactive',
    'all', 'recursive',
    'debug', 'trace', 'no-color',
    'stdout',
]);

/**
 * Expand short flags to long flags in options.
 * @param {Record<string, string>} options
 * @param {{ command?: string, subcommand?: string, args?: string[] }} [context]
 */
function expandShortFlags(options, context) {
    const map = { ...SHORT_FLAG_MAP };
    const isCfgExportYaml =
        context &&
        context.command === 'cfg' &&
        context.subcommand === 'export' &&
        context.args &&
        context.args[0] === 'yaml';
    if (isCfgExportYaml) {
        map.o = 'file';
    }
    const expanded = {};
    for (const [key, value] of Object.entries(options)) {
        const longKey = map[key] || key;
        expanded[longKey] = value;
    }
    return expanded;
}

/**
 * Parse command line arguments
 */
function parseArgs(rawArgs) {
    if (rawArgs.length === 0) return null;

    const command = rawArgs[0];
    let subcommand = null;
    const args = [];
    const options = {};

    let i = 1;
    while (i < rawArgs.length) {
        const arg = rawArgs[i];

        if (arg.startsWith('--')) {
            const eqIndex = arg.indexOf('=');
            if (eqIndex > 0) {
                const key = arg.substring(2, eqIndex);
                const value = arg.substring(eqIndex + 1);
                options[key] = value;
                i++;
            } else {
                const key = arg.substring(2);
                // Check if this is a flag option (no value expected)
                // or if the next arg is another flag
                if (FLAG_OPTIONS.has(key) || i + 1 >= rawArgs.length || rawArgs[i + 1].startsWith('-')) {
                    options[key] = '';
                    i++;
                } else {
                    options[key] = rawArgs[i + 1];
                    i += 2;
                }
            }
        } else if (arg.startsWith('-') && arg.length > 1) {
            const key = arg.substring(1);
            // Check if this is a flag option (no value expected)
            // First expand the short flag to check if it's a known flag option
            const expandedKey = SHORT_FLAG_MAP[key] || key;
            const isFlagOption = FLAG_OPTIONS.has(expandedKey);
            // Also check the short flag name directly for common boolean flags
            const isShortFlagOption = FLAG_OPTIONS.has(key);

            if (isFlagOption || isShortFlagOption || i + 1 >= rawArgs.length || rawArgs[i + 1].startsWith('-')) {
                options[key] = '';
                i++;
            } else {
                options[key] = rawArgs[i + 1];
                i += 2;
            }
        } else {
            if (subcommand === null) {
                subcommand = arg;
            } else {
                args.push(arg);
            }
            i++;
        }
    }

    return { command, subcommand, args, options };
}

/**
 * Send request to proxy server
 */
function sendRequest(payload, proxyUrl) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(proxyUrl + '/cli/execute');
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;

        const req = client.request({
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        }, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    resolve(data);
                } catch (e) {
                    resolve({ success: false, stderr: body, stdout: '', exit_code: 1 });
                }
            });
        });

        req.on('error', (err) => {
            resolve({
                success: false,
                stderr: `Failed to connect to proxy at ${PROXY_URL}\n${err.message}`,
                stdout: '',
                exit_code: 2,
            });
        });

        req.write(JSON.stringify(payload));
        req.end();
    });
}

/**
 * Fetch documentation from proxy server
 */
function fetchDocumentation(url) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;

        const req = client.request({
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        }, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    if (res.statusCode === 200) {
                        resolve(data);
                    } else {
                        resolve({ error: data.error || 'unknown_error', message: data.message || 'Unknown error' });
                    }
                } catch (e) {
                    resolve({ error: 'parse_error', message: 'Failed to parse response' });
                }
            });
        });

        req.on('error', (err) => {
            resolve({
                error: 'connection_error',
                message: `Failed to connect to proxy at ${url}\n${err.message}`
            });
        });

        req.end();
    });
}

/**
 * Read YAML file content for cfg import yaml command
 */
function readYamlFiles(filePath, dirPath) {
    const yamlFiles = [];
    const yaml = require('js-yaml');

    if (filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            yamlFiles.push({
                path: filePath,
                name: path.basename(filePath),
                content: content,
                parsed: yaml.load(content)
            });
        } catch (err) {
            throw new Error(`Failed to read YAML file at ${filePath}: ${err.message}`);
        }
    }

    if (dirPath) {
        try {
            const files = fs.readdirSync(dirPath);
            for (const file of files) {
                if (file.endsWith('.yaml') || file.endsWith('.yml')) {
                    const fullPath = path.join(dirPath, file);
                    try {
                        const content = fs.readFileSync(fullPath, 'utf8');
                        yamlFiles.push({
                            path: fullPath,
                            name: file,
                            content: content,
                            parsed: yaml.load(content)
                        });
                    } catch (err) {
                        console.warn(`Warning: Failed to read ${fullPath}: ${err.message}`);
                    }
                }
            }
        } catch (err) {
            throw new Error(`Failed to read directory at ${dirPath}: ${err.message}`);
        }
    }

    return yamlFiles;
}

/**
 * Read SQL DDL file content for cfg import ddl command
 * Reads the SQL file content locally to avoid Windows path issues in Docker container
 */
function readSqlFile(filePath) {
    if (!filePath) {
        return null;
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return {
            path: filePath,
            name: path.basename(filePath),
            content: content,
        };
    } catch (err) {
        throw new Error(`Failed to read SQL file at ${filePath}: ${err.message}`);
    }
}

/**
 * Build payload from parsed args
 */
function buildPayload(parsed) {
    const payload = {
        command: parsed.command,
        subcommand: parsed.subcommand,
        args: parsed.args,
        options: expandShortFlags(parsed.options, parsed),
    };

    // Special handling for cfg import yaml: read and bundle YAML files or content
    // Supports both --file/--dir and --yaml options
    if (parsed.command === 'cfg' && parsed.subcommand === 'import' && parsed.args[0] === 'yaml') {
        // Check for --yaml option first (YAML content string)
        const yamlContent = parsed.options.yaml;
        if (yamlContent) {
            // Bundle YAML content directly
            payload.yaml_files = [{
                name: 'entity.yaml',
                content: yamlContent,
                parsed: null, // Will be parsed by the server
            }];
            // Remove --yaml from options since it will be provided as bundled content
            const options = { ...payload.options };
            delete options.yaml;
            payload.options = options;
        } else {
            // Fall back to file/dir paths from options
            const yamlFiles = readYamlFiles(
                parsed.options.f || parsed.options.file,
                parsed.options.d || parsed.options.dir
            );
            if (yamlFiles.length > 0) {
                payload.yaml_files = yamlFiles;
                // Remove --file and --dir from options since files will be provided as bundled content
                const options = { ...payload.options };
                delete options.f;
                delete options.file;
                delete options.d;
                delete options.dir;
                payload.options = options;
            }
        }
    }

    // Special handling for cfg import ddl: read and bundle SQL DDL file or content
    // Supports both --file <FILE> and --sql <STRING> options
    if (parsed.command === 'cfg' && parsed.subcommand === 'import' && parsed.args[0] === 'ddl') {
        // Check for --sql option first (SQL content string)
        const sqlContent = parsed.options.sql;
        if (sqlContent) {
            // Bundle SQL content directly
            payload.sql_file = {
                name: 'ddl.sql',
                content: sqlContent,
            };
            // Remove --sql from options since it will be provided as bundled content
            const options = { ...payload.options };
            delete options.sql;
            payload.options = options;
        } else {
            // Fall back to file path from args or --file option
            const sqlFilePath = parsed.args[1] || parsed.options.f || parsed.options.file;
            if (sqlFilePath) {
                const sqlFile = readSqlFile(sqlFilePath);
                if (sqlFile) {
                    payload.sql_file = sqlFile;
                    // Remove the file path from args since it will be provided as bundled content
                    payload.args = ['ddl'];
                    // Also remove --file from options if present
                    const options = { ...payload.options };
                    delete options.f;
                    delete options.file;
                    payload.options = options;
                }
            }
        }
    }

    if (process.env.DATABASE_URL) {
        payload.env = { DATABASE_URL: process.env.DATABASE_URL };
    }
    return payload;
}

function showHelp() {
    console.log(`EAV Remote CLI

Usage:
  EAV_PROXY_URL=<url> node eav-remote-cli.js <command> [args...]

Environment Variables:
  EAV_PROXY_URL    Proxy server URL (default: http://localhost:3333)
  DATABASE_URL     Passed through to remote eav-cli when set (required for cfg import/export yaml via proxy)

Commands (identical to local eav-cli):
  query            Execute SQL queries
  cfg              Configuration management (entities, attributes, etc.)
  row              Row data management
  import           Import SQL file to EAV entities
  export           Export entity schema to SQL
  org              Organization management

Documentation:
  --skill          Display skill documentation
  --spec           Display YAML configuration specification

Examples:
  node eav-remote-cli.js cfg import yaml --file entity.yaml --dry-run
  node eav-remote-cli.js cfg export yaml --entity a,b --stdout
  node eav-remote-cli.js query --domain system --query list-tables
  node eav-remote-cli.js --skill
  node eav-remote-cli.js --spec
`);
}

async function main() {
    const rawArgs = process.argv.slice(2);

    if (rawArgs.length === 0 || rawArgs[0] === '--help' || rawArgs[0] === '-h' || rawArgs[0] === 'help') {
        showHelp();
        process.exit(0);
    }

    // Check for EAV_PROXY_URL
    if (!process.env.EAV_PROXY_URL) {
        console.error('Error: EAV_PROXY_URL environment variable is required');
        console.error('Set it with: export EAV_PROXY_URL=http://localhost:3333');
        console.error('Or create a .env file with EAV_PROXY_URL=<url>');
        process.exit(1);
    }
    const PROXY_URL = process.env.EAV_PROXY_URL;

    // Handle --skill parameter (get documentation from remote server)
    if (rawArgs.includes('--skill')) {
        const result = await fetchDocumentation(PROXY_URL + '/cli/skill');
        if (result.error) {
            console.error(`Error: ${result.message}`);
            process.exit(1);
        }
        console.log(result.content);
        process.exit(0);
    }

    // Handle --spec parameter (get YAML spec from remote server)
    if (rawArgs.includes('--spec')) {
        const result = await fetchDocumentation(PROXY_URL + '/cli/spec');
        if (result.error) {
            console.error(`Error: ${result.message}`);
            process.exit(1);
        }
        console.log(result.content);
        process.exit(0);
    }

    const parsed = parseArgs(rawArgs);

    const payload = buildPayload(parsed);
    const result = await sendRequest(payload, PROXY_URL);

    let pending = 0;
    function flushDone() {
        pending--;
        if (pending <= 0) {
            process.exit(result.exit_code !== undefined ? result.exit_code : 1);
        }
    }

    if (result.stdout) {
        pending++;
        process.stdout.write(result.stdout, flushDone);
    }
    if (result.stderr) {
        pending++;
        process.stderr.write(result.stderr, flushDone);
    }

    if (pending === 0) {
        process.exit(result.exit_code !== undefined ? result.exit_code : 1);
    }
}

main();
