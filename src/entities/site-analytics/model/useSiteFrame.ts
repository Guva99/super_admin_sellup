import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Связь с сайтом во фрейме — для карты кликов и плеера визитов. Сайт
 * (sellup_web, shared/lib/heatmapBridge.ts) слушает только консоль: на
 * «hello» он начинает сообщать свою страницу, прокрутку и высоту, на
 * остальное — прокручивается, переходит на страницу, открывает окно заявки.
 *
 *   консоль → сайт: { type: "sellup-heatmap:hello" }, { type: "sellup-heatmap:scroll", y },
 *                   { type: "sellup-heatmap:navigate", path }, { type: "sellup-heatmap:dialog", open }
 *   сайт → консоль: { type: "sellup-heatmap:state", path, scrollY, documentHeight, viewportWidth, viewportHeight }
 */

export interface SiteFrameState {
  path: string;
  scrollY: number;
  documentHeight: number;
  viewportHeight: number;
}

/** Сколько ждать первого ответа сайта, прежде чем сказать, что связи нет. */
const CONNECT_TIMEOUT_MS = 8000;
const HELLO_EVERY_MS = 400;

/** Origin адреса сайта; null — адрес не разобрать. */
export function originOf(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export function useSiteFrame(siteOrigin: string | null, frameKey: string) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [state, setState] = useState<SiteFrameState | null>(null);
  const [lost, setLost] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Новый адрес или окно — ждём сайт заново.
  useEffect(() => {
    setState(null);
    setLost(false);
    setLoaded(false);
  }, [frameKey]);

  useEffect(() => {
    if (!siteOrigin) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== siteOrigin || event.source !== frameRef.current?.contentWindow) return;
      const data = event.data as { type?: string; path?: string; scrollY?: number; documentHeight?: number; viewportHeight?: number } | null;
      if (data?.type !== "sellup-heatmap:state") return;
      setState({ path: data.path ?? "", scrollY: data.scrollY ?? 0, documentHeight: data.documentHeight ?? 0, viewportHeight: data.viewportHeight ?? 0 });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [siteOrigin]);

  const connected = state !== null;

  // Сайт ставит мост при загрузке скриптов — «hello» повторяем, пока не ответит.
  useEffect(() => {
    if (!siteOrigin || !loaded || connected) return;
    const hello = () => frameRef.current?.contentWindow?.postMessage({ type: "sellup-heatmap:hello" }, siteOrigin);
    hello();
    const timer = window.setInterval(hello, HELLO_EVERY_MS);
    const giveUp = window.setTimeout(() => setLost(true), CONNECT_TIMEOUT_MS);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(giveUp);
    };
  }, [siteOrigin, loaded, connected]);

  const post = useCallback(
    (message: Record<string, unknown>) => {
      if (siteOrigin) frameRef.current?.contentWindow?.postMessage(message, siteOrigin);
    },
    [siteOrigin],
  );

  const scrollTo = useCallback((y: number) => post({ type: "sellup-heatmap:scroll", y: Math.max(0, Math.round(y)) }), [post]);
  /** Перейти на страницу сайта без перезагрузки фрейма. */
  const navigate = useCallback((path: string) => post({ type: "sellup-heatmap:navigate", path }), [post]);
  const setDialog = useCallback((open: boolean) => post({ type: "sellup-heatmap:dialog", open }), [post]);

  return { frameRef, state, lost: lost && !connected, onLoad: () => setLoaded(true), scrollTo, navigate, setDialog };
}
