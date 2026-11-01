import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { originOf, useSiteFrame, type HeatmapClick, type HeatmapDevice } from "@/entities/site-analytics";
import { useElementWidth } from "@/shared/lib";
import { drawHeat } from "../model/heat";
import { frameSize, pagePoints, pinnedPoints } from "../model/layout";

/** Холст слоя страницы — не выше этого: браузеры не рисуют канвас длиннее ~32 тыс. пикселей. */
const MAX_CANVAS_PX = 30000;
const PAGE_RESOLUTION = 0.4;
const MINIMAP_WIDTH = 64;
/** Выше этого карта не растёт: окно телефона в полный рост не влезло бы в экран. */
const MAX_VIEW_HEIGHT = 720;

interface HeatmapViewerProps {
  clicks: HeatmapClick[];
  device: HeatmapDevice;
  siteUrl: string;
  pagePath: string;
}

/**
 * Живая страница сайта во фрейме размером с окно посетителя и тепловые пятна
 * поверх. Колесо мыши над картой прокручивает сайт во фрейме, и пятна едут
 * вместе с ним — под точкой всегда то, что видел посетитель, включая сцены,
 * которые меняются при прокрутке. Справа — вся страница целиком, клик по ней
 * переносит к месту.
 */
export function HeatmapViewer({ clicks, device, siteUrl, pagePath }: HeatmapViewerProps) {
  const box = useElementWidth<HTMLDivElement>();
  const size = useMemo(() => frameSize(device, clicks), [device, clicks]);
  const siteOrigin = useMemo(() => originOf(siteUrl), [siteUrl]);
  const src = `${siteUrl.replace(/\/$/, "")}${pagePath}`;
  const { frameRef, state, lost, onLoad, scrollTo } = useSiteFrame(siteOrigin, src);

  const scale = box.width > 0 ? Math.min(1, box.width / size.width, MAX_VIEW_HEIGHT / size.height) : 0;
  const documentHeight = Math.max(state?.documentHeight || 0, size.height);
  const scrollY = state?.scrollY ?? 0;
  const maxScroll = Math.max(0, documentHeight - size.height);

  /* --- слой страницы: весь документ, едет вместе с прокруткой --- */
  const pageCanvas = useRef<HTMLCanvasElement>(null);
  const [pageMax, setPageMax] = useState(0);
  const [pageDrawn, setPageDrawn] = useState(0);
  const resolution = Math.min(PAGE_RESOLUTION, MAX_CANVAS_PX / documentHeight);
  const pagePts = useMemo(
    () => pagePoints(clicks, device, { width: size.width, height: size.height, documentHeight }),
    [clicks, device, size, documentHeight],
  );
  useEffect(() => {
    if (!pageCanvas.current) return;
    setPageMax(drawHeat(pageCanvas.current, pagePts, size.width, documentHeight, resolution));
    setPageDrawn((n) => n + 1);
  }, [pagePts, size.width, documentHeight, resolution]);

  /* --- слой закреплённого: окно, перерисовывается при прокрутке --- */
  const pinnedCanvas = useRef<HTMLCanvasElement>(null);
  const pinnedPts = useMemo(
    () => pinnedPoints(clicks, device, { width: size.width, height: size.height, documentHeight }, scrollY),
    [clicks, device, size, documentHeight, scrollY],
  );
  useEffect(() => {
    if (pinnedCanvas.current) drawHeat(pinnedCanvas.current, pinnedPts, size.width, size.height, 0.5, pageMax);
  }, [pinnedPts, size, pageMax]);

  /* --- колесо: прокручивает сайт во фрейме, а не консоль --- */
  const viewport = useRef<HTMLDivElement>(null);
  const target = useRef(0);
  const lastWheel = useRef(0);
  useEffect(() => {
    // Пока крутят колесо, цель ведёт сама карта; иначе — то, что сообщил сайт.
    if (Date.now() - lastWheel.current > 300) target.current = scrollY;
  }, [scrollY]);
  useEffect(() => {
    const el = viewport.current;
    if (!el || !scale) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      lastWheel.current = Date.now();
      target.current = Math.min(maxScroll, Math.max(0, target.current + event.deltaY / scale));
      scrollTo(target.current);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [scale, maxScroll, scrollTo]);

  /* --- вся страница справа --- */
  const minimap = useRef<HTMLCanvasElement>(null);
  const minimapHeight = Math.round(size.height * scale);
  useEffect(() => {
    const canvas = minimap.current;
    if (!canvas || !minimapHeight) return;
    canvas.width = MINIMAP_WIDTH;
    canvas.height = minimapHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const k = minimapHeight / documentHeight;
    ctx.clearRect(0, 0, MINIMAP_WIDTH, minimapHeight);
    if (pageCanvas.current && pageCanvas.current.width > 1) ctx.drawImage(pageCanvas.current, 0, 0, MINIMAP_WIDTH, minimapHeight);
    // Первый экран — пунктиром.
    ctx.strokeStyle = "rgba(100, 116, 139, 0.9)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, size.height * k);
    ctx.lineTo(MINIMAP_WIDTH, size.height * k);
    ctx.stroke();
    ctx.setLineDash([]);
    // Где сейчас окно карты.
    ctx.strokeStyle = "rgb(253, 98, 44)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, scrollY * k + 1, MINIMAP_WIDTH - 2, Math.max(4, size.height * k - 2));
  }, [pageDrawn, scrollY, documentHeight, minimapHeight, size.height]);

  const jumpTo = (event: MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const y = ((event.clientY - rect.top) / rect.height) * documentHeight - size.height / 2;
    target.current = Math.min(maxScroll, Math.max(0, y));
    scrollTo(target.current);
  };

  return (
    <div className="flex items-start gap-3">
      <div ref={box.ref} className="flex-1 min-w-0">
        {scale > 0 && (
          <div
            ref={viewport}
            className="relative mx-auto overflow-hidden rounded-lg border border-ink-200 bg-white"
            style={{ width: size.width * scale, height: size.height * scale }}
          >
            <iframe
              ref={frameRef}
              key={src}
              src={src}
              title={`Страница ${pagePath} для карты кликов`}
              onLoad={onLoad}
              // Скрипты нужны: сайт — приложение и сам сообщает прокрутку. Переходы и всплывающие окна — нет.
              sandbox="allow-scripts allow-same-origin"
              className="absolute top-0 left-0 border-0 pointer-events-none"
              style={{ width: size.width, height: size.height, transform: `scale(${scale})`, transformOrigin: "0 0" }}
            />
            <div
              className="absolute top-0 left-0 pointer-events-none"
              style={{ width: size.width * scale, height: documentHeight * scale, transform: `translateY(${-scrollY * scale}px)` }}
            >
              <canvas ref={pageCanvas} className="absolute inset-0 w-full h-full" aria-hidden />
              <div className="absolute inset-x-0 border-t border-dashed border-slate-500/70" style={{ top: size.height * scale }}>
                <span className="absolute right-1 -top-4 px-1 rounded bg-slate-900/60 text-[10px] text-white">первый экран</span>
              </div>
            </div>
            <canvas ref={pinnedCanvas} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden />

            {!state && !lost && (
              <div className="absolute inset-x-0 top-3 flex justify-center">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/70 text-[11px] text-white">
                  <Loader2 size={11} className="animate-spin" />
                  Открываем страницу…
                </span>
              </div>
            )}
            {lost && (
              <div className="absolute inset-x-3 top-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <AlertTriangle size={13} className="flex-shrink-0 mt-px" />
                <span>
                  Сайт не отвечает во фрейме — карта показывает только первый экран. Сайт управляет прокруткой только для адреса консоли из своей
                  настройки VITE_CONSOLE_ORIGINS, и показывает себя во фрейме только ему (nginx, frame-ancestors).
                </span>
              </div>
            )}
          </div>
        )}
        {scale > 0 && scale < 1 && (
          <p className="text-center text-[11px] text-ink-400 mt-2">
            Окно {size.width}×{size.height} — медиана окон посетителей, уменьшено до {Math.round(scale * 100)} %. Колесо мыши над картой прокручивает страницу.
          </p>
        )}
      </div>

      {scale > 0 && (
        <canvas
          ref={minimap}
          onClick={jumpTo}
          title="Вся страница: клик — перейти к месту"
          className="flex-shrink-0 rounded-md border border-ink-200 bg-ink-50 cursor-pointer"
          style={{ width: MINIMAP_WIDTH, height: minimapHeight }}
        />
      )}
    </div>
  );
}
