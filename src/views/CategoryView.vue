<template>
  <div class="category-view">
    <h1 class="page-title">分类: {{ categoryName }}</h1>
    <div v-if="categoryPosts.length === 0" class="empty">该分类暂无文章</div>
    <div v-else class="post-list">
      <PostCard v-for="post in categoryPosts" :key="post.id" :post="post" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePosts } from '@/composables/usePosts'
import PostCard from '@/components/PostCard.vue'

const route = useRoute()
const { getPostsByCategory, loadAllPosts } = usePosts()

const categoryName = ref(route.params.name)
const categoryPosts = ref([])

onMounted(async () => {
  // 强制刷新以获取最新数据
  await loadAllPosts(true)
  categoryPosts.value = getPostsByCategory(categoryName.value)
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

.post-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
</style>
