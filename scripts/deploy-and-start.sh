#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# deploy-and-start.sh
# 一键部署自定义节点到 n8n 项目并启动本地开发环境
#
# 用法:
#   ./scripts/deploy-and-start.sh [n8n项目路径]
#
# 参数:
#   n8n项目路径  可选，默认为 ../n8n（即与 n8n-node 同级的 n8n 目录）
#
# 功能:
#   1. 编译本项目（n8n-node）
#   2. 将编译产物复制到 n8n 的自定义节点目录（~/.n8n/custom）
#   3. 将 local-dev.sh 复制到 n8n 项目的 scripts 目录
#   4. 启动 n8n 本地开发环境（后端 + 前端）
###############################################################################

# 获取本项目（n8n-node）的根目录
NODE_PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# n8n 项目路径，默认为同级目录下的 n8n
N8N_PROJECT_ROOT="${1:-$(cd "$NODE_PROJECT_ROOT/.." && pwd)/n8n}"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ─── 检查前置条件 ─────────────────────────────────────────────────────────────

info "检查项目路径..."

if [ ! -d "$NODE_PROJECT_ROOT" ]; then
  error "n8n-node 项目目录不存在: $NODE_PROJECT_ROOT"
fi

if [ ! -d "$N8N_PROJECT_ROOT" ]; then
  error "n8n 项目目录不存在: $N8N_PROJECT_ROOT"
  echo "  用法: $0 [n8n项目路径]"
  echo "  示例: $0 /path/to/n8n"
fi

info "n8n-node 项目: $NODE_PROJECT_ROOT"
info "n8n 项目:      $N8N_PROJECT_ROOT"

# ─── 步骤 1: 编译 n8n-node 项目 ──────────────────────────────────────────────

info "步骤 1/4: 编译自定义节点..."

cd "$NODE_PROJECT_ROOT"
npm install
npm run build

info "编译完成 ✓"

# ─── 步骤 2: 部署到 ~/.n8n/custom ────────────────────────────────────────────

info "步骤 2/4: 部署编译产物到 ~/.n8n/custom..."

CUSTOM_DIR="$HOME/.n8n/custom"
mkdir -p "$CUSTOM_DIR"

# 复制 package.json 和 dist 目录
cp "$NODE_PROJECT_ROOT/package.json" "$CUSTOM_DIR/"
rm -rf "$CUSTOM_DIR/dist"
cp -r "$NODE_PROJECT_ROOT/dist" "$CUSTOM_DIR/"

# 如果有 node_modules 中的运行时依赖，也需要复制
if [ -d "$NODE_PROJECT_ROOT/node_modules" ]; then
  cp -r "$NODE_PROJECT_ROOT/node_modules" "$CUSTOM_DIR/" 2>/dev/null || true
fi

info "自定义节点已部署到 $CUSTOM_DIR ✓"

# ─── 步骤 3: 同步 local-dev.sh 到 n8n 项目 ──────────────────────────────────

info "步骤 3/4: 同步 local-dev.sh 到 n8n 项目..."

N8N_SCRIPTS_DIR="$N8N_PROJECT_ROOT/scripts"
mkdir -p "$N8N_SCRIPTS_DIR"

cp "$NODE_PROJECT_ROOT/scripts/local-dev.sh" "$N8N_SCRIPTS_DIR/local-dev.sh"
chmod +x "$N8N_SCRIPTS_DIR/local-dev.sh"

info "local-dev.sh 已同步到 $N8N_SCRIPTS_DIR ✓"

# ─── 步骤 4: 启动 n8n 开发环境 ──────────────────────────────────────────────

info "步骤 4/4: 启动 n8n 本地开发环境..."
info "─────────────────────────────────────────"
info "  后端: http://localhost:5678"
info "  前端: http://localhost:5173 (Vite dev server)"
info "  按 Ctrl+C 停止"
info "─────────────────────────────────────────"

cd "$N8N_PROJECT_ROOT"
exec bash scripts/local-dev.sh
