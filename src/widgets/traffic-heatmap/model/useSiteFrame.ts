import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Связь с сайтом во фрейме карты кликов. Сайт (sellup_web,
 * shared/lib/heatmapBridge.ts) слушает только консоль: на «hello» он начинает
 * сообщать свою прокрутку и высоту, на «scroll» — прокручивается.
 *
 *   консоль → сайт: { type: "sellup-heatmap:hello" }, { type: "sellup-heatmap:scroll", y }
 *   сайт → консоль: { type: "sellup-heatmap:state", path, scrollY, documentHeight, viewportWidth, viewportHeight }
 */

export interface SiteFrameState {
  scrollY: number;
  documentHeight: number;
  viewportHeight: number;
}

/** Сколько ждать первого ответа сайта, прежде чем сказать, что связи нет. */
const CONNECT_TIMEOUT_MS = 8000;
const HELLO_EVERY_MS = 400;

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
      const data = event.data as { type?: string; scrollY?: number; documentHeight?: number; viewportHeight?: number } | null;
      if (data?.type !== "sellup-heatmap:state") return;
      setState({ scrollY: data.scrollY ?? 0, documentHeight: data.documentHeight ?? 0, viewportHeight: data.viewportHeight ?? 0 });
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

  const scrollTo = useCallback(
    (y: number) => {
      if (!siteOrigin) return;
      frameRef.current?.contentWindow?.postMessage({ type: "sellup-heatmap:scroll", y: Math.max(0, Math.round(y)) }, siteOrigin);
    },
    [siteOrigin],
  );

  return { frameRef, state, lost: lost && !connected, onLoad: () => setLoaded(true), scrollTo };
}
