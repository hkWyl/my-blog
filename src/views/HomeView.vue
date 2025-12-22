<template>
  <div class="home">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-if="posts.length === 0" class="empty">
        <p>还没有文章，快去 GitHub 仓库添加第一篇文章吧！</p>
        <a :href="`https://github.com/${config.github?.owner}/${config.github?.repo}`" target="_blank">
          前往仓库 →
        </a>
      </div>
      <div v-else class="post-list">
        <PostCard v-for="post in paginatedPosts" :key="post.id" :post="post" />

        <div v-if="totalPages > 1" class="pagination">
          <button @click="currentPage--" :disabled="currentPage === 1" class="page-btn">
            上一页
          </button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button @click="currentPage++" :disabled="currentPage === totalPages" class="page-btn">
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePosts } from '@/composables/usePosts'
import { useBlogConfig } from '@/composables/useBlogConfig'
import PostCard from '@/components/PostCard.vue'

const { config, loadProfile } = useBlogConfig()
const { posts, loading, error, loadAllPosts } = usePosts()

onMounted(async () => {
  await loadProfile()
})

const currentPage = ref(1)
const pageSize = computed(() => config.value.pageSize || 10)

const totalPages = computed(() => Math.ceil(posts.value.length / pageSize.value))

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return posts.value.slice(start, end)
})

onMounted(async () => {
  // 强制刷新以获取最新数据
  await loadAllPosts(true)
})
</script>

<style scoped>
.home {
  min-height: 400px;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-text-muted);
}

.empty a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 2rem 0;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-text);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}
</style>
