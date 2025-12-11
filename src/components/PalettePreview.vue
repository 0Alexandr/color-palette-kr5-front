<template>
  <div class="preview-container" :class="{ dark: isDarkMode }">
    <div class="mockup-header">
      <span class="dot"></span><span class="dot"></span>
    </div>
    <div class="mockup-body">
      <div class="mock-card" :style="{ borderColor: colors[0].hex }">
        <div class="mock-img" :style="{ backgroundColor: colors[1] ? colors[1].hex : '#ddd' }"></div>
        <h4 :style="{ color: colors[0].hex }">Заголовок</h4>
        <p :style="{ color: colors[2] ? colors[2].hex : '#666' }">Пример текста описания...</p>
        <button class="mock-btn" :style="{ backgroundColor: colors[0].hex, color: getContrast(colors[0].hex) }">
          Действие
        </button>
      </div>
    </div>
    <div class="preview-controls">
      <label>
        <input type="checkbox" v-model="isDarkMode"> Тёмный фон
      </label>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { getContrastColor } from '../utils/colorUtils'

export default {
  props: ['colors'],
  setup() {
    const isDarkMode = ref(false)
    return { isDarkMode, getContrast: getContrastColor }
  }
}
</script>

<style scoped>
.preview-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  background: #fff;
  transition: background 0.3s;
}

.preview-container.dark {
  background: #333;
  color: #f8f9fa;
}

.preview-container.dark input[type="checkbox"] {
    accent-color: #667eea;
}

.mockup-header {
  display: flex;
  gap: 5px;
  margin-bottom: 15px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ccc;
}

.mock-card {
  border: 2px solid;
  padding: 15px;
  border-radius: 8px;
  max-width: 300px;
  margin: 0 auto;
  background: white;
  /* Фон карточки всегда белый для контраста в примере */
}

.mock-img {
  height: 100px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.mock-btn {
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 10px;
  width: 100%;
}

.preview-controls {
  margin-top: 10px;
  text-align: right;
}
</style>