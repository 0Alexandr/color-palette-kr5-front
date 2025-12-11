// src/utils/colorUtils.js

// ... (оставляем generateHex, hexToRgb, hexToHsl, hslToHex без изменений)
export const generateHex = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
}

export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export const hexToHsl = (hex) => {
  let { r, g, b } = hexToRgb(hex);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export const hslToHex = (h, s, l) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// --- НОВАЯ ЛОГИКА WCAG ---

// Расчет относительной яркости (Luminance)
const getLuminance = (r, g, b) => {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Точный расчет коэффициента контрастности
export const getContrastRatio = (hex1, hex2) => {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1;

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);

  return (brightest + 0.05) / (darkest + 0.05);
}

// Получение оценки WCAG (AA/AAA)
export const getWcagScore = (ratio) => {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

// Упрощенная версия для выбора цвета текста (белый или черный)
export const getContrastColor = (hex) => {
  const ratioWhite = getContrastRatio(hex, '#FFFFFF');
  const ratioBlack = getContrastRatio(hex, '#000000');
  return ratioBlack > ratioWhite ? '#000000' : '#FFFFFF';
}

// --- ОБНОВЛЕННАЯ ГАРМОНИЯ ---

export const generateHarmony = (baseColor, type, count) => {
  const hsl = hexToHsl(baseColor);
  const colors = [];

  // Всегда добавляем базовый цвет первым
  colors.push(baseColor);

  for (let i = 1; i < count; i++) { // Начинаем с 1, так как 0 - база
    let newH = hsl.h;
    let newS = hsl.s;
    let newL = hsl.l;

    if (type === 'analogous') newH = (hsl.h + (i * 30)) % 360;
    if (type === 'monochromatic') newL = Math.max(10, Math.min(90, hsl.l + (i * 10 - 20))); // Вариация яркости
    if (type === 'triad') newH = (hsl.h + (i * 120)) % 360;

    // ДОБАВЛЕНО: Комплементарная (противоположный цвет + вариации)
    if (type === 'complementary') {
      if (i === 1) {
        newH = (hsl.h + 180) % 360; // Точный комплементарный
      } else {
        // Дополнительные цвета для палитры > 2
        newH = (hsl.h + 180 + (i * 20)) % 360;
        newL = Math.max(20, Math.min(80, newL + (i % 2 === 0 ? 20 : -20)));
      }
    }

    colors.push(hslToHex(newH, newS, newL));
  }
  // Если массив получился длиннее (из-за логики пуша), обрезаем, или наоборот
  return colors.slice(0, count);
}