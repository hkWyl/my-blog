---
title: 博客前端开发指南 - 从零到精通
date: 2025-12-19
categories: [教程, 前端开发, Vue3]
tags: [Vue3, 前端, 开发指南, 自定义]
excerpt: 完整的博客前端开发指南，教你如何修改样式、添加功能、自定义组件，让你的博客与众不同。
---

# 博客前端开发指南 - 从零到精通

## 📚 目录

- [项目结构](#项目结构)
- [开发环境设置](#开发环境设置)
- [Vue 3 基础知识](#vue-3-基础知识)
- [常见修改操作](#常见修改操作)
- [添加新功能](#添加新功能)
- [样式自定义](#样式自定义)
- [部署流程](#部署流程)
- [故障排查](#故障排查)

---

## 项目结构

了解项目结构是修改前端的第一步：

```
gitee-blog/
├── src/                      # 源代码目录
│   ├── api/                  # API 调用
│   │   └── gitee.js         # Gitee API 封装
│   ├── assets/              # 静态资源
│   │   ├── base.css         # 基础样式和 CSS 变量
│   │   └── main.css         # 主样式文件
│   ├── components/          # Vue 组件
│   │   ├── BlogHeader.vue   # 顶部导航栏
│   │   ├── BlogSidebar.vue  # 侧边栏
│   │   ├── PostCard.vue     # 文章卡片
│   │   ├── ParticleBackground.vue  # 粒子背景
│   │   └── GitalkComment.vue       # 评论组件
│   ├── composables/         # 组合式函数
│   │   ├── usePosts.js      # 文章管理
│   │   └── useDarkMode.js   # 暗色模式
│   ├── config/              # 配置文件
│   │   └── blog.config.js   # 博客配置
│   ├── router/              # 路由配置
│   │   └── index.js         # 路由定义
│   ├── utils/               # 工具函数
│   │   └── markdown.js      # Markdown 解析
│   ├── views/               # 页面组件
│   │   ├── HomeView.vue     # 首页
│   │   ├── PostView.vue     # 文章详情
│   │   ├── CategoriesView.vue  # 分类页
│   │   ├── TagsView.vue     # 标签页
│   │   ├── ArchiveView.vue  # 归档页
│   │   └── AboutView.vue    # 关于页
│   ├── App.vue              # 根组件
│   └── main.js              # 入口文件
├── public/                  # 公共资源
├── dist/                    # 构建输出目录
├── vite.config.js          # Vite 配置
├── package.json            # 项目依赖
└── deploy-github.sh        # 部署脚本
```

---

## 开发环境设置

### 1. 进入项目目录

```bash
cd /home/wyl/blog/gitee-blog
```

### 2. 启动开发服务器

```bash
pnpm run dev
```

访问 http://localhost:3000/my-blog/

### 3. 修改代码

修改任何 `.vue` 或 `.js` 文件后，浏览器会自动刷新显示更改。

### 4. 停止开发服务器

按 `Ctrl + C` 停止服务器。

---

## Vue 3 基础知识

### Vue 组件结构

每个 `.vue` 文件都包含三个部分：

```vue
<template>
  <!-- HTML 模板 -->
  <div class="my-component">
    <h1>{{ title }}</h1>
    <button @click="handleClick">点击我</button>
  </div>
</template>

<script setup>
// JavaScript 逻辑
import { ref } from 'vue'

const title = ref('我的标题')

const handleClick = () => {
  console.log('按钮被点击了')
}
</script>

<style scoped>
/* CSS 样式 */
.my-component {
  padding: 2rem;
  background: var(--color-background);
}
</style>
```

### 响应式数据

```javascript
import { ref, computed } from 'vue'

// ref - 基本类型响应式数据
const count = ref(0)
count.value++ // 修改值

// computed - 计算属性
const doubleCount = computed(() => count.value * 2)
```

### 组件导入和使用

```vue
<script setup>
import MyComponent from './components/MyComponent.vue'
</script>

<template>
  <MyComponent />
</template>
```

---

## 常见修改操作

### 1. 修改博客标题和描述

**文件**：`src/config/blog.config.js`

```javascript
export default {
  title: '你的新标题',           // 修改这里
  subtitle: '你的新副标题',       // 修改这里
  author: '你的名字',
  description: '你的博客描述',
  avatar: 'https://你的头像链接',
  // ...
}
```

### 2. 修改主题颜色

**文件**：`src/assets/base.css`

```css
:root {
  /* 修改主色调 */
  --color-primary: #42b983;     /* 改成你喜欢的颜色 */
  --color-secondary: #3b82f6;   /* 副色调 */
  --color-accent: #8b5cf6;      /* 强调色 */
}
```

### 3. 修改粒子背景

**文件**：`src/components/ParticleBackground.vue`

```javascript
// 修改粒子数量（第 40 行左右）
const numberOfParticles = Math.floor((canvas.value.width * canvas.value.height) / 15000)
// 数字越小，粒子越多

// 修改粒子颜色（第 34 行左右）
ctx.fillStyle = 'rgba(66, 185, 131, 0.8)'  // 改成你喜欢的颜色
```

### 4. 修改导航菜单

**文件**：`src/config/blog.config.js`

```javascript
nav: [
  { name: '首页', path: '/' },
  { name: '分类', path: '/categories' },
  { name: '标签', path: '/tags' },
  { name: '归档', path: '/archive' },
  { name: '关于', path: '/about' },
  { name: '友链', path: '/links' },  // 添加新菜单项
],
```

### 5. 修改头像

**文件**：`src/config/blog.config.js`

```javascript
avatar: 'https://新的头像链接',
```

---

## 添加新功能

### 示例：添加访客计数器

#### 1. 创建新组件

**文件**：`src/components/VisitorCounter.vue`

```vue
<template>
  <div class="visitor-counter">
    <span class="icon">👁️</span>
    <span class="count">访问量: {{ count }}</span>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const count = ref(0)

onMounted(() => {
  // 从 localStorage 获取访问次数
  const stored = localStorage.getItem('visitCount')
  count.value = stored ? parseInt(stored) + 1 : 1
  localStorage.setItem('visitCount', count.value)
})
</script>

<style scoped>
.visitor-counter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(66, 185, 131, 0.1);
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.icon {
  font-size: 1.2rem;
}

.count {
  color: var(--color-text);
}
</style>
```

#### 2. 在侧边栏中使用

**文件**：`src/components/BlogSidebar.vue`

```vue
<script setup>
// 添加导入
import VisitorCounter from './VisitorCounter.vue'
// ...
</script>

<template>
  <aside class="sidebar">
    <!-- 在适当位置添加组件 -->
    <VisitorCounter />

    <!-- 其他组件 -->
    <!-- ... -->
  </aside>
</template>
```

---

## 样式自定义

### 毛玻璃效果

在任何组件的 `<style>` 中添加：

```css
.my-element {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(100, 116, 139, 0.2);
}

/* 亮色模式 */
:root:not(.dark) .my-element {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.1);
}
```

### 渐变文字

```css
.gradient-text {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### 发光效果

```css
.glow-element {
  box-shadow: 0 0 20px var(--color-primary-glow);
}

.glow-element:hover {
  box-shadow: 0 0 30px var(--color-primary-glow);
}
```

### 悬停动画

```css
.hover-lift {
  transition: all 0.3s;
}

.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}
```

---

## 部署流程

### 1. 构建项目

```bash
cd /home/wyl/blog/gitee-blog
pnpm run build
```

### 2. 一键部署到 GitHub Pages

```bash
./deploy-github.sh
```

### 3. 查看部署结果

访问：https://hkwyl.github.io/my-blog/

### 4. 发布新文章

```bash
cd /home/wyl/blog/my-blog-posts

# 创建新文章
nano new-article.md

# 推送到 Gitee
git add .
git commit -m "Add: 新文章标题"
git push
```

**注意**：文章推送后会立即显示在博客上，无需重新部署网站！

---

## 故障排查

### 问题 1：开发服务器无法启动

**原因**：端口被占用

**解决**：
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或者修改端口
# 编辑 vite.config.js，修改 server.port
```

### 问题 2：修改后页面没有更新

**解决**：
1. 清除浏览器缓存（Ctrl + Shift + R）
2. 重启开发服务器
3. 检查控制台是否有错误信息

### 问题 3：构建失败

**常见原因**：
- 语法错误
- 导入路径错误
- 缺少依赖

**解决**：
```bash
# 检查错误信息
pnpm run build

# 安装缺失的依赖
pnpm install

# 检查代码语法
```

### 问题 4：部署后样式丢失

**原因**：`base` 路径配置错误

**解决**：
检查 `vite.config.js`：
```javascript
export default defineConfig({
  base: '/my-blog/',  // 必须与仓库名一致
  // ...
})
```

### 问题 5：文章无法加载

**检查清单**：
1. Gitee 仓库是否设置为公开
2. 文章 Markdown 格式是否正确
3. Front Matter 是否正确
4. 浏览器控制台是否有 API 错误

---

## 开发技巧

### 1. 使用 Vue DevTools

安装 Vue DevTools 浏览器插件，可以：
- 查看组件树
- 检查响应式数据
- 调试事件
- 性能分析

### 2. 快速定位组件

在开发模式下，右键点击元素 → 检查，可以看到对应的 Vue 组件。

### 3. 热重载

修改代码后无需手动刷新，Vite 会自动重载。

### 4. CSS 变量使用

所有颜色都定义在 `base.css` 中，修改变量即可全局生效。

### 5. 组件复用

如果多个地方使用相同的 UI，创建可复用组件：

```vue
<!-- components/MyButton.vue -->
<template>
  <button class="my-button" @click="$emit('click')">
    <slot></slot>
  </button>
</template>

<style scoped>
.my-button {
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
}
</style>
```

使用：
```vue
<MyButton @click="handleClick">点击我</MyButton>
```

---

## 常用命令速查

```bash
# 开发
pnpm run dev              # 启动开发服务器
pnpm run build            # 构建生产版本

# 部署
./deploy-github.sh        # 部署到 GitHub Pages

# 文章管理
cd /home/wyl/blog/my-blog-posts
git add .
git commit -m "消息"
git push

# 依赖管理
pnpm install              # 安装所有依赖
pnpm add <package>        # 添加新依赖
pnpm remove <package>     # 移除依赖
```

---

## 学习资源

### 官方文档
- [Vue 3 文档](https://cn.vuejs.org/)
- [Vite 文档](https://cn.vitejs.dev/)
- [Vue Router 文档](https://router.vuejs.org/zh/)

### 推荐教程
- Vue 3 Composition API 入门
- JavaScript ES6+ 特性
- CSS Flexbox 和 Grid 布局
- Git 版本控制基础

### 开发工具
- VS Code + Volar 插件
- Chrome DevTools
- Vue DevTools 浏览器扩展

---

## 总结

通过本指南，你已经掌握了：

- ✅ 项目结构和文件组织
- ✅ Vue 3 基础概念和语法
- ✅ 常见修改操作方法
- ✅ 添加新功能的流程
- ✅ 样式自定义技巧
- ✅ 完整的开发和部署流程
- ✅ 故障排查方法

现在你可以自由地定制你的博客了！

### 下一步建议

1. 尝试修改颜色主题
2. 添加一个简单的组件
3. 自定义文章卡片样式
4. 探索更多 Vue 3 特性

### 需要帮助？

- 查看浏览器控制台错误信息
- 阅读 Vue 3 官方文档
- 检查 GitHub Issues
- 参考本博客的其他技术文章

**祝你开发顺利！** 🎉

---

**相关文章**：
- [从零搭建 Vue3 + Gitee + GitHub Pages 个人博客完整教程](./blog-tutorial.md)

**更新日期**：2025-12-19
