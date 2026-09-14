import { useCallback } from "react";
import { FileText, Image as ImageIcon } from "lucide-react";
import type { Result } from "@/shared/api";
import { BlobImage } from "@/shared/ui";
import { formatBytes, saveBlob } from "@/shared/lib";
import { isImageReceipt, type PaymentReceipt } from "../model/types";

interface ReceiptPreviewProps {
  receipt: PaymentReceipt;
  paymentId: string;
  /** `downloadReceipt` из `usePayments` — стабилен, поэтому картинка не перекачивается на каждый рендер. */
  download: (paymentId: string) => Promise<Result<Blob>>;
}

/** Миниатюра чека-картинки (клик — открыть) или кнопка скачать PDF. */
export function ReceiptPreview({ receipt, paymentId, download }: ReceiptPreviewProps) {
  const load = useCallback(() => download(paymentId), [download, paymentId]);

  if (isImageReceipt(receipt)) {
    return <BlobImage load={load} alt={receipt.name} className="h-10 w-14 object-cover rounded border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity" />;
  }
  return (
    <button
      type="button"
      onClick={async () => {
        const result = await load();
        if (result.ok) saveBlob(result.data, receipt.name);
      }}
      title={`${receipt.name} · ${formatBytes(receipt.size)}`}
      className="flex items-center gap-1 text-[11px] text-brand-500 hover:underline"
    >
      <FileText size={11} />
      PDF
    </button>
  );
}

export function NoReceipt() {
  return (
    <span className="flex items-center gap-1 text-[11px] text-slate-300">
      <ImageIcon size={11} />
      нет
    </span>
  );
}
