# 解决CORS问题 - 将文章迁移到GitHub

## 📋 快速操作步骤

### 步骤1：在GitHub创建文章仓库（1分钟）

1. **访问**：https://github.com/new
2. **填写信息**：
   - Repository name: `my-blog-posts`
   - Description: `个人博客文章存储`
   - 选择：**Public**（公开）
   - **不要**勾选 "Add a README file"
3. **点击**：`Create repository`

### 步骤2：推送文章到GitHub（自动）

创建好仓库后，运行以下命令：

```bash
cd /tmp/my-blog-posts
git remote add github git@github.com:hkWyl/my-blog-posts.git
git push github master:main
```

或者使用HTTPS（如果SSH不可用）：
```bash
cd /tmp/my-blog-posts
git remote add github https://github.com/hkWyl/my-blog-posts.git
git push github master:main
```

### 步骤3：更新博客配置（我会帮你做）

更新以下文件使用GitHub API：
- `src/config/blog.config.js`
- `src/config/admin.config.js`
- `src/api/gitee.js` 改为 `src/api/github.js`
- `src/api/giteeAdmin.js` 改为 `src/api/githubAdmin.js`

### 步骤4：重新部署

```bash
cd /home/wyl/blog/gitee-blog
./deploy.sh
```

---

## 🔄 为什么要迁移？

### CORS问题
- ❌ GitHub Pages → Gitee = 跨域被阻止
- ✅ GitHub Pages → GitHub = 同域正常访问

### 迁移后的架构
```
GitHub Pages (托管博客)
    ↓ 同域访问
GitHub 仓库 (存储文章)
```

---

## ⏱️ 现在请完成步骤1

**立即访问**：https://github.com/new

创建 `my-blog-posts` 仓库后，告诉我，我会继续帮你完成后续步骤！
