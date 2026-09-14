import { Link } from "react-router-dom";

/** Неизвестный URL — раньше такого состояния не существовало, потому что
 *  навигация жила в useState и адресной строки не касалась. */
export function NotFoundPage() {
  return (
    <div className="p-10">
      <h2 className="text-sm font-semibold text-slate-900">Страница не найдена</h2>
      <p className="mt-1.5 text-xs text-slate-500">Проверьте адрес — такого раздела нет.</p>
      <Link to="/" className="mt-4 inline-block text-xs font-medium text-brand-500 hover:text-brand-600">
        ← На дашборд
      </Link>
    </div>
  );
}
