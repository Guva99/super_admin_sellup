import type { ReactNode } from "react";
import { CreditCard, ExternalLink, Rocket, Route, SquareCheck } from "lucide-react";
import { UserAvatar } from "@/shared/ui";
import { formatAmount } from "@/shared/lib";
import type { ClientHistoryEvent, ClientHistoryTask } from "../model/types";

/** Подписи значений и полей в обозначениях бэкенда даёт виджет: сущности друг друга не импортируют. */
export interface ClientHistoryFormatters {
  value: (field: string, value: string) => string;
  field: (field: string) => string;
}

interface ClientHistoryEventProps {
  event: ClientHistoryEvent;
  format: ClientHistoryFormatters;
  formatTime: (iso: string) => string;
  /** Открыть задачу; для удалённых задач не вызывается. */
  onOpenTask?: (id: string) => void;
}

const EMPTY = "—";

/** Строка истории бизнеса: «Гуванч · внёс платёж 70 000 ₽ · 5 мин назад». */
export function ClientHistoryEventRow({ event, format, formatTime, onOpenTask }: ClientHistoryEventProps) {
  return (
    <div className="flex gap-2.5">
      <UserAvatar name={event.actorName} size="sm" className="mt-0.5" />
      <div className="flex-1 min-w-0 text-xs leading-relaxed">
        <span className="font-semibold text-slate-700">{event.actorName}</span>
        <span className="text-slate-400"> · </span>
        <Description event={event} format={format} onOpenTask={onOpenTask} />
        <span className="text-slate-400"> · {formatTime(event.at)}</span>
      </div>
    </div>
  );
}

function TaskRef({ task, onOpenTask }: { task: ClientHistoryTask; onOpenTask?: (id: string) => void }) {
  const label = (
    <>
      <span className="font-mono text-[11px] text-slate-500">{task.key || "задача"}</span>
      {task.title && <span className="text-slate-700"> «{task.title}»</span>}
    </>
  );
  if (!task.exists || !onOpenTask) return <span className={task.exists ? "" : "line-through text-slate-400"}>{label}</span>;
  return (
    <button type="button" onClick={() => onOpenTask(task.id)} className="inline-flex items-center gap-0.5 hover:text-brand-600 group">
      {label}
      <ExternalLink size={9} className="text-slate-300 group-hover:text-brand-400" />
    </button>
  );
}

function Change({ from, to }: { from: string; to: string }) {
  return (
    <>
      <span className="text-slate-400 line-through">{from || EMPTY}</span> <span className="text-slate-400">→</span> <span className="text-slate-800 font-medium">{to || EMPTY}</span>
    </>
  );
}

function Icon({ children }: { children: ReactNode }) {
  return <span className="inline-flex align-middle mr-1 text-slate-400">{children}</span>;
}

function Description({ event, format, onOpenTask }: { event: ClientHistoryEvent; format: ClientHistoryFormatters; onOpenTask?: (id: string) => void }) {
  const { action, field, oldValue, newValue, details } = event;
  const task = event.task ? <TaskRef task={event.task} onOpenTask={onOpenTask} /> : null;
  const change = <Change from={format.value(field, oldValue)} to={format.value(field, newValue)} />;
  const amount = typeof details.amount === "number" ? formatAmount(details.amount) : String(details.amount ?? "");
  const text = (s: string) => <span className="text-slate-600">{s}</span>;

  switch (action) {
    case "client.created":
      return text("бизнес подключён");
    case "client.lead_submitted":
      return text("заявка с сайта");
    case "client.deleted":
      return text("бизнес удалён");
    case "client.stage_changed":
      return (
        <>
          <Icon>
            <Route size={11} />
          </Icon>
          {text("перемещён в воронке: ")}
          {change}
        </>
      );
    case "client.updated":
      return field === "status" ? (
        <>
          {text("статус: ")}
          {change}
        </>
      ) : (
        text("данные бизнеса изменены")
      );
    case "client.onboarding_step.updated":
      return (
        <>
          <Icon>
            <Rocket size={11} />
          </Icon>
          {text(`этап онбординга «${String(details.title ?? "")}»: `)}
          <span className="text-slate-800 font-medium">{format.value("stepStatus", String(details.status ?? ""))}</span>
        </>
      );
    case "client.task_key_changed":
      return (
        <>
          {text("ключ задач: ")}
          {change}
        </>
      );
    case "client.payment_recorded":
      return (
        <>
          <Icon>
            <CreditCard size={11} />
          </Icon>
          {text("внесён платёж ")}
          <span className="text-emerald-700 font-semibold">{amount}</span>
          {details.description ? text(` — ${String(details.description)}`) : null}
          {details.receipt ? text(", с чеком") : null}
        </>
      );
    case "client.payment_deleted":
      return (
        <>
          {text("удалён платёж ")}
          <span className="text-slate-800 font-medium line-through">{amount}</span>
        </>
      );
    case "subscription.updated":
      return field ? (
        <>
          {text("подписка: ")}
          {change}
        </>
      ) : (
        text("подписка изменена")
      );
    case "onboarding.updated":
      return (
        <>
          {text("стадия онбординга: ")}
          {change}
        </>
      );
    case "client.feature.updated":
      return text(`функция ${String(details.feature ?? "")}: ${String(details.state ?? "")}`);
    case "client_user.created":
      return text(`добавлен пользователь клиента ${String(details.email ?? "")}`);

    case "task.created":
      return (
        <>
          <Icon>
            <SquareCheck size={11} />
          </Icon>
          {text("создана задача ")}
          {task}
        </>
      );
    case "task.deleted":
      return (
        <>
          {text("удалена задача ")}
          {task}
        </>
      );
    case "task.updated":
    case "task.status_changed":
      if (field === "status")
        return (
          <>
            {text("задача ")}
            {task}
            {text(" перенесена: ")}
            {change}
          </>
        );
      if (field === "assignee")
        return (
          <>
            {text("задача ")}
            {task}
            {text(": исполнитель ")}
            {change}
          </>
        );
      if (field === "description")
        return (
          <>
            {text("задача ")}
            {task}
            {text(": изменено описание")}
          </>
        );
      return (
        <>
          {text("задача ")}
          {task}
          {text(`: ${format.field(field).toLowerCase()} `)}
          {change}
        </>
      );
    case "task.comment.created":
      return (
        <>
          {text("комментарий к задаче ")}
          {task}
        </>
      );
    case "task.comment.updated":
      return (
        <>
          {text("изменён комментарий к задаче ")}
          {task}
        </>
      );
    case "task.comment.deleted":
      return (
        <>
          {text("удалён комментарий к задаче ")}
          {task}
        </>
      );
    case "task.files_uploaded":
      return (
        <>
          {text("к задаче ")}
          {task}
          {text(` приложены файлы: ${Array.isArray(details.files) ? details.files.join(", ") : ""}`)}
        </>
      );
    default:
      // Неизвестное действие показываем как есть — лучше сырое имя, чем пропуск.
      return <span className="font-mono text-[11px] text-slate-500">{action}</span>;
  }
}
