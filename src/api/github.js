import axios from 'axios'
import blogConfig from '@/config/blog.config.js'

// 创建 axios 实例
const githubApi = axios.create({
  baseURL: blogConfig.api.base,
  timeout: 10000,
})

/**
 * 获取仓库文件列表（通过 GitHub API）
 */
export const getRepoTree = async () => {
  try {
    const { owner, repo, branch } = blogConfig.github
    const timestamp = new Date().getTime()

    // 使用 GitHub API 获取文件树
    const response = await githubApi.get(`/repos/${owner}/${repo}/git/trees/${branch}`, {
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
 * 获取文件内容（通过 GitHub Contents API - 无缓存）
 */
export const getFileContent = async (path) => {
  try {
    const { owner, repo, branch } = blogConfig.github
    const timestamp = new Date().getTime()

    // 使用 GitHub Contents API 获取文件内容（无缓存）
    const apiUrl = `${blogConfig.api.base}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${branch}&t=${timestamp}`

    const response = await axios.get(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github+json',
      }
    })

    // GitHub API 返回 base64 编码的内容，需要解码
    let content = ''
    if (response.data.content) {
      content = decodeBase64Content(response.data.content)
    }

    // 返回格式兼容原有代码
    return {
      path: response.data.path,
      name: response.data.name,
      content: content, // 解码后的文本内容
      sha: response.data.sha,
      size: response.data.size,
      download_url: response.data.download_url,
    }
  } catch (error) {
    console.error('获取文件内容失败:', error)
    return null
  }
}

/**
 * 解析 Base64 内容为文本（处理 GitHub API 返回的格式）
 */
export const decodeBase64Content = (base64Content) => {
  try {
    // 清理 base64 字符串：移除所有空白字符（GitHub API 返回的 base64 有换行）
    const cleanBase64 = base64Content.replace(/\s/g, '')

    // 解码 base64
    const decoded = atob(cleanBase64)

    // 转换为 UTF-8
    return decodeURIComponent(
      decoded
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
      sha: fileData.sha,
      size: fileData.size,
      download_url: fileData.download_url,
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
    return null
  }
}
