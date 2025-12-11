<template>
    <div class="generator-view">
        <div class="toolbar">
            <h1>🎨 Palette Gen</h1>

            <transition name="fade">
                <div v-if="notification" class="notification">{{ notification }}</div>
            </transition>

            <div class="controls">
                <select v-model="mode" class="control-input">
                    <option value="random">Случайная</option>
                    <option value="analogous">Аналогичная</option>
                    <option value="monochromatic">Монохромная</option>
                    <option value="triad">Триада</option>
                </select>

                <select v-model.number="count" class="control-input">
                    <option value="3">3 цвета</option>
                    <option value="5">5 цветов</option>
                    <option value="7">7 цветов</option>
                </select>

                <button @click="generatePalette" class="btn btn-primary">🔄 Генерировать</button>
                <button @click="savePalette" class="btn btn-secondary">💾 Сохранить</button>
            </div>
        </div>

        <div class="palette-grid">
            <ColorCard v-for="color in colors" :key="color.id" :color="color" :show-rgb="showRgbMode"
                @toggle-lock="toggleLock" @copy="showNotification" />
        </div>

        <div class="bottom-panel">
            <div class="toggles">
                <label><input type="checkbox" v-model="showRgbMode"> Показать RGB</label>
            </div>

            <PalettePreview v-if="colors.length" :colors="colors" />

            <button @click="showExportModal = true" class="btn btn-secondary">📤 Экспорт</button>

            <ExportModal v-if="showExportModal" :colors="colors" @close="showExportModal = false" />
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import ColorCard from '../components/ColorCard.vue'
import PalettePreview from '../components/PalettePreview.vue'
import { generateHex, generateHarmony } from '../utils/colorUtils'
import ExportModal from '../components/ExportModal.vue'

export default {
    components: { ColorCard, PalettePreview, ExportModal },
    setup() {
        // Состояние
        const colors = ref([])
        const count = ref(5)
        const mode = ref('random')
        const showRgbMode = ref(false)
        const notification = ref('')
        const showExportModal = ref(false)

        // Инициализация
        const generatePalette = () => {
            // Собираем незаблокированные индексы
            const newColors = []

            // Если режим гармонии (Практика 28)
            if (mode.value !== 'random') {
                const baseColor = colors.value.find(c => c.isLocked)?.hex || generateHex()
                const harmonyColors = generateHarmony(baseColor, mode.value, count.value)

                // Пересоздаем массив, сохраняя заблокированные если возможно, 
                // но для гармонии логичнее пересчитать всё от базы
                colors.value = harmonyColors.map((hex, index) => ({
                    id: index,
                    hex: hex,
                    isLocked: index === 0 // Блокируем базу для наглядности
                }))
                return
            }

            // Режим Random (Практика 27)
            // Создаем массив нужной длины
            while (colors.value.length < count.value) {
                colors.value.push({ id: Date.now() + Math.random(), hex: generateHex(), isLocked: false })
            }
            // Обрезаем если уменьшили
            if (colors.value.length > count.value) {
                colors.value = colors.value.slice(0, count.value)
            }

            // Обновляем незаблокированные
            colors.value.forEach(color => {
                if (!color.isLocked) {
                    color.hex = generateHex()
                }
            })
        }

        const toggleLock = (id) => {
            const color = colors.value.find(c => c.id === id)
            if (color) color.isLocked = !color.isLocked
        }

        const showNotification = (hex) => {
            notification.value = `Скопировано: ${hex}`
            setTimeout(() => notification.value = '', 2000)
        }

        // Сохранение в библиотеку (LocalStorage)
        const savePalette = () => {
            const saved = JSON.parse(localStorage.getItem('myPalettes') || '[]')
            const newPalette = {
                id: Date.now(),
                name: `Палитра ${new Date().toLocaleTimeString()}`,
                colors: colors.value.map(c => c.hex),
                date: new Date().toISOString()
            }
            saved.unshift(newPalette)
            localStorage.setItem('myPalettes', JSON.stringify(saved))
            showNotification('Палитра сохранена в библиотеку!')
        }

        // Экспорт CSS (Практика 28)
        const cssOutput = computed(() => {
            return `:root {\n` +
                colors.value.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n') +
                `\n}`
        })

        // 1. РЕАКТИВНОЕ ИЗМЕНЕНИЕ: Наблюдаем за count. Если он меняется, 
        // немедленно обновляем палитру до нового размера.
        watch(count, () => {
             generatePalette();
        });

        // Хуки и вотчеры
        // 2. СОХРАНЕНИЕ В LOCALSTORAGE: Наблюдаем за colors.
        watch(colors, (newVal) => {
            localStorage.setItem('currentWorkspace', JSON.stringify(newVal))
        }, { deep: true })

        onMounted(() => {
            const cached = localStorage.getItem('currentWorkspace')
            if (cached) {
                colors.value = JSON.parse(cached)
                // Устанавливаем count на основе загруженного массива
                count.value = colors.value.length;
            } else {
                generatePalette()
            }
        })

        return {
            colors, count, mode, showRgbMode, notification, cssOutput,
            generatePalette, toggleLock, showNotification, savePalette, showExportModal
        }
    }
}
</script>

<style scoped>
.generator-view {
    padding: 20px;
}

.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 15px;
}

.palette-grid {
    display: grid;
    gap: 15px;
    margin-bottom: 30px;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.notification {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    z-index: 100;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.controls {
    display: flex;
    gap: 10px;
}

.control-input {
    padding: 8px;
    border-radius: 5px;
    border: 1px solid #ccc;
}

.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    color: white;
}

.btn-primary {
    background: #667eea;
}

.btn-secondary {
    background: #2c3e50;
}

.bottom-panel {
    max-width: 800px;
    margin: 0 auto;
}

.export-block textarea {
    width: 100%;
    margin-top: 10px;
    padding: 10px;
    border-radius: 5px;
}
</style>