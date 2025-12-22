import { ref, computed } from 'vue'
import adminConfig from '@/config/admin.config.js'
import { loadAdminConfig } from '@/api/githubAdmin'

// 全局认证状态
const authState = ref({
  isAuthenticated: false,
  loginTime: null,
})

// 会话超时配置（毫秒），默认24小时
let sessionTimeout = adminConfig.auth.sessionTimeout

// 加载远程配置中的会话超时设置
async function loadSessionTimeout() {
  try {
    const remoteConfig = await loadAdminConfig()
    if (remoteConfig?.auth?.sessionTimeout) {
      sessionTimeout = remoteConfig.auth.sessionTimeout
      // 同步到本地配置
      adminConfig.auth.sessionTimeout = sessionTimeout
    }
  } catch (error) {
    console.log('使用默认会话超时配置')
  }
}

// 初始化时加载远程配置
loadSessionTimeout()

export function useAuth() {
  const isAuthenticated = computed(() => authState.value.isAuthenticated)

  const sessionTimeLeft = computed(() => {
    if (!authState.value.loginTime) return 0
    const elapsed = Date.now() - authState.value.loginTime
    const remaining = sessionTimeout - elapsed
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
      // 使用 sessionStorage 而不是 localStorage，关闭浏览器后会话自动清除
      sessionStorage.setItem('admin_session', JSON.stringify(authState.value))
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
    sessionStorage.removeItem('admin_session')
  }

  // 检查会话
  function checkSession() {
    const session = sessionStorage.getItem('admin_session')
    if (!session) return false

    try {
      const sessionData = JSON.parse(session)
      const elapsed = Date.now() - sessionData.loginTime

      if (elapsed < sessionTimeout) {
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
      sessionStorage.setItem('admin_session', JSON.stringify(authState.value))
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
