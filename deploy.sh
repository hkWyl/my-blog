#!/bin/bash

# Gitee Pages 一键部署脚本

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
echo "开始部署到 Gitee Pages..."

# 2. 进入 dist 目录
cd dist

# 3. 初始化 git（如果还没有）
if [ ! -d ".git" ]; then
    git init
fi

# 4. 添加所有文件
git add -A

# 5. 提交
git commit -m "Deploy to Gitee Pages - $(date '+%Y-%m-%d %H:%M:%S')"

# 6. 强制推送到 Gitee Pages 分支
echo ""
echo "正在推送到 Gitee..."
git push -f https://gitee.com/love-little-monster/my-blog.git master:gh-pages

# 7. 返回项目根目录
cd ..

echo ""
echo "✅ 部署完成！"
echo ""
echo "📝 接下来的步骤："
echo "1. 访问 https://gitee.com/love-little-monster/my-blog"
echo "2. 点击 '服务' -> 'Gitee Pages'"
echo "3. 选择 'gh-pages' 分支"
echo "4. 点击 '启动' 或 '更新'"
echo ""
echo "🌐 你的博客地址："
echo "   https://love-little-monster.gitee.io/my-blog/"
