export interface RGBColor {
  r: number; // 0..1
  g: number; // 0..1
  b: number; // 0..1
}

// 5-stop scientific colormap specified in requirements:
// Azul (bajos) -> Verde (moderados) -> Amarillo (elevados) -> Naranja (muy elevados) -> Rojo (máximos)
const COLOR_STOPS: { t: number; rgb: [number, number, number] }[] = [
  { t: 0.0, rgb: [0.10, 0.36, 0.92] }, // Azul
  { t: 0.25, rgb: [0.09, 0.72, 0.38] }, // Verde
  { t: 0.50, rgb: [0.95, 0.80, 0.12] }, // Amarillo
  { t: 0.75, rgb: [0.96, 0.48, 0.10] }, // Naranja
  { t: 1.0, rgb: [0.88, 0.14, 0.16] }, // Rojo
];

export function sampleStressColor(normalizedT: number): RGBColor {
  const t = Math.max(0, Math.min(1, Number.isFinite(normalizedT) ? normalizedT : 0));
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const a = COLOR_STOPS[i];
    const b = COLOR_STOPS[i + 1];
    if (t >= a.t && t <= b.t) {
      const local = (t - a.t) / (b.t - a.t);
      return {
        r: a.rgb[0] + (b.rgb[0] - a.rgb[0]) * local,
        g: a.rgb[1] + (b.rgb[1] - a.rgb[1]) * local,
        b: a.rgb[2] + (b.rgb[2] - a.rgb[2]) * local,
      };
    }
  }
  const last = COLOR_STOPS[COLOR_STOPS.length - 1];
  return { r: last.rgb[0], g: last.rgb[1], b: last.rgb[2] };
}

export const COLORMAP_CSS_GRADIENT =
  'linear-gradient(to top, rgb(26,92,235) 0%, rgb(23,184,97) 25%, rgb(242,204,31) 50%, rgb(245,122,26) 75%, rgb(224,36,41) 100%)';

export const COLORMAP_CSS_GRADIENT_HORIZONTAL =
  'linear-gradient(to right, rgb(26,92,235) 0%, rgb(23,184,97) 25%, rgb(242,204,31) 50%, rgb(245,122,26) 75%, rgb(224,36,41) 100%)';
