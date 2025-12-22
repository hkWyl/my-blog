# bug毁灭者 - 个人技术博客

基于 **Vue 3 + Vite + GitHub** 搭建的现代化个人博客系统。

## 🌟 特性

- ✅ 文章存储在 Gitee 仓库，支持 Markdown 格式
- ✅ 文章分类和标签管理
- ✅ 全文搜索功能
- ✅ 暗色模式支持
- ✅ 响应式设计，完美适配移动端
- ✅ 代码高亮显示
- ✅ 支持评论系统（Gitalk）
- ✅ 一键部署到 GitHub Pages

## 📦 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **路由管理**: Vue Router
- **HTTP 请求**: Axios
- **Markdown**: Marked.js
- **代码高亮**: Highlight.js
- **评论系统**: Gitalk
- **托管平台**: Gitee Pages

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:3000

### 生产构建

```bash
pnpm build
```

### 一键部署到 GitHub Pages

```bash
./deploy.sh
```

## 📝 写博客

在 `my-blog-posts` 仓库中创建 `.md` 文件：

```markdown
---
title: 文章标题
date: 2025-12-19
categories: [分类1, 分类2]
tags: [标签1, 标签2]
excerpt: 文章摘要
---

# 正文内容

这里是文章正文...
```

推送到 Gitee 后，运行 `./deploy.sh` 部署，文章会自动显示在博客中！

## 🔧 配置

修改 `src/config/blog.config.js` 自定义博客配置：

```javascript
export default {
  title: 'bug毁灭者',
  subtitle: '记录技术成长的点点滴滴',
  author: '小小怪',
  gitee: {
    owner: 'love-little-monster',
    repo: 'my-blog-posts',
  },
  // ... 更多配置
}
```

## 📂 项目结构

```
gitee-blog/
├── src/
│   ├── api/          # Gitee API 封装
│   ├── assets/       # 样式文件
│   ├── components/   # Vue 组件
│   ├── composables/  # 组合式函数
│   ├── config/       # 配置文件
│   ├── router/       # 路由配置
│   ├── utils/        # 工具函数
│   ├── views/        # 页面组件
│   ├── App.vue
│   └── main.js
├── deploy.sh         # 部署脚本
├── vite.config.js
└── package.json
```

## 🌐 在线访问

- **博客地址**: https://hkwyl.github.io/my-blog/
- **管理面板**: https://hkwyl.github.io/my-blog/#/admin （密码：admin123）
- **文章仓库**: https://gitee.com/love-little-monster/my-blog-posts
- **博客仓库**: https://github.com/hkWyl/my-blog

## 📄 开源协议

MIT License

---

**由 Claude Code AI 助手协助开发** 🤖
