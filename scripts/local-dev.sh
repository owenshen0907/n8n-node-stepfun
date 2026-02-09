#!/usr/bin/env bash
set -euo pipefail

# 获取仓库根目录，确保后续命令在项目根上下文运行
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 初始化变量，避免 set -u 在 cleanup 里报错
BACKEND_PID=""

# 如果存在 nvm 配置，则加载，方便后续切换 Node 版本
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

echo "1/4：准备 Node.js 与 pnpm（固定 Node 23.3.0 + pnpm 10.22.0）..."

# 统一使用 Node 23.3.0，避免版本差异导致的依赖问题
nvm install 23.3.0
nvm alias default 23.3.0
nvm use 23.3.0

# 激活核心包管理器提供的 pnpm 10.22.0，并全局安装以保证命令可用
corepack prepare pnpm@10.22.0 --activate
npm install -g pnpm@10.22.0
export PATH="$(npm bin -g):$PATH"
if builtin hash pnpm >/dev/null 2>&1; then
  hash -r
fi

echo "2/4：安装 pnpm 工作区依赖..."

# 进入项目根目录并安装依赖，保证当前状态是最新的
cd "$PROJECT_ROOT"
pnpm install

echo "3/4：构建项目（日志输出到 build.log）..."

# 构建所有包，生成 dist 目录，否则 dev server 会因缺少编译产物而失败
pnpm build > build.log 2>&1
if [ $? -ne 0 ]; then
  echo "构建失败，请检查 build.log"
  tail -n 20 build.log
  exit 1
fi

# 启动后台时记录 PID，便于退出时清理
cleanup() {
  if [[ -n "${BACKEND_PID-}" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "Stopping backend (pid $BACKEND_PID)..."
    kill "$BACKEND_PID"
  fi
}

# 捕获退出信号，确保后台进程不会遗留
trap cleanup EXIT INT TERM

# 提示即将启动后端
echo "4/4：启动后端和前端开发服务器..."

# 后端开发服务器放在后台运行（该包在 packages/cli，名称为 n8n）
pnpm --filter=n8n dev &
BACKEND_PID=$!
echo "后台已启动（PID=${BACKEND_PID}），正在启动前端..."

# 前端在前台运行，这样日志可直接观察
pnpm --filter=n8n-editor-ui dev

# 确保后台在前端退出后也随之终止
if [[ -n "${BACKEND_PID}" ]]; then
  wait "$BACKEND_PID"
fi
