# Appid Key Generator

Unified X-APPID-KEY generation tool for JWT authentication. This skill generates X-APPID-KEY headers and manages application credentials for development and testing.

## Trigger

When user requests:
- Generate X-APPID-KEY
- Create appid credentials
- Manage appid configurations
- `/appid-key <command> [options]`
- `/appid-cli <command> [options]`

## Installation

### Global Installation (Recommended)

```bash
cd jwt-core/cli
npm install
npm link
```

After installation, use the commands from anywhere:

**appid-key** - Simple key generation:
```bash
appid-key my-app
```

**appid-cli** - Full configuration management:
```bash
appid-cli appid my-app gen-key
```

### Standalone Usage

```bash
# Direct execution
./skills/appid-key/appid-key.js my-app

# Or with node
node skills/appid-key/appid-key.js my-app
```

## Commands

### appid-key (Simple)

```bash
# Generate with auto-secret
appid-key my-app

# Generate with custom secret
appid-key my-app "my-secret"

# Generate command explicitly
appid-key generate my-app

# Update .env file
appid-key env my-app
```

### appid-cli (Full-featured)

```bash
# Generate X-APPID-KEY for an appid
appid-cli appid <appid> gen-key

# List all configured appids
appid-cli config appid list

# Get specific appid configuration
appid-cli config appid get <appid>

# Set/generate secret for an appid
appid-cli config appid <appid> secret [key]

# Set validity in days
appid-cli config appid <appid> auth 30

# Set expiration date (YYYY-MM-DD)
appid-cli config appid <appid> auth 2028-12-31

# Export configuration as YAML for Spring Boot
appid-cli export yaml
```

## Implementation

Pure Node.js CLI that:
1. Generates X-APPID-KEY using HMAC-SHA256
2. Manages persistent appid configuration in `~/.appid-cli/config.json`
3. Supports auto-generated or custom secret keys
4. Supports validity periods (days) or expiration dates
5. Updates .env file with generated credentials (appid-key only)
6. Outputs curl test commands and YAML configuration snippets
7. Cross-platform compatible (Windows, macOS, Linux)

## Algorithm

X-APPID-KEY format: `{appid_hash}.{timestamp}.{signature}`

- **appid_hash**: First 16 chars of HMAC-SHA256(appid, derivation_key)
  - Derivation key: `X7K9mP2vN8wR4tY6uJ0fG5hC1dE8sZ3oP6nQ9`
  - Implicitly encodes appid to protect real value
- **timestamp**: Current timestamp in milliseconds
- **signature**: HMAC-SHA256(secret, `appidHash.timestamp`)

## Usage

```bash
appid-key <command> [options]
appid-key <appid> [secret]           # Shortcut for generate
```

### Commands

- `generate` - Generate X-APPID-KEY (default)
- `env` - Generate and update .env file
- `help` - Show help message

### Arguments

- `appid` - Application identifier (required)
- `secret` - Secret key for signing (optional, auto-generated if not provided)

## Examples

```bash
# Auto-generate secret
appid-key generate my-app

# Custom secret
appid-key generate my-app "my-secret"

# Update .env file
appid-key env my-app

# Shortcut (same as generate)
appid-key my-app
```

## Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generating X-APPID-KEY for: my-app
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 Appid Key Information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Appid:        my-app
Secret:       <generated_secret>
Appid Hash:   <16_char_hash>
X-APPID-KEY:  <appid_hash>.<timestamp>.<signature>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# application.yml
jwt:
  appid-key:
    configs:
      my-app:
        secret: "<generated_secret>"

# Test with curl:
curl http://localhost:8080/api/endpoint -H "X-APPID-KEY: <key>"
```

## Features

- **Auto-generation**: Creates secure random secrets (32 bytes / 256 bits)
- **Custom secrets**: Supports custom secret keys for specific use cases
- **.env integration**: Updates environment files automatically
- **Multiple search paths**: Finds .env files in common locations
- **Validation**: Validates appid format (alphanumeric, hyphen, underscore)
- **Cross-platform**: Works on Windows, macOS, and Linux
- **No external dependencies**: Uses only Node.js built-in modules

## Files

### CLI Package (jwt-core/cli/)
- `package.json` - NPM package configuration
- `bin/appid-key` - Executable CLI entry point
- `lib/appid-key.js` - Core implementation

### Skill Files (jwt-core/skills/appid-key/)
- `appid-key.js` - Standalone executable script
- `skill.md` - This file
- `README.md` - Quick reference

## Dependencies

- Node.js (v12 or higher)
- No npm packages required (uses only built-in modules)

## Module API

```javascript
const { generateKeyWithSecret } = require('./lib/appid-key.js');

const keyInfo = generateKeyWithSecret('my-app');
console.log(keyInfo);
// { appid: 'my-app', secret: '...', key: '...' }
```

Available exports:
- `hashAppid` - Generate appid hash
- `generateSecret` - Generate random secret
- `hmacSha256` - HMAC-SHA256 signing
- `generateKey` - Generate X-APPID-KEY
- `generateKeyWithSecret` - Generate key with auto-secret
- `verifyKey` - Verify X-APPID-KEY signature
- `parseKey` - Parse key without verification
- `toYamlConfig` - Generate YAML config
- `toCurlCommand` - Generate curl command
- `formatKeyInfo` - Format key information
- `findEnvFile` - Find .env file
- `updateEnvFile` - Update .env file

## Notes

- Uses native Node.js `crypto` module for HMAC-SHA256
- No external dependencies required
- Compatible with jwt-core Java verification logic
- Searches for .env files in:
  - `./.env`
  - `./cli/.env`
  - `../cli/.env`
  - `~/workspace/clis/category/.env`
- Requires valid appid format: `[a-zA-Z0-9_-]+`
- Colors are automatically disabled in non-TTY environments
