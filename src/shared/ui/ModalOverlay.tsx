import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ModalOverlayProps {
  children: ReactNode;
  onClose: () => void;
  /**
   * Несохранённые изменения, о которых знает сам владелец окна (форма целиком).
   * Вложенные поля отмечаются через `useUnsavedGuard` — они внутри и видят
   * контекст, а владелец рендерит ModalOverlay и до контекста не дотягивается.
   */
  unsaved?: boolean;
}

/**
 * Кто внутри окна сейчас держит несохранённый текст. Поля живут в разных
 * компонентах (описание, комментарий, форма), а знать о них должно окно —
 * поэтому они отмечаются здесь, а не прокидываются пропами наверх.
 */
interface ModalGuard {
  mark: (id: string, unsaved: boolean) => void;
  /** Закрыть окно, спросив, если внутри осталось несохранённое. */
  tryClose: () => void;
}

const UnsavedContext = createContext<ModalGuard | null>(null);

/**
 * Пометить, что в этом поле есть несохранённые изменения. Пока помечено хоть
 * одно, окно не закроется молча — ни по клику мимо, ни по Esc.
 */
export function useUnsavedGuard(id: string, unsaved: boolean): void {
  const guard = useContext(UnsavedContext);
  const mark = guard?.mark;
  useEffect(() => {
    if (!mark) return;
    mark(id, unsaved);
    return () => mark(id, false);
  }, [mark, id, unsaved]);
}

/**
 * Закрытие окна кнопкой внутри него (крестик в шапке): проходит через ту же
 * проверку, что клик мимо и Esc, — иначе несохранённый текст утекал бы через
 * самый очевидный путь.
 */
export function useModalClose(fallback: () => void): () => void {
  const guard = useContext(UnsavedContext);
  return guard?.tryClose ?? fallback;
}

/**
 * Подложка модального окна: закрывает по клику мимо и по Esc, но сначала
 * спрашивает, если внутри остался набранный и не сохранённый текст —
 * случайный клик мимо не должен стирать работу.
 * Esc обрабатывается здесь, а не в каждой модалке отдельно — так любое
 * новое окно получает это поведение бесплатно.
 */
export function ModalOverlay({ children, onClose, unsaved: ownerUnsaved = false }: ModalOverlayProps) {
  const unsaved = useRef(new Set<string>());
  const [asking, setAsking] = useState(false);

  const mark = useCallback((id: string, isUnsaved: boolean) => {
    if (isUnsaved) unsaved.current.add(id);
    else unsaved.current.delete(id);
  }, []);

  const tryClose = useCallback(() => {
    if (ownerUnsaved || unsaved.current.size > 0) setAsking(true);
    else onClose();
  }, [onClose, ownerUnsaved]);

  const guard = useMemo<ModalGuard>(() => ({ mark, tryClose }), [mark, tryClose]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Подтверждение поверх окна закрывается первым.
      if (asking) {
        setAsking(false);
        return;
      }
      tryClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [tryClose, asking]);

  // Закрытие вкладки с несохранённым текстом — браузер спросит сам.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (ownerUnsaved || unsaved.current.size > 0) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [ownerUnsaved]);

  return (
    <UnsavedContext.Provider value={guard}>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16" onClick={tryClose}>
        <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm" />
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>

        {asking && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/30" onClick={(e) => e.stopPropagation()}>
            <div className="w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-start gap-3 p-5">
                <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 leading-relaxed">
                  <p className="text-sm font-semibold text-slate-900 mb-1">Закрыть без сохранения?</p>
                  <p>Набранное не сохранено. Оно останется черновиком и подставится, когда вы вернётесь.</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setAsking(false)}
                  className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition-colors"
                >
                  Продолжить правку
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAsking(false);
                    onClose();
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </UnsavedContext.Provider>
  );
}
