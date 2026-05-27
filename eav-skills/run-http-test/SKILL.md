---
name: run-http-test
description: >-
  Runs repository `.http` API tests via the global `run-http-test` command and
  zero-test HTTP runner (`zero-test/skills/zero-test-skill/test-runner-simple.js`).
  Use when the user asks to run or execute `*.http` tests, building http suites,
  or filter by TC id.
---

# HTTP Run & Test（`run-http-test`）

本文档说明仓库内 `.http` 自动化测试的**执行方式**，并记录 **zero-test HTTP runner**（`zero-test/skills/zero-test-skill/test-runner-simple.js`）联调时的常见问题。经验来自固定资产管理 (`building`) 等模块。

---

## 1. 何时加载本 Skill

在识别到用户意图为以下任一类时，**先读本文件再执行命令**：

- 运行 / 执行 **`*.http`** 测试（如「跑 building 的 http」「`run-http-test` …」「执行某某 `.http`」）
- 按用例过滤（如 `--filter TC-001`）
- 排查 **Status 0** 等与 runner 相关的现象

---

## 2. 执行方式（`run-http-test`）

**前提**：全局命令 `run-http-test` 已在 `PATH` 中（例如将**当前 Git 仓库根**加入 `PATH`，或对仓库根下的 `run-http-test` 脚本在 `~/bin` 等处做符号链接）。依赖本机已安装 `node`、`bash`。

**用法**：`.http` 路径先按**当前 Shell 工作目录（`PWD`）**解析；若该路径不是已存在的文件，再按 **`run-http-test` 脚本所在目录**（即仓库根，由 `BASH_SOURCE` 解析，含符号链接）拼接同一路径再试一次。建议在仓库根下执行示例命令，最不易歧义。

```bash
run-http-test 模块名/http/xxx-test.http
run-http-test 模块名/http/xxx-test.http --filter TC-001
run-http-test @模块名/http/xxx-test.http --filter TC-001
```

- **帮助**：`run-http-test --help`

---

## 3. 服务端环境与网络问题

### 3.1 `Connection Error (Status 0)`

**问题表现**：测试报错 `Request failed with status 0`。

**原因分析**：指定的 `@baseUrl` 无法连通，比如指向了未启动的 `http://localhost:3000`。

**处理方式**：遇到此情况，直接向用户报告即可，由用户解决服务启动或网络连通性问题，无需深入分析。
