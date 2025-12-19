<template>
  <header class="blog-header">
    <div class="container">
      <router-link to="/" class="logo">
        <h1>{{ config.title }}</h1>
        <p class="subtitle">{{ config.subtitle }}</p>
      </router-link>

      <nav class="nav">
        <router-link
          v-for="item in config.nav"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          active-class="active"
        >
          {{ item.name }}
        </router-link>

        <button @click="toggleDarkMode" class="theme-toggle" title="切换主题">
          <span v-if="isDark">☀️</span>
          <span v-else>🌙</span>
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useDarkMode } from '@/composables/useDarkMode'
import blogConfig from '@/config/blog.config.js'

const config = blogConfig
const { isDark, toggleDarkMode } = useDarkMode()
</script>

<style scoped>
.blog-header {
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  text-decoration: none;
  color: var(--color-heading);
}

.logo h1 {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 700;
}

.subtitle {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0.25rem 0 0;
}

.nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: var(--color-text);
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.active {
  color: var(--color-primary);
}

.theme-toggle {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background 0.2s;
}

.theme-toggle:hover {
  background: var(--color-background-soft);
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav {
    gap: 1rem;
    font-size: 0.875rem;
  }
}
</style>
