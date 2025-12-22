# GitHub 迁移完成指南

## ✅ 已完成的工作

1. **代码迁移**
   - ✅ 将所有 Gitee API 更新为 GitHub API
   - ✅ 更新配置文件 (blog.config.js, admin.config.js)
   - ✅ 更新所有组件引用
   - ✅ 构建成功并部署到 GitHub Pages

2. **文章数据准备**
   - ✅ 从 Gitee 克隆了所有文章到 `/tmp/my-blog-posts`
   - ✅ 包含 5 篇文章：
     - GPIO总结.md
     - linux基础知识.md
     - 原子操作和spin-lock.md
     - 容器常用命令.md
     - 网络编程基础.md

## 🎯 接下来需要你完成的步骤

### 步骤 1：创建 GitHub 文章仓库（2分钟）

1. 访问：https://github.com/new
2. 填写信息：
   - Repository name: `my-blog-posts`
   - Description: `个人博客文章存储`
   - 选择：**Public**（公开）
   - **不要**勾选 "Add a README file"
3. 点击：`Create repository`

### 步骤 2：推送文章到 GitHub（1分钟）

创建好仓库后，在终端运行：

```bash
cd /tmp/my-blog-posts
git push github master:main
```

如果提示权限问题，使用 HTTPS：
```bash
git remote remove github
git remote add github https://github.com/hkWyl/my-blog-posts.git
git push github master:main
```

### 步骤 3：获取 GitHub Personal Access Token（3分钟）

1. 访问：https://github.com/settings/tokens/new
2. 填写信息：
   - Note: `Blog Admin Token`
   - Expiration: 选择一个有效期（建议 90 days 或 No expiration）
   - Select scopes: **勾选 `repo`**（完整仓库访问权限）
3. 点击 `Generate token`
4. **重要**：复制生成的 token（只显示一次！）

### 步骤 4：配置博客管理面板（2分钟）

1. 访问博客管理面板：https://hkwyl.github.io/my-blog/#/admin
2. 使用密码登录：`admin123`
3. 点击 "系统配置" 标签页
4. 粘贴你的 GitHub Access Token
5. 点击 "验证 Token" 确认有效
6. 点击 "保存配置"

### 步骤 5：测试功能（5分钟）

在管理面板测试以下功能：

1. **文章管理**
   - 查看文章列表（应该显示 5 篇文章）
   - 编辑一篇文章并保存
   - 新建一篇测试文章

2. **个人资料**
   - 修改博客标题、副标题等
   - 保存后刷新博客首页，查看是否更新

3. **博客浏览**
   - 访问博客首页：https://hkwyl.github.io/my-blog/
   - 点击文章查看详情
   - 测试分类和标签功能

## 📋 关键信息汇总

### 博客访问地址
- 博客首页：https://hkwyl.github.io/my-blog/
- 管理面板：https://hkwyl.github.io/my-blog/#/admin
- 管理密码：`admin123`

### 仓库信息
- 博客代码仓库：https://github.com/hkWyl/my-blog
- 文章存储仓库：https://github.com/hkWyl/my-blog-posts

### 配置信息
- GitHub Owner: `hkWyl`
- 文章仓库名: `my-blog-posts`
- 分支: `main`
- Token 存储位置: 浏览器 localStorage (`github_access_token`)

## 🔧 常见问题

### Q1: 推送文章时提示 "Repository not found"
**A**: 请先在 GitHub 创建 `my-blog-posts` 仓库，参考步骤1。

### Q2: Token 验证失败
**A**: 确保 Token 具有 `repo` 权限，并且仓库信息正确。

### Q3: 博客显示"还没有文章"
**A**: 确保：
1. 已创建 `my-blog-posts` 仓库
2. 已推送文章到仓库
3. 已在管理面板配置有效的 GitHub Token

### Q4: 修改文章后不显示
**A**:
1. GitHub API 可能有缓存（最多1分钟）
2. 刷新浏览器清除缓存（Ctrl + F5）
3. 检查文章的 Markdown 格式是否正确

### Q5: 如何修改管理员密码
**A**:
1. 访问：https://emn178.github.io/online-tools/sha256.html
2. 输入新密码，生成 SHA-256 哈希值
3. 编辑 `src/config/admin.config.js`
4. 替换 `passwordHash` 的值
5. 重新构建并部署：`./deploy.sh`

## 🚀 部署新更改

每次修改代码或配置后，运行：

```bash
cd /home/wyl/blog/gitee-blog
./deploy.sh
```

部署完成后，访问博客查看更改（可能需要等待1-2分钟）。

## 📝 下一步优化建议

1. **性能优化**
   - 代码分割减少首次加载时间
   - 添加图片懒加载

2. **功能增强**
   - 添加搜索功能
   - 支持草稿功能
   - 文章访问统计

3. **安全加固**
   - 修改默认管理员密码
   - 定期更新 GitHub Token

## ✨ 完成！

完成以上步骤后，你的博客将完全基于 GitHub 运行，解决了之前的 CORS 问题。你可以在管理面板在线管理文章，所有更改会自动同步到 GitHub 仓库。

有任何问题，请查看上面的常见问题或检查浏览器控制台的错误信息。
