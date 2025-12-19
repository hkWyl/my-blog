import { marked } from 'marked'
import hljs from 'highlight.js'

// 配置 marked
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {
        console.error(err)
      }
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true, // 支持 GFM 换行
  gfm: true, // 启用 GitHub 风格的 Markdown
})

/**
 * 解析 Markdown Front Matter
 * 格式：
 * ---
 * title: 文章标题
 * date: 2024-01-01
 * categories: [分类1, 分类2]
 * tags: [标签1, 标签2]
 * ---
 */
export const parseFrontMatter = (content) => {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = content.match(frontMatterRegex)

  if (!match) {
    return {
      meta: {},
      content: content,
    }
  }

  const frontMatterText = match[1]
  const mainContent = match[2]

  const meta = {}
  const lines = frontMatterText.split('\n')

  lines.forEach((line) => {
    const [key, ...valueParts] = line.split(':')
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim()

      // 解析数组格式 [item1, item2]
      if (value.startsWith('[') && value.endsWith(']')) {
        meta[key.trim()] = value
          .slice(1, -1)
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item)
      } else {
        meta[key.trim()] = value
      }
    }
  })

  return {
    meta,
    content: mainContent,
  }
}

/**
 * 渲染 Markdown 为 HTML
 */
export const renderMarkdown = (content) => {
  try {
    return marked(content)
  } catch (error) {
    console.error('Markdown 渲染失败:', error)
    return '<p>内容渲染失败</p>'
  }
}

/**
 * 提取文章摘要（前 200 个字符）
 */
export const extractExcerpt = (content, length = 200) => {
  // 移除 Markdown 语法
  const plainText = content
    .replace(/^---[\s\S]*?---/, '') // 移除 front matter
    .replace(/[#*`_~\[\]()]/g, '') // 移除 Markdown 标记
    .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
    .replace(/\[.*?\]\(.*?\)/g, '') // 移除链接
    .trim()

  return plainText.length > length ? plainText.substring(0, length) + '...' : plainText
}

/**
 * 生成文章 ID（基于路径）
 */
export const generatePostId = (path) => {
  return path.replace(/\//g, '-').replace('.md', '')
}
