<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import BlogHeader from './components/BlogHeader.vue'
import BlogSidebar from './components/BlogSidebar.vue'
import PlasmaBackground from './components/PlasmaBackground.vue'

const route = useRoute()
const hideLayout = computed(() => route.meta.hideLayout)
</script>

<template>
  <PlasmaBackground />
  <div id="app">
    <!-- 普通博客布局 -->
    <template v-if="!hideLayout">
      <BlogHeader />
      <div class="container">
        <main class="main-content">
          <RouterView />
        </main>
        <aside class="sidebar">
          <BlogSidebar />
        </aside>
      </div>
    </template>

    <!-- 管理面板全屏布局 -->
    <template v-else>
      <RouterView />
    </template>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  flex: 1;
  width: 100%;
}

.main-content {
  min-width: 0;
}

@media (max-width: 1024px) {
  .container {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: -1;
  }
}
</style>
