import axios from 'axios'
import blogConfig from '@/config/blog.config.js'

// 创建 axios 实例
const githubApi = axios.create({
  baseURL: blogConfig.api.base,
  timeout: 10000,
})

// 响应拦截器
githubApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API 请求失败:', error)
    return Promise.reject(error)
  },
)

/**
 * 获取仓库文件树
 */
export const getRepoTree = async () => {
  try {
    const { owner, repo, branch } = blogConfig.github
    const response = await githubApi.get(`/repos/${owner}/${repo}/git/trees/${branch}`, {
      params: {
        recursive: 1, // 递归获取所有文件
      },
    })
    return response
  } catch (error) {
    console.error('获取文件树失败:', error)
    return { tree: [] }
  }
}

/**
 * 获取文件内容（使用 GitHub Raw URL，直接返回文本内容）
 */
export const getFileContent = async (path) => {
  try {
    const { owner, repo, branch } = blogConfig.github
    // 使用 GitHub raw content URL，直接获取文本内容
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`
    const response = await axios.get(rawUrl)
    return {
      content: response.data,
      path: path,
      name: path.split('/').pop(),
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

    // GitHub raw URL 直接返回文本内容，不需要 base64 解码
    return {
      path: fileData.path,
      name: fileData.name,
      content: fileData.content,
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
    return null
  }
}
