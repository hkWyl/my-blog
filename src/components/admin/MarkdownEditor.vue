<template>
  <div class="markdown-editor">
    <div class="editor-toolbar">
      <button
        v-for="tool in tools"
        :key="tool.name"
        type="button"
        class="tool-btn"
        :title="tool.label"
        @click="insertMarkdown(tool.markdown)"
      >
        {{ tool.icon }}
      </button>

      <div class="toolbar-divider"></div>

      <button
        type="button"
        class="tool-btn"
        :class="{ active: showPreview }"
        title="切换预览"
        @click="showPreview = !showPreview"
      >
        👁️
      </button>
    </div>

    <div class="editor-container" :class="{ split: showPreview }">
      <div class="editor-pane">
        <textarea
          ref="textareaRef"
          v-model="localContent"
          class="editor-textarea"
          placeholder="在这里输入 Markdown 内容..."
          @input="handleInput"
          @scroll="handleEditorScroll"
        ></textarea>
      </div>

      <div v-if="showPreview" ref="previewRef" class="preview-pane" @scroll="handlePreviewScroll">
        <div class="preview-content markdown-body" v-html="renderedContent"></div>
      </div>
    </div>

    <div class="editor-footer">
      <span class="word-count">字数: {{ wordCount }}</span>
      <span class="char-count">字符: {{ charCount }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { renderMarkdown } from '@/utils/markdown'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const localContent = ref(props.modelValue)
const textareaRef = ref(null)
const previewRef = ref(null)
const showPreview = ref(true)

// 滚动同步标志
let isSyncingScroll = false

// 编辑器工具栏按钮
const tools = [
  { name: 'h1', icon: 'H1', label: '标题 1', markdown: '# ' },
  { name: 'h2', icon: 'H2', label: '标题 2', markdown: '## ' },
  { name: 'h3', icon: 'H3', label: '标题 3', markdown: '### ' },
  { name: 'bold', icon: 'B', label: '粗体', markdown: '****' },
  { name: 'italic', icon: 'I', label: '斜体', markdown: '__' },
  { name: 'link', icon: '🔗', label: '链接', markdown: '[链接文字](https://url)' },
  { name: 'image', icon: '🖼️', label: '图片', markdown: '![图片描述](https://image-url)' },
  { name: 'code', icon: '<>', label: '代码', markdown: '```\n\n```' },
  { name: 'list', icon: '•', label: '列表', markdown: '- ' },
  { name: 'quote', icon: '❝', label: '引用', markdown: '> ' },
]

// 渲染 Markdown
const renderedContent = computed(() => {
  return renderMarkdown(localContent.value)
})

// 统计字数和字符数
const wordCount = computed(() => {
  const text = localContent.value.trim()
  if (!text) return 0
  // 简单的字数统计（按空格分割）
  return text.split(/\s+/).length
})

const charCount = computed(() => {
  return localContent.value.length
})

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== localContent.value) {
      localContent.value = newValue
    }
  }
)

function handleInput() {
  emit('update:modelValue', localContent.value)
}

function insertMarkdown(markdown) {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = localContent.value

  // 插入 Markdown 语法
  const before = text.substring(0, start)
  const after = text.substring(end)

  // 如果选中了文本，将其包裹在 Markdown 语法中
  const selected = text.substring(start, end)

  let newText
  let cursorPos

  if (markdown.includes('**') || markdown.includes('__')) {
    // 粗体或斜体
    const markLength = markdown.length / 2
    newText = before + markdown.substring(0, markLength) + selected + markdown.substring(markLength) + after
    cursorPos = selected ? end + markdown.length : start + markLength
  } else if (markdown.includes('[') || markdown.includes('![')) {
    // 链接或图片
    newText = before + markdown + after
    cursorPos = start + (markdown.includes('![') ? 2 : 1) // 光标移到 [ 后面
  } else {
    // 其他
    newText = before + markdown + selected + after
    cursorPos = start + markdown.length
  }

  localContent.value = newText
  emit('update:modelValue', newText)

  // 恢复光标位置
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(cursorPos, cursorPos)
  }, 0)
}

// 编辑器滚动处理
function handleEditorScroll() {
  if (isSyncingScroll || !textareaRef.value || !previewRef.value) return

  console.log('编辑器滚动事件触发')
  isSyncingScroll = true
  const editor = textareaRef.value
  const preview = previewRef.value

  // 计算编辑器滚动百分比
  const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight)
  console.log('编辑器滚动百分比:', scrollPercentage)

  // 同步预览区域滚动
  preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight)

  setTimeout(() => {
    isSyncingScroll = false
  }, 10)
}

// 预览区域滚动处理
function handlePreviewScroll() {
  if (isSyncingScroll || !textareaRef.value || !previewRef.value) return

  console.log('预览面板滚动事件触发')
  isSyncingScroll = true
  const editor = textareaRef.value
  const preview = previewRef.value

  // 计算预览区域滚动百分比
  const scrollPercentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight)
  console.log('预览滚动百分比:', scrollPercentage)

  // 同步编辑器滚动
  editor.scrollTop = scrollPercentage * (editor.scrollHeight - editor.clientHeight)

  setTimeout(() => {
    isSyncingScroll = false
  }, 10)
}
</script>

<style scoped>
.markdown-editor {
  border: 1px solid rgba(66, 185, 131, 0.3);
  border-radius: 0.75rem;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.7);
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: calc(100vh - 300px);
  min-height: 500px;
  --admin-text: #f1f5f9;
  --admin-text-strong: #ffffff;
}

/* Light mode */
:root:not(.dark) .markdown-editor {
  --admin-text: #1e293b;
  --admin-text-strong: #0f172a;
}

:root:not(.dark) .markdown-editor {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.editor-toolbar {
  display: flex;
  gap: 0.25rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.9);
  border-bottom: 1px solid rgba(66, 185, 131, 0.3);
  flex-shrink: 0;
}

:root:not(.dark) .editor-toolbar {
  background: rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.tool-btn {
  padding: 0.375rem 0.75rem;
  background: rgba(100, 116, 139, 0.2);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 0.375rem;
  color: #e2e8f0;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

/* Light mode */
:root:not(.dark) .tool-btn {
  color: #1e293b;
  background: rgba(100, 116, 139, 0.15);
  border-color: rgba(100, 116, 139, 0.4);
}

.tool-btn:hover {
  background: rgba(66, 185, 131, 0.2);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.tool-btn.active {
  background: rgba(66, 185, 131, 0.3);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.toolbar-divider {
  width: 1px;
  background: rgba(100, 116, 139, 0.3);
  margin: 0 0.5rem;
}

.editor-container {
  display: grid;
  grid-template-columns: 1fr;
  flex: 1;
  overflow: hidden;
}

.editor-container.split {
  grid-template-columns: 1fr 1fr;
}

.editor-pane,
.preview-pane {
  overflow-y: auto;
  height: 100%;
}

.editor-pane {
  border-right: 1px solid rgba(100, 116, 139, 0.3);
}

.editor-textarea {
  width: 100%;
  height: 100%;
  padding: 1.5rem;
  background: transparent;
  border: none;
  color: var(--admin-text-strong);
  font-size: 0.9375rem;
  font-family: 'Courier New', Monaco, monospace;
  line-height: 1.6;
  resize: none;
  outline: none;
}

.editor-textarea::placeholder {
  color: rgba(226, 232, 240, 0.5);
}

.preview-pane {
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.3);
  color: var(--admin-text-strong);
}

:root:not(.dark) .preview-pane {
  background: rgba(255, 255, 255, 0.3);
  color: var(--admin-text-strong);
}

.preview-content {
  min-height: 100%;
  color: inherit;
}

/* 确保预览内容的所有文字都继承正确的颜色 */
.preview-content :deep(*) {
  color: inherit;
}

.preview-content :deep(h1),
.preview-content :deep(h2),
.preview-content :deep(h3),
.preview-content :deep(h4),
.preview-content :deep(h5),
.preview-content :deep(h6) {
  color: var(--admin-text-strong);
}

.preview-content :deep(p),
.preview-content :deep(li),
.preview-content :deep(td),
.preview-content :deep(span) {
  color: var(--admin-text);
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1.5rem;
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.9);
  border-top: 1px solid rgba(66, 185, 131, 0.3);
  font-size: 0.75rem;
  color: var(--admin-text-strong);
  flex-shrink: 0;
}

:root:not(.dark) .editor-footer {
  background: rgba(255, 255, 255, 0.5);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

@media (max-width: 1024px) {
  .editor-container.split {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }

  .editor-pane {
    border-right: none;
    border-bottom: 1px solid rgba(100, 116, 139, 0.3);
  }

  .markdown-editor {
    height: calc(100vh - 200px);
    min-height: 500px;
  }
}
</style>
