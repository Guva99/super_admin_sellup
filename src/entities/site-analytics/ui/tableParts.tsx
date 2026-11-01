import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import type { ListQuery } from "../model/types";

/** Заголовок колонки, сортировка по которой идёт на сервере. Повторный клик меняет направление. */
export function SortHeader<TSort extends string>({
  label,
  sort,
  query,
  onChange,
  align = "right",
}: {
  label: string;
  sort: TSort;
  query: ListQuery<TSort>;
  onChange: (query: ListQuery<TSort>) => void;
  align?: "left" | "right";
}) {
  const active = query.sort === sort;
  const Arrow = query.direction === "asc" ? ArrowUp : ArrowDown;
  return (
    <th className={`px-3 py-2.5 font-medium ${align === "right" ? "text-right" : "text-left"}`} aria-sort={active ? (query.direction === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => onChange({ ...query, page: 1, sort, direction: active && query.direction === "desc" ? "asc" : "desc" })}
        className={`inline-flex items-center gap-1 hover:text-ink-700 ${active ? "text-ink-700" : ""}`}
      >
        {label}
        {active && <Arrow size={11} />}
      </button>
    </th>
  );
}

/** «1–50 из 132» и стрелки страниц. */
export function Pager<TSort extends string>({ total, query, onChange }: { total: number; query: ListQuery<TSort>; onChange: (query: ListQuery<TSort>) => void }) {
  const pages = Math.max(1, Math.ceil(total / query.limit));
  if (total <= query.limit) return null;
  const first = (query.page - 1) * query.limit + 1;
  const last = Math.min(total, query.page * query.limit);
  const button = "p-1.5 rounded-md border border-ink-200 text-ink-500 hover:bg-ink-50 disabled:opacity-40";
  return (
    <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-ink-100 text-xs text-ink-500">
      <span>
        {first}–{last} из {total}
      </span>
      <button type="button" aria-label="Предыдущая страница" disabled={query.page <= 1} onClick={() => onChange({ ...query, page: query.page - 1 })} className={button}>
        <ChevronLeft size={13} />
      </button>
      <button type="button" aria-label="Следующая страница" disabled={query.page >= pages} onClick={() => onChange({ ...query, page: query.page + 1 })} className={button}>
        <ChevronRight size={13} />
      </button>
    </div>
  );
}
