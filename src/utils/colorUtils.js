// src/utils/colorUtils.js

// Генерация случайного HEX
export const generateHex = () => {
  return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase();
}

// Преобразование HEX в RGB
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Преобразование HEX в HSL (для гармонии цветов)
export const hexToHsl = (hex) => {
  let {r, g, b} = hexToRgb(hex);
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

// HSL обратно в HEX
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

// Расчет контрастности (WCAG)
export const getContrastColor = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  // Формула яркости
  const yiq = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
}

// Генерация гармоний
export const generateHarmony = (baseColor, type, count) => {
  const hsl = hexToHsl(baseColor);
  const colors = [];
  
  for (let i = 0; i < count; i++) {
    let newH = hsl.h;
    let newS = hsl.s;
    let newL = hsl.l;

    if (type === 'analogous') newH = (hsl.h + (i * 30)) % 360;
    if (type === 'monochromatic') newL = Math.max(10, Math.min(90, hsl.l + (i * 10 - 20)));
    if (type === 'triad') newH = (hsl.h + (i * 120)) % 360;
    if (type === 'complementary') newH = (hsl.h + (i * 180)) % 360;

    colors.push(hslToHex(newH, newS, newL));
  }
  return colors;
}