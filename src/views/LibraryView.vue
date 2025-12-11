<template>
  <div class="library-view">
    <h2>📚 Моя библиотека</h2>

    <div class="filters">
      <input v-model="searchQuery" placeholder="Поиск палитр..." class="search-input">
      <label class="fav-filter">
        <input type="checkbox" v-model="showOnlyFavorites"> ❤️ Только избранные
      </label>
    </div>

    <div v-if="filteredPalettes.length === 0" class="empty-state">
      <p>Палитры не найдены.</p>
    </div>

    <div class="palettes-list">
      <div v-for="palette in filteredPalettes" :key="palette.id" class="palette-item">
        <div class="palette-header">
          <h3>{{ palette.name }}</h3>
          <div class="header-actions">
            <button @click="toggleFavorite(palette.id)" class="icon-btn" :class="{ active: palette.isFavorite }">
              {{ palette.isFavorite ? '❤️' : '🤍' }}
            </button>
            <button @click="deletePalette(palette.id)" class="icon-btn delete">×</button>
          </div>
        </div>

        <div class="mini-palette">
          <div v-for="hex in palette.colors" :key="hex" class="mini-color" :style="{ backgroundColor: hex }"
            :title="hex"></div>
        </div>

        <div class="palette-actions">
          <button @click="loadToGenerator(palette)" class="action-btn">Загрузить</button>
          <button @click="copyCss(palette)" class="action-btn">CSS</button>
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
    const showOnlyFavorites = ref(false) // Фильтр избранного
    const router = useRouter()

    const saveToStorage = () => {
      localStorage.setItem('myPalettes', JSON.stringify(palettes.value))
    }

    onMounted(() => {
      palettes.value = JSON.parse(localStorage.getItem('myPalettes') || '[]')
      // Миграция старых данных (добавляем поле isFavorite если нет)
      palettes.value.forEach(p => {
        if (p.isFavorite === undefined) p.isFavorite = false;
      })
    })

    const filteredPalettes = computed(() => {
      let result = palettes.value;

      // Фильтр по избранному
      if (showOnlyFavorites.value) {
        result = result.filter(p => p.isFavorite);
      }

      // Поиск
      if (searchQuery.value) {
        result = result.filter(p => p.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
      }

      return result
    })

    const deletePalette = (id) => {
      if (!confirm('Удалить палитру?')) return;
      palettes.value = palettes.value.filter(p => p.id !== id)
      saveToStorage()
    }

    const toggleFavorite = (id) => {
      const palette = palettes.value.find(p => p.id === id);
      if (palette) {
        palette.isFavorite = !palette.isFavorite;
        saveToStorage();
      }
    }

    const loadToGenerator = (palette) => {
      const colorsForGen = palette.colors.map((hex, i) => ({
        id: i, hex: hex, isLocked: true
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
      searchQuery, filteredPalettes, showOnlyFavorites,
      deletePalette, loadToGenerator, copyCss, toggleFavorite
    }
  }
}
</script>

<style scoped>
.library-view {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.fav-filter {
  cursor: pointer;
  user-select: none;
}

.palettes-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.palette-item {
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.palette-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.header-actions {
  display: flex;
  gap: 5px;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.icon-btn:hover {
  opacity: 1;
}

.icon-btn.active {
  opacity: 1;
}

.icon-btn.delete {
  color: #ff6b6b;
  font-size: 1.5rem;
  line-height: 1;
}

.mini-palette {
  display: flex;
  height: 50px;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
}

.mini-color {
  flex: 1;
}

.palette-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 5px;
  cursor: pointer;
  background: #f0f0f0;
  border: none;
  border-radius: 3px;
}

.action-btn:hover {
  background: #e0e0e0;
}
</style>