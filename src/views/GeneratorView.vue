<template>
    <div class="generator-view">
        <div class="toolbar">
            <h1>🎨 Palette Gen</h1>

            <transition name="fade">
                <div v-if="notification" class="notification">{{ notification }}</div>
            </transition>

            <div class="controls">
                <div class="input-group">
                    <label>База:</label>
                    <input type="color" v-model="baseColor" @input="updateBaseColor" class="color-input">
                </div>

                <select v-model="mode" class="control-input">
                    <option value="random">Случайная</option>
                    <option value="analogous">Аналогичная</option>
                    <option value="monochromatic">Монохромная</option>
                    <option value="triad">Триада</option>
                    <option value="complementary">Комплементарная</option>
                </select>

                <select v-model.number="count" class="control-input">
                    <option value="3">3 цвета</option>
                    <option value="5">5 цветов</option>
                    <option value="7">7 цветов</option>
                </select>

                <button @click="() => generatePalette(false)" class="btn btn-primary">🔄 Генерировать</button>
                <button @click="sharePalette" class="btn btn-secondary">🔗 Ссылка</button>
                <button @click="savePalette" class="btn btn-secondary">💾 Сохранить</button>
            </div>
        </div>

        <div class="palette-grid">
            <ColorCard v-for="color in colors" :key="color.id" :color="color" :show-rgb="showRgbMode"
                @toggle-lock="toggleLock" @copy="showNotification" />
        </div>

        <div class="bottom-panel">
            <div class="toggles">
                <label><input type="checkbox" v-model="showRgbMode"> Показать RGB / WCAG</label>
            </div>

            <ColorWheel v-if="colors.length" :colors="colors" />

            <PalettePreview v-if="colors.length" :colors="colors" />
            <button @click="showExportModal = true" class="btn btn-secondary">📤 Экспорт</button>
            <ExportModal v-if="showExportModal" :colors="colors" @close="showExportModal = false" />
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ColorCard from '../components/ColorCard.vue'
import PalettePreview from '../components/PalettePreview.vue'
import ExportModal from '../components/ExportModal.vue'
import ColorWheel from '../components/ColorWheel.vue'
import { generateHex, generateHarmony } from '../utils/colorUtils'

export default {
    components: { ColorCard, PalettePreview, ExportModal, ColorWheel },
    setup() {
        const route = useRoute()
        const router = useRouter()

        const colors = ref([])
        const count = ref(5)
        const mode = ref('random')
        const showRgbMode = ref(false)
        const notification = ref('')
        const showExportModal = ref(false)
        const baseColor = ref('#667eea')

        const updateBaseColor = () => {
            if (colors.value.length > 0 && !colors.value[0].isLocked) {
                colors.value[0].hex = baseColor.value
            }
        }

        /**
         * Генерирует палитру.
         * @param {boolean} maintainColors - Если true, сохраняет HEX-значения существующих цветов
         * и генерирует только новые для незаблокированных слотов, 
         * если count изменился. Используется для изменения количества 
         * и при загрузке.
         */
        const generatePalette = (maintainColors = false) => {
            // Если режим гармонии - всегда пересчитываем полностью
            if (mode.value !== 'random') {
                const seed = colors.value.length && colors.value[0].isLocked
                    ? colors.value[0].hex
                    : baseColor.value;

                const harmonyColors = generateHarmony(seed, mode.value, count.value)

                // Полная перегенерация
                colors.value = harmonyColors.map((hex, index) => ({
                    id: index, // Используем индекс как ID
                    hex: hex,
                    isLocked: index === 0 // Блокируем базу
                }))
                baseColor.value = harmonyColors[0];
                return
            }

            // --- ЛОГИКА RANDOM ---

            // 1. Сначала корректируем размер массива (добавляем или обрезаем)
            // Новые цвета сразу получают случайный HEX
            while (colors.value.length < count.value) {
                colors.value.push({ id: Date.now() + Math.random(), hex: generateHex(), isLocked: false })
            }
            if (colors.value.length > count.value) {
                colors.value = colors.value.slice(0, count.value)
            }

            // 2. Если мы НЕ хотим сохранять текущие цвета (нажата кнопка Генерировать),
            // то перегенерируем все незаблокированные
            if (!maintainColors) {
                colors.value.forEach((color, index) => {
                    if (!color.isLocked) {
                        color.hex = generateHex()
                    }
                    if (index === 0) baseColor.value = color.hex;
                })
            }
            // Если maintainColors === true, мы пропускаем шаг 2, сохраняя HEX, 
            // что решает проблему с обновлением страницы и сбросом цветов.
        }

        const sharePalette = () => {
            const hexString = colors.value.map(c => c.hex.replace('#', '')).join('-');
            router.replace({ query: { palette: hexString } });
            const url = `${window.location.origin}/?palette=${hexString}`;
            navigator.clipboard.writeText(url);
            showNotification('Ссылка скопирована!');
        }

        const loadFromUrl = () => {
            if (route.query.palette) {
                const hexes = route.query.palette.split('-');
                colors.value = hexes.map((hex, i) => ({
                    id: i,
                    hex: '#' + hex,
                    isLocked: true
                }));
                count.value = hexes.length;
                baseColor.value = '#' + hexes[0];
                return true;
            }
            return false;
        }

        const toggleLock = (id) => {
            const color = colors.value.find(c => c.id === id)
            if (color) color.isLocked = !color.isLocked
        }

        const showNotification = (msg) => {
            notification.value = msg
            setTimeout(() => notification.value = '', 2000)
        }

        const savePalette = () => {
            const saved = JSON.parse(localStorage.getItem('myPalettes') || '[]')
            const newPalette = {
                id: Date.now(),
                name: `Палитра ${new Date().toLocaleTimeString()}`,
                colors: colors.value.map(c => c.hex),
                date: new Date().toISOString(),
                isFavorite: false
            }
            saved.unshift(newPalette)
            localStorage.setItem('myPalettes', JSON.stringify(saved))
            showNotification('Палитра сохранена в библиотеку!')
        }

        // --- WATCHERS ---
        // ИСПРАВЛЕНО: При изменении количества, сохраняем цвета
        watch(count, () => generatePalette(true));

        // При смене режима гармонии - всегда полная перегенерация
        watch(mode, () => generatePalette(false));

        // Сохранение в localStorage при любом изменении палитры
        watch(colors, (newVal) => {
            localStorage.setItem('currentWorkspace', JSON.stringify(newVal))
        }, { deep: true })

        // --- LIFECYCLE ---
        onMounted(() => {
            if (loadFromUrl()) return;

            const cached = localStorage.getItem('currentWorkspace')
            if (cached) {
                colors.value = JSON.parse(cached)
                // Установка count и baseColor
                count.value = colors.value.length;
                if (colors.value.length) baseColor.value = colors.value[0].hex;
            } else {
                generatePalette(false)
            }
        })

        return {
            colors, count, mode, showRgbMode, notification, baseColor, showExportModal,
            generatePalette, toggleLock, showNotification, savePalette, updateBaseColor, sharePalette
        }
    }
}
</script>

<style scoped>
/* Добавляем стили для инпута цвета */
.input-group {
    display: flex;
    align-items: center;
    gap: 5px;
    background: white;
    padding: 5px;
    border-radius: 5px;
    border: 1px solid #ccc;
}

.color-input {
    width: 30px;
    height: 30px;
    border: none;
    padding: 0;
    cursor: pointer;
    background: none;
}

/* Остальные стили те же */
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

/* ИСПРАВЛЕННЫЙ СТИЛЬ: Ограничивает ширину карточек и центрирует их */
.palette-grid {
    display: grid;
    gap: 15px;
    margin-bottom: 30px;
    /* Ограничиваем максимальную ширину колонки 300px */
    grid-template-columns: repeat(auto-fit, minmax(180px, 300px));
    justify-content: center;
    /* Центрируем сетку */
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

.controls {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
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
</style>