import { Plus } from "lucide-react";
import type { Client } from "@/entities/client";

export function ClientHistory({ client }: { client: Client }) {
  const entries = [
    { date: "06 сен 2026", icon: "📝", text: "Обсудили планы по расширению. Клиент интересуется дополнительным модулем аналитики.", author: client.manager },
    { date: "02 сен 2026", icon: "📞", text: "Звонок 25 мин. Разобрали вопросы по отчётам. Договорились провести онлайн-обучение.", author: "Мария С." },
    { date: "28 авг 2026", icon: "✉️", text: "Отправлено письмо с инструкцией по настройке интеграции.", author: client.manager },
    { date: "01 сен 2026", icon: "💳", text: "Получен платёж 70 000 ₽.", author: "Система" },
  ];
  return (
    <div className="max-w-[700px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">История общения</h3>
        <button className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600">
          <Plus size={12} />Добавить
        </button>
      </div>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
        <ul className="space-y-4">
          {entries.map((entry, i) => (
            <li key={i} className="relative pl-10">
              <div className="absolute left-2.5 top-3 w-3 h-3 rounded-full bg-white border-2 border-slate-300" />
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-700">{entry.icon} {entry.author}</span>
                  <span className="text-[11px] text-slate-400">{entry.date}</span>
                </div>
                <p className="text-sm text-slate-600">{entry.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
