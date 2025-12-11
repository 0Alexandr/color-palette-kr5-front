<template>
    <div class="color-wheel-container">
        <div class="color-wheel-visual">
            <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
                <circle :cx="center" :cy="center" :r="radius" fill="white" opacity="0.3" class="saturation-layer" />

                <g>
                    <circle v-for="(point, index) in colorPoints" :key="index" :cx="point.x" :cy="point.y" r="8"
                        :fill="point.hex" stroke-width="3" :stroke="point.isLocked ? '#000' : '#fff'"
                        class="color-point">
                        <title>{{ point.hex }} (H: {{ point.hsl.h.toFixed(0) }}°)</title>
                    </circle>
                </g>
            </svg>
        </div>

        <div class="legend">
            <p><strong>Анализ гармонии:</strong></p>
            <p>Круг показывает расположение оттенков (Hue). Белый центр — низкая насыщенность.</p>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue'
import { hexToHsl, getContrastColor } from '../utils/colorUtils'

export default {
    props: {
        colors: {
            type: Array,
            required: true
        }
    },
    setup(props) {
        const size = 300 // Размер SVG и контейнера
        const center = size / 2 // 150
        const radius = 120 // Радиус круга

        // Вычисляемое свойство для позиционирования точек
        const colorPoints = computed(() => {
            if (!props.colors || props.colors.length === 0) return []

            return props.colors.map(color => {
                const hsl = hexToHsl(color.hex)

                // Используем Яркость (L) и Насыщенность (S) для определения радиуса точки.
                // Чем выше S, тем дальше от центра. Чем выше L, тем ярче цвет.

                // Расстояние от центра. S=0 => в центре, S=100 => на краю.
                const rFactor = hsl.s / 100;

                // Мы используем фиксированный радиус для наглядности (radius * 0.95), 
                // но умножаем на rFactor, чтобы имитировать насыщенность.
                const r = radius * 0.95 * rFactor;

                // Угол (в градусах), скорректированный для отрисовки (0° Red сверху, идет по часовой)
                let angle = hsl.h - 90;
                // SVG-функции косинуса/синуса работают с углами, где 0° справа и по часовой,
                // поэтому 90° смещает красный (0°) наверх.

                // Конвертируем в радианы
                const angleRad = angle * (Math.PI / 180)

                // Вычисляем координаты (X, Y)
                const x = center + r * Math.cos(angleRad)
                const y = center + r * Math.sin(angleRad)

                return {
                    x,
                    y,
                    hex: color.hex,
                    isLocked: color.isLocked,
                    hsl
                }
            })
        })

        return {
            size,
            center,
            radius,
            colorPoints,
            getContrast: getContrastColor
        }
    }
}
</script>

<style scoped>
/* Контейнер для всего компонента */
.color-wheel-container {
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fdfdfd;
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* Контейнер для визуального круга (CSS) */
.color-wheel-visual {
    width: 300px;
    height: 300px;
    border-radius: 50%;
    position: relative;
    /* ИСПОЛЬЗУЕМ КОНИЧЕСКИЙ ГРАДИЕНТ для ЦВЕТНОГО КРУГА */
    background: conic-gradient(hsl(0, 100%, 50%),
            hsl(60, 100%, 50%),
            hsl(120, 100%, 50%),
            hsl(180, 100%, 50%),
            hsl(240, 100%, 50%),
            hsl(300, 100%, 50%),
            hsl(360, 100%, 50%));
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

/* SVG внутри контейнера, чтобы точки были точно поверх */
.color-wheel-visual svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

/* Слой для имитации насыщенности (белый центр) */
.saturation-layer {
    filter: blur(10px);
    /* Слегка размываем, чтобы градиент был плавнее */
}

/* Точки */
.color-point {
    cursor: default;
}

.legend {
    margin-top: 15px;
    text-align: center;
    font-size: 0.9rem;
    color: #555;
}
</style>