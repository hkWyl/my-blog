import { ref, computed } from 'vue'
import adminConfig from '@/config/admin.config.js'

// 全局认证状态
const authState = ref({
  isAuthenticated: false,
  loginTime: null,
})

export function useAuth() {
  const isAuthenticated = computed(() => authState.value.isAuthenticated)

  const sessionTimeLeft = computed(() => {
    if (!authState.value.loginTime) return 0
    const elapsed = Date.now() - authState.value.loginTime
    const remaining = adminConfig.auth.sessionTimeout - elapsed
    return Math.max(0, Math.floor(remaining / 1000 / 60)) // 转换为分钟
  })

  // 登录
  async function login(password) {
    // 计算密码的 SHA-256 哈希
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

    if (hashHex === adminConfig.auth.passwordHash) {
      authState.value = {
        isAuthenticated: true,
        loginTime: Date.now(),
      }
      localStorage.setItem('admin_session', JSON.stringify(authState.value))
      return true
    }
    return false
  }

  // 登出
  function logout() {
    authState.value = {
      isAuthenticated: false,
      loginTime: null,
    }
    localStorage.removeItem('admin_session')
  }

  // 检查会话
  function checkSession() {
    const session = localStorage.getItem('admin_session')
    if (!session) return false

    try {
      const sessionData = JSON.parse(session)
      const elapsed = Date.now() - sessionData.loginTime

      if (elapsed < adminConfig.auth.sessionTimeout) {
        authState.value = sessionData
        return true
      } else {
        logout()
        return false
      }
    } catch {
      logout()
      return false
    }
  }

  // 刷新会话
  function refreshSession() {
    if (authState.value.isAuthenticated) {
      authState.value.loginTime = Date.now()
      localStorage.setItem('admin_session', JSON.stringify(authState.value))
    }
  }

  return {
    isAuthenticated,
    sessionTimeLeft,
    login,
    logout,
    checkSession,
    refreshSession,
  }
}
