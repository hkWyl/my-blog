<template>
  <div class="tag-input">
    <label v-if="label" class="tag-label">{{ label }}</label>

    <div class="tags-display">
      <span v-for="(tag, index) in modelValue" :key="index" class="tag-item">
        {{ tag }}
        <button type="button" @click="removeTag(index)" class="tag-remove">×</button>
      </span>

      <input
        ref="inputRef"
        v-model="currentInput"
        type="text"
        class="tag-input-field"
        :placeholder="modelValue.length === 0 ? placeholder : ''"
        @keydown.enter.prevent="addTag"
        @keydown.comma.prevent="addTag"
        @keydown.backspace="handleBackspace"
        @input="handleInput"
      />
    </div>

    <div v-if="showSuggestions && filteredSuggestions.length > 0" class="suggestions">
      <button
        v-for="suggestion in filteredSuggestions"
        :key="suggestion"
        type="button"
        class="suggestion-item"
        @click="addTagFromSuggestion(suggestion)"
      >
        {{ suggestion }}
      </button>
    </div>

    <p v-if="hint" class="hint">{{ hint }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import adminConfig from '@/config/admin.config.js'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '输入标签后按回车或逗号',
  },
  hint: {
    type: String,
    default: '按 Enter 或逗号添加标签，点击标签删除',
  },
  suggestions: {
    type: Array,
    default: () => adminConfig.commonTags,
  },
})

const emit = defineEmits(['update:modelValue'])

const currentInput = ref('')
const showSuggestions = ref(false)
const inputRef = ref(null)

// 过滤建议标签（未添加的 + 匹配当前输入的）
const filteredSuggestions = computed(() => {
  if (!currentInput.value.trim()) {
    // 没有输入时，显示所有未添加的常用标签
    return props.suggestions.filter((tag) => !props.modelValue.includes(tag)).slice(0, 8)
  }

  // 有输入时，显示匹配的标签
  const input = currentInput.value.toLowerCase().trim()
  return props.suggestions
    .filter((tag) => !props.modelValue.includes(tag) && tag.toLowerCase().includes(input))
    .slice(0, 8)
})

function addTag() {
  const tag = currentInput.value.trim()

  if (tag && !props.modelValue.includes(tag)) {
    emit('update:modelValue', [...props.modelValue, tag])
    currentInput.value = ''
  }
}

function addTagFromSuggestion(tag) {
  if (!props.modelValue.includes(tag)) {
    emit('update:modelValue', [...props.modelValue, tag])
  }
  currentInput.value = ''
  showSuggestions.value = false
  inputRef.value?.focus()
}

function removeTag(index) {
  const newTags = [...props.modelValue]
  newTags.splice(index, 1)
  emit('update:modelValue', newTags)
}

function handleBackspace() {
  if (currentInput.value === '' && props.modelValue.length > 0) {
    // 如果输入框为空，删除最后一个标签
    removeTag(props.modelValue.length - 1)
  }
}

function handleInput() {
  showSuggestions.value = true
}
</script>

<style scoped>
.tag-input {
  position: relative;
}

.tag-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--admin-text);
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 0.5rem;
  min-height: 44px;
  transition: all 0.3s;
}

:root:not(.dark) .tags-display {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.tags-display:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  background: rgba(66, 185, 131, 0.15);
  border: 1px solid rgba(66, 185, 131, 0.3);
  border-radius: 0.375rem;
  color: var(--color-primary);
  font-size: 0.875rem;
  font-weight: 500;
}

.tag-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: none;
  border: none;
  border-radius: 50%;
  color: var(--color-primary);
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;
}

.tag-remove:hover {
  background: rgba(66, 185, 131, 0.2);
  transform: scale(1.1);
}

.tag-input-field {
  flex: 1;
  min-width: 120px;
  background: none;
  border: none;
  color: var(--admin-text);
  font-size: 0.9375rem;
  outline: none;
}

.tag-input-field::placeholder {
  color: var(--admin-text-muted);
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 0.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

:root:not(.dark) .suggestions {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.suggestion-item {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: none;
  border: none;
  border-radius: 0.375rem;
  color: var(--admin-text);
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-item:hover {
  background: rgba(66, 185, 131, 0.15);
  color: var(--color-primary);
}

.hint {
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  color: var(--admin-text-muted);
}
</style>
