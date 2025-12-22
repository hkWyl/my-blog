<template>
  <div class="about-view">
    <div class="about-card">
      <h1 class="title">{{ config.title }}</h1>
      <p class="subtitle">{{ config.subtitle }}</p>

      <div class="content">
        <h2>关于博主</h2>
        <p>{{ config.author }} - {{ config.description }}</p>

        <h2>关于本站</h2>
        <p>这是一个基于 Vue 3 + Gitee 搭建的个人博客系统。</p>
        <ul>
          <li>博客文章存储在 Gitee 仓库中</li>
          <li>支持 Markdown 格式写作</li>
          <li>支持文章分类和标签</li>
          <li>支持全文搜索</li>
          <li>支持暗色模式</li>
          <li>支持评论系统</li>
        </ul>

        <h2>联系方式</h2>
        <div class="social-links">
          <a
            v-if="config.social.gitee"
            :href="config.social.gitee"
            target="_blank"
            class="social-link"
          >
            Gitee 主页
          </a>
          <a
            v-if="config.social.github"
            :href="config.social.github"
            target="_blank"
            class="social-link"
          >
            GitHub 主页
          </a>
          <a v-if="config.social.email" :href="`mailto:${config.social.email}`" class="social-link">
            邮箱联系
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useBlogConfig } from '@/composables/useBlogConfig'

const { config, loadProfile } = useBlogConfig()

onMounted(async () => {
  await loadProfile()
})
</script>

<style scoped>
.about-view {
  display: flex;
  justify-content: center;
}

.about-card {
  background: var(--color-background-soft);
  border-radius: 0.5rem;
  padding: 3rem;
  max-width: 800px;
  width: 100%;
}

.title {
  margin: 0 0 0.5rem;
  font-size: 2rem;
  color: var(--color-heading);
  text-align: center;
}

.subtitle {
  margin: 0 0 2rem;
  font-size: 1rem;
  color: var(--color-text-muted);
  text-align: center;
}

.content h2 {
  margin: 2rem 0 1rem;
  font-size: 1.5rem;
  color: var(--color-heading);
}

.content p {
  margin: 1rem 0;
  line-height: 1.8;
  color: var(--color-text);
}

.content ul {
  padding-left: 2rem;
  margin: 1rem 0;
}

.content li {
  margin: 0.5rem 0;
  line-height: 1.8;
  color: var(--color-text);
}

.social-links {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.social-link {
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  text-decoration: none;
  border-radius: 0.375rem;
  transition: opacity 0.2s;
}

.social-link:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .about-card {
    padding: 1.5rem;
  }
}
</style>
