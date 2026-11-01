import type { HeatmapClick, HeatmapDevice } from "@/entities/site-analytics";

/**
 * Геометрия карты кликов. Сайт показывается во фрейме размером с окно
 * типичного посетителя (медиана по кликам) и прокручивается вместе с картой:
 * высоты сцен на лендинге считаются от высоты окна, поэтому фрейм «во всю
 * страницу» растянул бы их до неузнаваемости.
 */

interface DeviceFrame {
  /** Ширины окон класса — те же границы, что у бэкенда (heatmapDevices). */
  minWidth: number;
  maxWidth: number;
  /** Окно по умолчанию, пока кликов нет. */
  width: number;
  height: number;
}

export const DEVICE_FRAME: Record<HeatmapDevice, DeviceFrame> = {
  // Шире 1920 не берём: контент лендинга центрирован, дальше растут только поля.
  desktop: { minWidth: 1024, maxWidth: 1920, width: 1440, height: 900 },
  tablet: { minWidth: 768, maxWidth: 1023, width: 820, height: 1180 },
  mobile: { minWidth: 320, maxWidth: 767, width: 390, height: 844 },
};

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Окно кадра: медианы ширины и высоты окон посетителей этого класса устройств. */
export function frameSize(device: HeatmapDevice, clicks: HeatmapClick[]): { width: number; height: number } {
  const spec = DEVICE_FRAME[device];
  const width = median(clicks.map((c) => c.viewportWidth)) || spec.width;
  const height = median(clicks.map((c) => c.viewportHeight)) || spec.height;
  return { width: clamp(width, spec.minWidth, spec.maxWidth), height: clamp(height, 480, 1600) };
}

export interface FrameGeometry {
  width: number;
  height: number;
  /** Высота документа во фрейме — её сообщает сайт. */
  documentHeight: number;
}

/**
 * X: на компьютере контент центрирован, поэтому клик переносится от центра
 * окна — иначе на широком мониторе точка уехала бы вбок от кнопки. На
 * телефоне и планшете вёрстка тянется по ширине — пропорционально.
 */
function frameX(click: HeatmapClick, device: HeatmapDevice, width: number): number {
  const x = device === "desktop" ? width / 2 + (click.x - click.viewportWidth / 2) : (click.x / click.viewportWidth) * width;
  return clamp(x, 0, width);
}

/**
 * Высота документа у посетителя и во фрейме различается (окна разные, а
 * сцены считаются от высоты окна) — место на странице переносится долей
 * высоты документа.
 */
function frameDocY(y: number, click: HeatmapClick, frame: FrameGeometry): number {
  return click.documentHeight > 0 ? (y / click.documentHeight) * frame.documentHeight : y;
}

export interface HeatPoint {
  x: number;
  y: number;
}

/** Клики по странице — в координатах документа фрейма. */
export function pagePoints(clicks: HeatmapClick[], device: HeatmapDevice, frame: FrameGeometry): HeatPoint[] {
  return clicks.filter((c) => !c.pinned).map((c) => ({ x: frameX(c, device, frame.width), y: frameDocY(c.y, c, frame) }));
}

/**
 * Клики по закреплённому — шапке и сценам, которые стоят на месте, пока страница
 * едет под ними. Они привязаны к окну, а не к документу, поэтому видны, только
 * когда карта прокручена туда же, где был посетитель (± полэкрана).
 */
export function pinnedPoints(clicks: HeatmapClick[], device: HeatmapDevice, frame: FrameGeometry, scrollY: number): HeatPoint[] {
  return clicks
    .filter((c) => c.pinned && Math.abs(frameDocY(c.scrollY, c, frame) - scrollY) <= frame.height / 2)
    .map((c) => ({ x: frameX(c, device, frame.width), y: c.viewportHeight > 0 ? (c.y / c.viewportHeight) * frame.height : c.y }));
}
