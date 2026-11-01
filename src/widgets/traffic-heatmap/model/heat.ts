import type { HeatPoint } from "./layout";

/** Радиус пятна клика в пикселях страницы. */
const RADIUS = 26;
const POINT_ALPHA = 0.25;

/* Цвета карты — шкала данных, а не цвета интерфейса: от редких кликов к
   частым. В тёмной теме они те же. */
const PALETTE_STOPS: [number, string][] = [
  [0.15, "rgb(59, 130, 246)"],
  [0.45, "rgb(34, 197, 94)"],
  [0.7, "rgb(234, 179, 8)"],
  [1, "rgb(239, 68, 68)"],
];

let paletteCache: Uint8ClampedArray | null = null;

function palette(): Uint8ClampedArray {
  if (paletteCache) return paletteCache;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 1;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, 256, 0);
  for (const [stop, color] of PALETTE_STOPS) gradient.addColorStop(stop, color);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 1);
  paletteCache = ctx.getImageData(0, 0, 256, 1).data;
  return paletteCache;
}

function brush(radius: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = radius * 2;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
  gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, radius * 2, radius * 2);
  return canvas;
}

/**
 * Классическая тепловая карта: пятна кликов копятся в прозрачности, потом
 * прозрачность переводится в цвет. Шкала нормируется по самому горячему месту
 * (или по normalizeTo — чтобы закреплённый слой говорил на той же шкале, что
 * страница), поэтому карта читается и при десяти кликах, и при десяти тысячах.
 * Возвращает самую плотную точку — для соседнего слоя.
 *
 * resolution — пикселей холста на пиксель страницы: карта размытая, полное
 * разрешение не нужно, а документ лендинга длиной в десятки тысяч пикселей.
 */
export function drawHeat(canvas: HTMLCanvasElement, points: HeatPoint[], width: number, height: number, resolution: number, normalizeTo = 0): number {
  const w = Math.max(1, Math.round(width * resolution));
  const h = Math.max(1, Math.round(height * resolution));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx || points.length === 0) return 0;

  const radius = Math.max(4, Math.round(RADIUS * resolution));
  const stamp = brush(radius);
  ctx.globalAlpha = POINT_ALPHA;
  for (const point of points) ctx.drawImage(stamp, point.x * resolution - radius, point.y * resolution - radius);
  ctx.globalAlpha = 1;

  const image = ctx.getImageData(0, 0, w, h);
  const data = image.data;
  let maxAlpha = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > maxAlpha) maxAlpha = data[i];
  if (maxAlpha === 0) return 0;

  const top = normalizeTo > 0 ? normalizeTo : maxAlpha;
  const colors = palette();
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha === 0) continue;
    const t = Math.min(1, alpha / top);
    if (t < 0.03) {
      data[i + 3] = 0;
      continue;
    }
    const offset = Math.min(255, Math.round(t * 255)) * 4;
    data[i] = colors[offset];
    data[i + 1] = colors[offset + 1];
    data[i + 2] = colors[offset + 2];
    data[i + 3] = Math.min(230, 70 + Math.round(t * 170));
  }
  ctx.putImageData(image, 0, 0);
  return maxAlpha;
}
