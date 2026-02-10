# Stepfun.ai TTS for n8n

`@owenshen0907/n8n-nodes-stepfun-tts` 是一个 n8n 社区节点，用于调用 Stepfun.ai 的文本转语音（TTS）能力。

- NPM: https://www.npmjs.com/package/@owenshen0907/n8n-nodes-stepfun-tts
- GitHub: https://github.com/owenshen0907/n8n-node-stepfun

## 当前状态

- 包已经发布到 npm，可用于自建 / 私有 n8n 环境。
- n8n Public Cloud 中是否能“直接搜索安装”，取决于 n8n 对该社区节点的收录/审核状态。
- 在被 n8n 收录前，开发和测试建议先在本地或私有部署环境使用 npm 安装。

## 功能

- 将输入文本转换为音频
- 支持输出格式：`mp3`、`aac`、`flac`、`wav`、`pcm`、`opus`
- 输出 binary 音频数据（字段名：`audio`）

## 开发阶段：直接用 npm 安装

### 方式一：Self-hosted 的 Community Nodes 页面安装（推荐）

1. 打开 n8n 管理后台 `Settings` -> `Community Nodes`
2. 输入包名：`@owenshen0907/n8n-nodes-stepfun-tts`
3. 安装后重启 n8n
4. 在节点搜索中输入 `Stepfun` 或 `TTS`

### 方式二：本地目录手动安装（CLI）

```bash
mkdir -p ~/.n8n/nodes
cd ~/.n8n/nodes
npm init -y
npm install @owenshen0907/n8n-nodes-stepfun-tts
```

安装后重启 n8n。

### 方式三：Docker / Compose 环境

确保映射 n8n 数据目录：

```yaml
services:
  n8n:
    image: n8nio/n8n:latest
    volumes:
      - ~/.n8n:/home/node/.n8n
```

然后在宿主机执行：

```bash
mkdir -p ~/.n8n/nodes
cd ~/.n8n/nodes
npm init -y
npm install @owenshen0907/n8n-nodes-stepfun-tts
```

最后重启容器。

## 节点配置

1. 在 `Credentials` 新建 `Stepfun AI API Key`
2. 参数填写：
   - `API Key`: https://platform.stepfun.ai/interface-key
   - `Base URL`: `https://api.stepfun.ai/v1`
3. 在节点里填写 `Text`，选择 `Voice`、`Model`、`Output Format`

## 维护者：npm 发布流程

### 1. 修改版本号

```bash
npm version patch
# 或 npm version minor / major
```

### 2. 安装并构建

```bash
rm -rf dist node_modules package-lock.json
npm install
npm run build
```

### 3. 登录 npm（确保是正确账号）

```bash
npm login --registry=https://registry.npmjs.org/
npm whoami --registry=https://registry.npmjs.org/
```

### 4. 发布（2FA 账号需要 OTP）

```bash
npm publish --access public --registry=https://registry.npmjs.org/ --otp=6位验证码
```

### 5. 验证发布

```bash
npm view @owenshen0907/n8n-nodes-stepfun-tts version --registry=https://registry.npmjs.org/
```

并打开页面确认：

- https://www.npmjs.com/package/@owenshen0907/n8n-nodes-stepfun-tts

### 6. 等待 n8n 收录（面向 Public Cloud）

npm 发布成功后，Public Cloud 是否可搜索安装仍取决于 n8n 收录进度。收录完成后，用户可在编辑器中搜索 `Stepfun` 或 `TTS` 直接安装。

## 许可证

MIT
