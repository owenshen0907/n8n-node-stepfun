# Stepfun.ai TTS for n8n

`@stepfun/n8n-nodes-stepfun-integration` 是一个 n8n 社区节点，用于在 n8n 中调用 Stepfun.ai 文本转语音（TTS）能力。

- NPM: https://www.npmjs.com/package/@stepfun/n8n-nodes-stepfun-integration
- GitHub: https://github.com/owenshen0907/n8n-node-stepfun

## 功能说明

- 将文本转换为语音音频
- 支持输出格式：`mp3`、`aac`、`flac`、`wav`、`pcm`、`opus`
- 输出 `binary.audio`，可直接接入后续节点

## 安装方式

### 1) Self-Hosted：Community Nodes（推荐）

1. 在工作流编辑器点击 `+` 添加节点。
2. 进入 `Settings` -> `Community Nodes`。
3. 输入包名：`@stepfun/n8n-nodes-stepfun-integration` 并安装。
4. 重启 n8n。
5. 在节点搜索中输入 `Stepfun` 或 `TTS` 使用节点。

### 2) 手动 npm 安装（`~/.n8n/nodes`）

```bash
mkdir -p ~/.n8n/nodes
cd ~/.n8n/nodes
npm init -y
npm install @stepfun/n8n-nodes-stepfun-integration
```

安装后重启 n8n。

### 3) 本地开发调试（`~/.n8n/custom`）

适合开发阶段验证本地代码，不依赖 npm 最新发布版本。

```bash
# 在本仓库中
npm install
npm run build

mkdir -p ~/.n8n/custom
cp package.json ~/.n8n/custom/
rm -rf ~/.n8n/custom/dist
cp -r dist ~/.n8n/custom/
```

然后重启 n8n。

也可以使用仓库脚本一键部署并启动本地 n8n 开发环境：

```bash
bash ./scripts/deploy-and-start.sh /path/to/n8n
```

### 4) Docker / Compose 安装

确保 n8n 数据目录已挂载：

```yaml
services:
  n8n:
    image: n8nio/n8n:latest
    volumes:
      - ~/.n8n:/home/node/.n8n
```

在宿主机执行：

```bash
# 方式 A：安装 npm 包
mkdir -p ~/.n8n/nodes
cd ~/.n8n/nodes
npm init -y
npm install @stepfun/n8n-nodes-stepfun-integration
```

然后重启容器。

如果要测试本地开发代码（非 npm 包），请改为把本仓库 `dist` 同步到 `~/.n8n/custom/dist`，再重启容器。

## 发布 npm 后如何生效

- `npm publish` 只会发布新版本，不会让已安装的 n8n 实例自动更新。
- 已安装实例需要手动更新后再重启 n8n。
- 使用 `~/.n8n/custom` 的本地开发模式时，n8n 读取的是你本地 `dist`，与 npm 上的新版本无关。

手动更新示例：

```bash
cd ~/.n8n/nodes
npm update @stepfun/n8n-nodes-stepfun-integration
```

更新后重启 n8n。

## 凭证配置

1. 在 n8n 中进入 `Credentials`。
2. 新建 `Stepfun AI API Key`。
3. 填写以下参数：
   - `API Key`: 你的 Stepfun API Key（https://platform.stepfun.ai/interface-key）
   - `Base URL`: `https://api.stepfun.ai/v1`
4. 保存凭证。

## 节点参数

- `Text`: 需要转换的文本内容
- `Voice`: 音色
- `Model`: 模型（默认 `step-tts-2`）
- `Output Format`: 音频格式

## 输出说明

节点会输出：

- `json`: 本次请求的参数信息
- `binary.audio`: 生成的音频文件

你可以将 `binary.audio` 连接到邮件、存储、HTTP 上传等后续节点。

## 常见问题

### 节点安装后看不到

- 确认已重启 n8n
- 确认安装包名为 `@stepfun/n8n-nodes-stepfun-integration`
- 在节点搜索中使用 `Stepfun` 或 `TTS`

### 本地改了代码但不生效

- 确认已执行 `npm run build`
- 确认已把 `dist` 复制到 `~/.n8n/custom/dist`
- 确认重启了 n8n（或重启容器）

### 发布 npm 后线上实例没变化

- `npm publish` 不会自动更新已有安装
- 需要在实例里执行更新（GUI 或 `npm update`）
- 更新后需要重启 n8n

### 凭证验证失败

- 检查 `API Key` 是否有效
- 检查 `Base URL` 是否为 `https://api.stepfun.ai/v1`
- 检查服务器是否可访问外网

## 许可证

MIT
