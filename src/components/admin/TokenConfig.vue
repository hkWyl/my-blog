<template>
  <div class="token-config">
    <h2 class="section-title">系统配置</h2>

    <div class="config-section">
      <h3 class="section-subtitle">GitHub Access Token</h3>
      <p class="section-description">
        配置 GitHub Personal Access Token 以管理文章。Token 会安全地存储在浏览器本地。
      </p>

      <div class="form-group">
        <label for="github-token">GitHub Access Token *</label>
        <div class="token-input-group">
          <input
            id="github-token"
            v-model="tokenInput"
            :type="showToken ? 'text' : 'password'"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            class="token-input"
          />
          <button type="button" @click="showToken = !showToken" class="btn-toggle-visibility">
            {{ showToken ? '🙈 隐藏' : '👁️ 显示' }}
          </button>
        </div>
        <p class="field-hint">
          需要具有 <code>repo</code> 权限的 Token。
          <a
            href="https://github.com/settings/tokens/new?scopes=repo&description=Blog%20Admin"
            target="_blank"
            rel="noopener noreferrer"
            class="help-link"
          >
            创建新 Token →
          </a>
        </p>
      </div>

      <div class="token-status">
        <div v-if="currentToken" class="status-item status-saved">
          <span class="status-icon">✅</span>
          <span>Token 已配置</span>
        </div>
        <div v-else class="status-item status-missing">
          <span class="status-icon">⚠️</span>
          <span>未配置 Token</span>
        </div>
      </div>

      <div v-if="verifying" class="verify-status">
        <div class="spinner-small"></div>
        <span>验证 Token 中...</span>
      </div>

      <div v-if="verifyError" class="error-message">
        {{ verifyError }}
      </div>

      <div v-if="verifySuccess" class="success-message">
        ✅ Token 验证成功！
      </div>

      <div class="form-actions">
        <button
          type="button"
          @click="handleVerifyToken"
          class="btn-secondary"
          :disabled="!tokenInput || verifying"
        >
          <span v-if="verifying">验证中...</span>
          <span v-else>验证 Token</span>
        </button>
        <button
          type="button"
          @click="handleSaveToken"
          class="btn-primary"
          :disabled="!tokenInput || verifying"
        >
          保存配置
        </button>
        <button
          v-if="currentToken"
          type="button"
          @click="handleClearToken"
          class="btn-danger"
          :disabled="verifying"
        >
          清除 Token
        </button>
      </div>
    </div>

    <div class="config-section">
      <h3 class="section-subtitle">仓库信息</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">仓库所有者：</span>
          <span class="info-value">{{ adminConfig.github.owner }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">仓库名称：</span>
          <span class="info-value">{{ adminConfig.github.repo }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">分支：</span>
          <span class="info-value">{{ adminConfig.github.branch }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">API 地址：</span>
          <span class="info-value">{{ adminConfig.github.apiBase }}</span>
        </div>
      </div>
      <p class="field-hint">如需修改仓库信息，请编辑 src/config/admin.config.js</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { verifyToken } from '@/api/githubAdmin'
import adminConfig from '@/config/admin.config.js'

const tokenInput = ref('')
const currentToken = ref('')
const showToken = ref(false)
const verifying = ref(false)
const verifyError = ref('')
const verifySuccess = ref(false)

onMounted(() => {
  // 加载已保存的 token
  const savedToken = localStorage.getItem('github_access_token')
  if (savedToken) {
    currentToken.value = savedToken
    tokenInput.value = savedToken
  }
})

async function handleVerifyToken() {
  if (!tokenInput.value.trim()) return

  verifying.value = true
  verifyError.value = ''
  verifySuccess.value = false

  try {
    // 临时保存 token 以便验证
    const originalToken = localStorage.getItem('github_access_token')
    localStorage.setItem('github_access_token', tokenInput.value.trim())

    const isValid = await verifyToken()

    if (isValid) {
      verifySuccess.value = true
      setTimeout(() => {
        verifySuccess.value = false
      }, 3000)
    } else {
      // 恢复原来的 token
      if (originalToken) {
        localStorage.setItem('github_access_token', originalToken)
      } else {
        localStorage.removeItem('github_access_token')
      }
      verifyError.value = 'Token 验证失败，请检查 Token 是否有效以及是否具有正确的权限'
    }
  } catch (error) {
    verifyError.value = 'Token 验证失败：' + error.message
  } finally {
    verifying.value = false
  }
}

function handleSaveToken() {
  if (!tokenInput.value.trim()) {
    alert('请输入 GitHub Access Token')
    return
  }

  try {
    localStorage.setItem('github_access_token', tokenInput.value.trim())
    currentToken.value = tokenInput.value.trim()
    alert('✅ Token 保存成功！')
  } catch (error) {
    alert('保存失败：' + error.message)
  }
}

function handleClearToken() {
  if (!confirm('确定要清除已保存的 Token 吗？')) {
    return
  }

  try {
    localStorage.removeItem('github_access_token')
    currentToken.value = ''
    tokenInput.value = ''
    alert('Token 已清除')
  } catch (error) {
    alert('清除失败：' + error.message)
  }
}
</script>

<style scoped>
.token-config {
  max-width: 800px;
  --admin-text: #f1f5f9;
  --admin-text-strong: #ffffff;
  --admin-text-muted: #e2e8f0;
}

/* Light mode */
:root:not(.dark) .token-config {
  --admin-text: #1e293b;
  --admin-text-strong: #0f172a;
  --admin-text-muted: #475569;
}

.section-title {
  margin: 0 0 2rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--admin-text-strong);
}

.config-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 0.75rem;
  border: 1px solid rgba(100, 116, 139, 0.2);
}

:root:not(.dark) .config-section {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.section-subtitle {
  margin: 0 0 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-primary);
}

.section-description {
  margin: 0 0 1.5rem;
  font-size: 0.875rem;
  color: var(--admin-text-muted);
  line-height: 1.6;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--admin-text);
}

.token-input-group {
  display: flex;
  gap: 0.5rem;
}

.token-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 0.5rem;
  color: var(--admin-text);
  font-size: 0.9375rem;
  font-family: 'Courier New', monospace;
  transition: all 0.3s;
}

:root:not(.dark) .token-input {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.token-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.btn-toggle-visibility {
  padding: 0.75rem 1rem;
  background: rgba(100, 116, 139, 0.2);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 0.5rem;
  color: var(--admin-text);
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s;
}

.btn-toggle-visibility:hover {
  background: rgba(100, 116, 139, 0.3);
}

.field-hint {
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  color: var(--admin-text-muted);
  line-height: 1.5;
}

.field-hint code {
  padding: 0.125rem 0.375rem;
  background: rgba(100, 116, 139, 0.2);
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875em;
}

.help-link {
  color: var(--color-primary);
  text-decoration: none;
  transition: opacity 0.3s;
}

.help-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.token-status {
  margin: 1rem 0;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.status-saved {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.status-missing {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.status-icon {
  font-size: 1.125rem;
}

.verify-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  color: #60a5fa;
  font-size: 0.875rem;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-top-color: #60a5fa;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  color: #ffffff !important;
}

.btn-primary span {
  color: #ffffff !important;
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

.btn-secondary:hover:not(:disabled) {
  background: rgba(100, 116, 139, 0.3);
}

.btn-danger {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.btn-danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
}

.btn-primary:disabled,
.btn-secondary:disabled,
.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-item {
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

:root:not(.dark) .info-item {
  background: rgba(255, 255, 255, 0.5);
}

.info-label {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--admin-text-muted);
  font-size: 0.75rem;
}

.info-value {
  display: block;
  color: var(--admin-text);
  font-weight: 500;
  font-family: 'Courier New', monospace;
}
</style>
