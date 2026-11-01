import { useCallback, useEffect, useRef, useState } from "react";
import { skipIdle, type Timeline } from "./replay";

export const SPEEDS = [1, 2, 4, 8] as const;
/** Сколько держится надпись «пауза пропущена». */
const SKIP_NOTE_MS = 1500;
export type Speed = (typeof SPEEDS)[number];

export interface Playback {
  time: number;
  playing: boolean;
  speed: Speed;
  skipPauses: boolean;
  /** Только что промотана пауза в столько секунд — плеер это показывает; null — нет. */
  skippedSec: number | null;
  toggle: () => void;
  pause: () => void;
  seek: (t: number) => void;
  setSpeed: (speed: Speed) => void;
  setSkipPauses: (skip: boolean) => void;
}

/** Время записи: идёт кадрами анимации со скоростью speed, паузы без действий проматываются. */
export function usePlayback(timeline: Timeline | null): Playback {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [skipPauses, setSkipPauses] = useState(true);
  const [skippedSec, setSkippedSec] = useState<number | null>(null);
  const timeRef = useRef(0);
  const skipNote = useRef<{ seconds: number; at: number } | null>(null);

  // Другой визит — с начала.
  useEffect(() => {
    timeRef.current = 0;
    setTime(0);
    setPlaying(false);
  }, [timeline]);

  useEffect(() => {
    if (!playing || !timeline) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // Вкладка консоли была в фоне — не догоняем рывком.
      const elapsed = Math.min(now - last, 250) * speed;
      last = now;
      let next = timeRef.current + elapsed;
      const skipped = skipPauses ? skipIdle(timeline, next) : next;
      if (skipped !== next) skipNote.current = { seconds: Math.round((skipped - next) / 1000), at: now };
      next = skipped;
      const note = skipNote.current;
      setSkippedSec(note && now - note.at < SKIP_NOTE_MS ? note.seconds : null);
      if (next >= timeline.duration) {
        timeRef.current = timeline.duration;
        setTime(timeline.duration);
        setPlaying(false);
        return;
      }
      timeRef.current = next;
      setTime(next);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, timeline, speed, skipPauses]);

  const seek = useCallback(
    (t: number) => {
      const next = Math.min(Math.max(0, t), timeline?.duration ?? 0);
      timeRef.current = next;
      setTime(next);
    },
    [timeline],
  );

  const toggle = useCallback(() => {
    if (!timeline) return;
    // Досмотрели — «играть» начинает сначала.
    if (!playing && timeRef.current >= timeline.duration) seek(0);
    setPlaying((p) => !p);
  }, [playing, timeline, seek]);

  return {
    time,
    playing,
    speed,
    skipPauses,
    skippedSec: playing ? skippedSec : null,
    toggle,
    pause: () => setPlaying(false),
    seek,
    setSpeed,
    setSkipPauses,
  };
}
