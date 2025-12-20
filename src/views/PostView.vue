<template>
  <div class="post-view">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="!post" class="error">文章未找到</div>
    <article v-else class="post-content">
      <header class="post-header">
        <h1 class="post-title">{{ post.title }}</h1>
        <div class="post-meta">
          <span class="date">{{ formatDate(post.date) }}</span>
          <span v-if="post.categories.length > 0" class="categories">
            <router-link
              v-for="category in post.categories"
              :key="category"
              :to="`/category/${category}`"
              class="category"
            >
              {{ category }}
            </router-link>
          </span>
        </div>
        <div v-if="post.tags.length > 0" class="tags">
          <router-link
            v-for="tag in post.tags"
            :key="tag"
            :to="`/tag/${tag}`"
            class="tag"
          >
            #{{ tag }}
          </router-link>
        </div>
      </header>

      <div class="markdown-body" v-html="renderedContent"></div>

      <div class="post-footer">
        <router-link to="/" class="back-link">← 返回首页</router-link>
      </div>

      <div id="gitalk-container" class="comment-section"></div>
    </article>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { usePosts } from '@/composables/usePosts'
import { renderMarkdown } from '@/utils/markdown'
import blogConfig from '@/config/blog.config.js'
import 'highlight.js/styles/github-dark.css'

const route = useRoute()
const { posts, loading, loadAllPosts, getPostById } = usePosts()

const post = ref(null)
const renderedContent = ref('')

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const initGitalk = () => {
  if (!blogConfig.gitalk.clientID || !post.value) return

  const gitalk = new Gitalk({
    ...blogConfig.gitalk,
    id: post.value.id,
    title: post.value.title,
  })

  gitalk.render('gitalk-container')
}

onMounted(async () => {
  // 强制刷新以获取最新数据
  await loadAllPosts(true)
  post.value = getPostById(route.params.id)

  if (post.value) {
    renderedContent.value = renderMarkdown(post.value.content)

    await nextTick()

    if (typeof Gitalk !== 'undefined') {
      initGitalk()
    }
  }
})
</script>

<style scoped>
.post-view {
  min-height: 400px;
}

.loading,
.error {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-text-muted);
}

.post-content {
  background: var(--color-background-soft);
  border-radius: 0.5rem;
  padding: 3rem;
}

.post-header {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--color-border);
}

.post-title {
  margin: 0 0 1rem;
  font-size: 2rem;
  color: var(--color-heading);
  line-height: 1.3;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.categories {
  display: flex;
  gap: 0.5rem;
}

.category {
  padding: 0.25rem 0.75rem;
  background: var(--color-background);
  border-radius: 0.25rem;
  text-decoration: none;
  color: var(--color-text);
  transition: all 0.2s;
}

.category:hover {
  background: var(--color-primary);
  color: white;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s;
}

.tag:hover {
  color: var(--color-primary);
}

.post-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.back-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.comment-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

@media (max-width: 768px) {
  .post-content {
    padding: 1.5rem;
  }

  .post-title {
    font-size: 1.5rem;
  }
}
</style>

<style>
.markdown-body {
  line-height: 1.8;
  color: var(--color-text);
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin: 2rem 0 1rem;
  color: var(--color-heading);
  font-weight: 600;
}

.markdown-body h1 {
  font-size: 1.875rem;
}

.markdown-body h2 {
  font-size: 1.5rem;
}

.markdown-body h3 {
  font-size: 1.25rem;
}

.markdown-body p {
  margin: 1rem 0;
}

.markdown-body a {
  color: var(--color-primary);
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body code {
  background: var(--color-background);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  font-family: 'Courier New', monospace;
}

.markdown-body pre {
  background: #1e1e1e;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.markdown-body pre code {
  background: none;
  padding: 0;
}

.markdown-body blockquote {
  border-left: 4px solid var(--color-primary);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--color-text-muted);
}

.markdown-body ul,
.markdown-body ol {
  padding-left: 2rem;
  margin: 1rem 0;
}

.markdown-body li {
  margin: 0.5rem 0;
}

.markdown-body img {
  max-width: 100%;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.markdown-body table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.markdown-body th,
.markdown-body td {
  border: 1px solid var(--color-border);
  padding: 0.5rem;
}

.markdown-body th {
  background: var(--color-background);
  font-weight: 600;
}
</style>
