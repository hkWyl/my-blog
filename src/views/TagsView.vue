<template>
  <div class="tags-view">
    <h1 class="page-title">标签云</h1>
    <div v-if="allTags.length === 0" class="empty">暂无标签</div>
    <div v-else class="tag-cloud-large">
      <router-link
        v-for="tag in allTags"
        :key="tag.name"
        :to="`/tag/${tag.name}`"
        class="tag-item"
        :style="{ fontSize: getTagSize(tag.count) }"
      >
        {{ tag.name }}
        <span class="count">{{ tag.count }}</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { usePosts } from '@/composables/usePosts'

const { allTags, loadAllPosts } = usePosts()

const getTagSize = (count) => {
  const minSize = 1
  const maxSize = 2.5
  const maxCount = Math.max(...allTags.value.map((t) => t.count))
  const size = minSize + ((count / maxCount) * (maxSize - minSize))
  return `${size}rem`
}

onMounted(async () => {
  await loadAllPosts()
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

.tag-cloud-large {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  padding: 2rem;
}

.tag-item {
  text-decoration: none;
  color: var(--color-text);
  padding: 0.5rem 1.5rem;
  background: var(--color-background-soft);
  border-radius: 2rem;
  transition: all 0.3s;
  border: 2px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.tag-item:hover {
  background: var(--color-primary);
  color: white;
  transform: scale(1.1);
}

.count {
  font-size: 0.75em;
  opacity: 0.7;
}
</style>
