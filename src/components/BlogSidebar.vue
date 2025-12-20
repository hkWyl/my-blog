<template>
  <aside class="sidebar">
    <!-- 个人信息卡片 -->
    <div class="widget profile-widget">
      <div class="profile-card">
        <div class="avatar-wrapper">
          <img :src="config.avatar" :alt="config.author" class="avatar" />
        </div>
        <h3 class="author-name">{{ config.author }}</h3>
        <p class="description">{{ config.description }}</p>
        <div class="social-links" v-if="config.social">
          <a
            v-if="config.social.gitee"
            :href="config.social.gitee"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link"
            title="Gitee"
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </a>
          <a
            v-if="config.social.github"
            :href="config.social.github"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link"
            title="GitHub"
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
            </svg>
          </a>
          <a
            v-if="config.social.email"
            :href="`mailto:${config.social.email}`"
            class="social-link"
            title="Email"
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>

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
import blogConfig from '@/config/blog.config.js'

const config = blogConfig
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

/* 个人信息卡片样式 */
.profile-widget {
  background: linear-gradient(135deg, rgba(66, 185, 131, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%);
  border: 1px solid rgba(66, 185, 131, 0.2);
}

.profile-card {
  text-align: center;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 1rem;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid var(--color-primary);
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.avatar:hover {
  transform: scale(1.05);
}

.author-name {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  color: var(--color-heading);
  font-weight: 700;
}

.description {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.social-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-background);
  color: var(--color-text);
  text-decoration: none;
  transition: all 0.3s;
}

.social-link:hover {
  background: var(--color-primary);
  color: white;
  transform: translateY(-2px);
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
