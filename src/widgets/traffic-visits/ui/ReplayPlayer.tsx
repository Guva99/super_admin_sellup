import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AlertTriangle, EyeOff, FastForward, Loader2, Pause, Play } from "lucide-react";
import { formatClock, originOf, useSiteFrame } from "@/entities/site-analytics";
import { useElementWidth } from "@/shared/lib";
import { CLICK_FLASH_MS, stateAt, type MarkerKind, type Timeline } from "../model/replay";
import { SPEEDS, type Playback } from "../model/usePlayback";

/** Выше этого плеер не растёт: окно телефона в полный рост не влезло бы в экран. */
const MAX_VIEW_HEIGHT = 640;

const MARKER_STYLE: Record<MarkerKind, { className: string; title: string }> = {
  page: { className: "w-0.5 h-4 bg-ink-400", title: "Переход на страницу" },
  click: { className: "w-1 h-1 rounded-full bg-brand-500", title: "Клик" },
  form: { className: "w-2 h-2 rounded-full bg-amber-500 ring-2 ring-surface", title: "Открыл форму заявки" },
  lead: { className: "w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface", title: "Отправил заявку" },
};

/**
 * Курсор посетителя — не масштабируется вместе с сайтом, чтобы его было видно,
 * и с ореолом: на сайте есть нарисованные курсоры, свой не должен с ними путаться.
 */
function Cursor({ x, y }: { x: number; y: number }) {
  return (
    <>
      <span className="absolute w-7 h-7 rounded-full bg-brand-500/25 pointer-events-none" style={{ left: x - 14, top: y - 14 }} aria-hidden />
      <svg width="18" height="20" viewBox="0 0 18 20" className="absolute pointer-events-none drop-shadow" style={{ left: x - 1, top: y - 1 }} aria-hidden>
        <path d="M1.5 1.5v14.2l3.7-3.6 2.6 6 2.4-1-2.6-5.9h5.3z" fill="#111827" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    </>
  );
}

function Scrubber({ timeline, playback }: { timeline: Timeline; playback: Playback }) {
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const seekTo = (event: PointerEvent<HTMLDivElement>) => {
    const rect = track.current?.getBoundingClientRect();
    if (!rect) return;
    playback.seek(((event.clientX - rect.left) / rect.width) * timeline.duration);
  };
  const percent = (t: number) => `${Math.min(100, Math.max(0, (t / timeline.duration) * 100))}%`;

  return (
    <div
      ref={track}
      role="slider"
      aria-label="Время записи"
      aria-valuemin={0}
      aria-valuemax={Math.round(timeline.duration / 1000)}
      aria-valuenow={Math.round(playback.time / 1000)}
      className="relative flex-1 h-8 cursor-pointer touch-none"
      onPointerDown={(event) => {
        dragging.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        seekTo(event);
      }}
      onPointerMove={(event) => dragging.current && seekTo(event)}
      onPointerUp={() => (dragging.current = false)}
    >
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-ink-100 overflow-hidden">
        {/* Паузы, которые проматываются, — светлее. */}
        {timeline.idle.map(([from, to]) => (
          <div key={from} className="absolute inset-y-0 bg-ink-200/70" style={{ left: percent(from), width: `calc(${percent(to)} - ${percent(from)})` }} />
        ))}
        <div className="absolute inset-y-0 left-0 bg-brand-400" style={{ width: percent(playback.time) }} />
      </div>
      {timeline.markers.map((m, i) => (
        <span
          key={i}
          title={MARKER_STYLE[m.kind].title}
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none ${MARKER_STYLE[m.kind].className}`}
          style={{ left: percent(m.at) }}
        />
      ))}
      <span
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-surface border-2 border-brand-500 shadow pointer-events-none"
        style={{ left: percent(playback.time) }}
      />
    </div>
  );
}

interface ReplayPlayerProps {
  timeline: Timeline;
  playback: Playback;
  siteUrl: string;
}

/**
 * Запись визита поверх живого сайта: фрейм размером с окно посетителя
 * (уменьшенный под консоль) переходит по тем же страницам и прокручивается
 * так же, а поверх движется курсор и вспыхивают клики. Сайт во фрейме — его
 * нынешняя версия: если страницу с тех пор переделали, запись ляжет неточно.
 */
export function ReplayPlayer({ timeline, playback, siteUrl }: ReplayPlayerProps) {
  const box = useElementWidth<HTMLDivElement>();
  const screen = stateAt(timeline, playback.time);
  const siteOrigin = useMemo(() => originOf(siteUrl), [siteUrl]);
  // Фрейм грузится один раз, на первой странице записи; дальше переходы идут через мост, без перезагрузки.
  const [src] = useState(() => `${siteUrl.replace(/\/$/, "")}${timeline.segments[0].path}`);
  const { frameRef, state, lost, onLoad, scrollTo, navigate, setDialog } = useSiteFrame(siteOrigin, src);

  const connected = state !== null;
  const onPage = connected && state.path === screen.path;
  const siteScroll = state?.scrollY;

  // Страница не та — переходим; сайт ответит своим адресом, и onPage станет true.
  useEffect(() => {
    if (connected && !onPage) navigate(screen.path);
  }, [connected, onPage, screen.path, navigate]);

  // Прокрутка — за записью; и снова, если сайт уехал сам (новая страница открывается сверху).
  useEffect(() => {
    if (onPage && siteScroll !== undefined && Math.abs(siteScroll - screen.scrollY) > 1) scrollTo(screen.scrollY);
  }, [onPage, siteScroll, screen.scrollY, scrollTo]);

  // Окно заявки — открыто или закрыто, как у посетителя в этот момент.
  const dialogSent = useRef<boolean | null>(null);
  useEffect(() => {
    if (!onPage) {
      dialogSent.current = null;
      return;
    }
    if (dialogSent.current === screen.dialogOpen) return;
    dialogSent.current = screen.dialogOpen;
    setDialog(screen.dialogOpen);
  }, [onPage, screen.dialogOpen, setDialog]);

  const scale = box.width > 0 ? Math.min(1, box.width / screen.width, MAX_VIEW_HEIGHT / screen.height) : 0;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === " ") playback.toggle();
    else if (event.key === "ArrowRight") playback.seek(playback.time + 5000);
    else if (event.key === "ArrowLeft") playback.seek(playback.time - 5000);
    else return;
    event.preventDefault();
  };

  return (
    <div className="space-y-3 outline-none" tabIndex={0} onKeyDown={onKeyDown} aria-label="Плеер визита: пробел — пуск и пауза, стрелки — на 5 секунд">
      <div className="flex items-center justify-between gap-3 text-xs text-ink-500">
        <span className="truncate">
          Страница <span className="font-mono text-ink-800">{screen.path}</span>
          {timeline.segments.length > 1 && (
            <span className="text-ink-400">
              {" "}
              · {screen.segment + 1} из {timeline.segments.length}
            </span>
          )}
        </span>
        <span className="flex-shrink-0 text-ink-400">
          Окно {screen.width}×{screen.height}
          {scale > 0 && scale < 1 && `, ${Math.round(scale * 100)} %`}
        </span>
      </div>

      <div ref={box.ref} className="w-full">
        {scale > 0 && (
          <div
            className="relative mx-auto overflow-hidden rounded-lg border border-ink-200 bg-white"
            style={{ width: screen.width * scale, height: screen.height * scale }}
          >
            <iframe
              ref={frameRef}
              src={src}
              title="Сайт для плеера визита"
              onLoad={onLoad}
              // Скрипты нужны: сайт — приложение и сам слушает команды плеера. Переходы и всплывающие окна — нет.
              sandbox="allow-scripts allow-same-origin"
              className="absolute top-0 left-0 border-0 pointer-events-none"
              style={{ width: screen.width, height: screen.height, transform: `scale(${scale})`, transformOrigin: "0 0" }}
            />

            {screen.clicks.map((click, i) => {
              const size = 10 + 30 * (click.age / CLICK_FLASH_MS);
              return (
                <span
                  key={i}
                  className="absolute rounded-full border-2 border-brand-500 bg-brand-400/25 pointer-events-none"
                  style={{
                    left: click.x * scale,
                    top: click.y * scale,
                    width: size,
                    height: size,
                    transform: "translate(-50%, -50%)",
                    opacity: 1 - click.age / CLICK_FLASH_MS,
                  }}
                />
              );
            })}
            {!timeline.touch && screen.cursor && <Cursor x={screen.cursor.x * scale} y={screen.cursor.y * scale} />}

            {screen.hidden && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/45">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 text-xs text-white">
                  <EyeOff size={12} />
                  Посетитель на другой вкладке
                </span>
              </div>
            )}
            {playback.skippedSec !== null && playback.skippedSec > 0 && (
              <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/70 text-[11px] text-white">
                <FastForward size={11} />
                Пропущена пауза {playback.skippedSec} с
              </span>
            )}
            {!state && !lost && (
              <div className="absolute inset-x-0 top-3 flex justify-center">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/70 text-[11px] text-white">
                  <Loader2 size={11} className="animate-spin" />
                  Открываем сайт…
                </span>
              </div>
            )}
            {lost && (
              <div className="absolute inset-x-3 top-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <AlertTriangle size={13} className="flex-shrink-0 mt-px" />
                <span>
                  Сайт не отвечает во фрейме — курсор и клики видны, но страница не переходит и не прокручивается. Сайт слушается только консоль
                  из своей настройки VITE_CONSOLE_ORIGINS и показывает себя во фрейме только ей (nginx, frame-ancestors).
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={playback.toggle}
          aria-label={playback.playing ? "Пауза" : "Смотреть"}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-colors"
        >
          {playback.playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>
        <span className="flex-shrink-0 w-[92px] text-xs tabular-nums text-ink-600">
          {formatClock(playback.time)} / {formatClock(timeline.duration)}
        </span>
        <Scrubber timeline={timeline} playback={playback} />
        <div className="flex-shrink-0 flex gap-0.5 bg-ink-100 rounded-lg p-0.5" role="group" aria-label="Скорость">
          {SPEEDS.map((speed) => (
            <button
              key={speed}
              type="button"
              aria-pressed={playback.speed === speed}
              onClick={() => playback.setSpeed(speed)}
              className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors ${
                playback.speed === speed ? "bg-surface text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-700"
              }`}
            >
              {speed}×
            </button>
          ))}
        </div>
        <label className="flex-shrink-0 flex items-center gap-1.5 text-xs text-ink-600 cursor-pointer select-none">
          <input type="checkbox" checked={playback.skipPauses} onChange={(e) => playback.setSkipPauses(e.target.checked)} className="accent-brand-500" />
          Пропускать паузы
        </label>
      </div>
    </div>
  );
}
