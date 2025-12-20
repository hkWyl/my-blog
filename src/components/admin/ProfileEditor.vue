<template>
  <div class="profile-editor">
    <h2 class="section-title">个人资料编辑</h2>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else class="editor-container">
      <form @submit.prevent="handleSave" class="profile-form">
        <div class="form-section">
          <h3 class="section-subtitle">基本信息</h3>

          <div class="form-group">
            <label for="title">博客标题</label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              placeholder="例如：bug毁灭者"
              required
            />
          </div>

          <div class="form-group">
            <label for="subtitle">副标题</label>
            <input
              id="subtitle"
              v-model="form.subtitle"
              type="text"
              placeholder="例如：记录技术成长的点点滴滴"
            />
          </div>

          <div class="form-group">
            <label for="author">作者名称</label>
            <input
              id="author"
              v-model="form.author"
              type="text"
              placeholder="你的名字"
              required
            />
          </div>

          <div class="form-group">
            <label for="description">博客描述</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              placeholder="简单描述你的博客"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="avatar">头像链接</label>
            <input
              id="avatar"
              v-model="form.avatar"
              type="url"
              placeholder="https://example.com/avatar.jpg"
            />
            <div v-if="form.avatar" class="avatar-preview">
              <img :src="form.avatar" alt="头像预览" />
              <span class="preview-label">头像预览</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-subtitle">社交链接</h3>

          <div class="form-group">
            <label for="gitee">Gitee 主页</label>
            <input
              id="gitee"
              v-model="form.social.gitee"
              type="url"
              placeholder="https://gitee.com/username"
            />
          </div>

          <div class="form-group">
            <label for="github">GitHub 主页（可选）</label>
            <input
              id="github"
              v-model="form.social.github"
              type="url"
              placeholder="https://github.com/username"
            />
          </div>

          <div class="form-group">
            <label for="email">邮箱（可选）</label>
            <input id="email" v-model="form.social.email" type="email" placeholder="your@email.com" />
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          ✅ 保存成功！更改将在下次部署后生效。
        </div>

        <div class="form-actions">
          <button type="button" @click="handleReset" class="btn-secondary" :disabled="saving">
            重置
          </button>
          <button type="submit" class="btn-primary" :disabled="saving">
            <span v-if="saving">保存中...</span>
            <span v-else>保存更改</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getFileContent, updateFile } from '@/api/githubAdmin'
import blogConfig from '@/config/blog.config.js'

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref(false)

const form = ref({
  title: '',
  subtitle: '',
  author: '',
  description: '',
  avatar: '',
  social: {
    gitee: '',
    github: '',
    email: '',
  },
})

const originalSha = ref('')

onMounted(async () => {
  await loadConfig()
})

async function loadConfig() {
  loading.value = true
  error.value = ''

  try {
    // 从当前配置加载数据
    form.value = {
      title: blogConfig.title || '',
      subtitle: blogConfig.subtitle || '',
      author: blogConfig.author || '',
      description: blogConfig.description || '',
      avatar: blogConfig.avatar || '',
      social: {
        gitee: blogConfig.social?.gitee || '',
        github: blogConfig.social?.github || '',
        email: blogConfig.social?.email || '',
      },
    }

    // 检查是否有 token
    const hasToken = localStorage.getItem('github_access_token')
    if (!hasToken) {
      console.warn('未配置 GitHub Token，跳过获取远程配置文件')
      loading.value = false
      return
    }

    // 获取配置文件的 SHA（用于更新）
    try {
      const fileData = await getFileContent('src/config/blog.config.js')
      originalSha.value = fileData.sha
    } catch (err) {
      console.warn('无法获取配置文件 SHA，将使用当前数据')
    }
  } catch (err) {
    error.value = '加载配置失败：' + err.message
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  if (saving.value) return

  saving.value = true
  error.value = ''
  success.value = false

  try {
    // 生成新的配置文件内容
    const newConfig = generateConfigFile()

    // 如果没有 SHA，说明是首次操作，提示用户
    if (!originalSha.value) {
      error.value = '⚠️ 注意：无法直接保存到 Gitee。请手动将以下内容复制到 blog.config.js：\n' + newConfig
      saving.value = false
      return
    }

    // 更新 Gitee 仓库中的配置文件
    // 注意：这里更新的是 my-blog-posts 仓库，需要确保该仓库有这个文件
    await updateFile(
      'src/config/blog.config.js',
      newConfig,
      originalSha.value,
      'Update: 更新博客配置'
    )

    success.value = true

    // 3 秒后隐藏成功消息
    setTimeout(() => {
      success.value = false
    }, 3000)
  } catch (err) {
    error.value = '保存失败：' + err.message
  } finally {
    saving.value = false
  }
}

function generateConfigFile() {
  // 生成配置文件内容
  const socialLinks = []
  if (form.value.social.gitee) socialLinks.push(`    gitee: '${form.value.social.gitee}',`)
  if (form.value.social.github) socialLinks.push(`    github: '${form.value.social.github}',`)
  if (form.value.social.email) socialLinks.push(`    email: '${form.value.social.email}',`)

  return `// 博客配置文件
export default {
  // 博客基本信息
  title: '${form.value.title}',
  subtitle: '${form.value.subtitle}',
  author: '${form.value.author}',
  description: '${form.value.description}',
  avatar: '${form.value.avatar}',

  // Gitee 配置
  gitee: {
    owner: '${blogConfig.gitee.owner}',
    repo: '${blogConfig.gitee.repo}',
    branch: '${blogConfig.gitee.branch}',
  },

  // Gitee API 地址
  api: {
    base: '${blogConfig.api.base}',
  },

  // 导航菜单
  nav: ${JSON.stringify(blogConfig.nav, null, 4)},

  // 每页显示文章数
  pageSize: ${blogConfig.pageSize},

  // 社交链接
  social: {
${socialLinks.join('\n')}
  },

  // Gitalk 评论配置
  gitalk: ${JSON.stringify(blogConfig.gitalk, null, 4)},
}
`
}

function handleReset() {
  if (confirm('确定要重置所有更改吗？')) {
    loadConfig()
  }
}
</script>

<style scoped>
.profile-editor {
  max-width: 800px;
}

.section-title {
  margin: 0 0 2rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-heading);
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
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

.editor-container {
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

.form-section {
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 0.75rem;
  border: 1px solid rgba(100, 116, 139, 0.2);
}

:root:not(.dark) .form-section {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.section-subtitle {
  margin: 0 0 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-primary);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 0.5rem;
  color: var(--color-text);
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

.avatar-preview {
  margin-top: 1rem;
  text-align: center;
}

.avatar-preview img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid var(--color-primary);
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.preview-label {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
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
  white-space: pre-wrap;
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
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(66, 185, 131, 0.3);
}

.btn-secondary {
  background: rgba(100, 116, 139, 0.2);
  color: var(--color-text);
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(100, 116, 139, 0.3);
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
