/** Чек к платежу — метаданные; содержимое скачивается отдельно. */
export interface PaymentReceipt {
  name: string;
  contentType: string;
  size: number;
}

/** Платёж, внесённый вручную (`Payment` в Swagger). */
export interface Payment {
  id: string;
  clientId: string;
  amount: number;
  /** Календарная дата YYYY-MM-DD. */
  paidAt: string;
  description: string;
  receipt: PaymentReceipt | null;
  recordedBy: string;
  recordedByName: string;
  createdAt: string;
}

export interface NewPaymentInput {
  amount: number;
  paidAt: string;
  description: string;
  receipt: File | null;
}

/** Чек — фото, скриншот или PDF; лимит тот же, что у файлов задач. */
export const RECEIPT_ACCEPT = ".png,.jpg,.jpeg,.gif,.webp,.bmp,.heic,.pdf";
const RECEIPT_EXTENSIONS = RECEIPT_ACCEPT.split(",");
const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;

/** Текст ошибки для пользователя или null, если чек подходит. */
export function receiptError(file: File): string | null {
  const name = file.name.toLowerCase();
  if (!RECEIPT_EXTENSIONS.some((ext) => name.endsWith(ext))) return "Чек — картинка или PDF";
  if (file.size > MAX_RECEIPT_BYTES) return "Чек больше 10 МБ";
  return null;
}

export const isImageReceipt = (receipt: PaymentReceipt): boolean => receipt.contentType.startsWith("image/");
