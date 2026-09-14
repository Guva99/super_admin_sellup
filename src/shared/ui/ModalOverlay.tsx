import { useEffect, type ReactNode } from "react";

interface ModalOverlayProps {
  children: ReactNode;
  onClose: () => void;
}

/**
 * Подложка модального окна: закрывает по клику мимо и по Esc.
 * Esc обрабатывается здесь, а не в каждой модалке отдельно — так любое
 * новое окно получает это поведение бесплатно.
 */
export function ModalOverlay({ children, onClose }: ModalOverlayProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm" />
      <div className="relative" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
