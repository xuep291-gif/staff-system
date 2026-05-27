---
description: SQL Query Execution Skill
---

# SQL Query Execution

This skill covers the `query` command, which allows you to execute predefined SQL queries categorized by domains (e.g., system, business).

## General Usage

```bash
# List all available domains
node scripts/eav-remote-cli.js query --list-domains

# List all queries in a specific domain (e.g., system)
node scripts/eav-remote-cli.js query --domain system --list-queries

# Execute a query without parameters
node scripts/eav-remote-cli.js query --domain system --query list-tables

# Output formats: json, table, pretty (default)
node scripts/eav-remote-cli.js query --domain system --query list-tables --format json
```

## Executing Queries with Parameters

You can pass extra parameters to queries using the `--param` flag in `key=value` format.

```bash
# Execute query with a parameter
node scripts/eav-remote-cli.js query --domain system --query describe-table --param table=users
```
