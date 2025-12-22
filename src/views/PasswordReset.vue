<template>
  <div class="password-reset">
    <div class="reset-card">
      <div class="reset-header">
        <h1 class="title">找回密码</h1>
        <p class="subtitle">请回答安全问题验证身份</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>加载安全问题中...</p>
      </div>

      <!-- 无安全问题 -->
      <div v-else-if="!hasQuestions" class="info-message">
        <p>⚠️ 未设置安全问题，无法找回密码</p>
        <p class="hint">请联系管理员重置密码</p>
        <router-link to="/admin" class="back-link">返回登录</router-link>
      </div>

      <!-- 安全问题验证 -->
      <form v-else-if="!verified" @submit.prevent="handleVerify" class="verify-form">
        <p class="instruction">请回答以下所有安全问题：</p>

        <div v-for="(question, index) in questions" :key="index" class="form-group">
          <label :for="`answer-${index}`">
            问题 {{ index + 1 }}：{{ question.question }}
          </label>
          <input
            :id="`answer-${index}`"
            v-model="answers[index]"
            type="text"
            placeholder="请输入答案"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="submit-btn" :disabled="verifying">
          <span v-if="verifying">验证中...</span>
          <span v-else">验证答案</span>
        </button>

        <router-link to="/admin" class="back-link">返回登录</router-link>
      </form>

      <!-- 设置新密码 -->
      <form v-else @submit.prevent="handleResetPassword" class="reset-form">
        <div class="success-message">
          ✅ 验证成功！请设置新密码
        </div>

        <div class="form-group">
          <label for="new-password">新密码 *</label>
          <input
            id="new-password"
            v-model="newPassword"
            type="password"
            placeholder="请输入新密码（至少6位）"
            required
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label for="confirm-password">确认新密码 *</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            required
          />
        </div>

        <div v-if="resetError" class="error-message">
          {{ resetError }}
        </div>

        <div v-if="resetSuccess" class="success-message">
          ✅ 密码重置成功！正在跳转登录页...
        </div>

        <button type="submit" class="submit-btn" :disabled="resetting || resetSuccess">
          <span v-if="resetting">重置中...</span>
          <span v-else>重置密码</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import adminConfig from '@/config/admin.config.js'
import { loadAdminConfig, updateAdminConfig } from '@/api/githubAdmin'

const router = useRouter()

const loading = ref(true)
const hasQuestions = ref(false)
const questions = ref([])
const answers = ref([])

const verifying = ref(false)
const verified = ref(false)
const error = ref('')

const newPassword = ref('')
const confirmPassword = ref('')
const resetting = ref(false)
const resetError = ref('')
const resetSuccess = ref(false)

onMounted(async () => {
  loading.value = true

  try {
    // 尝试加载远程配置
    const remoteConfig = await loadAdminConfig()

    if (remoteConfig && remoteConfig.auth.securityQuestions) {
      // 合并远程配置到本地
      adminConfig.auth.securityQuestions = remoteConfig.auth.securityQuestions
      adminConfig.auth.passwordHash = remoteConfig.auth.passwordHash
    }

    questions.value = adminConfig.auth.securityQuestions || []
    hasQuestions.value = questions.value.length > 0

    if (hasQuestions.value) {
      answers.value = new Array(questions.value.length).fill('')
    }
  } catch (err) {
    console.error('加载配置失败:', err)
    hasQuestions.value = false
  } finally {
    loading.value = false
  }
})

// SHA-256 哈希函数
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// 验证答案
async function handleVerify() {
  error.value = ''
  verifying.value = true

  try {
    // 检查是否所有答案都已填写
    if (answers.value.some((a) => !a.trim())) {
      error.value = '请回答所有问题'
      verifying.value = false
      return
    }

    // 验证每个答案
    let allCorrect = true
    for (let i = 0; i < questions.value.length; i++) {
      const answerHash = await sha256(answers.value[i].trim())
      if (answerHash !== questions.value[i].answerHash) {
        allCorrect = false
        break
      }
    }

    if (allCorrect) {
      verified.value = true
      error.value = ''
    } else {
      error.value = '答案错误，请重试'
      answers.value = new Array(questions.value.length).fill('')
    }
  } catch (err) {
    error.value = '验证失败：' + err.message
  } finally {
    verifying.value = false
  }
}

// 重置密码
async function handleResetPassword() {
  resetError.value = ''
  resetSuccess.value = false

  // 验证
  if (newPassword.value.length < 6) {
    resetError.value = '密码至少需要6位'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    resetError.value = '两次输入的密码不一致'
    return
  }

  resetting.value = true

  try {
    // 生成新密码的哈希值
    const newPasswordHash = await sha256(newPassword.value)

    // 更新配置
    const newConfig = {
      ...adminConfig,
      auth: {
        ...adminConfig.auth,
        passwordHash: newPasswordHash,
      },
    }

    await updateAdminConfig(newConfig)

    resetSuccess.value = true

    // 2秒后跳转到登录页
    setTimeout(() => {
      router.push('/admin')
    }, 2000)
  } catch (err) {
    resetError.value = '重置失败：' + err.message
  } finally {
    resetting.value = false
  }
}
</script>

<style scoped>
.password-reset {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.reset-card {
  width: 100%;
  max-width: 520px;
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 1rem;
  padding: 3rem 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

:root:not(.dark) .reset-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.reset-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.title {
  margin: 0 0 0.5rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
}

:root:not(.dark) .title {
  color: #0f172a;
}

.subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: #cbd5e1;
  font-weight: 500;
}

:root:not(.dark) .subtitle {
  color: #475569;
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #e2e8f0;
}

:root:not(.dark) .loading-state {
  color: #475569;
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

.verify-form,
.reset-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.instruction {
  margin: 0;
  padding: 1rem;
  background: rgba(66, 185, 131, 0.1);
  border: 1px solid rgba(66, 185, 131, 0.3);
  border-radius: 0.5rem;
  color: #ffffff;
  font-size: 0.875rem;
  text-align: center;
}

:root:not(.dark) .instruction {
  color: #0f172a;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #ffffff;
}

:root:not(.dark) .form-group label {
  color: #0f172a;
}

.form-group input {
  padding: 0.875rem 1rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 0.5rem;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s;
}

:root:not(.dark) .form-group input {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.2);
  color: #0f172a;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.error-message,
.success-message,
.info-message {
  padding: 1rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  text-align: center;
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

.info-message {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #60a5fa;
  padding: 2rem;
}

.info-message p {
  margin: 0 0 0.5rem;
}

.hint {
  font-size: 0.8125rem;
  margin-bottom: 1rem;
}

.submit-btn {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #42b983 0%, #35a372 100%);
  border: none;
  border-radius: 0.5rem;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

:root:not(.dark) .submit-btn {
  border: 2px solid #2d7a5e;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(66, 185, 131, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.back-link {
  display: block;
  text-align: center;
  color: var(--color-primary);
  font-size: 0.875rem;
  text-decoration: none;
  transition: opacity 0.3s;
}

.back-link:hover {
  opacity: 0.8;
}
</style>
