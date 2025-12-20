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
  background: rgba(10, 14, 26, 0.95);
  border-bottom: 1px solid rgba(66, 185, 131, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px) saturate(180%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
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
  transition: all 0.3s;
  position: relative;
}

.logo:hover {
  transform: translateY(-2px);
}

.logo h1 {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 700;
  background: linear-gradient(135deg, #42b983, #52d9a3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  transition: all 0.3s;
  position: relative;
  padding: 0.5rem 0;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
  transition: all 0.3s;
  transform: translateX(-50%);
}

.nav-link:hover::after,
.nav-link.active::after {
  width: 100%;
}

.nav-link:hover,
.nav-link.active {
  color: var(--color-primary);
  text-shadow: 0 0 10px rgba(66, 185, 131, 0.5);
}

.theme-toggle {
  background: rgba(66, 185, 131, 0.1);
  border: 1px solid rgba(66, 185, 131, 0.3);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s;
}

.theme-toggle:hover {
  background: rgba(66, 185, 131, 0.2);
  border-color: var(--color-primary);
  box-shadow: 0 0 15px rgba(66, 185, 131, 0.3);
  transform: scale(1.05);
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
