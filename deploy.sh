#!/bin/bash

# GitHub Pages 一键部署脚本

echo "开始构建博客..."

# 1. 构建生产版本
pnpm run build

# 检查构建是否成功
if [ ! -d "dist" ]; then
    echo "❌ 构建失败！"
    exit 1
fi

echo "✅ 构建成功！"
echo ""
echo "开始部署到 GitHub Pages..."

# 2. 进入 dist 目录
cd dist

# 3. 初始化 git（如果还没有）
if [ ! -d ".git" ]; then
    git init
    git checkout -b master
fi

# 4. 添加所有文件
git add -A

# 5. 提交
git commit -m "Deploy to GitHub Pages - $(date '+%Y-%m-%d %H:%M:%S')"

# 6. 强制推送到 GitHub Pages 分支
echo ""
echo "正在推送到 GitHub..."
git push -f git@github.com:hkWyl/my-blog.git master:gh-pages

# 7. 返回项目根目录
cd ..

echo ""
echo "✅ 部署完成！"
echo ""
echo "📝 首次部署需要启用 GitHub Pages："
echo "1. 访问 https://github.com/hkWyl/my-blog/settings/pages"
echo "2. Source 选择 'Deploy from a branch'"
echo "3. Branch 选择 'gh-pages' 和 '/ (root)'"
echo "4. 点击 'Save'"
echo ""
echo "🌐 你的博客地址："
echo "   https://hkwyl.github.io/my-blog/"
echo ""
echo "📝 管理面板："
echo "   https://hkwyl.github.io/my-blog/#/admin"
echo "   密码: admin123"
