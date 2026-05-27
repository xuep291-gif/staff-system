---
description: Schema and Configuration Management Skill
---

# Schema & Configuration Management

This skill covers the `cfg` commands used to manage the EAV structure: Entities, Attributes, Annotations, Routes, and Custom Query SQL.

## Entity Management

Entities represent tables or collections in the EAV system.

```bash
# List all entities
node scripts/eav-remote-cli.js cfg entity list

# Get entity by ID or name
node scripts/eav-remote-cli.js cfg entity get users
```

### Entity data (list rows — preferred for queries)

For **browsing or inspecting instance rows** of an entity, use **`cfg entity data list`** (reads under `cfg entity …`, more intuitive than `row list` for “entity + data”). Supports pagination, sort, filter, `--format`, `--fields`.

**Agents:** default **`--page 1 --page-size 5`** (CLI default page-size here is **20**—override explicitly). Show only that page’s rows with all columns; repeat the CLI **total row count** line. Do not increase `--page-size` or page through everything unless the user explicitly wants a full dump or export. Env: invoke `eav-remote-cli.js` per root `SKILL.md` — the script loads `.env` itself; do not read `.env` via tools to inject vars.

```bash
# Default for agents: page 1, exactly 5 rows
node scripts/eav-remote-cli.js cfg entity data list users --page 1 --page-size 5 --format json

# Larger page / table — only when the user asks for more rows or human-readable width
node scripts/eav-remote-cli.js cfg entity data list users --page 1 --page-size 10 --format table --verbose
```

Use **`row list`** only when you need the `row` subcommand surface (see `row.md`) or legacy scripts reference it.

```bash
# Create a new entity (use --auto-id to generate an auto-increment ID attribute)
node scripts/eav-remote-cli.js cfg entity create users --auto-id

# Update entity name
node scripts/eav-remote-cli.js cfg entity update users --name customers

# Rename entity
node scripts/eav-remote-cli.js cfg entity rename users customers

# Delete entity
node scripts/eav-remote-cli.js cfg entity delete users
```

### Entity Lifecycle (Destructive)

```bash
# Get entity statistics before destructive operations
node scripts/eav-remote-cli.js cfg entity meta test_student info

# Truncate data (preserve metadata)
node scripts/eav-remote-cli.js cfg entity meta test_student truncate --force

# Force hard delete (cascade cleanup)
node scripts/eav-remote-cli.js cfg entity meta test_student delete --force
```

### Entity Logic Operations

Register code-based business logic operations.
```bash
node scripts/eav-remote-cli.js cfg entity op list --entity goods
node scripts/eav-remote-cli.js cfg entity op register goods mark_reviewed mark_reviewed --description "Mark as reviewed"
```

## Attribute Management

Attributes represent the columns or fields of an entity.

```bash
# List attributes
node scripts/eav-remote-cli.js cfg attribute list users

# Create an attribute
# Types: string, text, int, decimal, date, datetime, json, boolean, auto_increment
node scripts/eav-remote-cli.js cfg attribute create users email --field-type string --not-null true --unique true

# Rename an attribute
node scripts/eav-remote-cli.js cfg attribute rename users email user_email

# Delete an attribute
node scripts/eav-remote-cli.js cfg attribute delete users email
```

### Virtual Attributes

For simple cross-entity lookups (e.g., fetch major name for a class).
```bash
node scripts/eav-remote-cli.js cfg attribute create college_class major_name \
  --field-type string \
  --query-only \
  --join-entity major \
  --join-attribute name \
  --join-on major_id \
  --join-with row_id
```

## Annotation Management

Annotations add validations (range, regex, options) and defaults to attributes.

```bash
# Add range validation
node scripts/eav-remote-cli.js cfg annotation create users age "range(0,150)"

# Add options (enum)
node scripts/eav-remote-cli.js cfg annotation create users os "options[android,ios,windows]"

# Add dynamic default using Atomic Naming Service (<uuid>, <timestamp>, <random>, <sequence>)
node scripts/eav-remote-cli.js cfg annotation create users id "default(<uuid>)"

# List annotations for an attribute
node scripts/eav-remote-cli.js cfg annotation list users age
```

## Route Mapping Management

Routes expose entities via HTTP endpoints.

```bash
# List mappings
node scripts/eav-remote-cli.js cfg route list

# Create a simple route (/api/v1/students -> students entity)
node scripts/eav-remote-cli.js cfg route create students student

# Create route with a domain (/api/v1/school/students -> students entity)
node scripts/eav-remote-cli.js cfg route create students student --domain school

# Multi-level routes (/api/v1/asset/builds/beds)
node scripts/eav-remote-cli.js cfg route create "builds/beds" "building-bed" --domain asset

# Scope-based automatic filtering
node scripts/eav-remote-cli.js cfg route create areas system_config --domain building --scope-attribute building_area
```

## Custom Query SQL Management

Override standard EAV queries with custom SQL.

```bash
# Add custom query
node scripts/eav-remote-cli.js cfg querysql add student \
  --sql "SELECT row_id, jsonb_build_object('name', name) as attributes FROM view WHERE row_id = ANY('{{row_ids}}'::uuid[])" \
  --description "Optimized student query"

# Enable/disable
node scripts/eav-remote-cli.js cfg querysql update student --enable
```

## API Service Management (NEW)

Service-based queries with automatic SQL optimization and native table support. Three service types are available: eav, eav_plus, and native.

```bash
# List all API services
node scripts/eav-remote-cli.js cfg service list

# Create eav service (parse → translate to EAV SQL → execute)
node scripts/eav-remote-cli.js cfg service create student_query \
  --sql "SELECT id, name, email FROM student WHERE status = 'active'" \
  --type eav \
  --description "Active students query"

# Create eav_plus service (parse → ensure native table → execute native SQL)
node scripts/eav-remote-cli.js cfg service create student_query_plus \
  --sql "SELECT id, name, email FROM student WHERE status = 'active'" \
  --type eav_plus \
  --description "Active students with auto native table creation"

# Create native service (execute SQL directly, no entity involvement)
node scripts/eav-remote-cli.js cfg service create external_data_query \
  --sql "SELECT * FROM external_table WHERE created_at > NOW() - INTERVAL '7 days'" \
  --type native \
  --description "External data query"

# Get service details
node scripts/eav-remote-cli.js cfg service get student_query

# Update service
node scripts/eav-remote-cli.js cfg service update student_query --description "Updated description"
node scripts/eav-remote-cli.js cfg service update student_query --disable
node scripts/eav-remote-cli.js cfg service update student_query --enable

# Delete service
node scripts/eav-remote-cli.js cfg service delete student_query

# Test service without executing
node scripts/eav-remote-cli.js cfg service test student_query --dry-run
```

### Service Types

| Type | Description | Best For | Performance |
|------|-------------|----------|-------------|
| `eav` | Parse → translate to EAV SQL → execute | Complex EAV queries, dynamic schema | Standard |
| `eav_plus` | Parse → ensure native table → execute native SQL | High-performance queries, stable schema | 10x-100x faster |
| `native` | Execute SQL directly | External tables, legacy data | Fastest |

## Standard Field Template Management

Manage predefined attribute templates with standard properties.

```bash
# List all 37 standard column templates with their properties
node scripts/eav-remote-cli.js cfg template column list

# Sync template properties to an entity attribute
# (when attribute name matches template name)
node scripts/eav-remote-cli.js cfg entity column sync template student email

# Sync with explicit template name (when different from attribute name)
node scripts/eav-remote-cli.js cfg entity column sync template student contact_email --template email

# Preview sync changes without applying
node scripts/eav-remote-cli.js cfg entity column sync template student email --dry-run
```

## Service Atomic Operations

Manage atomic services for dynamic default value generation.

```bash
# List all available atomic services
node scripts/eav-remote-cli.js cfg service atomic list

# Run an atomic service with parameters
node scripts/eav-remote-cli.js cfg service atomic run uuid --param "{}"
node scripts/eav-remote-cli.js cfg service atomic run timestamp --param '{"format":"%s"}'
node scripts/eav-remote-cli.js cfg service atomic run random --param '{"min":1,"max":100}'
node scripts/eav-remote-cli.js cfg service atomic run sequence --param '{"start":1000}'
```

## JWT Management

JWT token generation and secret management for user authentication.

```bash
# Show current JWT secret and its source
node scripts/eav-remote-cli.js jwt show secret

# Create JWT token with user_id claim
node scripts/eav-remote-cli.js jwt create --user-id 123

# Create JWT token with custom claims
node scripts/eav-remote-cli.js jwt create --user-id 123 --format json
```
