#!/bin/bash

# ============================================
# Taizhunle Cloudflare Pages 自动部署配置脚本
# ============================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目配置
PROJECT_NAME="taizhunle-mini"
MIN_NODE_VERSION=18

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 比较版本号
version_ge() {
    [ "$(printf '%s\n' "$1" "$2" | sort -V | head -n1)" = "$2" ]
}

# ============================================
# 步骤 1: 检查 Node.js 和 npm
# ============================================
check_node_npm() {
    print_header "步骤 1: 检查 Node.js 和 npm"
    
    # 检查 Node.js
    if ! command_exists node; then
        print_error "未检测到 Node.js！"
        echo ""
        echo "请先安装 Node.js ${MIN_NODE_VERSION}+ 版本："
        echo "  macOS:   brew install node"
        echo "  Ubuntu:  curl -fsSL https://deb.nodesource.com/setup_${MIN_NODE_VERSION}.x | sudo -E bash - && sudo apt-get install -y nodejs"
        echo "  Windows: https://nodejs.org/zh-cn/download/"
        echo ""
        exit 1
    fi
    
    # 检查 Node.js 版本
    NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
    print_info "检测到 Node.js 版本: v$(node -v | sed 's/v//')"
    
    if [ "$NODE_VERSION" -lt "$MIN_NODE_VERSION" ]; then
        print_error "Node.js 版本过低！需要 ${MIN_NODE_VERSION}+ 版本"
        echo ""
        echo "当前版本: $(node -v)"
        echo "请升级 Node.js 到 ${MIN_NODE_VERSION}+ 版本"
        echo ""
        exit 1
    fi
    
    print_success "Node.js 版本符合要求"
    
    # 检查 npm
    if ! command_exists npm; then
        print_error "未检测到 npm！"
        echo ""
        echo "npm 通常随 Node.js 一起安装，请重新安装 Node.js"
        echo ""
        exit 1
    fi
    
    print_info "检测到 npm 版本: $(npm -v)"
    print_success "npm 已安装"
    echo ""
}

# ============================================
# 步骤 2: 安装 Wrangler CLI
# ============================================
install_wrangler() {
    print_header "步骤 2: 安装 Wrangler CLI"
    
    if command_exists wrangler; then
        WRANGLER_VERSION=$(wrangler --version 2>/dev/null | head -n1 || echo "unknown")
        print_info "检测到已安装的 Wrangler: $WRANGLER_VERSION"
        
        read -p "是否要更新到最新版本？(y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "正在更新 Wrangler..."
            npm install -g wrangler@latest
            print_success "Wrangler 已更新到最新版本"
        else
            print_info "跳过更新，使用现有版本"
        fi
    else
        print_info "正在全局安装 Wrangler CLI..."
        npm install -g wrangler
        print_success "Wrangler CLI 安装完成"
    fi
    
    echo ""
}

# ============================================
# 步骤 3: 登录 Cloudflare
# ============================================
login_cloudflare() {
    print_header "步骤 3: 登录 Cloudflare"
    
    print_info "正在检查登录状态..."
    
    # 尝试获取账户信息来检查是否已登录
    if wrangler whoami >/dev/null 2>&1; then
        ACCOUNT_INFO=$(wrangler whoami 2>/dev/null | grep -E "Account Name|Account ID" || echo "")
        if [ -n "$ACCOUNT_INFO" ]; then
            print_success "已登录 Cloudflare"
            echo "$ACCOUNT_INFO"
            echo ""
            
            read -p "是否要重新登录？(y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_info "使用现有登录状态"
                echo ""
                return 0
            fi
        fi
    fi
    
    print_info "即将打开浏览器进行 Cloudflare 登录..."
    print_warning "请在浏览器中完成登录授权"
    echo ""
    
    sleep 2
    
    if wrangler login; then
        print_success "Cloudflare 登录成功！"
        echo ""
        wrangler whoami
        echo ""
    else
        print_error "Cloudflare 登录失败"
        echo ""
        echo "请检查："
        echo "  1. 浏览器是否成功打开"
        echo "  2. 是否完成了授权"
        echo "  3. 网络连接是否正常"
        echo ""
        exit 1
    fi
}

# ============================================
# 步骤 4: 检查项目
# ============================================
check_project() {
    print_header "步骤 4: 检查 Cloudflare Pages 项目"
    
    print_info "正在查找项目: $PROJECT_NAME"
    
    if wrangler pages project list 2>/dev/null | grep -q "$PROJECT_NAME"; then
        print_success "找到项目: $PROJECT_NAME"
        echo ""
        
        # 显示项目信息
        print_info "项目详情："
        wrangler pages project list | grep -A 5 "$PROJECT_NAME" || true
        echo ""
    else
        print_warning "未找到项目: $PROJECT_NAME"
        echo ""
        echo "可用的项目列表："
        wrangler pages project list
        echo ""
        
        read -p "是否要创建新项目 $PROJECT_NAME？(y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "正在创建项目..."
            wrangler pages project create "$PROJECT_NAME" --production-branch=main
            print_success "项目创建成功"
        else
            print_error "未找到项目，脚本退出"
            exit 1
        fi
    fi
}

# ============================================
# 步骤 5: 配置 Git 自动部署
# ============================================
setup_git_deploy() {
    print_header "步骤 5: 配置 Git 自动部署"
    
    # 检查是否在 Git 仓库中
    if [ ! -d ".git" ]; then
        print_error "当前目录不是 Git 仓库！"
        echo ""
        echo "请先初始化 Git 仓库："
        echo "  git init"
        echo "  git add ."
        echo "  git commit -m 'Initial commit'"
        echo ""
        exit 1
    fi
    
    print_success "检测到 Git 仓库"
    
    # 检查当前分支
    CURRENT_BRANCH=$(git branch --show-current)
    print_info "当前分支: $CURRENT_BRANCH"
    
    # 检查是否有远程仓库
    if git remote -v | grep -q "origin"; then
        REMOTE_URL=$(git remote get-url origin)
        print_info "远程仓库: $REMOTE_URL"
        
        # 检查是否是 GitHub
        if echo "$REMOTE_URL" | grep -q "github.com"; then
            print_success "检测到 GitHub 仓库"
            echo ""
            
            print_info "配置 GitHub 集成..."
            echo ""
            echo "请按照以下步骤在 Cloudflare Dashboard 中配置："
            echo ""
            echo "1. 访问: https://dash.cloudflare.com"
            echo "2. 进入 Pages 项目: $PROJECT_NAME"
            echo "3. 点击 'Settings' → 'Builds & deployments'"
            echo "4. 在 'Source' 部分点击 'Connect to Git'"
            echo "5. 选择 GitHub 并授权"
            echo "6. 选择你的仓库: $(basename "$REMOTE_URL" .git)"
            echo "7. 配置构建设置："
            echo "   - Production branch: main"
            echo "   - Build command: npm run build:client"
            echo "   - Build output directory: dist"
            echo "8. 点击 'Save and Deploy'"
            echo ""
            
            read -p "完成配置后按回车继续..." -r
            echo ""
            
            print_success "Git 自动部署配置完成！"
        else
            print_warning "未检测到 GitHub 仓库"
            echo ""
            echo "Cloudflare Pages 主要支持 GitHub 和 GitLab"
            echo "当前远程仓库: $REMOTE_URL"
            echo ""
            echo "你可以："
            echo "  1. 将代码推送到 GitHub"
            echo "  2. 在 Cloudflare Dashboard 中手动配置 Git 集成"
            echo ""
        fi
    else
        print_warning "未检测到远程仓库"
        echo ""
        echo "请先添加远程仓库："
        echo "  git remote add origin <your-repo-url>"
        echo "  git push -u origin main"
        echo ""
    fi
}

# ============================================
# 步骤 6: 测试部署
# ============================================
test_deployment() {
    print_header "步骤 6: 测试部署"
    
    print_info "正在获取最新部署信息..."
    echo ""
    
    if wrangler pages deployment list --project-name="$PROJECT_NAME" 2>/dev/null | head -20; then
        echo ""
        print_success "部署历史获取成功"
    else
        print_warning "无法获取部署历史"
    fi
    
    echo ""
    read -p "是否要查看实时部署日志？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "正在连接到部署日志..."
        print_warning "按 Ctrl+C 退出日志查看"
        echo ""
        sleep 2
        wrangler pages deployment tail --project-name="$PROJECT_NAME" || true
    fi
}

# ============================================
# 步骤 7: 完成总结
# ============================================
show_summary() {
    print_header "🎉 配置完成！"
    
    echo -e "${GREEN}Git 自动部署已开启！${NC}"
    echo ""
    echo "现在你可以："
    echo ""
    echo "  1️⃣  提交代码："
    echo "     git add ."
    echo "     git commit -m 'Your commit message'"
    echo ""
    echo "  2️⃣  推送到远程仓库："
    echo "     git push origin main"
    echo ""
    echo "  3️⃣  Cloudflare 会自动："
    echo "     ✅ 检测到新的提交"
    echo "     ✅ 自动运行构建"
    echo "     ✅ 自动部署到生产环境"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📝 常用命令："
    echo ""
    echo "  查看项目列表:"
    echo "    wrangler pages project list"
    echo ""
    echo "  查看部署历史:"
    echo "    wrangler pages deployment list --project-name=$PROJECT_NAME"
    echo ""
    echo "  手动部署:"
    echo "    npm run build:client"
    echo "    wrangler pages deploy dist --project-name=$PROJECT_NAME"
    echo ""
    echo "  查看实时日志:"
    echo "    wrangler pages deployment tail --project-name=$PROJECT_NAME"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${BLUE}📚 更多信息:${NC}"
    echo "  Cloudflare Dashboard: https://dash.cloudflare.com"
    echo "  Wrangler 文档: https://developers.cloudflare.com/workers/wrangler/"
    echo ""
}

# ============================================
# 主函数
# ============================================
main() {
    clear
    
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║     Taizhunle Cloudflare Pages 自动部署配置脚本       ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    
    print_info "开始配置 Cloudflare Pages 自动部署..."
    echo ""
    
    sleep 1
    
    # 执行所有步骤
    check_node_npm
    install_wrangler
    login_cloudflare
    check_project
    setup_git_deploy
    test_deployment
    show_summary
    
    print_success "所有步骤完成！"
    echo ""
}

# 运行主函数
main
