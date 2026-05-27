# @jwt-core/cli

JWT Core CLI - X-APPID-KEY generation and appid management tools.

## Installation

### Local Installation

```bash
cd /path/to/jwt-core/cli
npm install
npm link
```

### Global Installation

```bash
cd /path/to/jwt-core/cli
npm install -g .
```

## Commands

This package provides two CLI tools:

### appid-key

Simple X-APPID-KEY generation tool:

```bash
# Generate credentials with auto-secret
appid-key my-app

# Generate with custom secret
appid-key my-app "my-secret"

# Generate command explicitly
appid-key generate my-app

# Update .env file
appid-key env my-app

# Show help
appid-key help
```

### appid-cli

Full-featured appid configuration and key management CLI:

```bash
# Generate X-APPID-KEY for an appid
appid-cli appid <appid> gen-key

# List all configured appids
appid-cli config appid list

# Get specific appid configuration
appid-cli config appid get <appid>

# Set/generate secret for an appid (auto-generates if not provided)
appid-cli config appid <appid> secret [key]

# Set validity in days
appid-cli config appid <appid> auth 30

# Set expiration date (YYYY-MM-DD)
appid-cli config appid <appid> auth 2028-12-31

# Export configuration as YAML for Spring Boot
appid-cli export yaml
```

## Examples

### Quick Start with appid-cli (YAML Mode)

```bash
# 1. Configure YAML mode in cli/.env
echo "APP_PATH=../jwt-core" > .env

# 2. Create a new appid (auto-generates secret)
appid-cli config appid my-app secret

# 3. Set validity to 30 days
appid-cli config appid my-app auth 30

# 4. Generate X-APPID-KEY for testing
appid-cli appid my-app gen-key

# 5. View the updated configuration
cat ../jwt-core/src/main/resources/application.yml
```

### Using API Mode

```bash
# 1. Start the JWT application with API enabled
# In application.yml: jwt.appid-key.api-enabled: true

# 2. Configure API mode in cli/.env
echo "BASE_URL=http://localhost:8080" > .env

# 3. Use appid-cli normally
appid-cli config appid my-app secret
appid-cli appid my-app gen-key
```

### Advanced Configuration

```bash
# Set custom secret
appid-cli config appid secure-app secret "my-secure-secret-key"

# Set expiration date
appid-cli config appid secure-app auth 2028-12-31

# View all configured appids
appid-cli config appid list

# View specific appid details
appid-cli config appid get secure-app
```

## Output Format

### appid-cli appid gen-key

```
─────────────────────────────────────────────────────────────────
🔑 Appid Key Information
─────────────────────────────────────────────────────────────────
Appid:        my-app
Secret:       <generated_secret>
Appid Hash:   <16_char_hash>
X-APPID-KEY:  <appid_hash>.<timestamp>.<signature>
─────────────────────────────────────────────────────────────────

# application.yml
jwt:
  appid-key:
    configs:
      my-app:
        secret: "<generated_secret>"

Valid for: 30 days

─────────────────────────────────────────────────────────────────
Test with curl:
─────────────────────────────────────────────────────────────────
curl http://localhost:8080/api/endpoint \
  -H "X-APPID-KEY: <key>"
─────────────────────────────────────────────────────────────────
```

### appid-cli export yaml

```yaml
jwt:
  appid-key:
    configs:
      my-app:
        secret: <base64_secret>
        validity-days: 30
      secure-app:
        secret: <base64_secret>
        expire-date: '2028-12-31'
```

## Configuration

Before using `appid-cli`, create a `.env` file in the CLI directory with one of the following modes:

### API Mode (for running applications)

Connect to a running JWT application via REST API:

```bash
# cli/.env
BASE_URL=http://localhost:8080
```

The application must have `jwt.appid-key.api-enabled=true` in `application.yml`.

### YAML Mode (for development)

Directly modify the `application.yml` file:

```bash
# cli/.env
APP_PATH=../jwt-core
```

## Java REST API

When `jwt.appid-key.api-enabled=true`, the following endpoints are available:

- `GET /dev/cfg/appid` - List all appid configs
- `GET /dev/cfg/appid/{appid}` - Get specific appid config
- `POST /dev/cfg/appid/{appid}` - Create/update appid config
- `DELETE /dev/cfg/appid/{appid}` - Remove appid config
- `POST /dev/cfg/appid/{appid}/secret` - Update secret
- `POST /dev/cfg/appid/{appid}/auth` - Update auth (validity)
- `POST /dev/cfg/appid/{appid}/enable` - Enable appid
- `POST /dev/cfg/appid/{appid}/disable` - Disable appid
- `POST /dev/cfg/appid/{appid}/generate` - Generate X-APPID-KEY
- `POST /dev/cfg/appid/verify` - Verify X-APPID-KEY

## Development

```bash
# Run tests
npm test

# Unlink global command
npm unlink -g

# Relink after changes
npm link
```

## Module Usage

You can also use this as a Node.js module:

```javascript
const { generateKeyWithSecret } = require('@jwt-core/cli/lib/appid-key.js');

const keyInfo = generateKeyWithSecret('my-app');
console.log(keyInfo);
// { appid: 'my-app', secret: '...', key: '...' }
```

## Integration with Java Spring Boot

The YAML output can be directly used in your `application.yml`:

```yaml
jwt:
  appid-key:
    configs:
      school-001:
        secret: "school-001-secret"
        validity-days: 30
      school-002:
        secret: "school-002-secret"
        expire-date: "2027-12-31"
```

The Java `AppidKeyResolver` will automatically load these configurations at startup.

## License

MIT
