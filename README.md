# Stepfun.ai TTS for n8n

n8n 社区节点，集成 Stepfun.ai 文本转语音（TTS）能力。

---

## 目录

- [项目概览](#项目概览)
- [前置环境要求](#前置环境要求)
- [快速开始](#快速开始)
- [n8n 本地启动指南](#n8n-本地启动指南)
- [一键部署与启动](#一键部署与启动)
- [节点开发指南](#节点开发指南)
- [节点参数](#节点参数)
- [输出](#输出)
- [测试流程](#测试流程)
- [项目结构](#项目结构)
- [相关链接](#相关链接)

---

## 项目概览

本项目是一个 n8n 社区自定义节点，提供 Stepfun.ai 的 TTS（文本转语音）能力。开发时需要配合 n8n 主项目一起使用。

项目目录关系（推荐放在同级目录）：

```
parent-dir/
├── n8n/              # n8n 主项目（后端 + 前端）
└── n8n-node/         # 本项目（自定义节点）
```

## 前置环境要求

- **Node.js** >= 22.16（推荐通过 nvm 管理）
- **pnpm** >= 10.22.0（n8n 主项目使用 pnpm 工作区）
- **npm**（本项目使用 npm）
- **PostgreSQL**（n8n 默认数据库，也可使用 SQLite）
- **nvm**（可选但推荐，脚本会自动切换 Node 版本）
- **Git**

---

## 快速开始

### 1. 安装

将编译产物复制到 n8n 自定义节点目录：

```bash
# 克隆并编译
git clone https://github.com/owenshen0907/n8n-node-stepfun.git
cd n8n-node-stepfun
npm install
npm run build

# 复制到 n8n 自定义目录
mkdir -p ~/.n8n/custom
cp package.json ~/.n8n/custom/
cp -r dist ~/.n8n/custom/

# 重启 n8n
# Docker: docker restart n8n
# 本地: 重新运行 n8n
```

### 2. 配置凭证

1. 进入 n8n → **Settings** → **Credentials** → **Add Credential**
2. 搜索 `Stepfun AI API Key`
3. 填写：
   - **API Key**: 你的 Stepfun API Key（获取地址：https://platform.stepfun.ai/interface-key）
   - **Base URL**: `https://api.stepfun.ai/v1`（默认值，一般无需修改）
4. 点击 **Save**，凭证会自动验证连通性

### 3. 使用节点

1. 在工作流编辑器中，点击 **+** 添加节点
2. 搜索 `Stepfun` 或 `TTS`
3. 选择 **Stepfun.ai** 节点（默认名称：Convert Text Into Speech）

---

## n8n 本地启动指南

n8n 是一个基于 pnpm workspace + Turbo 的 monorepo 项目，包含后端（Express）和前端（Vue 3 + Vite）。

### 方法一：使用 local-dev.sh 一键启动

本项目已包含 `scripts/local-dev.sh`，可复制到 n8n 项目后一键启动完整开发环境。

```bash
# 将脚本复制到 n8n 项目
cp scripts/local-dev.sh /path/to/n8n/scripts/local-dev.sh
chmod +x /path/to/n8n/scripts/local-dev.sh

# 进入 n8n 项目并启动
cd /path/to/n8n
bash scripts/local-dev.sh
```

脚本执行流程：

1. **准备 Node.js 与 pnpm** — 通过 nvm 切换到 Node 23.3.0，激活 pnpm 10.22.0
2. **安装依赖** — 执行 `pnpm install`
3. **构建项目** — 执行 `pnpm build`，日志输出到 `build.log`
4. **启动服务** — 后端 `pnpm --filter=n8n dev` 在后台运行，前端 `pnpm --filter=n8n-editor-ui dev` 在前台运行

启动成功后：

- 后端 API：`http://localhost:5678`
- 前端 Dev Server：`http://localhost:5173`（Vite 热更新）
- 按 `Ctrl+C` 停止所有服务

### 方法二：手动分步启动

如果你更喜欢手动控制各个步骤：

```bash
cd /path/to/n8n

# 1. 确保 Node 和 pnpm 版本正确
nvm use 23.3.0
corepack prepare pnpm@10.22.0 --activate

# 2. 安装依赖
pnpm install

# 3. 构建所有包（首次或依赖变更后需要）
pnpm build

# 4. 在两个终端分别启动
# 终端 1 — 后端
pnpm --filter=n8n dev

# 终端 2 — 前端
pnpm --filter=n8n-editor-ui dev
```

### 方法三：使用 n8n 内置的开发命令

```bash
cd /path/to/n8n

# 全栈开发（后端 + 前端同时启动）
pnpm dev

# 仅后端
pnpm dev:be

# 仅前端
pnpm dev:fe

# AI 相关包开发
pnpm dev:ai
```

### 数据库配置

n8n 支持 PostgreSQL 和 SQLite。在 n8n 项目根目录的 `.env` 文件中配置：

```env
# PostgreSQL（推荐）
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=localhost
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=root
DB_POSTGRESDB_PASSWORD=your_password

# 或使用 SQLite（无需额外配置，适合快速测试）
# DB_TYPE=sqlite
```

---

## 一键部署与启动

本项目提供了 `scripts/deploy-and-start.sh`，可以一键完成编译自定义节点、部署到 n8n、并启动开发环境。

### 使用方式

```bash
# 默认假设 n8n 项目在同级目录 ../n8n
./scripts/deploy-and-start.sh

# 或指定 n8n 项目路径
./scripts/deploy-and-start.sh /path/to/n8n
```

### 脚本执行流程

1. **编译本项目** — `npm install && npm run build`
2. **部署到 ~/.n8n/custom** — 复制 `package.json`、`dist/` 到自定义节点目录
3. **同步 local-dev.sh** — 将最新的启动脚本复制到 n8n 项目
4. **启动 n8n** — 调用 `local-dev.sh` 启动后端和前端

### 手动部署（不启动 n8n）

如果你只想部署节点而不启动 n8n：

```bash
# 编译
npm run build

# 部署
mkdir -p ~/.n8n/custom
cp package.json ~/.n8n/custom/
cp -r dist ~/.n8n/custom/

# 之后手动重启 n8n 即可
```

---

## 节点开发指南

### 开发工作流

推荐的日常开发流程：

```bash
# 1. 在 n8n-node 项目中修改代码
cd /path/to/n8n-node
vim nodes/StepFunTts/StepFunTts.node.ts

# 2. 编译并部署
npm run build
cp package.json ~/.n8n/custom/
cp -r dist ~/.n8n/custom/

# 3. 重启 n8n 查看效果
# （如果 n8n 正在运行，需要 Ctrl+C 停止后重新启动）
```

### 监听模式开发

使用 `build:watch` 可以在修改 TypeScript 后自动编译：

```bash
# 终端 1 — 监听编译
npm run build:watch

# 终端 2 — 手动复制编译产物（每次改动后）
cp package.json ~/.n8n/custom/ && cp -r dist ~/.n8n/custom/
```

> **提示**：n8n 目前不支持热加载自定义节点，每次更新后需要重启 n8n 才能生效。

### 创建新节点

```bash
# 使用 n8n-node-dev CLI 创建新节点模板
npm run new
```

### 项目文件说明

```bash
npm install         # 安装依赖
npm run build       # 编译 TypeScript + 复制资源文件
npm run build:watch # 监听模式（仅 TypeScript 编译）
npm run new         # 创建新节点/凭证模板
```

---

## 节点参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Text | 字符串 | 是 | 要转换的文本，最大 1000 字符 |
| Voice | 下拉选择 | 是 | 音色（从 API 动态加载可用音色列表） |
| Model | 下拉选择 | 是 | TTS 模型，当前支持 `step-tts-2` |
| Output Format | 下拉选择 | 否 | 音频格式：MP3（默认）、AAC、FLAC、WAV、PCM、Opus |

## 输出

节点输出包含两部分：

**JSON 数据**：
```json
{
  "text": "输入的文本",
  "voice": "所选音色",
  "model": "step-tts-2",
  "outputFormat": "mp3"
}
```

**Binary 数据**：
- 属性名：`audio`
- 包含生成的音频文件（如 `stepfun-tts.mp3`）
- 可直接连接下游节点使用（如发送邮件、保存文件等）

---

## 测试流程

### 基本功能测试

1. **创建凭证** → 验证保存时是否提示连接成功
2. **新建工作流** → 添加 Manual Trigger + Stepfun.ai 节点
3. **配置节点**：
   - Text: `Hello, this is a test of Stepfun TTS.`
   - Voice: 从下拉列表中选择一个音色
   - Model: `step-tts-2`
   - Output Format: `MP3`
4. **执行工作流** → 检查输出：
   - JSON 中有 text、voice、model、outputFormat 字段
   - Binary 中有 audio 属性，可点击播放/下载

### 测试项清单

- [ ] 凭证创建并验证通过
- [ ] Voice 下拉列表能正常加载音色
- [ ] 输入中文文本，生成音频正常
- [ ] 输入英文文本，生成音频正常
- [ ] 切换不同 Output Format（MP3/WAV/FLAC/Opus/PCM），均能正常输出
- [ ] 文本为空时，报错提示合理
- [ ] API Key 错误时，报错提示合理
- [ ] 批量输入（多条 item）时，每条均正常生成音频

### 导入模板测试

也可以直接导入预置模板来测试：

1. 在 n8n 中点击 **Import from File**
2. 选择 `templates/stepfun-tts-basic.json`
3. 替换凭证中的 `REPLACE_ME` 为你的凭证 ID
4. 执行工作流

---

## 项目结构

```
n8n-node/
├── credentials/                 # 凭证定义
│   └── StepFunApi.credentials.ts
├── nodes/                       # 节点实现
│   └── StepFunTts/
│       └── StepFunTts.node.ts
├── icons/                       # 节点图标
│   └── stepfun.png
├── templates/                   # 工作流模板
│   └── stepfun-tts-basic.json
├── scripts/
│   ├── local-dev.sh             # n8n 本地开发启动脚本
│   ├── deploy-and-start.sh      # 一键部署并启动 n8n
│   ├── copy-assets.cjs          # 构建时复制资源文件
│   └── n8n-node-dev.cjs         # n8n-node-dev CLI 包装
├── dist/                        # 编译输出（git ignored）
├── package.json
└── tsconfig.json
```

---

## 相关链接

- Stepfun 开放平台：https://platform.stepfun.ai/
- API Key 管理：https://platform.stepfun.ai/interface-key
- n8n 官网：https://n8n.io/
- n8n 社区节点开发文档：https://docs.n8n.io/integrations/creating-nodes/
