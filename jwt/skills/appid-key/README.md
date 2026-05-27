# Appid Key Generator Skill

Unified X-APPID-KEY generation tool for JWT authentication.

## Quick Start

### Global Installation (Recommended)

```bash
cd jwt-core/cli
npm install
npm link
```

Then use from anywhere:
```bash
appid-key my-app
```

### Standalone Usage

```bash
# Make executable (if needed)
chmod +x appid-key.js

# Generate credentials
./appid-key.js my-app
```

## Files

### CLI Package (`jwt-core/cli/`)
- `package.json` - NPM package configuration
- `bin/appid-key` - Executable CLI entry point
- `lib/appid-key.js` - Core implementation
- `README.md` - CLI documentation

### Skill Files (`jwt-core/skills/appid-key/`)
- `appid-key.js` - Standalone executable script
- `skill.md` - Skill definition for Claude Code
- `README.md` - This file

## Commands

```bash
# Auto-generate secret
appid-key my-app

# Custom secret
appid-key my-app "my-secret"

# Update .env file
appid-key env my-app

# Show help
appid-key help
```

## Integration

This skill is part of the jwt-core module and provides unified credential generation for:
- Development testing
- API authentication
- Environment configuration

## Features

- **Pure Node.js** - No bash, no Java, no external dependencies
- **Cross-platform** - Works on Windows, macOS, and Linux
- **.env integration** - Automatically updates environment files
- **Global command** - Install once with `npm link`
- **Colored output** - Easy-to-read terminal output
- **Module support** - Can be imported as a Node.js module

## Migration Notes

This skill replaces:
- Java `AppidKeyGenerator.java` (removed)
- Bash `appid-key.sh` wrapper (removed)
- Python `appid-test` skill (removed)

All functionality is now consolidated in a single Node.js package.

## NPM Package

```json
{
  "name": "@jwt-core/cli",
  "version": "21.0.0",
  "bin": {
    "appid-key": "./bin/appid-key"
  }
}
```
