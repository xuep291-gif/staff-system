---
name: eav-skill
description: >-
  EAV CLI Root Skill - Entry point for dynamically loading EAV CLI sub-skills.
  Use this to discover and route to the specific CLI capability needed.
---

# EAV CLI Skill

## Global install (optional)

Symlink this directory to `~/.claude/skills/eav-skill` for Claude Code:

```bash
node cli/skills/scripts/install.js
```

(Run from the `eav-rust` repository root; adjust the path if your cwd differs.) Uninstall: `node cli/skills/scripts/uninstall.js`.

You are an agent interacting with the EAV system via the `eav-cli` command-line tool. The capabilities of this CLI are vast, so they are divided into specialized sub-skills.

To use the CLI effectively, you should dynamically load the required sub-skill based on the user's request.

### Conventions (single source of truth)

All operational rules for `eav-cli` / `eav-remote-cli.js` (pagination, proxy/env, output shape, failure handling) live **in this skill directory** (`SKILL.md` + sub-skills such as `cfg-schema.md`, `row.md`). Keep this skill **self-contained and generic**; project- or product-specific guidance belongs in those repositories, not embedded here.

- **Errors / connectivity**: On any `eav-cli` execution error or connection failure, print the **raw tool output** and produce a **Bugfix requirements** note if appropriate; do **not** spin up open-ended code-level root-cause analysis or environment probing unless the user explicitly asks for that.
- **Strict routing**: Read this `SKILL.md`, then the relevant sub-skill (`row.md`, `cfg-schema.md`, etc.), before running commands.
- **Proxy / `.env` (agents)**: Never read `.env` with tools to assemble inline env for `eav-remote-cli.js`; the wrapper loads `./.env` (cwd) → `~/.env` → `scripts/.env` automatically (see **Environment** below). Use repo root as cwd when the proxy URL is stored there.

### Output Guidelines

- **No Field Truncation**: Always show all relevant data fields/columns returned by the CLI. Never omit columns.
- **Entity data listing (default)**: For “查询实体数据 / list entity rows”, prefer **`cfg entity data list <ENTITY>`** (see `cfg-schema.md`). Unless the user explicitly asks for a different page size, pass **`--page 1 --page-size 5`** (this subcommand’s CLI default is **20**—do not rely on it for agent probes). Use **`--format json`** when you need machine-stable output. Still state **total row count** when the CLI prints it. **Do not** re-run with a larger `--page-size` or extra pages to dump all rows unless the user clearly asks for a full listing, export, or “all data”.
- **`row list` (fallback)**: Use **`row list`** only if the task needs `row`-specific behavior or existing automation references it; its default page size is **50**—same agent override **`--page 1 --page-size 5`**. See `row.md` for option placement.
- **Record / display limit**: For any other large dump, default to surfacing **5 items** unless the user requests more; always indicate totals when the tool reports them.
- **Zero Filler**: Strip all conversational padding (e.g., "I have executed...", "Here is the table...").
- **Direct Output**: Provide data or command results immediately without any introductory or concluding text.

## How to use the CLI Proxy

The CLI is accessed remotely via the bundled Node.js wrapper `scripts/eav-remote-cli.js`. This script is self-contained within the skills directory and does not depend on the local `eav-rust` source code.

### Environment (agents — required behavior)

- **Do not** open or parse `.env` with editor tools to build `EAV_PROXY_URL=...` (or other vars) on the command line. **Do not** teach workflows that depend on reading a repository’s secrets into the transcript. Configuration is loaded **inside** `eav-remote-cli.js` at startup: existing shell env is respected; then, **per variable**, the first file in this chain that defines it wins: **`./.env` in `process.cwd()`** → **`~/.env`** → **`scripts/.env`** next to the wrapper. To pick up a service repo’s `EAV_PROXY_URL`, run Node with **`cwd` set to that repo root** (so its `./.env` applies), or set the variable once in your shell, or use `scripts/.env` / `~/.env` for machine-local defaults.
- The skill documents **how to invoke** the script; it does not prescribe where `.env` files live beyond the merge order above.

```bash
# Example: cwd = repo that contains ./.env with EAV_PROXY_URL (script loads it automatically)
node /path/to/eav-skill/scripts/eav-remote-cli.js <command> [subcommand] [args...] [--options...]

# Example: cwd = skill directory; use scripts/.env or ~/.env, or export EAV_PROXY_URL in the shell
cd /path/to/eav-skill && node scripts/eav-remote-cli.js <command> [subcommand] [args...] [--options...]
```

If you use a local `eav-cli` binary with `DATABASE_URL` instead of the proxy, commands are the same but invoked as `eav-cli ...`; follow that binary’s own env / config conventions.

## Available Sub-Skills

Depending on the task, read the corresponding sub-skill document to understand the exact commands and parameters available.

1. **Schema & Configuration (`cfg-schema.md`)**
   - **Load when:** You need to create, update, or list entities, **list entity instance rows (`cfg entity data list`)**, attributes, annotations, route mappings, API services, or custom query SQL.
   - **Commands:** `cfg entity` (including `cfg entity data list`), `cfg attribute`, `cfg annotation`, `cfg route`, `cfg service`, `cfg querysql`.

2. **Row Data Management (`row.md`)**
   - **Load when:** You need **mutating** entity instance operations (create/update/patch/delete/upsert), or **`row list`** where scripts require it.
   - **Commands:** `row list`, `row get`, `row create`, `row update`, `row patch`, `row delete`, `row upsert`.

3. **Import & Export (`import-export.md`)**
   - **Load when:** You need to import/export SQL DDL files, or YAML configuration files containing entity schemas.
   - **Commands:** `ddl import`, `ddl export`, `cfg import yaml`, **`cfg export yaml`**.

4. **Hybrid Storage & Cache (`hybrid-cache.md`)**
   - **Load when:** You need to optimize performance using native tables, migrate data between EAV and Table modes, or manage the query cache.
   - **Commands:** `cfg table`, `cfg migrate`, `cfg verify`, `cache`.

5. **Query Execution (`query.md`)**
   - **Load when:** You need to execute predefined domain-based SQL queries.
   - **Commands:** `query`.

6. **YAML Import Specification (`yaml-spec.md`)**
   - **Load when:** You need to reference the complete YAML entity configuration format.
   - **Contains:** Entity definitions, attribute types, virtual attributes, annotations, routes, search fields, and complete examples.
   - **Quick access:** `node scripts/eav-remote-cli.js --spec`

## Dynamic Loading Instruction

When a user asks you to perform an EAV task:

1. Identify the domain of the task (e.g., modifying an entity schema -> Schema & Configuration).
2. Use your file reading tool to read the corresponding sub-skill file in this directory (same folder as `SKILL.md`, e.g. `cfg-schema.md`).
3. Execute the CLI commands as instructed in the sub-skill document using `eav-remote-cli.js` (or `eav-cli` when using a direct DB connection). For the remote wrapper, set **shell cwd** to the service repo when `EAV_PROXY_URL` lives in that repo’s `./.env`; do not read `.env` via tools to inject env (see **Environment** above).
