<template>
  <div class="password-settings">
    <h2 class="section-title">密码与安全</h2>

    <!-- 修改密码区域 -->
    <div class="settings-section">
      <h3 class="subsection-title">修改密码</h3>
      <form @submit.prevent="handleChangePassword" class="password-form">
        <div class="form-group">
          <label for="current-password">当前密码 *</label>
          <input
            id="current-password"
            v-model="passwordForm.currentPassword"
            type="password"
            placeholder="请输入当前密码"
            required
          />
        </div>

        <div class="form-group">
          <label for="new-password">新密码 *</label>
          <input
            id="new-password"
            v-model="passwordForm.newPassword"
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
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            required
          />
        </div>

        <div v-if="passwordError" class="error-message">
          {{ passwordError }}
        </div>

        <div v-if="passwordSuccess" class="success-message">
          ✅ 密码修改成功！请重新登录
        </div>

        <button type="submit" class="btn-primary" :disabled="savingPassword">
          <span v-if="savingPassword">保存中...</span>
          <span v-else>修改密码</span>
        </button>
      </form>
    </div>

    <!-- 安全问题区域 -->
    <div class="settings-section">
      <div class="subsection-header">
        <h3 class="subsection-title">安全问题设置</h3>
        <p class="hint">用于忘记密码时验证身份（最多3个问题）</p>
      </div>

      <!-- 已有的安全问题列表 -->
      <div v-if="securityQuestions.length > 0" class="questions-list">
        <div
          v-for="(item, index) in securityQuestions"
          :key="index"
          class="question-item"
        >
          <div class="question-content">
            <span class="question-number">问题 {{ index + 1 }}</span>
            <span class="question-text">{{ item.question }}</span>
          </div>
          <button
            @click="handleDeleteQuestion(index)"
            class="btn-delete-question"
            type="button"
          >
            删除
          </button>
        </div>
      </div>

      <!-- 添加新问题 -->
      <div v-if="securityQuestions.length < 3" class="add-question-form">
        <h4 class="form-title">添加新问题</h4>
        <form @submit.prevent="handleAddQuestion">
          <div class="form-group">
            <label for="new-question">问题 *</label>
            <input
              id="new-question"
              v-model="newQuestion.question"
              type="text"
              placeholder="例如：你的小学名称是？"
              required
            />
          </div>

          <div class="form-group">
            <label for="new-answer">答案 *</label>
            <input
              id="new-answer"
              v-model="newQuestion.answer"
              type="text"
              placeholder="请输入答案"
              required
            />
            <p class="field-hint">答案将被加密存储，请牢记</p>
          </div>

          <div v-if="questionError" class="error-message">
            {{ questionError }}
          </div>

          <button type="submit" class="btn-secondary" :disabled="savingQuestion">
            <span v-if="savingQuestion">添加中...</span>
            <span v-else>添加问题</span>
          </button>
        </form>
      </div>

      <div v-else class="info-message">
        ⚠️ 已达到最大问题数量（3个）
      </div>

      <div v-if="questionSuccess" class="success-message">
        ✅ 安全问题已更新
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import adminConfig from '@/config/admin.config.js'
import { updateAdminConfig } from '@/api/githubAdmin'

const router = useRouter()

// 密码表单
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const savingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref(false)

// 安全问题
const securityQuestions = ref([])
const newQuestion = ref({
  question: '',
  answer: '',
})

const savingQuestion = ref(false)
const questionError = ref('')
const questionSuccess = ref(false)

onMounted(() => {
  // 加载现有的安全问题
  securityQuestions.value = [...(adminConfig.auth.securityQuestions || [])]
})

// SHA-256 哈希函数
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// 修改密码
async function handleChangePassword() {
  passwordError.value = ''
  passwordSuccess.value = false

  // 验证
  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = '新密码至少需要6位'
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = '两次输入的新密码不一致'
    return
  }

  // 验证当前密码
  const currentPasswordHash = await sha256(passwordForm.value.currentPassword)
  if (currentPasswordHash !== adminConfig.auth.passwordHash) {
    passwordError.value = '当前密码错误'
    return
  }

  savingPassword.value = true

  try {
    // 生成新密码的哈希值
    const newPasswordHash = await sha256(passwordForm.value.newPassword)

    // 更新配置
    const newConfig = {
      ...adminConfig,
      auth: {
        ...adminConfig.auth,
        passwordHash: newPasswordHash,
      },
    }

    await updateAdminConfig(newConfig)

    passwordSuccess.value = true
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }

    // 2秒后退出登录
    setTimeout(() => {
      localStorage.removeItem('admin_session')
      router.push('/admin')
    }, 2000)
  } catch (err) {
    passwordError.value = '修改失败：' + err.message
  } finally {
    savingPassword.value = false
  }
}

// 添加安全问题
async function handleAddQuestion() {
  questionError.value = ''
  questionSuccess.value = false

  if (!newQuestion.value.question.trim() || !newQuestion.value.answer.trim()) {
    questionError.value = '问题和答案不能为空'
    return
  }

  if (securityQuestions.value.length >= 3) {
    questionError.value = '最多只能添加3个安全问题'
    return
  }

  savingQuestion.value = true

  try {
    // 生成答案的哈希值
    const answerHash = await sha256(newQuestion.value.answer.trim())

    // 添加到列表
    const newQuestions = [
      ...securityQuestions.value,
      {
        question: newQuestion.value.question.trim(),
        answerHash: answerHash,
      },
    ]

    // 更新配置
    const newConfig = {
      ...adminConfig,
      auth: {
        ...adminConfig.auth,
        securityQuestions: newQuestions,
      },
    }

    await updateAdminConfig(newConfig)

    // 更新本地状态
    securityQuestions.value = newQuestions
    adminConfig.auth.securityQuestions = newQuestions

    questionSuccess.value = true
    newQuestion.value = {
      question: '',
      answer: '',
    }

    setTimeout(() => {
      questionSuccess.value = false
    }, 3000)
  } catch (err) {
    questionError.value = '添加失败：' + err.message
  } finally {
    savingQuestion.value = false
  }
}

// 删除安全问题
async function handleDeleteQuestion(index) {
  if (!confirm('确定要删除这个安全问题吗？')) {
    return
  }

  try {
    const newQuestions = securityQuestions.value.filter((_, i) => i !== index)

    // 更新配置
    const newConfig = {
      ...adminConfig,
      auth: {
        ...adminConfig.auth,
        securityQuestions: newQuestions,
      },
    }

    await updateAdminConfig(newConfig)

    // 更新本地状态
    securityQuestions.value = newQuestions
    adminConfig.auth.securityQuestions = newQuestions

    questionSuccess.value = true
    setTimeout(() => {
      questionSuccess.value = false
    }, 3000)
  } catch (err) {
    questionError.value = '删除失败：' + err.message
  }
}
</script>

<style scoped>
.password-settings {
  max-width: 800px;
  --admin-text: #f1f5f9;
  --admin-text-strong: #ffffff;
  --admin-text-muted: #e2e8f0;
}

/* Light mode */
:root:not(.dark) .password-settings {
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

.settings-section {
  margin-bottom: 3rem;
  padding: 2rem;
  background: rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(100, 116, 139, 0.2);
  border-radius: 0.75rem;
}

:root:not(.dark) .settings-section {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.subsection-header {
  margin-bottom: 1.5rem;
}

.subsection-title {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--admin-text-strong);
}

.hint {
  margin: 0;
  font-size: 0.875rem;
  color: var(--admin-text-muted);
}

.password-form,
.add-question-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-title {
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--admin-text-strong);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--admin-text);
}

.form-group input {
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 0.5rem;
  color: var(--admin-text);
  font-size: 0.9375rem;
  transition: all 0.3s;
}

:root:not(.dark) .form-group input {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.field-hint {
  margin: 0.375rem 0 0;
  font-size: 0.75rem;
  color: var(--admin-text-muted);
}

.questions-list {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.question-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: rgba(100, 116, 139, 0.1);
  border: 1px solid rgba(100, 116, 139, 0.2);
  border-radius: 0.5rem;
}

:root:not(.dark) .question-item {
  background: rgba(100, 116, 139, 0.05);
}

.question-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.question-number {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
}

.question-text {
  font-size: 0.9375rem;
  color: var(--admin-text-strong);
}

.btn-delete-question {
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.375rem;
  color: #f87171;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-delete-question:hover {
  background: rgba(239, 68, 68, 0.2);
}

.error-message,
.success-message,
.info-message {
  padding: 1rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
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
  align-self: flex-start;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  color: #ffffff;
}

:root:not(.dark) .btn-primary {
  color: #ffffff;
  background: linear-gradient(135deg, #42b983 0%, #35a372 100%);
  border: 2px solid #2d7a5e;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.3);
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

:root:not(.dark) .btn-secondary {
  background: rgba(100, 116, 139, 0.15);
  border: 2px solid rgba(100, 116, 139, 0.5);
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
