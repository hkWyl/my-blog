// GitHub Admin API - 用于管理员操作 GitHub 仓库
import adminConfig from '@/config/admin.config.js'

const { owner, repo, branch, apiBase } = adminConfig.github

// 从 localStorage 获取 token
function getAccessToken() {
  const token = localStorage.getItem('github_access_token')
  if (!token) {
    throw new Error('未配置 GitHub Access Token，请先在管理面板配置')
  }
  console.log('🔑 Using GitHub Token:', token.substring(0, 20) + '...')
  console.log('📦 Target Repo:', `${owner}/${repo}`, 'Branch:', branch)
  return token
}

/**
 * 获取仓库中的所有文件
 * @returns {Promise<Array>} 文件列表
 */
export async function getRepoFiles() {
  const token = getAccessToken()
  const timestamp = new Date().getTime()
  const url = `${apiBase}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1&t=${timestamp}`

  try {
    const response = await fetch(url, {
      cache: 'no-cache',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const data = await response.json()
    return data.tree.filter((item) => item.type === 'blob')
  } catch (error) {
    console.error('获取文件列表失败:', error)
    throw error
  }
}

/**
 * 获取单个文件的内容
 * @param {string} filepath - 文件路径（例如：GPIO总结.md）
 * @returns {Promise<Object>} 文件内容和元数据
 */
export async function getFileContent(filepath) {
  const token = getAccessToken()
  const timestamp = new Date().getTime()
  const url = `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(
    filepath
  )}?ref=${branch}&t=${timestamp}`

  try {
    const response = await fetch(url, {
      cache: 'no-cache',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const data = await response.json()

    let content
    if (data.content) {
      try {
        const cleanBase64 = data.content.replace(/\s/g, '')
        content = decodeURIComponent(escape(atob(cleanBase64)))
      } catch (decodeError) {
        console.error('Base64 解码失败:', decodeError)
        content = data.content
      }
    } else {
      content = ''
    }

    return {
      content,
      sha: data.sha,
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
 * @param {string} filepath - 文件路径
 * @param {string} content - 文件内容
 * @param {string} message - 提交信息
 * @returns {Promise<Object>} 创建结果
 */
export async function createFile(filepath, content, message = '创建新文章') {
  const token = getAccessToken()
  const url = `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(filepath)}`

  const base64Content = btoa(unescape(encodeURIComponent(content)))

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: base64Content,
        branch,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    const data = await response.json()
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
  const token = getAccessToken()
  const url = `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(filepath)}`

  console.log('📝 Updating file:', filepath)
  console.log('🔗 API URL:', url)
  console.log('🏷️  File SHA:', sha)
  console.log('📄 Content length:', content.length)
  console.log('💬 Commit message:', message)

  const base64Content = btoa(unescape(encodeURIComponent(content)))
  console.log('🔐 Base64 content length:', base64Content.length)

  const requestBody = {
    message,
    content: base64Content,
    sha,
    branch,
  }

  try {
    console.log('🚀 Sending PUT request...')
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    console.log('✅ Response received, status:', response.status, response.statusText)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('GitHub API 错误详情:', errorData)
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    const data = await response.json()
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
  const token = getAccessToken()
  const url = `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(filepath)}`

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
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
    return data
  } catch (error) {
    console.error(`删除文件 ${filepath} 失败:`, error)
    throw error
  }
}

/**
 * 获取所有 Markdown 文章
 * @returns {Promise<Array>} 文章列表（包含解析后的 Front Matter）
 */
export async function getAllPosts() {
  try {
    const files = await getRepoFiles()
    const mdFiles = files.filter((file) => file.path.endsWith('.md'))

    const posts = await Promise.all(
      mdFiles.map(async (file) => {
        try {
          const fileData = await getFileContent(file.path)
          const parsed = parseFrontMatter(fileData.content)

          return {
            id: file.path.replace('.md', ''),
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

  const data = {}
  const lines = frontMatter.split('\n')

  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue

    const key = line.substring(0, colonIndex).trim()
    let value = line.substring(colonIndex + 1).trim()

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
    const token = getAccessToken()
    const url = `${apiBase}/user`
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
      },
    })
    return response.ok
  } catch (error) {
    return false
  }
}
