#!/bin/bash

# 一键部署到 GitHub Pages 脚本

echo "🚀 开始部署到 GitHub Pages..."
echo ""

# 1. 构建项目
echo "📦 构建项目..."
pnpm run build

if [ ! -d "dist" ]; then
    echo "❌ 构建失败！"
    exit 1
fi

echo "✅ 构建成功！"
echo ""

# 2. 部署到 GitHub Pages
echo "🌐 部署到 GitHub Pages..."
cd dist

# 初始化 git
if [ ! -d ".git" ]; then
    git init
    git checkout -b gh-pages
fi

# 添加和提交
git add -A
git commit -m "Deploy to GitHub Pages - $(date '+%Y-%m-%d %H:%M:%S')"

# 推送到 GitHub Pages
git push -f git@github.com:hkWyl/my-blog.git gh-pages:gh-pages

cd ..

echo ""
echo "✅ 部署完成！"
echo ""
echo "📝 接下来的步骤："
echo "1. 访问 https://github.com/hkWyl/my-blog/settings/pages"
echo "2. 在 'Source' 下选择 'gh-pages' 分支"
echo "3. 点击 'Save'"
echo "4. 等待1-2分钟"
echo ""
echo "🌐 你的博客将在以下地址访问："
echo "   https://hkwyl.github.io/my-blog/"
echo ""
