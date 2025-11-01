#!/bin/bash

# Taizhunle 开发环境启动脚本

echo "🚀 启动 Taizhunle 开发环境..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "⚠️ .env 文件不存在，从模板复制..."
    cp .env.example .env
    echo "📝 请编辑 .env 文件配置必要的环境变量"
fi

# 启动开发服务器
echo "🔧 启动开发服务器..."
npm run dev

echo "✅ 开发环境启动完成！"
echo "📍 前端: http://localhost:5173"
echo "📍 后端: http://localhost:3001"
echo "📍 健康检查: http://localhost:3001/health"