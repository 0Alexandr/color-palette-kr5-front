<template>
  <div class="library-view">
    <h2>📚 Моя библиотека</h2>
    
    <div class="search-bar">
      <input v-model="searchQuery" placeholder="Поиск палитр..." class="search-input">
    </div>

    <div v-if="filteredPalettes.length === 0" class="empty-state">
      <p>Нет сохраненных палитр. Перейдите в генератор!</p>
    </div>

    <div class="palettes-list">
      <div v-for="palette in filteredPalettes" :key="palette.id" class="palette-item">
        <div class="palette-header">
          <h3>{{ palette.name }}</h3>
          <button @click="deletePalette(palette.id)" class="delete-btn">×</button>
        </div>
        
        <div class="mini-palette">
          <div 
            v-for="hex in palette.colors" 
            :key="hex" 
            class="mini-color" 
            :style="{ backgroundColor: hex }"
            :title="hex"
          ></div>
        </div>
        
        <div class="palette-actions">
          <button @click="loadToGenerator(palette)" class="action-btn">Загрузить</button>
          <button @click="copyCss(palette)" class="action-btn">Копировать CSS</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const palettes = ref([])
    const searchQuery = ref('')
    const router = useRouter()

    onMounted(() => {
      palettes.value = JSON.parse(localStorage.getItem('myPalettes') || '[]')
    })

    // Фильтрация (Практика 28 - Поиск)
    const filteredPalettes = computed(() => {
      if (!searchQuery.value) return palettes.value
      return palettes.value.filter(p => 
        p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })

    const deletePalette = (id) => {
      palettes.value = palettes.value.filter(p => p.id !== id)
      localStorage.setItem('myPalettes', JSON.stringify(palettes.value))
    }

    const loadToGenerator = (palette) => {
      // Преобразуем формат обратно для генератора
      const colorsForGen = palette.colors.map((hex, i) => ({
        id: i,
        hex: hex,
        isLocked: true
      }))
      localStorage.setItem('currentWorkspace', JSON.stringify(colorsForGen))
      router.push('/')
    }
    
    const copyCss = (palette) => {
      const css = `:root { ${palette.colors.map((c, i) => `--c-${i}: ${c}`).join('; ')} }`
      navigator.clipboard.writeText(css)
      alert('CSS скопирован!')
    }

    return {
      searchQuery, filteredPalettes, deletePalette, loadToGenerator, copyCss
    }
  }
}
</script>

<style scoped>
.library-view { padding: 20px; max-width: 1000px; margin: 0 auto; }
.search-input { width: 100%; padding: 10px; margin-bottom: 20px; font-size: 16px; border-radius: 5px; border: 1px solid #ccc; }
.palettes-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.palette-item { border: 1px solid #eee; padding: 15px; border-radius: 8px; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.palette-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.delete-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #ff6b6b; }
.mini-palette { display: flex; height: 50px; border-radius: 5px; overflow: hidden; margin-bottom: 10px; }
.mini-color { flex: 1; }
.palette-actions { display: flex; gap: 10px; }
.action-btn { flex: 1; padding: 5px; cursor: pointer; background: #f0f0f0; border: none; border-radius: 3px; }
.action-btn:hover { background: #e0e0e0; }
</style>