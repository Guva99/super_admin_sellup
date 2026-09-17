import { useEffect } from "react";
import { X } from "lucide-react";

interface LightboxProps {
  /** Адрес картинки (blob-URL); null — лайтбокс закрыт. */
  src: string | null;
  alt?: string;
  onClose: () => void;
}

/** Картинка во весь экран поверх всего; закрывается по клику мимо, крестику и Esc. */
export function Lightbox({ src, alt = "", onClose }: LightboxProps) {
  useEffect(() => {
    if (!src) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Иначе Esc закроет и модалку задачи под лайтбоксом.
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [src, onClose]);

  if (!src) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/85 p-6" onClick={onClose}>
      <button type="button" onClick={onClose} aria-label="Закрыть" className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10">
        <X size={20} />
      </button>
      <img src={src} alt={alt} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
