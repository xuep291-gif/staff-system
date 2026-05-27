---
description: YAML Import Specification - Complete reference for EAV YAML entity configuration format
---

# YAML Import Specification

Complete reference for defining EAV entities, attributes, routes, and relationships via YAML configuration.

## Quick Reference

```bash
# Preview import
node scripts/eav-remote-cli.js cfg import yaml --file config.yaml --dry-run

# Execute import
node scripts/eav-remote-cli.js cfg import yaml --file config.yaml --mode skip
```

## ✅ Basic Entity Configuration Checklist

YAML import/export supports the following basic entity configurations:

| Configuration | Status | Description |
|--------------|--------|-------------|
| **Entity Definition** | ✅ Supported | Entity name, type, description, domain, resource identifier |
| **Attribute Definition** | ✅ Supported | Name, type, field name, default value, validation rules |
| **Field Types** | ✅ Supported | auto_increment, integer, decimal, string, text, date, datetime, json, boolean |
| **Annotations** | ✅ Supported | range, regex, options, default (atomic naming), hide_on_query, ignore_on_update |
| **Virtual Attributes** | ✅ Supported | Cross-entity lookup via join_entity, join_attribute, join_on |
| **Method Scope** | ✅ Supported | Restrict attributes to specific HTTP methods (GET, POST, etc.) |
| **Search Configuration** | ✅ Supported | Universal search with param_name, fields, match_mode (or, exact) |
| **Route Mapping** | ✅ Supported | V1 API route registration with forward_mode, priority, domain |
| **API Service Configuration** | ✅ Supported | Service-based queries with three types: eav, eav_plus, native |
| **Custom Query SQL** | ✅ Supported | Entity-specific custom SQL queries via query_sql field |
| **Entity Operations** | ✅ Supported | Operation definitions with operation_name, category, service_name |

### ❌ Not Supported via YAML Import

The following configurations must be managed through their dedicated CLI commands:

| Configuration | Alternative Command | Description |
|--------------|---------------------|-------------|
| **API Service Management** | `cfg service create` | Service-based queries with automatic optimization |
| **Peer Relationships** | `cfg service query --type relationship` | Entity relationships (migrated from entity_many) |
| **Entity Operations** | `cfg operation` | Entity operation definitions and management |
| **Extensions** | Extension management | CLI extensions and plugins |
| **Organization Services** | `cfg org` | Organization-specific services |

## Root Structure

```yaml
entities:
  - name: string                    # Required
    type: string                    # Optional: ds_entity (default), ds_form, ds_entity_plus
    description: string             # Optional
    domain: string                  # Optional
    resource_identifier: string     # Optional
    table_name: string              # Optional (for ds_entity_plus)
    search_fields: [string]         # Optional
    attributes: [...]               # Required
    routes: [...]                   # Optional
```

## Entity Types

| Type | Description | Use Case |
|------|-------------|----------|
| `ds_form` | Form-based entity | Basic data collection |
| `ds_entity` | Standard entity (default) | Full CRUD with EAV storage |
| `ds_entity_plus` | External table | High-performance native table storage |

## Attribute Definition

```yaml
attributes:
  - name: string                    # Required
    type: string                    # Required
    description: string             # Optional
    is_primary: boolean             # Optional
    is_required: boolean            # Optional
    is_unique: boolean              # Optional
    is_readonly: boolean            # Optional
    default: any                    # Optional
    annotations: [string]           # Optional
```

## Field Types

| Type | Description | Aliases |
|------|-------------|---------|
| `auto_increment` | Auto-incrementing integer ID | auto, serial |
| `integer` | 64-bit signed integer | int, int64, bigint |
| `decimal` | Floating-point number | number, float, double |
| `string` | Short text (up to 255 chars) | - |
| `text` | Long text content | longtext |
| `date` | Date (YYYY-MM-DD) | - |
| `datetime` | Datetime (ISO 8601) | timestamp |
| `json` | JSON data structures | jsonb |
| `boolean` | Boolean (stored as string) | bool |

## Annotations

### Range Validation
```yaml
annotations:
  - "range(0,100)"
  - "range(0.0,4.0)"
```

### Regular Expression
```yaml
annotations:
  - "regex(^[A-Z]{2}\\d{6}$)"
```

### Options (Enum)
```yaml
annotations:
  - "options[active,inactive,graduated]"
```

### Default Value (Atomic Naming Service)
```yaml
annotations:
  - "default(<uuid>)"              # UUID v4
  - "default(<timestamp>)"         # ISO 8601 timestamp
  - "default(<timestamp:format=%s>)"  # Unix timestamp
  - "default(active)"              # Static value
```

### Hide on Query
```yaml
annotations:
  - "hide_on_query"                # Exclude from query responses
```

## Virtual Attributes

Cross-entity lookups without full Entity View configuration.

### Syntax
```yaml
attributes:
  - name: major_name
    type: string
    query_only: true               # Required: marks as virtual
    join_entity: major             # Required: target entity
    join_attribute: name           # Required: field to fetch
    join_on: major_id              # Required: local join field
    join_with: row_id              # Optional: target join field (default)
    description: Major name (virtual)
```

### Example
```yaml
entities:
  - name: college_class
    attributes:
      - name: major_id
        type: string
        description: Major ID reference

      # Virtual: fetch major name
      - name: major_name
        type: string
        query_only: true
        join_entity: major
        join_attribute: name
        join_on: major_id
        join_with: row_id
        description: Major name (virtual)
```

## Search Fields

Define which fields are searchable via keyword search.

### Syntax
```yaml
entities:
  - name: college_student
    search_fields:
      - name
      - email
      - student_number
    attributes: [...]
```

### Behavior
- **With `search_fields`**: Keyword search only searches specified fields
- **Without `search_fields`**: Searches all text-based fields

## Route Definition

Automatic API route registration.

### Syntax
```yaml
routes:
  - path: /api/v1/students        # Required
    methods: [GET, POST]           # Optional
    roles: [admin, teacher]        # Optional
    enabled: true                  # Optional (default: true)
```

### Route Path Patterns
| Pattern | Domain | Result URL |
|---------|--------|------------|
| `/api/v1/students` | null | `/api/v1/students` |
| `/api/v1/edu/students` | `edu` | `/api/v1/edu/students` |
| `/api/v1/asset/builds/beds` | `asset` | `/api/v1/asset/builds/beds` |

## API Service Configuration (NEW)

API Services provide service-based queries with automatic SQL optimization and native table support. Three service types are available for different performance and functionality requirements.

### Service Types

| Service Type | Description | Best For | Performance |
|--------------|-------------|----------|-------------|
| **eav** | Parse query_sql → translate to EAV SQL → execute | Complex EAV queries, dynamic schema | Standard |
| **eav_plus** | Parse query_sql → ensure native table → build and execute native SQL | High-performance queries, stable schema | 10x-100x faster |
| **native** | Execute query_sql directly (no entity involvement) | External tables, legacy data | Fastest |

### Syntax

```yaml
services:
  - service_name: string           # Required
    query_sql: string              # Required
    service_type: string           # Optional: eav (default), eav_plus, native
    description: string            # Optional
    param_schema: object           # Optional (JSON Schema for parameters)
    disabled: boolean              # Optional (default: false)
```

### eav_plus Service Type Features

**Automatic Native Table Creation:**
- Automatically creates native tables when `entity.table_name` is not configured
- Migrates EAV data to native table if table is missing from database
- Ensures optimal query performance with native SQL execution

**Multi-Table JOIN Detection:**
- Detects multi-table JOIN queries with clear error messages
- Supports complex queries across multiple entities
- Provides detailed feedback for query optimization

### Example Configuration

```yaml
services:
  # eav type: Complex EAV query with translation
  - service_name: student_class_query
    query_sql: "SELECT id, name, class_name FROM student WHERE status = 'active'"
    service_type: eav
    description: "Active students with class information (EAV mode)"
    disabled: false

  # eav_plus type: High-performance query with auto native table
  - service_name: student_report_query
    query_sql: "SELECT id, name, gpa, enrollment_date FROM student WHERE gpa >= 3.5"
    service_type: eav_plus
    description: "Dean's list students with auto native table creation"
    disabled: false

  # native type: Direct SQL execution for external data
  - service_name: external_enrollment_query
    query_sql: "SELECT s.id, s.name, e.course_code FROM student s JOIN enrollment e ON s.id = e.student_id WHERE e.term = '2026-01'"
    service_type: native
    description: "Current term enrollments with course information"
    disabled: false
```

### Service Type Behavior

**eav Type:**
- Parses the SQL query to understand the required structure
- Translates the query into EAV multi-table JOINs
- Executes the translated EAV SQL
- Best for complex EAV queries with dynamic schema requirements

**eav_plus Type:**
- Parses the SQL query to understand the required structure
- Checks if native table exists in the database
- Creates native table if missing (auto-generate schema from entity)
- Migrates EAV data to native table if needed
- Builds optimized native SQL query
- Executes query on native table for best performance
- Includes multi-table JOIN detection with clear error messages

**native Type:**
- Executes the query SQL directly without any transformation
- No entity involvement or query translation
- Best for external tables, views, or legacy data integration
- Fastest performance for optimized SQL queries

### When to Use Each Service Type

**Use eav when:**
- Entity schema changes frequently
- Need maximum flexibility for attribute additions
- Complex cross-entity relationships
- Prototyping or early development phase

**Use eav_plus when:**
- Entity has stable schema (rare attribute changes)
- High read volume (reporting, dashboards, analytics)
- Performance is critical for this query
- Need database-level optimizations (indexes, constraints)
- Want native table performance without manual migration

**Use native when:**
- Working with external tables or views
- Legacy data integration
- Custom SQL optimization required
- No entity involvement needed

## Import Modes

| Mode | Description | Behavior |
|------|-------------|----------|
| `skip` | Skip existing (default) | Don't modify existing entities/attributes |
| `replace` | Replace existing | Delete all attributes and recreate |
| `append` | Append to existing | Keep existing attributes, add new ones |

## Complete Example

```yaml
entities:
  - name: college_student
    type: ds_entity
    domain: edu
    resource_identifier: edu:college:student
    description: College student entity
    search_fields:
      - name
      - email
      - student_number
    attributes:
      # Primary key
      - name: id
        type: auto_increment
        is_primary: true
        description: Student ID

      # Unique identifier
      - name: student_number
        type: string
        is_unique: true
        is_required: true
        description: Student number
        annotations:
          - "regex(^[A-Z]{2}\\d{6}$)"

      # Basic fields
      - name: name
        type: string
        is_required: true
        description: Student name

      - name: email
        type: string
        is_unique: true
        is_required: true
        description: Email address
        annotations:
          - "regex(^[\\w-\\.]+@[\\w-]+\\.[a-z]{2,4}$)"

      # Numeric with range validation
      - name: gpa
        type: decimal
        description: Grade point average
        annotations:
          - "range(0.0,4.0)"
        default: 0.0

      # Enum with options
      - name: status
        type: string
        description: Student status
        default: "active"
        annotations:
          - "options[active,inactive,graduated,suspended]"

      # Date fields
      - name: enrollment_date
        type: date
        is_required: true
        description: Date of enrollment
        annotations:
          - "default(<timestamp:format=%Y-%m-%d>)"

      - name: created_at
        type: datetime
        is_readonly: true
        description: Creation timestamp
        annotations:
          - "default(<timestamp>)"

      # Foreign key
      - name: class_id
        type: string
        description: Class ID reference

      # Virtual: class name
      - name: class_name
        type: string
        query_only: true
        join_entity: college_class
        join_attribute: class_name
        join_on: class_id
        join_with: row_id
        description: Class name (virtual)

    routes:
      - path: /api/v1/edu/students
        methods: [GET, POST, PUT, DELETE]
        roles: [admin, teacher, student]
        enabled: true
```

## Best Practices

1. **Always use `--dry-run` first** to validate YAML structure
2. **Use `--mode skip` for safety** in production
3. **Define `search_fields` explicitly** for better search performance
4. **Use virtual attributes** for simple cross-entity lookups
5. **Add descriptions** to all entities and attributes for documentation
6. **Use `resource_identifier`** for RBAC integration
7. **Define routes** for automatic API registration
8. **Use annotations** for data validation
9. **Keep YAML in version control** for schema management

## Import Workflow

```bash
# Step 1: Preview import (dry run)
node scripts/eav-remote-cli.js cfg import yaml --file config.yaml --dry-run

# Step 2: Execute import
node scripts/eav-remote-cli.js cfg import yaml --file config.yaml --mode skip

# Step 3: Verify
node scripts/eav-remote-cli.js cfg entity list
node scripts/eav-remote-cli.js cfg attribute list <entity_name>
```

## CLI Commands

```bash
# Import from file
node scripts/eav-remote-cli.js cfg import yaml --file config.yaml --dry-run
node scripts/eav-remote-cli.js cfg import yaml --file config.yaml --mode skip

# Import from directory
node scripts/eav-remote-cli.js cfg import yaml --dir ./configs --mode skip

# Import from string
node scripts/eav-remote-cli.js cfg import yaml --yaml "entities: [{name: test}]"

# Import with organization context
node scripts/eav-remote-cli.js cfg import yaml --file config.yaml --org-id 2 --appid "my-app"
```

## Validation Rules

1. **Entity name**: 1-100 characters, alphanumeric + underscore
2. **Attribute name**: 1-100 characters, alphanumeric + underscore
3. **Resource identifier**: Max 255 characters
4. **Domain**: Used for API routing and organization
5. **Search fields**: Must be valid attribute names within entity

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `No entities found` | Empty or missing `entities` array | Check YAML structure |
| `Invalid YAML syntax` | Malformed YAML | Use `--dry-run` to validate |
| `Entity already exists` | Duplicate entity name | Use `--mode append` or `--mode replace` |
| `Invalid field type` | Unknown type specified | Check field types section |

---

**See Also:**
- `cfg-schema.md` - Schema management commands
- `import-export.md` - Import/export operations
- `--spec` - Display this specification: `node scripts/eav-remote-cli.js --spec`
