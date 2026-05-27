---
name: run-yaml-import
description: >-
  Runs `eav-cli cfg import yaml` / `cfg export yaml` in the host repo: if `eav-cli --help`
  succeeds, use only local `eav-cli` (skip eav-remote-cli); otherwise fall back to
  `~/.claude/skills/eav-skill/scripts/eav-remote-cli.js` with EAV_PROXY_URL; post-import audit via re-export
  and comparison. Classifies loopback proxy as local.
---

# EAV YAML 配置导入 / 导出

本 Skill 约束 **在本仓库内如何执行** `cfg import yaml` 与 **`cfg export yaml`**：

1. **先探测本地 `eav-cli` 是否可用**（见 §3.1）。**可用则全程只用 `eav-cli`**，**不调用** `eav-remote-cli.js`。
2. 仅当本地 **`eav-cli` 不可用**（不在 PATH 或 `eav-cli --help` 失败）时，**回退**到经 **`EAV_PROXY_URL`** 的 **`eav-remote-cli.js`**（代理可能在同一台机器，见「本地语义」）。

**子命令、分页、代理错误处理、与 `eav-remote-cli` 的约定** 仍以全局 **[`~/.claude/skills/eav-skill`](~/.claude/skills/eav-skill)** 的 `SKILL.md` 及 **`import-export.md`** 为真源；此处不重复全文，只写本仓库的执行策略与路径。

---

## 1. 何时加载本 Skill

在识别到用户意图为以下任一类时，**先读本文件再执行命令**：

- 执行 / 重新执行 **YAML 导入**（`cfg import yaml`）或 **YAML 导出**（`cfg export yaml`）
- 将某模块下的 **`\*-api-config.yaml`** / **`eav-config/\*.yaml`** 同步到目标库
- 口述「导入 building yaml」「跑一下 yaml import」「把配置写进 EAV」「导出某实体 yaml」等
- **导入后验收 / audit**（重新导出并与源 YAML 或基线做比较）

---

## 2. 工作目录与环境

1. **Shell 工作目录**：使用**当前承载本配置与业务 YAML 的 Git 仓库根目录**（含 `./.env`、且作为 `--file` / 相对路径基准的那一层；与本仓库根目录 **`CLAUDE.md`**、`run-http-test` 等约定一致），以便 `./.env` 被各工具按约定加载。
2. **环境变量**：由 **用户在 shell 中** `source .env` 或已 `export` 的变量生效即可。**不要**用编辑器/读取工具把 `.env` 内容展开到对话里。
3. **YAML 路径**：对 `--file` 使用**相对上述仓库根**的路径（例如 `<业务模块>/api/<域>-api-config.yaml`）。若仓库内 **`eav-rust` 为指向仓库外的符号链接**，在仓库根以外执行 `cargo run --bin eav-cli` 时，对 `--file` 优先使用**仓库根的绝对路径**，避免 `../` 解析到错误目录。

### 2.1 本地语义（`EAV_PROXY_URL`）

在已加载环境（如 shell 中 `source .env`）的前提下，根据 **`EAV_PROXY_URL`** 判断代理是否视为**本机**（用于表述与排障；**仅在选择远程路径时**有意义）：

- **本机代理**：URL 的 host 为 **`localhost`**、**`127.0.0.1`**，或 **`::1`**（常见写法如 **`http://127.0.0.1:…`**、**`http://localhost:…`**；任意端口）时，视为代理跑在**本机回环**上；此时回退路径仍是「本机 Node → 本机/本机容器内的 `eav-cli-proxy`」，不要误称为「远端机房」。
- **非本机代理**：host 为其它主机名、局域网 IP、公网域名等时，视为**另一节点**上的代理；网络、TLS、防火墙等与「本机回环」排查不同。

**不要**在文档或对话中写死某磁盘路径；`eav-rust` 与 `eav-cli` 二进制位置因克隆目录、工作区挂载方式而异，以用户环境为准。

---

## 3. 执行顺序（必须遵守）

### 3.1 本地探测：可用则只用 `eav-cli`（跳过远程）

按顺序执行（均在**仓库根**、已按需 `source .env` 的前提下）：

1. **`command -v eav-cli`**（或用户提供的 **`eav-cli` 绝对路径**）是否在 PATH 上可解析。
2. **可执行性**：运行 **`eav-cli --help`**（或同一二进制路径的 **`/path/to/eav-cli --help`**），**退出码为 0** 即视为**本地 CLI 可用**。
3. **一旦判定本地可用**：
   - **所有**本 Skill 触发的 **`cfg import yaml`**、**`cfg export yaml`**（及同一轮任务中相关的 `cfg` YAML 子命令）**一律使用 `eav-cli`**；
   - **不要**再调用 **`eav-remote-cli.js`**，也不要因存在 **`EAV_PROXY_URL`** 而改走代理（避免旧版 `eav-cli-proxy` 与单文件 YAML 打包不一致等问题）。
4. 典型命令形态：

   ```bash
   cd <repository-root>
   set -a && [ -f .env ] && . ./.env && set +a
   eav-cli cfg import yaml --file <相对路径> [--dry-run] [--mode skip|append|replace] [--org-id …] [--import-routes …]
   eav-cli cfg export yaml [--entity …] [--stdout] …
   ```

5. **本地模式下直连库失败**（例如未配置 **`DATABASE_URL`** / 要求 **`--db-url`**、连接拒绝）：在输出中给出**原始错误**，并提示检查 `.env` 或 CLI 参数；**不自动切换**到 `eav-remote-cli.js`，除非用户**明确要求**经代理执行，或 **§3.1 探测未通过**因而从未进入本地模式。

### 3.2 回退：仅当本地 `eav-cli` 不可用 — `eav-remote-cli.js`（经 `EAV_PROXY_URL`）

**仅当** `eav-cli` 不在 PATH，或 **`eav-cli --help` 非 0 / 无法启动**时进入本分支。

1. 仍在仓库根执行，保证 `./.env` 中的 **`EAV_PROXY_URL`**（及代理侧需要的变量）可被 Node 进程继承。按 **上文「本地语义」** 区分本机回环代理与其它主机代理，便于日志与连通性说明。
2. 使用全局 eav-skill 自带的 **`~/.claude/skills/eav-skill/scripts/eav-remote-cli.js`**（**cwd 仍为仓库根**，以便 `./.env` 与 `--file` 相对路径生效；`eav-remote-cli.js` 会按约定加载 `cwd` 下的 `./.env`）。若本机未安装该 skill，按全局 eav-skill 说明完成安装后再用此路径。

   ```bash
   cd <repository-root>
   set -a && [ -f .env ] && . ./.env && set +a
   node ~/.claude/skills/eav-skill/scripts/eav-remote-cli.js cfg import yaml --file <相对路径> [--dry-run] [--mode skip|append|replace] …
   ```

3. **依赖**：若报错 `Cannot find module 'js-yaml'`，在 **`~/.claude/skills/eav-skill/scripts`** 目录执行一次 `npm install` 后再重试。
4. **代理版本**：若 stderr 出现 `unexpected argument '--mode'` 等 **子命令顺序** 相关错误，或 **`Either --file, --dir, or --yaml must be specified for YAML import`** 且请求已带 YAML 内容，说明远端 **`eav-cli-proxy`** 可能为旧构建；需在部署 **`eav-cli-proxy`** 的环境重新编译部署 **`eav-rust`**，或在本机安装/配置 **`eav-cli`** 后走 **§3.1**。

---

## 4. 模式与验收建议

- **`--dry-run`**：首次或高风险变更前先预览。
- **`--mode`**：实体已存在且需**补路由/补属性**时优先 **`append`**；需整实体替换时用 **`replace`**（破坏性高，需用户明确意图）。
- 导入后验收：按全局 eav-skill 使用 `cfg route list` / `cfg entity get` 等（具体以 `--help` 为准）；**与导入文件做一致性核对时**，优先按 **§6 导入后 Audit** 执行。

---

## 5. 与全局 eav-skill 的分工

| 内容 | 以谁为准 |
|------|-----------|
| 本仓库 **本地 `eav-cli --help` 探测**、**可用则跳过远程**、直连失败不自动改代理、**`EAV_PROXY_URL` 是否本机回环**、**`scripts/yaml-audit.js`**、`npm install`、**导入后 Audit（§6）** | **本 Skill** |
| `cfg import yaml` / `cfg export yaml` 全量参数、代理、`row`/`cfg` 其它子命令 | **`~/.claude/skills/eav-skill`** |

---

## 6. 导入后 Audit

在 **`cfg import yaml` 成功**（退出码 0、摘要无失败）之后，对**本次涉及的实体**做 audit：用 **`yaml-audit.js`** 将**源 YAML** 与**重新导出**的 YAML 逐项对比。**PASS 条件**：每个实体的 **Differences 差异项计数为 0**（与源完全一致）；任一非零即 **FAIL**，`audit_exit` 为 **1**。

### 6.1 何时做

- 高风险 / 首次导入、或用户要求「验收 / audit」时**必须**做。
- 工具选择与 §3 一致：本地 **`eav-cli --help` 可用则 export / audit 均用 `eav-cli`**。

### 6.2 标准流程（推荐）

均在**仓库根**、`source .env` 后执行。设：

- `SRC` = 源 YAML，如 `<模块>/api/<域>-api-config.yaml`
- `ENTITIES` = 从 `SRC` 的 `entities[].name` 逗号拼接
- `AUDIT` = `<模块>/api/<域>-api-config.audit-export.yaml`（勿覆盖 `SRC`）
- `REPORT` = `<模块>/api/output/yaml-audit-report.md`

```bash
cd <repository-root>
set -a && [ -f .env ] && . ./.env && set +a

# 1) 快速：实体在库且规模合理
eav-cli cfg export yaml --entity "$ENTITIES" --dry-run

# 2) 重新导出（证据文件）
eav-cli cfg export yaml --entity "$ENTITIES" -o "$AUDIT"

# 3) 严格比对 + 报告（yaml-audit.js 会就地过滤 export 中的 null 键后写回）
node rules/skills/run-yaml-import/scripts/yaml-audit.js \
  --source "$SRC" --export "$AUDIT" \
  --warn "t_eav_entity_many missing → peers not exported (non-blocking)" \
  -o "$REPORT"
echo "audit exit: $?"   # 0=PASS（零差异项）, 1=FAIL
```

首次若报 `js-yaml not found`，在 **`rules/skills/run-yaml-import/scripts`** 执行一次 **`npm install`** 后重试。

**向用户交付**：给出 **`REPORT` 路径**、**Overall PASS/FAIL**（仅零差异为 PASS）、**Differences** 全文；`echo` 的退出码与脚本一致。

### 6.3 比对规则（脚本逻辑，严格）

| 维度 | 规则 |
|------|------|
| **PASS** | 对每个源实体：**差异项总数为 0**（实体元数据、`search_fields`、属性 missing/extra、属性字段、路由 missing/extra 均无条目）。 |
| **属性** | 源与导出属性名集合须**完全一致**；同名属性的 `type` / `is_*` / `default` / `annotations` / `join_*` 等须与源一致（`integer` 与 `number` 视为兼容）。 |
| **路由** | 源声明的路由须在导出中覆盖；导出**多出**源未声明的路由（如 CRUD `{id}`、杂项 segment）**计为差异**，不能 PASS。 |
| **整文件 diff** | 仍不作主判据；以 **Differences** 与 **Diffs** 计数为准。 |

依赖：**Node.js** + **`js-yaml`**（`rules/skills/run-yaml-import/scripts` 下 `npm install`；亦可复用 `~/.claude/skills/eav-skill/scripts/node_modules`）。无 `js-yaml` 时退化为 §6.2 步骤 1 的 `--dry-run` 数量核对 + 对关键实体 `cfg entity get` / `cfg route list` 抽检。

### 6.4 说明

- 当前 **`eav-cli cfg export yaml`** 常省略 `domain`、`resource_identifier`、`search_fields`，且虚拟属性 `join_*`、只读标记等与手写源不完全一致 —— 在严格模式下会 **FAIL**，属**导出能力与真源对齐**问题，不代表导入未执行；要拿到 PASS 需**对齐导出格式**或**收窄比对范围**（未来可通过脚本参数实现）。
- 导出 stderr 出现 **`t_eav_entity_many` 不存在**：写入 `--warn`；若影响导出内容仍会计入差异。
