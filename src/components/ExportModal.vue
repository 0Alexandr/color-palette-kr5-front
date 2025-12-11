<template>
  <div class="modal-backdrop" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Экспорт палитры</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body">
        <div class="tabs">
          <button v-for="format in formats" :key="format.id" :class="{ active: currentFormat === format.id }"
            @click="currentFormat = format.id">
            {{ format.label }}
          </button>
        </div>

        <div class="code-preview">
          <textarea readonly :value="generatedCode" ref="codeArea"></textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">Закрыть</button>
        <button class="btn btn-primary" @click="copyCode">
          {{ copied ? 'Скопировано!' : 'Копировать код' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ExportModal',
  props: {
    colors: {
      type: Array,
      required: true
    }
  },
  emits: ['close'],
  setup(props) {
    const currentFormat = ref('css')
    const copied = ref(false)

    const formats = [
      { id: 'css', label: 'CSS Variables' },
      { id: 'scss', label: 'SCSS' },
      { id: 'json', label: 'JSON' },
      { id: 'tailwind', label: 'Tailwind' }
    ]

    const generatedCode = computed(() => {
      const hexValues = props.colors.map(c => c.hex)

      switch (currentFormat.value) {
        case 'css':
          return `:root {\n${hexValues.map((hex, i) => `  --color-${i + 1}: ${hex};`).join('\n')}\n}`

        case 'scss':
          return hexValues.map((hex, i) => `$color-${i + 1}: ${hex};`).join('\n')

        case 'json':
          return JSON.stringify(hexValues, null, 2)

        case 'tailwind':
          return `module.exports = {\n  theme: {\n    colors: {\n${hexValues.map((hex, i) => `      'primary-${i + 1}': '${hex}',`).join('\n')}\n    }\n  }\n}`

        default:
          return ''
      }
    })

    const copyCode = () => {
      navigator.clipboard.writeText(generatedCode.value)
      copied.value = true
      setTimeout(() => copied.value = false, 2000)
    }

    return {
      currentFormat,
      formats,
      generatedCode,
      copyCode,
      copied
    }
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 600px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 20px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.tabs button {
  background: none;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 6px;
  font-weight: 600;
  color: #666;
}

.tabs button.active {
  background: #eef2ff;
  color: var(--primary-color);
}

.code-preview textarea {
  width: 100%;
  height: 200px;
  background: #282c34;
  color: #abb2bf;
  padding: 15px;
  border-radius: 8px;
  font-family: monospace;
  resize: none;
}

.modal-footer {
  padding: 15px 20px;
  background: #f9f9f9;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>