<template>
  <div class="tag-view">
    <h1 class="page-title">标签: #{{ tagName }}</h1>
    <div v-if="tagPosts.length === 0" class="empty">该标签暂无文章</div>
    <div v-else class="post-list">
      <PostCard v-for="post in tagPosts" :key="post.id" :post="post" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePosts } from '@/composables/usePosts'
import PostCard from '@/components/PostCard.vue'

const route = useRoute()
const { getPostsByTag, loadAllPosts } = usePosts()

const tagName = ref(route.params.name)
const tagPosts = ref([])

onMounted(async () => {
  await loadAllPosts()
  tagPosts.value = getPostsByTag(tagName.value)
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
