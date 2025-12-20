<template>
  <div class="archive-view">
    <h1 class="page-title">文章归档</h1>
    <div v-if="postsByYear.length === 0" class="empty">暂无文章</div>
    <div v-else class="archive-list">
      <div v-for="yearGroup in postsByYear" :key="yearGroup.year" class="year-group">
        <h2 class="year">{{ yearGroup.year }}</h2>
        <div class="posts">
          <router-link
            v-for="post in yearGroup.posts"
            :key="post.id"
            :to="`/post/${post.id}`"
            class="archive-item"
          >
            <span class="date">{{ formatDate(post.date) }}</span>
            <span class="title">{{ post.title }}</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePosts } from '@/composables/usePosts'

const { postsByYear, loadAllPosts } = usePosts()

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  })
}

onMounted(async () => {
  // 强制刷新以获取最新数据
  await loadAllPosts(true)
})
</script>

<style scoped>
.page-title {
  margin: 0 0 2rem;
  font-size: 2rem;
  color: var(--color-heading);
}

.empty {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-text-muted);
}

.archive-list {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.year-group {
  background: var(--color-background-soft);
  border-radius: 0.5rem;
  padding: 2rem;
}

.year {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  color: var(--color-primary);
  font-weight: 700;
}

.posts {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.archive-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: var(--color-text);
  border-radius: 0.375rem;
  transition: background 0.2s;
}

.archive-item:hover {
  background: var(--color-background);
}

.archive-item .date {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  min-width: 3rem;
}

.archive-item .title {
  flex: 1;
}

.archive-item:hover .title {
  color: var(--color-primary);
}
</style>
