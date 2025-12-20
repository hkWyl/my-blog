// GitHub Admin API - 用于管理员操作 GitHub 仓库
import adminConfig from '@/config/admin.config.js'

const { owner, repo, branch, apiBase } = adminConfig.github

// 从 localStorage 获取 token
function getAccessToken() {
  const token = localStorage.getItem('github_access_token')
  if (!token) {
    throw new Error('未配置 GitHub Access Token，请先在管理面板配置')
  }
  return token
}

// 通用请求头
function getHeaders() {
  return {
    'Authorization': `Bearer ${getAccessToken()}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }
}

/**
 * 获取仓库中的所有文件
 * @returns {Promise<Array>} 文件列表
 */
export async function getRepoFiles() {
  const url = `${apiBase}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`

  try {
    const response = await fetch(url, { headers: getHeaders() })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const data = await response.json()
    return data.tree.filter((item) => item.type === 'blob') // 只返回文件，不返回目录
  } catch (error) {
    console.error('获取文件列表失败:', error)
    throw error
  }
}

/**
 * 获取单个文件的内容
 * @param {string} filepath - 文件路径（例如：posts/article.md）
 * @returns {Promise<Object>} 文件内容和元数据
 */
export async function getFileContent(filepath) {
  const url = `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(
    filepath
  )}?ref=${branch}`

  try {
    const response = await fetch(url, { headers: getHeaders() })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const data = await response.json()

    let content
    if (data.content) {
      // GitHub API 返回 base64 编码的内容
      try {
        // 移除所有换行符和空格
        const cleanBase64 = data.content.replace(/\s/g, '')
        content = decodeURIComponent(escape(atob(cleanBase64)))
      } catch (decodeError) {
        console.error('Base64 解码失败，尝试直接使用:', decodeError)
        content = data.content
      }
    } else {
      content = ''
    }

    return {
      content,
      sha: data.sha, // 文件的 SHA 值，更新时需要
      path: data.path,
      size: data.size,
    }
  } catch (error) {
    console.error(`获取文件 ${filepath} 失败:`, error)
    throw error
  }
}

/**
 * 创建新文件
 * @param {string} filepath - 文件路径（例如：posts/new-article.md）
 * @param {string} content - 文件内容
 * @param {string} message - 提交信息
 * @returns {Promise<Object>} 创建结果
 */
export async function createFile(filepath, content, message = '创建新文章') {
  const url = `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(filepath)}`

  // 将内容编码为 base64
  const base64Content = btoa(unescape(encodeURIComponent(content)))

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        message,
        content: base64Content,
        branch,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()

      // 特殊处理权限错误
      if (response.status === 403 || errorData.message?.includes('Resource not accessible')) {
        throw new Error(
          '权限不足：您的 GitHub Token 可能没有足够的权限。\n' +
          '请确保 Token 拥有以下权限：\n' +
          '1. repo（完整仓库权限）\n' +
          '2. workflow（如果需要操作 GitHub Actions）\n\n' +
          '请前往 GitHub Settings > Developer settings > Personal access tokens，\n' +
          '重新生成具有完整 repo 权限的 Token。'
        )
      }

      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    const data = await response.json()

    // 更新 posts.json
    await updatePostsJson()

    return data
  } catch (error) {
    console.error(`创建文件 ${filepath} 失败:`, error)
    throw error
  }
}

/**
 * 更新现有文件
 * @param {string} filepath - 文件路径
 * @param {string} content - 新的文件内容
 * @param {string} sha - 文件的当前 SHA 值
 * @param {string} message - 提交信息
 * @returns {Promise<Object>} 更新结果
 */
export async function updateFile(filepath, content, sha, message = '更新文章') {
  const url = `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(filepath)}`

  // 将内容编码为 base64
  const base64Content = btoa(unescape(encodeURIComponent(content)))

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        message,
        content: base64Content,
        sha,
        branch,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()

      // 特殊处理权限错误
      if (response.status === 403 || errorData.message?.includes('Resource not accessible')) {
        throw new Error(
          '权限不足：您的 GitHub Token 可能没有足够的权限。\n' +
          '请确保 Token 拥有以下权限：\n' +
          '1. repo（完整仓库权限）\n' +
          '2. workflow（如果需要操作 GitHub Actions）\n\n' +
          '请前往 GitHub Settings > Developer settings > Personal access tokens，\n' +
          '重新生成具有完整 repo 权限的 Token。'
        )
      }

      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    const data = await response.json()

    // 更新 posts.json
    await updatePostsJson()

    return data
  } catch (error) {
    console.error(`更新文件 ${filepath} 失败:`, error)
    throw error
  }
}

/**
 * 删除文件
 * @param {string} filepath - 文件路径
 * @param {string} sha - 文件的当前 SHA 值
 * @param {string} message - 提交信息
 * @returns {Promise<Object>} 删除结果
 */
export async function deleteFile(filepath, sha, message = '删除文件') {
  const url = `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(filepath)}`

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({
        message,
        sha,
        branch,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    const data = await response.json()

    // 更新 posts.json
    await updatePostsJson()

    return data
  } catch (error) {
    console.error(`删除文件 ${filepath} 失败:`, error)
    throw error
  }
}

/**
 * 更新 posts.json 文件
 * 每次创建、更新或删除文章后调用，保持文章列表同步
 */
async function updatePostsJson() {
  try {
    // 获取所有文章文件
    const files = await getRepoFiles()
    const mdFiles = files
      .filter((file) => file.path.startsWith('posts/') && file.path.endsWith('.md'))
      .map((file) => file.path.replace('posts/', ''))

    // 获取现有 posts.json 的 SHA（如果存在）
    let postsSha = null
    try {
      const postsFile = await getFileContent('posts/posts.json')
      postsSha = postsFile.sha
    } catch (error) {
      // posts.json 不存在，将创建新文件
      console.log('posts.json 不存在，将创建新文件')
    }

    // 创建或更新 posts.json
    const postsContent = JSON.stringify(mdFiles, null, 2)
    const url = `${apiBase}/repos/${owner}/${repo}/contents/posts/posts.json`
    const base64Content = btoa(unescape(encodeURIComponent(postsContent)))

    const body = {
      message: '更新文章列表',
      content: base64Content,
      branch,
    }

    if (postsSha) {
      body.sha = postsSha
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`更新 posts.json 失败: ${response.status}`)
    }

    console.log('posts.json 更新成功')
  } catch (error) {
    console.error('更新 posts.json 失败:', error)
    // 不抛出错误，避免影响主操作
  }
}

/**
 * 获取所有 Markdown 文章
 * @returns {Promise<Array>} 文章列表（包含解析后的 Front Matter）
 */
export async function getAllPosts() {
  try {
    const files = await getRepoFiles()
    const mdFiles = files.filter(
      (file) => file.path.startsWith('posts/') && file.path.endsWith('.md')
    )

    // 并行获取所有文章内容
    const posts = await Promise.all(
      mdFiles.map(async (file) => {
        try {
          const fileData = await getFileContent(file.path)
          const parsed = parseFrontMatter(fileData.content)

          return {
            id: file.path.replace('posts/', '').replace('.md', ''),
            filename: file.path,
            sha: fileData.sha,
            title: parsed.data.title || '无标题',
            date: parsed.data.date || '',
            categories: parsed.data.categories || [],
            tags: parsed.data.tags || [],
            excerpt: parsed.data.excerpt || '',
            content: parsed.content,
            rawContent: fileData.content,
          }
        } catch (error) {
          console.error(`解析文章 ${file.path} 失败:`, error)
          return null
        }
      })
    )

    // 过滤掉解析失败的文章，按日期排序
    return posts.filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date))
  } catch (error) {
    console.error('获取文章列表失败:', error)
    throw error
  }
}

/**
 * 解析 Markdown Front Matter
 * @param {string} content - Markdown 内容
 * @returns {Object} { data: Front Matter 数据, content: 正文内容 }
 */
function parseFrontMatter(content) {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(frontMatterRegex)

  if (!match) {
    return { data: {}, content }
  }

  const frontMatter = match[1]
  const mainContent = match[2]

  // 简单的 YAML 解析（适用于基本格式）
  const data = {}
  const lines = frontMatter.split('\n')

  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue

    const key = line.substring(0, colonIndex).trim()
    let value = line.substring(colonIndex + 1).trim()

    // 处理数组格式 [item1, item2]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim())
    }

    data[key] = value
  }

  return { data, content: mainContent }
}

/**
 * 生成 Markdown 文章内容（包含 Front Matter）
 * @param {Object} frontMatter - Front Matter 数据
 * @param {string} content - 正文内容
 * @returns {string} 完整的 Markdown 内容
 */
export function generateMarkdownContent(frontMatter, content) {
  const { title, date, categories, tags, excerpt } = frontMatter

  const fm = [
    '---',
    `title: ${title}`,
    `date: ${date}`,
    `categories: [${Array.isArray(categories) ? categories.join(', ') : categories}]`,
    `tags: [${Array.isArray(tags) ? tags.join(', ') : tags}]`,
    `excerpt: ${excerpt}`,
    '---',
    '',
  ].join('\n')

  return fm + content
}

/**
 * 验证 GitHub Token 是否有效
 * @returns {Promise<boolean>} Token 是否有效
 */
export async function verifyToken() {
  try {
    const url = `${apiBase}/user`
    const response = await fetch(url, { headers: getHeaders() })
    return response.ok
  } catch (error) {
    return false
  }
}
