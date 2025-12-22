import { ref } from 'vue'
import blogConfig from '@/config/blog.config.js'
import { getFileContent } from '@/api/github.js'

const config = ref({ ...blogConfig })
const loaded = ref(false)

/**
 * 获取博客配置（从 profile.json 或默认配置）
 */
export function useBlogConfig() {
  async function loadProfile() {
    if (loaded.value) return

    try {
      // 尝试从 GitHub 仓库加载 profile.json
      const profileFile = await getFileContent('profile.json')
      if (profileFile && profileFile.content) {
        const profileData = JSON.parse(profileFile.content)

        // 合并配置：profile.json 优先，其他使用默认值
        config.value = {
          ...blogConfig,
          title: profileData.title || blogConfig.title,
          subtitle: profileData.subtitle || blogConfig.subtitle,
          author: profileData.author || blogConfig.author,
          description: profileData.description || blogConfig.description,
          avatar: profileData.avatar || blogConfig.avatar,
          social: {
            ...blogConfig.social,
            ...profileData.social,
          },
        }
        console.log('从 profile.json 加载配置成功')
      }
    } catch (err) {
      // profile.json 不存在或加载失败，使用默认配置
      console.log('使用默认配置:', err.message)
    } finally {
      loaded.value = true
    }
  }

  return {
    config,
    loaded,
    loadProfile,
  }
}
