# GitHub Pages 博客使用指南

## 🌐 博客地址

### 博客首页
```
https://hkwyl.github.io/my-blog/
```

### 管理面板
```
https://hkwyl.github.io/my-blog/#/admin
```
**登录密码**：`admin123`

---

## 🚀 首次设置（必须完成）

### 步骤1：启用 GitHub Pages

1. 访问：https://github.com/hkWyl/my-blog/settings/pages
2. 在 **"Build and deployment"** 部分：
   - **Source**: 选择 `Deploy from a branch`
   - **Branch**:
     - 第一个下拉框选择 `gh-pages`
     - 第二个下拉框选择 `/ (root)`
3. 点击 **Save** 按钮
4. 等待1-2分钟部署完成
5. 页面顶部会显示访问地址：https://hkwyl.github.io/my-blog/

### 步骤2：配置 Gitee Token

1. 访问管理面板：https://hkwyl.github.io/my-blog/#/admin
2. 输入密码：`admin123`
3. 点击 **"系统配置"** 标签
4. 输入你的 Gitee Access Token
5. 点击 **"验证 Token"**
6. 点击 **"保存配置"**

**获取 Gitee Token**：
- 访问：https://gitee.com/profile/personal_access_tokens
- 点击 **"生成新令牌"**
- 勾选 `projects` 权限
- 点击 **"提交"**
- 复制生成的 Token

---

## 📝 日常使用

### 写文章

**方法1：通过管理面板（推荐）**
1. 访问：https://hkwyl.github.io/my-blog/#/admin
2. 登录后点击 **"文章管理"**
3. 点击 **"+ 新建文章"**
4. 填写文章信息：
   - 标题、日期、文件名
   - 分类、标签、摘要
   - 正文内容（Markdown格式）
5. 点击 **"发布文章"**
6. 刷新博客首页即可看到新文章

**方法2：直接在 Gitee 仓库编辑**
1. 访问：https://gitee.com/love-little-monster/my-blog-posts
2. 创建新的 `.md` 文件
3. 按以下格式编写：

```markdown
---
title: 文章标题
date: 2025-12-22
categories: [分类1, 分类2]
tags: [标签1, 标签2]
excerpt: 文章摘要
---

# 正文内容

这里是文章正文...
```

4. 提交后刷新博客即可看到

### 更新个人资料

1. 访问管理面板
2. 点击 **"个人资料"** 标签
3. 修改：
   - 博客标题
   - 副标题
   - 作者名称
   - 头像链接
   - 社交链接
4. 点击 **"保存更改"**
5. 刷新博客查看效果

### 部署更新

当你修改了博客源代码后：

```bash
cd /home/wyl/blog/gitee-blog
./deploy.sh
```

这个脚本会自动：
1. 构建项目
2. 推送到 GitHub Pages
3. GitHub 会自动部署（1-2分钟）

---

## 🔧 常用操作

### 修改登录密码

1. 访问：`src/config/admin.config.js`
2. 找到 `passwordHash` 字段
3. 使用 SHA-256 工具生成新密码的哈希值：https://emn178.github.io/online-tools/sha256.html
4. 替换 `passwordHash` 的值
5. 运行 `./deploy.sh` 重新部署

### 更改 Token

1. 访问管理面板
2. 点击 **"系统配置"**
3. 输入新的 Token
4. 点击 **"验证 Token"**
5. 点击 **"保存配置"**

---

## 📂 项目结构

```
my-blog/
├── 博客前端（GitHub Pages）    → https://hkwyl.github.io/my-blog/
├── 管理面板（GitHub Pages）    → https://hkwyl.github.io/my-blog/#/admin
└── 文章存储（Gitee仓库）      → https://gitee.com/love-little-monster/my-blog-posts
```

### 数据流

```
管理面板
    ↓ 保存文章/资料
Gitee 仓库 (my-blog-posts)
    ↓ 读取数据
博客前端
```

---

## ⚡ 快速命令

### 本地开发
```bash
cd /home/wyl/blog/gitee-blog
pnpm dev
```
访问：http://localhost:3000

### 构建
```bash
pnpm build
```

### 部署到 GitHub Pages
```bash
./deploy.sh
```

### 提交源代码到 GitHub
```bash
git add -A
git commit -m "你的提交信息"
git push github master:main
```

---

## 🎯 功能清单

### 博客前端
- [x] 文章列表展示
- [x] 文章详情查看
- [x] 分类/标签筛选
- [x] 文章搜索
- [x] 归档页面
- [x] 关于页面
- [x] 暗色/亮色模式

### 管理面板
- [x] 文章管理（增删改查）
- [x] 个人资料编辑
- [x] Token 管理
- [x] Markdown 编辑器
- [x] 实时预览

### 数据同步
- [x] 文章自动同步到 Gitee
- [x] 个人资料自动同步
- [x] 博客自动获取最新数据
- [x] 无需手动部署即可更新内容

---

## 🐛 常见问题

### 1. 博客显示404
**原因**：GitHub Pages 未启用或正在部署中
**解决**：
- 访问：https://github.com/hkWyl/my-blog/settings/pages
- 检查配置是否正确
- 等待1-2分钟部署完成

### 2. 管理面板保存失败
**原因**：Token 未配置或无效
**解决**：
- 检查 Token 是否已在管理面板配置
- 确认 Token 具有 `projects` 权限
- 重新生成并配置新 Token

### 3. 文章没有显示
**原因**：文章格式错误或缓存问题
**解决**：
- 检查文章的 Front Matter 格式是否正确
- 刷新页面（Ctrl+F5 强制刷新）
- 在管理面板重新保存文章

### 4. 个人资料更新没生效
**原因**：未保存到 Gitee 或缓存问题
**解决**：
- 确认点击了 "保存更改"
- 强制刷新页面（Ctrl+F5）
- 检查浏览器控制台是否有错误

---

## 🔒 安全建议

1. **定期更换 Token**
   - 每3-6个月更换一次
   - 如发现泄露立即更换

2. **修改默认密码**
   - 使用强密码
   - 不要使用简单密码如 admin123

3. **不要泄露 Token**
   - Token 存储在浏览器本地
   - 不要分享给他人
   - 不要提交到公开代码库

---

## 📞 技术支持

遇到问题请检查：
1. GitHub Pages 是否已正确启用
2. Token 是否配置正确
3. 浏览器控制台是否有错误信息
4. 网络连接是否正常

---

## 🎉 开始使用

1. ✅ 启用 GitHub Pages：https://github.com/hkWyl/my-blog/settings/pages
2. ✅ 配置 Gitee Token
3. ✅ 写第一篇文章
4. ✅ 自定义个人资料
5. ✅ 分享你的博客：https://hkwyl.github.io/my-blog/

**祝你使用愉快！** 🚀
