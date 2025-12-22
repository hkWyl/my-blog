<template>
  <article class="post-card">
    <router-link :to="`/post/${post.id}`" class="post-link">
      <div class="post-header">
        <h2 class="post-title">{{ post.title }}</h2>
        <div class="post-meta">
          <span v-if="post.author" class="author">{{ post.author }}</span>
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
  border-radius: 0.75rem;
  padding: 2rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--color-border);
  position: relative;
  overflow: hidden;
}

.post-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(66, 185, 131, 0.1),
    transparent
  );
  transition: left 0.6s;
}

.post-card:hover::before {
  left: 100%;
}

.post-card:hover {
  border-color: var(--color-primary);
  box-shadow:
    0 0 20px rgba(66, 185, 131, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.3);
  transform: translateY(-4px);
  background: rgba(26, 31, 46, 0.95);
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
  transition: all 0.3s;
  position: relative;
  display: inline-block;
}

.post-title::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-primary), transparent);
  transition: width 0.4s;
}

.post-card:hover .post-title {
  color: var(--color-primary);
  text-shadow: 0 0 10px rgba(66, 185, 131, 0.3);
}

.post-card:hover .post-title::after {
  width: 100%;
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
  padding: 0.25rem 0.75rem;
  background: rgba(66, 185, 131, 0.1);
  border-radius: 0.375rem;
  border: 1px solid rgba(66, 185, 131, 0.3);
  font-weight: 500;
  transition: all 0.3s;
}

.post-card:hover .category {
  background: rgba(66, 185, 131, 0.2);
  border-color: var(--color-primary);
}

.post-excerpt {
  margin: 1rem 0;
  color: var(--color-text);
  line-height: 1.8;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  font-size: 0.875rem;
  color: var(--color-primary);
  opacity: 0.8;
  transition: opacity 0.3s;
}

.post-card:hover .tag {
  opacity: 1;
}

.read-more {
  font-size: 0.875rem;
  color: var(--color-primary);
  font-weight: 600;
  transition: all 0.3s;
  position: relative;
  padding-right: 20px;
}

.read-more::after {
  content: '→';
  position: absolute;
  right: 0;
  transition: transform 0.3s;
}

.post-card:hover .read-more::after {
  transform: translateX(4px);
}
</style>
