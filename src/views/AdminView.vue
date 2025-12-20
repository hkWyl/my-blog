<template>
  <div class="admin-view">
    <header class="admin-header">
      <div class="header-left">
        <h1 class="admin-title">管理面板</h1>
        <span class="session-info">会话剩余: {{ sessionTimeLeft }} 分钟</span>
      </div>
      <div class="header-right">
        <button @click="handleLogout" class="logout-btn">
          <span>退出登录</span>
        </button>
      </div>
    </header>

    <div class="admin-content">
      <nav class="admin-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
        </button>
      </nav>

      <div class="tab-content">
        <ProfileEditor v-if="activeTab === 'profile'" />
        <PostManager v-else-if="activeTab === 'posts'" />
        <TokenConfig v-else-if="activeTab === 'config'" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import ProfileEditor from '@/components/admin/ProfileEditor.vue'
import PostManager from '@/components/admin/PostManager.vue'
import TokenConfig from '@/components/admin/TokenConfig.vue'

const router = useRouter()
const { isAuthenticated, sessionTimeLeft, logout, checkSession, refreshSession } = useAuth()

const activeTab = ref('profile')

const tabs = [
  { id: 'profile', label: '个人资料', icon: '👤' },
  { id: 'posts', label: '文章管理', icon: '📝' },
  { id: 'config', label: '系统配置', icon: '⚙️' },
]

onMounted(() => {
  // 检查登录状态
  if (!checkSession()) {
    router.push('/admin')
    return
  }

  // 定期刷新会话
  setInterval(() => {
    if (isAuthenticated.value) {
      refreshSession()
    }
  }, 5 * 60 * 1000) // 每 5 分钟刷新一次
})

function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    logout()
    router.push('/admin')
  }
}
</script>

<style scoped>
.admin-view {
  min-height: 100vh;
  padding: 2rem;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(100, 116, 139, 0.2);
  border-radius: 0.75rem;
}

:root:not(.dark) .admin-header {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.admin-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.session-info {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  padding: 0.375rem 0.75rem;
  background: rgba(66, 185, 131, 0.1);
  border-radius: 0.375rem;
}

.logout-btn {
  padding: 0.625rem 1.25rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  color: #f87171;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-2px);
}

.admin-content {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(100, 116, 139, 0.2);
  border-radius: 0.75rem;
  overflow: hidden;
}

:root:not(.dark) .admin-content {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.admin-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 1.5rem 1.5rem 0;
  border-bottom: 2px solid rgba(100, 116, 139, 0.2);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--color-text-muted);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: -2px;
}

.tab-btn:hover {
  color: var(--color-primary);
}

.tab-btn.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab-icon {
  font-size: 1.25rem;
}

.tab-content {
  padding: 2rem;
}

@media (max-width: 768px) {
  .admin-view {
    padding: 1rem;
  }

  .admin-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .tab-content {
    padding: 1.5rem 1rem;
  }
}
</style>
