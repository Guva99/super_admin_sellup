import type { ToggleClientModulesController } from "../model/useToggleClientModules";

/** Блок «Модули админки» в карточке клиента. */
export function ClientModules({ controller }: { controller: ToggleClientModulesController }) {
  const { rows, isLoading, savingKey, error, canEdit, toggle } = controller;

  return (
    <div>
      <p className="text-[10px] text-ink-400 uppercase tracking-wide font-medium mb-2.5">Модули админки</p>
      {isLoading ? (
        <p className="text-xs text-ink-300">Загрузка…</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.key} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-ink-700">{row.title}</p>
                <p className="text-[10px] text-ink-400 truncate">{row.hint}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={row.on}
                aria-label={row.title}
                disabled={!canEdit || savingKey !== null}
                onClick={() => toggle(row.key)}
                className={`relative flex-shrink-0 w-8 h-[18px] rounded-full transition-colors disabled:opacity-50 ${
                  row.on ? "bg-brand-500" : "bg-ink-200"
                }`}
              >
                <span
                  className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform ${
                    row.on ? "translate-x-[14px]" : ""
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-[10px] text-ink-400 mt-2">Заказы и каталог есть всегда. Изменение видно в админке клиента в течение минуты.</p>
      {error && <p className="text-[10px] text-red-600 mt-1">{error}</p>}
    </div>
  );
}
