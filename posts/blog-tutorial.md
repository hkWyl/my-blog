---
title: 从零搭建 Vue3 + Gitee + GitHub Pages 个人博客完整教程
date: 2025-12-19
categories: [教程, 前端, 博客]
tags: [Vue3, Gitee, GitHub Pages, Vite, 个人博客]
excerpt: 一步步教你如何使用 Vue 3、Gitee 和 GitHub Pages 搭建一个功能完整、完全免费的个人博客系统，包括 Markdown 文章管理、分类标签、搜索、暗色模式等功能。
---

# 从零搭建 Vue3 + Gitee + GitHub Pages 个人博客完整教程

## 前言

想要搭建一个属于自己的技术博客吗？本教程将手把手教你使用 **Vue 3 + Gitee + GitHub Pages** 搭建一个功能完整、**完全免费**的个人博客系统！

### 最终效果

- ✅ 精美的 Vue 3 博客界面
- ✅ Markdown 格式写作，支持代码高亮
- ✅ 文章分类和标签管理
- ✅ 全文搜索功能
- ✅ 暗色模式切换
- ✅ 响应式设计，完美支持移动端
- ✅ **完全免费，不需要服务器**
- ✅ 文章存储在 Gitee，网站托管在 GitHub Pages

---

## 技术架构

### 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **路由管理**: Vue Router
- **HTTP 请求**: Axios
- **Markdown 渲染**: Marked.js
- **代码高亮**: Highlight.js
- **文章存储**: Gitee 仓库
- **网站托管**: GitHub Pages

### 架构设计

```
┌─────────────────────────────────┐
│  文章存储：Gitee 仓库            │  ← 写文章推送到这里
│  (Markdown 文件)                │
└─────────────────────────────────┘
              ↓
         Gitee API 读取
              ↓
┌─────────────────────────────────┐
│  博客网站：GitHub Pages          │  ← 用户访问
│  (Vue 3 应用)                   │
└─────────────────────────────────┘
```

**优势**：
- 文章和代码分离
- 推送文章立即生效，无需重新部署网站
- 完全免费

---

## 准备工作

### 环境要求

- Node.js >= 20.0
- pnpm 包管理器
- Git
- Gitee 账号（用于存储文章）
- GitHub 账号（用于托管网站）

### 创建仓库

#### 1. 在 Gitee 创建文章仓库

1. 访问 https://gitee.com/projects/new
2. 仓库名称：`blog-posts`（或其他名称）
3. 是否公开：**公开**（重要！）
4. 初始化：勾选 "使用 Readme 文件初始化这个仓库"
5. 创建

#### 2. 在 GitHub 创建网站仓库

1. 访问 https://github.com/new
2. Repository name: `my-blog`
3. 选择 **Public**
4. **不要勾选** "Add a README file"
5. 创建

---

## 第一步：初始化 Vue 3 项目

### 1.1 创建项目

```bash
# 使用 Vue 官方脚手架创建项目
pnpm create vue@latest

# 配置选项：
✔ Project name: my-blog
✔ Add TypeScript? No
✔ Add JSX Support? No
✔ Add Vue Router? Yes
✔ Add Pinia? No
✔ Add Vitest? No
✔ Add ESLint? Yes
✔ Add Prettier? Yes

# 进入项目目录
cd my-blog

# 安装依赖
pnpm install
```

### 1.2 安装核心依赖

```bash
pnpm add axios marked highlight.js
```

依赖说明：
- `axios`: 调用 Gitee API
- `marked`: Markdown 解析
- `highlight.js`: 代码高亮

---

## 第二步：配置博客系统

### 2.1 创建配置文件

创建 `src/config/blog.config.js`：

```javascript
export default {
  // 博客基本信息
  title: '你的博客标题',
  subtitle: '你的博客副标题',
  author: '你的名字',
  description: '博客描述',

  // Gitee 配置
  gitee: {
    owner: '你的Gitee用户名',  // 替换为你的 Gitee 用户名
    repo: 'blog-posts',        // 文章仓库名
    branch: 'master',
  },

  // API 配置
  api: {
    base: 'https://gitee.com/api/v5',
  },

  // 导航菜单
  nav: [
    { name: '首页', path: '/' },
    { name: '分类', path: '/categories' },
    { name: '标签', path: '/tags' },
    { name: '归档', path: '/archive' },
    { name: '关于', path: '/about' },
  ],

  // 每页显示文章数
  pageSize: 10,
}
```

### 2.2 封装 Gitee API

创建 `src/api/gitee.js`：

```javascript
import axios from 'axios'
import blogConfig from '@/config/blog.config.js'

const giteeApi = axios.create({
  baseURL: blogConfig.api.base,
  timeout: 10000,
})

// 获取仓库文件树
export const getRepoTree = async () => {
  const { owner, repo, branch } = blogConfig.gitee
  const response = await giteeApi.get(
    `/repos/${owner}/${repo}/git/trees/${branch}`,
    { params: { recursive: 1 } }
  )
  return response.data
}

// 获取文件内容
export const getFileContent = async (path) => {
  const { owner, repo } = blogConfig.gitee
  const response = await giteeApi.get(
    `/repos/${owner}/${repo}/contents/${path}`
  )
  return response.data
}

// 解码 Base64 内容
export const decodeBase64Content = (base64Content) => {
  return decodeURIComponent(
    atob(base64Content)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
}

// 获取所有文章
export const getAllPosts = async () => {
  const tree = await getRepoTree()
  return tree.tree.filter(
    (file) => file.type === 'blob' && file.path.endsWith('.md')
  )
}
```

### 2.3 Markdown 解析工具

创建 `src/utils/markdown.js`：

```javascript
import { marked } from 'marked'
import hljs from 'highlight.js'

// 配置 marked
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true,
})

// 解析 Front Matter
export const parseFrontMatter = (content) => {
  const regex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = content.match(regex)

  if (!match) {
    return { meta: {}, content }
  }

  const meta = {}
  match[1].split('\n').forEach((line) => {
    const [key, ...value] = line.split(':')
    if (key && value.length > 0) {
      const val = value.join(':').trim()
      // 解析数组格式
      if (val.startsWith('[') && val.endsWith(']')) {
        meta[key.trim()] = val.slice(1, -1)
          .split(',')
          .map(item => item.trim())
      } else {
        meta[key.trim()] = val
      }
    }
  })

  return { meta, content: match[2] }
}

// 渲染 Markdown
export const renderMarkdown = (content) => {
  return marked(content)
}
```

---

## 第三步：实现核心功能

### 3.1 文章管理 Composable

创建 `src/composables/usePosts.js`，实现文章的加载、分类、标签等功能。

### 3.2 暗色模式

创建 `src/composables/useDarkMode.js`：

```javascript
import { ref, watch, onMounted } from 'vue'

const isDark = ref(false)

export const useDarkMode = () => {
  const toggleDarkMode = () => {
    isDark.value = !isDark.value
  }

  watch(isDark, (newValue) => {
    if (newValue) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  })

  onMounted(() => {
    const saved = localStorage.getItem('theme')
    if (saved) {
      isDark.value = saved === 'dark'
    }
  })

  return { isDark, toggleDarkMode }
}
```

### 3.3 CSS 主题变量

在 `src/assets/base.css` 中定义颜色变量：

```css
:root {
  --color-background: #ffffff;
  --color-text: #2c3e50;
  --color-primary: #42b983;
}

:root.dark {
  --color-background: #1a1a1a;
  --color-text: #ebebeb;
  --color-primary: #42b983;
}
```

---

## 第四步：配置路由

修改 `src/router/index.js`：

```javascript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/post/:id',
      component: () => import('../views/PostView.vue'),
    },
    {
      path: '/categories',
      component: () => import('../views/CategoriesView.vue'),
    },
    {
      path: '/tags',
      component: () => import('../views/TagsView.vue'),
    },
    {
      path: '/archive',
      component: () => import('../views/ArchiveView.vue'),
    },
    {
      path: '/about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
```

---

## 第五步：部署到 GitHub Pages

### 5.1 配置 Vite

修改 `vite.config.js`：

```javascript
export default defineConfig({
  plugins: [vue()],
  base: '/my-blog/',  // 替换为你的仓库名
  build: {
    outDir: 'dist',
  },
})
```

### 5.2 创建 GitHub Token

1. 访问 https://github.com/settings/tokens/new
2. Note: `blog-deployment`
3. Expiration: `No expiration`
4. 勾选 `repo` 权限
5. 点击 "Generate token"
6. **复制并保存 token**（只显示一次！）

### 5.3 配置 Git 远程仓库

```bash
# 添加 GitHub 远程仓库
git remote add github https://YOUR-USERNAME:YOUR-TOKEN@github.com/YOUR-USERNAME/my-blog.git

# 推送代码
git push github master
```

### 5.4 创建部署脚本

创建 `deploy.sh`：

```bash
#!/bin/bash

echo "开始构建博客..."
pnpm run build

echo "部署到 GitHub Pages..."
cd dist
git init
git add -A
git commit -m "Deploy $(date '+%Y-%m-%d %H:%M:%S')"
git push -f https://YOUR-USERNAME:YOUR-TOKEN@github.com/YOUR-USERNAME/my-blog.git master:gh-pages

cd ..
echo "✅ 部署完成！"
```

```bash
# 添加执行权限
chmod +x deploy.sh

# 运行部署
./deploy.sh
```

### 5.5 开启 GitHub Pages

1. 访问 `https://github.com/YOUR-USERNAME/my-blog/settings/pages`
2. Source: 选择 "Deploy from a branch"
3. Branch: 选择 `gh-pages` 分支
4. 点击 "Save"
5. 等待 1-2 分钟

**你的博客地址**：`https://YOUR-USERNAME.github.io/my-blog/`

---

## 第六步：写博客文章

### 6.1 文章格式

在 Gitee 的 `blog-posts` 仓库中创建 `.md` 文件：

```markdown
---
title: 文章标题
date: 2025-12-19
categories: [分类1, 分类2]
tags: [标签1, 标签2]
excerpt: 文章摘要
---

# 正文标题

这里是文章正文内容...

## 二级标题

代码示例：

​```javascript
console.log('Hello World')
​```
```

### 6.2 推送文章

```bash
cd blog-posts
git add .
git commit -m "Add new post"
git push
```

**推送后立即生效！** 刷新博客即可看到新文章。

---

## 常见问题

### Q1: 页面空白，无法显示？

**原因**：资源路径配置错误。

**解决**：
1. 检查 `vite.config.js` 中的 `base` 配置
2. 必须设置为 `/仓库名/`，例如 `/my-blog/`
3. 重新构建部署

### Q2: Gitee API 无法获取文章？

**原因**：仓库必须是公开的。

**解决**：
1. 进入 Gitee 仓库设置
2. 修改为"公开"状态

### Q3: GitHub Pages 404 错误？

**原因**：Pages 设置错误。

**解决**：
1. 确认选择了 `gh-pages` 分支
2. 确认选择了 `/ (root)` 目录
3. 等待几分钟让 GitHub 部署

### Q4: 如何自定义样式？

修改 `src/assets/base.css` 中的 CSS 变量：

```css
:root {
  --color-primary: #your-color;  /* 修改主题色 */
}
```

### Q5: 如何添加评论功能？

可以集成 Gitalk：
1. 安装 `pnpm add gitalk`
2. 配置 Gitalk 参数
3. 在文章详情页引入

---

## 优化建议

### 性能优化

1. **代码分割**：使用路由懒加载
2. **图片优化**：使用 CDN 或图床
3. **缓存策略**：配置 Service Worker

### SEO 优化

1. **元标签**：添加 meta description
2. **sitemap**：生成站点地图
3. **语义化**：使用正确的 HTML 标签

### 体验优化

1. **骨架屏**：添加加载占位符
2. **错误处理**：友好的错误提示
3. **加载动画**：提升用户体验

---

## 总结

通过本教程，你已经成功搭建了一个：

- ✅ 功能完整的个人博客
- ✅ 完全免费，无需服务器
- ✅ 自动部署，推送即生效
- ✅ 美观现代，支持暗色模式

### 技术收获

- Vue 3 Composition API 实战
- Vite 构建工具配置
- Gitee API 调用
- GitHub Pages 部署
- Markdown 渲染和高亮

### 后续扩展

- 增加文章阅读统计
- 集成评论系统
- 添加 RSS 订阅
- 接入搜索引擎
- 自定义域名绑定

---

## 参考资源

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Vite 官方文档](https://cn.vitejs.dev/)
- [Gitee API 文档](https://gitee.com/api/v5/swagger)
- [GitHub Pages 文档](https://docs.github.com/pages)
- [Marked.js 文档](https://marked.js.org/)

---

**祝你搭建顺利！开始你的技术博客之旅吧！** 🚀

如有问题，欢迎在评论区交流讨论！
