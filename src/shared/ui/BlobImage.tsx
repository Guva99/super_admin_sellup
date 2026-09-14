import { useEffect, useState } from "react";
import type { Result } from "../api/result";

interface BlobImageProps {
  /**
   * Запрос содержимого — с токеном, сам компонент про API не знает. Должен быть
   * стабильным (useCallback): при смене функции картинка скачивается заново.
   */
  load: () => Promise<Result<Blob>>;
  alt: string;
  className: string;
}

/**
 * Картинка, которую нельзя отдать обычным <img src>: файлы API требуют токен
 * в заголовке. Содержимое скачивается и показывается как Blob; клик открывает
 * его в новой вкладке.
 */
export function BlobImage({ load, alt, className }: BlobImageProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    load().then((result) => {
      if (!result.ok || cancelled) return;
      objectUrl = URL.createObjectURL(result.data);
      setUrl(objectUrl);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [load]);

  if (!url) return <div className={`${className} bg-slate-100 animate-pulse`} />;
  return <img src={url} alt={alt} className={className} onClick={() => window.open(url, "_blank")} />;
}
