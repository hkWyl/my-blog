<template>
  <article class="post-card">
    <router-link :to="`/post/${post.id}`" class="post-link">
      <div class="post-header">
        <h2 class="post-title">{{ post.title }}</h2>
        <div class="post-meta">
          <span class="date">{{ formatDate(post.date) }}</span>
          <span v-if="post.categories.length > 0" class="categories">
            <span v-for="category in post.categories" :key="category" class="category">
              {{ category }}
            </span>
          </span>
        </div>
      </div>

      <p class="post-excerpt">{{ post.excerpt }}</p>

      <div class="post-footer">
        <div v-if="post.tags.length > 0" class="tags">
          <span v-for="tag in post.tags" :key="tag" class="tag">#{{ tag }}</span>
        </div>
        <span class="read-more">阅读全文 →</span>
      </div>
    </router-link>
  </article>
</template>

<script setup>
defineProps({
  post: {
    type: Object,
    required: true,
  },
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
</script>

<style scoped>
.post-card {
  background: var(--color-background-soft);
  border-radius: 0.5rem;
  padding: 2rem;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.post-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.post-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.post-header {
  margin-bottom: 1rem;
}

.post-title {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  color: var(--color-heading);
  transition: color 0.2s;
}

.post-card:hover .post-title {
  color: var(--color-primary);
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.categories {
  display: flex;
  gap: 0.5rem;
}

.category {
  padding: 0.125rem 0.5rem;
  background: var(--color-background);
  border-radius: 0.25rem;
}

.post-excerpt {
  margin: 1rem 0;
  color: var(--color-text);
  line-height: 1.6;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.read-more {
  font-size: 0.875rem;
  color: var(--color-primary);
  font-weight: 500;
}
</style>
