import { ref, computed } from 'vue'
import { getAllPosts, getPostDetail } from '@/api/github'
import { parseFrontMatter, extractExcerpt, generatePostId } from '@/utils/markdown'

// 全局状态
const posts = ref([])
const loading = ref(false)
const error = ref(null)

export const usePosts = () => {
  /**
   * 加载所有文章
   * @param {boolean} forceRefresh - 强制刷新，忽略缓存
   */
  const loadAllPosts = async (forceRefresh = false) => {
    // 如果已有缓存且不强制刷新，直接返回
    if (posts.value.length > 0 && !forceRefresh) {
      return posts.value
    }

    loading.value = true
    error.value = null

    try {
      const postFiles = await getAllPosts()

      // 获取每篇文章的详细信息
      const postPromises = postFiles.map(async (file) => {
        const detail = await getPostDetail(file.path)
        if (!detail) return null

        const { meta, content } = parseFrontMatter(detail.content)

        return {
          id: generatePostId(file.path),
          path: file.path,
          title: meta.title || detail.name.replace('.md', ''),
          date: meta.date || '',
          categories: meta.categories || [],
          tags: meta.tags || [],
          excerpt: meta.excerpt || extractExcerpt(content),
          content: content,
          rawContent: detail.content,
        }
      })

      const loadedPosts = await Promise.all(postPromises)
      posts.value = loadedPosts
        .filter((post) => post !== null)
        .sort((a, b) => new Date(b.date) - new Date(a.date)) // 按日期倒序

      return posts.value
    } catch (err) {
      error.value = err.message
      console.error('加载文章失败:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据 ID 获取文章
   */
  const getPostById = (id) => {
    return posts.value.find((post) => post.id === id)
  }

  /**
   * 根据分类获取文章
   */
  const getPostsByCategory = (category) => {
    return posts.value.filter((post) => post.categories.includes(category))
  }

  /**
   * 根据标签获取文章
   */
  const getPostsByTag = (tag) => {
    return posts.value.filter((post) => post.tags.includes(tag))
  }

  /**
   * 搜索文章
   */
  const searchPosts = (keyword) => {
    if (!keyword) return posts.value

    const lowerKeyword = keyword.toLowerCase()
    return posts.value.filter(
      (post) =>
        post.title.toLowerCase().includes(lowerKeyword) ||
        post.excerpt.toLowerCase().includes(lowerKeyword) ||
        post.content.toLowerCase().includes(lowerKeyword),
    )
  }

  /**
   * 获取所有分类
   */
  const allCategories = computed(() => {
    const categoryMap = new Map()

    posts.value.forEach((post) => {
      post.categories.forEach((category) => {
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
      })
    })

    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  })

  /**
   * 获取所有标签
   */
  const allTags = computed(() => {
    const tagMap = new Map()

    posts.value.forEach((post) => {
      post.tags.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
      })
    })

    return Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  })

  /**
   * 按年份归档
   */
  const postsByYear = computed(() => {
    const yearMap = new Map()

    posts.value.forEach((post) => {
      if (post.date) {
        const year = new Date(post.date).getFullYear()
        if (!yearMap.has(year)) {
          yearMap.set(year, [])
        }
        yearMap.get(year).push(post)
      }
    })

    return Array.from(yearMap.entries())
      .sort(([a], [b]) => b - a) // 年份倒序
      .map(([year, posts]) => ({
        year,
        posts: posts.sort((a, b) => new Date(b.date) - new Date(a.date)),
      }))
  })

  return {
    posts,
    loading,
    error,
    loadAllPosts,
    getPostById,
    getPostsByCategory,
    getPostsByTag,
    searchPosts,
    allCategories,
    allTags,
    postsByYear,
  }
}
