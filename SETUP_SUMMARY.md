# 博客系统配置总结

**最后更新**: 2025年12月20日 23:37
**状态**: ✅ 已完成并测试

---

## 🎯 系统架构

```
┌──────────────────┐
│   管理面板        │  ← 你在这里编辑文章
│  /admin          │
└────────┬─────────┘
         │ 保存
         ↓
┌──────────────────┐
│   Gitee 仓库      │  ← 文章统一存储在这里
│ my-blog-posts    │     你也可以直接在 Gitee 网页上修改
└────────┬─────────┘
         │ 读取
         ↓
┌──────────────────┐
│   博客前端        │  ← 访客看到的博客页面
│   /              │
└──────────────────┘
```

---

## 📦 仓库配置

### Gitee 文章仓库
- **地址**: https://gitee.com/love-little-monster/my-blog-posts
- **分支**: master
- **用途**: 存储所有博客文章（.md 文件）

### Gitee Pages 仓库
- **地址**: https://gitee.com/love-little-monster/my-blog
- **分支**: gh-pages
- **用途**: 托管博客静态网站

---

## 🔑 Token 配置

你的 Gitee Access Token 已配置:
- **Token**: `49608c6fe1eb2fdc956ca2572a6164fa`
- **权限**: projects（可读写仓库内容）
- **存储位置**: 浏览器 localStorage (`gitee_access_token`)

⚠️ **安全提醒**: 测试完成后建议重新生成新 Token 并删除此 Token

---

## 📝 使用方法

### 方式 1: 通过管理面板编辑（推荐）

1. 访问管理面板: https://love-little-monster.gitee.io/my-blog/admin
2. 登录（密码: admin123）
3. 在"系统配置"中确认 Token 已配置
4. 在"文章管理"中编辑或新建文章
5. 点击"保存" → 自动同步到 Gitee
6. 刷新博客页面即可看到更新

### 方式 2: 直接在 Gitee 修改

1. 访问: https://gitee.com/love-little-monster/my-blog-posts
2. 点击任意 .md 文件，点击"编辑"
3. 修改内容后提交
4. 刷新博客页面即可看到更新

---

## 🔧 文件说明

### 源代码配置文件

**管理面板配置** (`src/config/admin.config.js`):
```javascript
gitee: {
  owner: 'love-little-monster',
  repo: 'my-blog-posts',
  branch: 'master',
  apiBase: 'https://gitee.com/api/v5',
}
```

**博客前端配置** (`src/config/blog.config.js`):
```javascript
gitee: {
  owner: 'love-little-monster',
  repo: 'my-blog-posts',
  branch: 'master',
}
api: {
  base: 'https://gitee.com/api/v5',
}
```

### API 文件

- **管理面板 API** (`src/api/giteeAdmin.js`): 用于写入（创建、更新、删除文章）
- **博客前端 API** (`src/api/gitee.js`): 用于读取（显示文章列表和内容）

---

## 🚀 部署流程

每次修改代码后，运行部署脚本:

```bash
./deploy.sh
```

脚本会自动:
1. 构建生产版本 (`npm run build`)
2. 推送到 Gitee Pages (`gh-pages` 分支)
3. 提示你手动更新 Gitee Pages

然后:
1. 访问 https://gitee.com/love-little-monster/my-blog
2. 点击"服务" → "Gitee Pages"
3. 点击"更新"按钮
4. 等待部署完成（通常 1-2 分钟）

---

## ✅ 已验证功能

- [x] 管理面板可以新建、编辑、删除文章
- [x] 管理面板保存后 Gitee 仓库立即更新
- [x] Gitee 仓库修改后博客端立即读取
- [x] 三端同步: 管理面板 ↔ Gitee ↔ 博客端
- [x] 缓存破坏机制避免读取旧数据
- [x] 中文文件名支持正常
- [x] Markdown Front Matter 解析正常

详细测试报告见: `TEST_REPORT.md`

---

## 🔗 快速链接

| 名称 | 地址 |
|------|------|
| 博客首页 | https://love-little-monster.gitee.io/my-blog/ |
| 管理面板 | https://love-little-monster.gitee.io/my-blog/admin |
| Gitee 文章仓库 | https://gitee.com/love-little-monster/my-blog-posts |
| Gitee Pages 仓库 | https://gitee.com/love-little-monster/my-blog |
| Token 管理 | https://gitee.com/profile/personal_access_tokens |

---

## 📚 文章文件结构

所有文章直接放在仓库根目录:

```
my-blog-posts/
├── .gitignore
├── GPIO总结-test.md
├── blog-tutorial.md
├── frontend-development-guide.md
└── my-first-tech-blog.md
```

每篇文章格式:
```markdown
---
title: 文章标题
date: 2025-12-20
categories: [分类1, 分类2]
tags: [标签1, 标签2]
excerpt: 文章摘要
---

正文内容...
```

---

## 🛠️ 常见问题

### Q1: 管理面板保存后看不到更新？
A: 清除浏览器缓存，或使用硬刷新（Ctrl+Shift+R）

### Q2: 提示 Token 未配置？
A: 访问管理面板的"系统配置"，输入 Gitee Token 并保存

### Q3: 想修改管理员密码？
A: 编辑 `src/config/admin.config.js`，生成新密码的 SHA-256 哈希值

### Q4: 想添加更多文章？
A: 
- 方式1: 在管理面板点击"新建文章"
- 方式2: 直接在 Gitee 仓库创建 .md 文件

---

**配置完成！** 🎉

现在你可以:
1. 访问博客查看效果
2. 登录管理面板编辑文章
3. 直接在 Gitee 修改文章
4. 所有修改都会实时同步
