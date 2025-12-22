<template>
  <div class="post-manager">
    <!-- 视图切换：列表 / 编辑器 -->
    <div v-if="currentView === 'list'" class="list-view">
      <div class="list-header">
        <h2 class="section-title">文章管理</h2>
        <button @click="handleNewPost" class="btn-new-post">
          <span>+ 新建文章</span>
        </button>
      </div>

      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索文章标题或内容..."
        />
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="loadPosts" class="btn-retry">重试</button>
      </div>

      <div v-else-if="filteredPosts.length === 0" class="empty-state">
        <p>{{ searchQuery ? '没有找到匹配的文章' : '还没有文章，点击上方按钮新建第一篇文章吧！' }}</p>
      </div>

      <div v-else class="posts-grid">
        <div v-for="post in filteredPosts" :key="post.id" class="post-item">
          <div class="post-item-header">
            <h3 class="post-item-title">{{ post.title }}</h3>
            <span class="post-item-date">{{ formatDate(post.date) }}</span>
          </div>

          <p class="post-item-excerpt">{{ post.excerpt || '无描述' }}</p>

          <div class="post-item-meta">
            <div class="post-item-tags">
              <span v-for="tag in post.tags.slice(0, 3)" :key="tag" class="tag">
                #{{ tag }}
              </span>
              <span v-if="post.tags.length > 3" class="tag-more">+{{ post.tags.length - 3 }}</span>
            </div>
          </div>

          <div class="post-item-actions">
            <button @click="handleEditPost(post)" class="btn-edit">
              <span>✏️ 编辑</span>
            </button>
            <button @click="handleDeletePost(post)" class="btn-delete">
              <span>🗑️ 删除</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑器视图 -->
    <div v-else-if="currentView === 'editor'" class="editor-view">
      <div class="editor-header">
        <h2 class="section-title">{{ isEditing ? '编辑文章' : '新建文章' }}</h2>
        <button @click="handleCancelEdit" class="btn-cancel">
          <span>← 返回列表</span>
        </button>
      </div>

      <form @submit.prevent="handleSavePost" class="post-form">
        <div class="form-group">
          <label for="post-title">文章标题 *</label>
          <input
            id="post-title"
            v-model="postForm.title"
            type="text"
            placeholder="请输入文章标题"
            required
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="post-date">发布日期 *</label>
            <input id="post-date" v-model="postForm.date" type="date" required />
          </div>

          <div class="form-group">
            <label for="post-filename">文件名 *</label>
            <input
              id="post-filename"
              v-model="postForm.filename"
              type="text"
              placeholder="例如: my-article.md"
              required
              :disabled="isEditing"
            />
            <p class="field-hint">文件名一旦创建不可修改</p>
          </div>
        </div>

        <div class="form-group">
          <label>分类</label>
          <TagInput
            v-model="postForm.categories"
            placeholder="输入分类"
            :suggestions="adminConfig.commonCategories"
            hint="按 Enter 或逗号添加分类"
          />
        </div>

        <div class="form-group">
          <label>标签</label>
          <TagInput
            v-model="postForm.tags"
            placeholder="输入标签"
            :suggestions="adminConfig.commonTags"
            hint="按 Enter 或逗号添加标签"
          />
        </div>

        <div class="form-group">
          <label for="post-excerpt">摘要</label>
          <textarea
            id="post-excerpt"
            v-model="postForm.excerpt"
            rows="2"
            placeholder="简短描述文章内容（可选）"
          ></textarea>
        </div>

        <div class="form-group">
          <label>正文内容 *</label>
          <MarkdownEditor v-model="postForm.content" />
        </div>

        <div v-if="saveError" class="error-message">
          {{ saveError }}
        </div>

        <div v-if="saveSuccess" class="success-message">
          ✅ {{ isEditing ? '更新成功！正在刷新列表...' : '发布成功！正在返回列表...' }}
        </div>

        <div class="form-actions">
          <button type="button" @click="handleCancelEdit" class="btn-secondary" :disabled="saving">
            取消
          </button>
          <button type="submit" class="btn-primary" :disabled="saving">
            <span v-if="saving">{{ isEditing ? '更新中...' : '发布中...' }}</span>
            <span v-else>{{ isEditing ? '更新文章' : '发布文章' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllPosts, getFileContent, createFile, updateFile, deleteFile, generateMarkdownContent } from '@/api/githubAdmin'
import { parseFrontMatter } from '@/utils/markdown'
import TagInput from './TagInput.vue'
import MarkdownEditor from './MarkdownEditor.vue'
import adminConfig from '@/config/admin.config.js'

const currentView = ref('list') // 'list' or 'editor'
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')

const posts = ref([])
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)

const isEditing = ref(false)
const editingPost = ref(null)

const postForm = ref({
  title: '',
  date: new Date().toISOString().split('T')[0],
  filename: '',
  categories: [],
  tags: [],
  excerpt: '',
  content: '',
  sha: '', // 用于更新时需要
})

// 过滤后的文章列表
const filteredPosts = computed(() => {
  if (!searchQuery.value.trim()) {
    return posts.value
  }

  const query = searchQuery.value.toLowerCase()
  return posts.value.filter((post) => {
    return (
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.tags.some((tag) => tag.toLowerCase().includes(query)) ||
      post.categories.some((cat) => cat.toLowerCase().includes(query))
    )
  })
})

onMounted(() => {
  loadPosts()
})

async function loadPosts() {
  loading.value = true
  error.value = ''

  // 检查是否有 token
  const hasToken = localStorage.getItem('github_access_token')
  if (!hasToken) {
    error.value = '未配置 GitHub Access Token，请先在"系统配置"标签页配置'
    loading.value = false
    return
  }

  try {
    posts.value = await getAllPosts()
  } catch (err) {
    error.value = '加载文章失败：' + err.message
  } finally {
    loading.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function handleNewPost() {
  isEditing.value = false
  editingPost.value = null

  postForm.value = {
    title: '',
    date: new Date().toISOString().split('T')[0],
    filename: '',
    categories: [],
    tags: [],
    excerpt: '',
    content: '',
    sha: '',
  }

  currentView.value = 'editor'
}

async function handleEditPost(post) {
  isEditing.value = true
  editingPost.value = post

  // 重新从 GitHub 获取最新文件内容，避免使用缓存数据
  console.log('📥 重新获取文件最新内容:', post.filename)
  try {
    const latestFile = await getFileContent(post.filename)

    // 解析最新的 frontmatter - 注意：parseFrontMatter 返回 { meta, content }
    const { meta: frontMatter, content: parsedContent } = parseFrontMatter(latestFile.content)
    const contentMatch = latestFile.content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/)
    const mainContent = contentMatch ? contentMatch[1] : parsedContent

    postForm.value = {
      title: frontMatter.title || post.title || '无标题',
      date: frontMatter.date || post.date || new Date().toISOString().split('T')[0],
      filename: post.filename,
      categories: Array.isArray(frontMatter.categories) ? frontMatter.categories :
                  (typeof frontMatter.categories === 'string' ? frontMatter.categories.split(',').map(c => c.trim()) : []),
      tags: Array.isArray(frontMatter.tags) ? frontMatter.tags :
            (typeof frontMatter.tags === 'string' ? frontMatter.tags.split(',').map(t => t.trim()) : []),
      excerpt: frontMatter.excerpt || post.excerpt || '',
      content: mainContent.trim(),
      sha: latestFile.sha,
    }

    console.log('✅ 加载最新文件成功，标题:', postForm.value.title)
  } catch (error) {
    console.error('❌ 获取最新文件失败，使用缓存数据:', error)
    // 如果失败，降级使用缓存数据
    postForm.value = {
      title: post.title || '无标题',
      date: post.date || new Date().toISOString().split('T')[0],
      filename: post.filename || '',
      categories: Array.isArray(post.categories) ? [...post.categories] : [],
      tags: Array.isArray(post.tags) ? [...post.tags] : [],
      excerpt: post.excerpt || '',
      content: post.content || '',
      sha: post.sha || '',
    }
  }

  currentView.value = 'editor'
}

function handleCancelEdit() {
  if (confirm('确定要放弃当前的编辑吗？未保存的内容将丢失。')) {
    currentView.value = 'list'
    saveError.value = ''
    saveSuccess.value = false
  }
}

async function handleSavePost() {
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false

  try {
    // 调试：打印表单数据
    console.log('💾 开始保存文章...')
    console.log('📋 表单数据:', {
      title: postForm.value.title,
      filename: postForm.value.filename,
      date: postForm.value.date,
      categories: postForm.value.categories,
      tags: postForm.value.tags,
      excerpt: postForm.value.excerpt,
      contentLength: postForm.value.content.length,
    })

    // 验证表单
    if (!postForm.value.title.trim()) {
      throw new Error('请输入文章标题')
    }

    if (!postForm.value.filename.trim()) {
      throw new Error('请输入文件名')
    }

    if (!postForm.value.filename.endsWith('.md')) {
      postForm.value.filename += '.md'
    }

    if (!postForm.value.content.trim()) {
      throw new Error('请输入文章内容')
    }

    // 生成 Markdown 内容
    const markdownContent = generateMarkdownContent(
      {
        title: postForm.value.title,
        date: postForm.value.date,
        categories: postForm.value.categories,
        tags: postForm.value.tags,
        excerpt: postForm.value.excerpt,
      },
      postForm.value.content
    )

    console.log('📝 生成的 Markdown 前50字符:', markdownContent.substring(0, 150))

    if (isEditing.value) {
      // 更新现有文章 - 先获取最新的 SHA 避免冲突
      try {
        const latestFile = await getFileContent(postForm.value.filename)
        const latestSha = latestFile.sha
        await updateFile(
          postForm.value.filename,
          markdownContent,
          latestSha,
          `Update: ${postForm.value.title}`
        )

        // 保存成功后，重新获取最新 SHA 并更新表单，避免下次保存冲突
        const updatedFile = await getFileContent(postForm.value.filename)
        postForm.value.sha = updatedFile.sha
      } catch (err) {
        // 如果获取最新 SHA 失败，尝试使用缓存的 SHA
        if (err.message.includes('404')) {
          // 文件不存在，当作新建处理
          await createFile(postForm.value.filename, markdownContent, `Add: ${postForm.value.title}`)
        } else {
          throw err
        }
      }
    } else {
      // 创建新文章
      await createFile(postForm.value.filename, markdownContent, `Add: ${postForm.value.title}`)
    }

    saveSuccess.value = true

    // 1.5 秒后返回列表并刷新
    setTimeout(async () => {
      saveSuccess.value = false
      currentView.value = 'list'
      // 重新加载文章列表（现在会强制刷新缓存）
      await loadPosts()
    }, 1500)
  } catch (err) {
    saveError.value = err.message || '保存失败'
  } finally {
    saving.value = false
  }
}

async function handleDeletePost(post) {
  if (
    !confirm(
      `确定要删除文章《${post.title}》吗？\n\n此操作不可恢复！`
    )
  ) {
    return
  }

  try {
    await deleteFile(post.filename, post.sha, `Delete: ${post.title}`)
    alert('删除成功！')
    await loadPosts()
  } catch (err) {
    alert('删除失败：' + err.message)
  }
}
</script>

<style scoped>
.post-manager {
  max-width: 1200px;
  --admin-text: #f1f5f9;
  --admin-text-strong: #ffffff;
  --admin-text-muted: #e2e8f0;
}

/* Light mode */
:root:not(.dark) .post-manager {
  --admin-text: #1e293b;
  --admin-text-strong: #0f172a;
  --admin-text-muted: #475569;
}

.list-view,
.editor-view {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.list-header,
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--admin-text-strong);
}

.btn-new-post,
.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  border: none;
  border-radius: 0.5rem;
  color: #ffffff;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

/* 浅色模式下按钮样式优化 */
:root:not(.dark) .btn-new-post,
:root:not(.dark) .btn-cancel {
  color: #ffffff;
  background: linear-gradient(135deg, #42b983 0%, #35a372 100%);
  border: 2px solid #2d7a5e;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.3);
}

.btn-new-post span,
.btn-cancel span {
  color: inherit;
}

.btn-new-post:hover,
.btn-cancel:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(66, 185, 131, 0.3);
}

.search-bar {
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1.25rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 0.5rem;
  color: var(--admin-text);
  font-size: 0.9375rem;
  transition: all 0.3s;
}

:root:not(.dark) .search-input {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--admin-text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid rgba(66, 185, 131, 0.2);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: var(--color-primary);
  border: none;
  border-radius: 0.5rem;
  color: #ffffff;
  cursor: pointer;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.post-item {
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(100, 116, 139, 0.2);
  border-radius: 0.75rem;
  transition: all 0.3s;
}

:root:not(.dark) .post-item {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.post-item:hover {
  border-color: var(--color-primary);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.post-item-header {
  margin-bottom: 0.75rem;
}

.post-item-title {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--admin-text-strong);
  line-height: 1.4;
}

.post-item-date {
  font-size: 0.8125rem;
  color: var(--admin-text-muted);
}

.post-item-excerpt {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: var(--admin-text-muted);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-item-meta {
  margin-bottom: 1rem;
}

.post-item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.tag {
  padding: 0.25rem 0.625rem;
  background: rgba(66, 185, 131, 0.1);
  border-radius: 0.25rem;
  color: var(--color-primary);
  font-size: 0.75rem;
}

.tag-more {
  padding: 0.25rem 0.625rem;
  background: rgba(100, 116, 139, 0.2);
  border-radius: 0.25rem;
  color: var(--admin-text-muted);
  font-size: 0.75rem;
}

.post-item-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(100, 116, 139, 0.2);
}

.btn-edit,
.btn-delete {
  flex: 1;
  padding: 0.625rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

.btn-edit:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
}

.btn-delete {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-2px);
}

/* 编辑器表单样式 */
.post-form {
  max-width: 900px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--admin-text);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 0.5rem;
  color: var(--admin-text);
  font-size: 0.9375rem;
  font-family: inherit;
  transition: all 0.3s;
}

:root:not(.dark) .form-group input,
:root:not(.dark) .form-group textarea {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.field-hint {
  margin: 0.375rem 0 0;
  font-size: 0.75rem;
  color: var(--admin-text-muted);
}

.error-message,
.success-message {
  padding: 1rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.success-message {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  color: #ffffff;
}

/* 浅色模式下按钮样式优化 */
:root:not(.dark) .btn-primary {
  color: #ffffff;
  background: linear-gradient(135deg, #42b983 0%, #35a372 100%);
  border: 2px solid #2d7a5e;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.3);
}

.btn-primary span {
  color: inherit;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(66, 185, 131, 0.3);
}

.btn-secondary {
  background: rgba(100, 116, 139, 0.2);
  color: var(--admin-text);
  border: 1px solid rgba(100, 116, 139, 0.3);
}

/* 浅色模式下次要按钮样式优化 */
:root:not(.dark) .btn-secondary {
  background: rgba(100, 116, 139, 0.15);
  color: #1e293b;
  border: 2px solid rgba(100, 116, 139, 0.5);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(100, 116, 139, 0.3);
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
