---
description: Row Data Management Skill
---

# Row Data Management

This skill covers the `row` commands used for full CRUD operations on entity instances.

**Listing rows for inspection:** Prefer **`cfg entity data list <ENTITY>`** (see `cfg-schema.md`)—same pagination/filter/format flags, clearer for “entity data” queries. Use **`row list`** below when you rely on `row` subcommand semantics or legacy docs/scripts.

**Important Option Placement:**
- Global options (`--format`, `--fields`, `--exclude-fields`, `--org-id`, `--appid`, `--dry-run`) **MUST** be placed *before* the subcommand (`list`, `create`, `update`, etc.).
- Subcommand options (`--page`, `--sort`, `--filter`, `--data`, `--row-id`) **MUST** be placed *after* the subcommand.

## List Operations

**Default page size (agents):** If the user does **not** specify another size, use **`--page 1 --page-size 5`**. The CLI’s built-in default is **50** per page—do not use that implicitly for ad-hoc entity browsing. Prefer **`--page` / `--page-size`** long flags (short flags after the entity name can mis-parse on some builds). Do not bump `--page-size` or walk all pages to dump the full dataset unless the user explicitly asks for a full listing or export. Invoke `eav-remote-cli.js` per root `SKILL.md`: the wrapper loads `.env` itself—do not read `.env` with tools to build inline env.

```bash
# List first page, 5 rows (recommended default for agents unless user overrides)
node scripts/eav-remote-cli.js row list users --page 1 --page-size 5

# List all rows on one page (explicit large page only when user asks)
node scripts/eav-remote-cli.js --format json row list users --page 1 --page-size 50

# List with pagination and sorting
node scripts/eav-remote-cli.js row list users --page 2 --page-size 20 --sort age --order desc

# Filtering (Operators: eq, ne, gt, lt, ge, le, like, ilike)
node scripts/eav-remote-cli.js row list users --filter "status:eq=active" --filter "age:gt=18"

# Field Selection
node scripts/eav-remote-cli.js --fields "id,name,email" row list users
```

## Get Operations

```bash
# Get by integer ID
node scripts/eav-remote-cli.js row get users 123

# Get by UUID row_id
node scripts/eav-remote-cli.js row get users --row abc-123-def

# Get by field value
node scripts/eav-remote-cli.js row get-by-field users email "john@example.com"
```

## Create Operations

```bash
# Create with inline JSON string
node scripts/eav-remote-cli.js row create users --data '{"name":"John","email":"john@example.com","age":30}'

# Specify a custom row_id
node scripts/eav-remote-cli.js row create users --row-id "custom-uuid" --data '{"name":"Jane"}'

# Dry run (preview)
node scripts/eav-remote-cli.js --dry-run row create users --data '{"name":"Test"}'
```

## Update & Patch Operations

- `update` performs a full replacement of the entity attributes.
- `patch` performs a partial update, only modifying the provided attributes.

```bash
# Full update by integer ID
node scripts/eav-remote-cli.js row update users 123 --data '{"name":"John Updated","email":"new@email.com"}'

# Partial update (patch) by UUID row_id
node scripts/eav-remote-cli.js row patch users --row abc-123-def --data '{"status":"inactive"}'
```

## Upsert Operations

Insert if not exists, update if exists based on a key field.

```bash
# Upsert based on email
node scripts/eav-remote-cli.js row upsert users --key-field email --data '{"email":"john@example.com","name":"John"}'

# On-conflict strategies: skip, error, update (default)
node scripts/eav-remote-cli.js row upsert users --key-field email --on-conflict skip --data '{"email":"john@example.com"}'
```

## Delete Operations

```bash
# Delete by integer ID (auto-confirm with --yes)
node scripts/eav-remote-cli.js row delete users 123 --yes

# Delete by UUID row_id
node scripts/eav-remote-cli.js row delete users --row abc-123-def --yes
```
