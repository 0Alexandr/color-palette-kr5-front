<template>
  <div 
    class="color-card" 
    :style="{ backgroundColor: color.hex }"
    :class="{ locked: color.isLocked }"
  >
    <button class="lock-btn" @click="$emit('toggle-lock', color.id)">
      <span v-if="color.isLocked">🔒</span>
      <span v-else>🔓</span>
    </button>

    <div class="color-info">
      <h3 
        class="hex-code" 
        @click="copyToClipboard"
        :style="{ color: textColor }"
      >
        {{ color.hex }}
        <span class="copy-hint">📋</span>
      </h3>
      
      <p class="rgb-code" v-if="showRgb" :style="{ color: textColor }">
        {{ rgbString }}
      </p>

      <div class="wcag-badge" :style="{ color: textColor, borderColor: textColor }">
        {{ textColor === '#000000' ? 'Dark Text' : 'Light Text' }}
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { hexToRgb, getContrastColor } from '../utils/colorUtils'

export default {
  name: 'ColorCard',
  props: {
    color: {
      type: Object,
      required: true
    },
    showRgb: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle-lock', 'copy'], // Определяем события
  setup(props, { emit }) {
    const rgbString = computed(() => {
      const rgb = hexToRgb(props.color.hex)
      return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : ''
    })

    const textColor = computed(() => getContrastColor(props.color.hex))

    const copyToClipboard = () => {
      navigator.clipboard.writeText(props.color.hex)
      emit('copy', props.color.hex) // Уведомляем родителя
    }

    return { rgbString, textColor, copyToClipboard }
  }
}
</script>

<style scoped>
.color-card {
  height: 300px;
  border-radius: 12px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  transition: transform 0.2s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.color-card:hover { transform: translateY(-5px); }
.lock-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255,255,255,0.5);
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  cursor: pointer;
  font-size: 1.2rem;
}
.hex-code {
  cursor: pointer;
  font-family: monospace;
  font-size: 1.5rem;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.copy-hint { opacity: 0; transition: opacity 0.2s; font-size: 1rem; }
.hex-code:hover .copy-hint { opacity: 1; }
.rgb-code { font-size: 0.9rem; opacity: 0.8; }
.wcag-badge {
  font-size: 0.7rem;
  border: 1px solid;
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 10px;
  opacity: 0.7;
}
</style>