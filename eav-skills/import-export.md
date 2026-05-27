---
description: Import and Export Management Skill
---

# Import & Export Management

This skill covers the DDL and YAML import/export functionality of the CLI.

## DDL Import (`cfg import ddl`)

Converts standard SQL DDL (CREATE TABLE statements) into EAV entities and attributes. Supports MySQL and PostgreSQL dialects.

### CLI Options
- `--file <FILE>`: Path to SQL file.
- `--sql <STRING>`: Direct SQL string.
- `--mode <skip|replace|append>`: Conflict strategy (default: skip).
- `--dry-run`: Preview without making changes.

### Examples

```bash
# Preview import
node scripts/eav-remote-cli.js cfg import ddl --file schema.sql --dry-run
node scripts/eav-remote-cli.js cfg import ddl --sql "CREATE TABLE users (id INT PRIMARY KEY);" --dry-run

# Import with mode replace (deletes existing entity and attributes)
node scripts/eav-remote-cli.js cfg import ddl --file schema.sql --mode replace

# Import with a domain
node scripts/eav-remote-cli.js cfg import ddl --file schema.sql --domain mydomain
```

## DDL Export (`cfg entity ddl export`)

Exports EAV entities back into standard SQL CREATE TABLE statements.

### Examples

```bash
# Basic export (Minimal MySQL)
node scripts/eav-remote-cli.js cfg entity ddl export students

# Production schema (Includes DROP TABLE, IF NOT EXISTS, comments)
node scripts/eav-remote-cli.js cfg entity ddl export students --drop-table

# Export to a specific file
node scripts/eav-remote-cli.js cfg entity ddl export students --output students.sql

# Different dialect
node scripts/eav-remote-cli.js cfg entity ddl export students --format postgresql
```

## YAML Import (`cfg import yaml`)

Imports entity definitions, attributes, and route mappings from a YAML configuration.

### CLI Options
- `--file <FILE>`: Single YAML file.
- `--dir <DIR>`: Directory of YAML files.
- `--yaml <STRING>`: Direct YAML string.
- `--mode <skip|replace|append>`: Conflict strategy (default: skip).
- `--dry-run`: Preview without making changes.

### Examples

```bash
# Preview YAML import from a file
node scripts/eav-remote-cli.js cfg import yaml --file config.yaml --dry-run

# Preview from an inline string
node scripts/eav-remote-cli.js cfg import yaml --yaml "entities: [{name: test}]" --dry-run

# Execute import from directory (skipping existing entities)
node scripts/eav-remote-cli.js cfg import yaml --dir ./eav-config --mode skip
```

## YAML Export (`cfg export yaml`)

Exports one or more **entity** definitions (same names as in YAML `entities[].name`) from the running database into a single YAML document with a top-level `entities:` list.

### CLI options (local `eav-cli`)

- `--entity <names>`: comma-separated entity names (trimmed), e.g. `building_info,building_room`.
- `--file <path>` / `-o`: write YAML to a file.
- `--stdout`: write YAML to stdout (for `diff` / pipes).
- `--dry-run`: print each requested entity, whether it exists, and coarse counts (attributes, routes); no file output.

Exactly one of `--file`/`-o`, `--stdout`, or `--dry-run` is required (aside from `--entity`).

### Remote (`eav-remote-cli.js`)

`cfg export yaml` is sent to the EAV HTTP API as **`GET /api/cfg/export/yaml?entities=...&dry_run=true`**, not through `/cli/execute`, so the **client machine does not need `DATABASE_URL`**.

- **`EAV_API_URL`**: base URL of the EAV API (e.g. `http://localhost:3001`). If unset, defaults to the same host as `EAV_PROXY_URL` with port **3001**.

### Examples

```bash
# Local (needs DATABASE_URL)
eav-cli cfg export yaml --entity my_entity --stdout
eav-cli cfg export yaml --entity a,b,c -o merged.yaml
eav-cli cfg export yaml --entity a,b --dry-run

# Remote (needs EAV_PROXY_URL; API default port 3001 on same host)
node scripts/eav-remote-cli.js cfg export yaml --entity my_entity --stdout
node scripts/eav-remote-cli.js cfg export yaml --entity a,b -o merged.yaml
```
