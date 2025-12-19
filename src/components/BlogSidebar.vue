<template>
  <aside class="sidebar">
    <div class="widget search-widget">
      <h3>搜索</h3>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索文章..."
        @input="handleSearch"
        class="search-input"
      />
      <div v-if="searchResults.length > 0" class="search-results">
        <router-link
          v-for="post in searchResults.slice(0, 5)"
          :key="post.id"
          :to="`/post/${post.id}`"
          class="search-item"
          @click="clearSearch"
        >
          {{ post.title }}
        </router-link>
      </div>
    </div>

    <div class="widget categories-widget">
      <h3>分类</h3>
      <div class="category-list">
        <router-link
          v-for="category in categories"
          :key="category.name"
          :to="`/category/${category.name}`"
          class="category-item"
        >
          <span>{{ category.name }}</span>
          <span class="count">{{ category.count }}</span>
        </router-link>
      </div>
    </div>

    <div class="widget tags-widget">
      <h3>标签</h3>
      <div class="tag-cloud">
        <router-link
          v-for="tag in tags"
          :key="tag.name"
          :to="`/tag/${tag.name}`"
          class="tag-item"
          :style="{ fontSize: getTagSize(tag.count) }"
        >
          {{ tag.name }}
        </router-link>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePosts } from '@/composables/usePosts'

const { allCategories, allTags, searchPosts } = usePosts()

const searchQuery = ref('')
const searchResults = ref([])

const categories = computed(() => allCategories.value.slice(0, 10))
const tags = computed(() => allTags.value.slice(0, 20))

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    searchResults.value = searchPosts(searchQuery.value)
  } else {
    searchResults.value = []
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
}

const getTagSize = (count) => {
  const minSize = 0.875
  const maxSize = 1.25
  const maxCount = Math.max(...tags.value.map((t) => t.count))
  const size = minSize + ((count / maxCount) * (maxSize - minSize))
  return `${size}rem`
}
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.widget {
  background: var(--color-background-soft);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.widget h3 {
  margin: 0 0 1rem;
  font-size: 1.125rem;
  color: var(--color-heading);
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.search-results {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-item {
  padding: 0.5rem;
  text-decoration: none;
  color: var(--color-text);
  border-radius: 0.25rem;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.search-item:hover {
  background: var(--color-background);
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  text-decoration: none;
  color: var(--color-text);
  border-radius: 0.25rem;
  transition: background 0.2s;
}

.category-item:hover {
  background: var(--color-background);
}

.count {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  background: var(--color-background);
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  text-decoration: none;
  color: var(--color-text);
  padding: 0.25rem 0.75rem;
  background: var(--color-background);
  border-radius: 1rem;
  transition: all 0.2s;
}

.tag-item:hover {
  background: var(--color-primary);
  color: white;
}
</style>
