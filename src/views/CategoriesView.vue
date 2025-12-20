<template>
  <div class="categories-view">
    <h1 class="page-title">文章分类</h1>
    <div v-if="allCategories.length === 0" class="empty">暂无分类</div>
    <div v-else class="category-grid">
      <router-link
        v-for="category in allCategories"
        :key="category.name"
        :to="`/category/${category.name}`"
        class="category-card"
      >
        <h3>{{ category.name }}</h3>
        <p>{{ category.count }} 篇文章</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePosts } from '@/composables/usePosts'

const { allCategories, loadAllPosts } = usePosts()

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

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.category-card {
  background: var(--color-background-soft);
  border-radius: 0.5rem;
  padding: 2rem;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.category-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-card h3 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  color: var(--color-heading);
}

.category-card p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}
</style>
