import axios from 'axios'
import blogConfig from '@/config/blog.config.js'

// 创建 axios 实例
const giteeApi = axios.create({
  baseURL: blogConfig.api.base,
  timeout: 10000,
})

/**
 * 获取仓库文件列表（通过 Gitee API）
 */
export const getRepoTree = async () => {
  try {
    const { owner, repo, branch } = blogConfig.gitee
    const timestamp = new Date().getTime()

    // 使用 Gitee API 获取文件树
    const response = await giteeApi.get(`/repos/${owner}/${repo}/git/trees/${branch}`, {
      params: {
        recursive: 1, // 递归获取所有文件
        t: timestamp, // 缓存破坏参数
      },
    })

    return {
      tree: response.data.tree || []
    }
  } catch (error) {
    console.error('获取文件列表失败:', error)
    return { tree: [] }
  }
}

/**
 * 获取文件内容（通过 Gitee Raw URL）
 */
export const getFileContent = async (path) => {
  try {
    const { owner, repo, branch } = blogConfig.gitee
    const timestamp = new Date().getTime()
    // 使用 Gitee raw URL 直接获取文件内容
    const rawUrl = `https://gitee.com/${owner}/${repo}/raw/${branch}/${encodeURIComponent(path)}?t=${timestamp}`

    const response = await axios.get(rawUrl)

    // 返回格式兼容原有代码
    return {
      path: path,
      name: path.split('/').pop(),
      content: response.data, // 直接是文本内容
      sha: '',
      size: response.data?.length || 0,
      download_url: rawUrl,
    }
  } catch (error) {
    console.error('获取文件内容失败:', error)
    return null
  }
}

/**
 * 解析 Base64 内容为文本
 */
export const decodeBase64Content = (base64Content) => {
  try {
    return decodeURIComponent(
      atob(base64Content)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
  } catch (error) {
    console.error('解码 Base64 失败:', error)
    return ''
  }
}

/**
 * 获取所有 Markdown 文章
 */
export const getAllPosts = async () => {
  try {
    const tree = await getRepoTree()
    const mdFiles = tree.tree.filter(
      (file) => file.type === 'blob' && file.path.endsWith('.md') && !file.path.includes('README'),
    )

    return mdFiles.map((file) => ({
      path: file.path,
      sha: file.sha,
      url: file.url,
    }))
  } catch (error) {
    console.error('获取文章列表失败:', error)
    return []
  }
}

/**
 * 获取文章详情（包含内容）
 */
export const getPostDetail = async (path) => {
  try {
    const fileData = await getFileContent(path)
    if (!fileData || !fileData.content) {
      return null
    }

    // Gitee raw URL 直接返回文本内容，不需要 base64 解码
    return {
      path: fileData.path,
      name: fileData.name,
      content: fileData.content,
      sha: fileData.sha,
      size: fileData.size,
      download_url: fileData.download_url,
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
    return null
  }
}
