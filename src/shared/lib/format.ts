export function formatMoney(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M ₽`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k ₽`;
  return `${amount} ₽`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

/**
 * Сохранить файл на диск. Файлы приходят из API с токеном в заголовке, поэтому
 * обычная ссылка на адрес API не подходит — скачиваем Blob и отдаём его.
 */
export function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  // Даём браузеру начать скачивание до освобождения ссылки.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
