import { ref, watch, onMounted } from 'vue'

const isDark = ref(false)

export const useDarkMode = () => {
  const toggleDarkMode = () => {
    isDark.value = !isDark.value
  }

  const setDarkMode = (value) => {
    isDark.value = value
  }

  // 监听变化，更新 HTML 类名和本地存储
  watch(
    isDark,
    (newValue) => {
      if (newValue) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    },
    { immediate: true },
  )

  // 初始化时读取本地存储
  onMounted(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // 检测系统主题偏好
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  })

  return {
    isDark,
    toggleDarkMode,
    setDarkMode,
  }
}
