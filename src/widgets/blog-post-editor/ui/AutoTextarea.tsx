import { useLayoutEffect, useRef, type TextareaHTMLAttributes } from "react";

/** Поле, которое растёт вместе с текстом: заголовок и ответы не прячутся под прокруткой. */
export function AutoTextarea({ value, className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { value: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return <textarea ref={ref} rows={1} value={value} className={`resize-none overflow-hidden ${className}`} {...props} />;
}
