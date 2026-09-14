import { useState } from "react";
import type { Task } from "@/entities/task";
import { HistoryEvent, type HistoryValueFormatter, type TaskHistoryState } from "@/entities/task-history";
import { CommentComposer, useAddTaskComment } from "@/features/add-task-comment";
import { CommentList, useEditTaskComment } from "@/features/edit-task-comment";
import { Tabs } from "@/shared/ui";

type ActivityTab = "all" | "comments" | "history";

interface ActivitySectionProps {
  task: Task;
  history: TaskHistoryState;
  currentUserName: string;
  formatHistoryValue: HistoryValueFormatter;
  formatTime: (iso: string) => string;
}

/**
 * Активность: «Все» — комментарии и история одной лентой по времени,
 * остальные табы — по отдельности. «Журнал работ» появится на этапе 3.
 */
export function ActivitySection({ task, history, currentUserName, formatHistoryValue, formatTime }: ActivitySectionProps) {
  const [tab, setTab] = useState<ActivityTab>("all");
  const composer = useAddTaskComment(task.id);
  const editor = useEditTaskComment(task.id);

  const tabs = [
    { id: "all" as const, label: "Все" },
    { id: "comments" as const, label: "Комментарии", count: task.comments.length },
    { id: "history" as const, label: "История", count: history.events.length },
  ];

  // Записи истории «добавлен комментарий» дублируют сами комментарии в общей ленте.
  const historyWithoutComments = history.events.filter((e) => e.type !== "comment");

  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Активность</h2>
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
      </div>

      {tab !== "history" && (
        <div className="mb-4">
          <CommentComposer controller={composer} authorName={currentUserName} />
        </div>
      )}

      {tab === "comments" && <CommentList taskId={task.id} comments={task.comments} controller={editor} formatTime={formatTime} />}

      {tab === "history" && <HistoryList history={history} formatValue={formatHistoryValue} formatTime={formatTime} />}

      {tab === "all" && (
        <div className="space-y-3">
          {[...task.comments.map((c) => ({ at: c.createdAt, node: <CommentList taskId={task.id} comments={[c]} controller={editor} formatTime={formatTime} /> })),
            ...historyWithoutComments.map((e) => ({ at: e.at, node: <HistoryEvent event={e} formatValue={formatHistoryValue} formatTime={formatTime} /> }))]
            .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
            .map((item, i) => <div key={i}>{item.node}</div>)}
          {task.comments.length === 0 && historyWithoutComments.length === 0 && !history.isLoading && (
            <p className="text-xs text-slate-400">Пока ничего не происходило</p>
          )}
        </div>
      )}
    </section>
  );
}

function HistoryList({ history, formatValue, formatTime }: { history: TaskHistoryState; formatValue: HistoryValueFormatter; formatTime: (iso: string) => string }) {
  if (history.isLoading) return <p className="text-xs text-slate-400">Загрузка истории…</p>;
  if (history.error) return <p className="text-xs text-red-600">Не удалось загрузить историю: {history.error}</p>;
  if (history.events.length === 0) return <p className="text-xs text-slate-400">Истории пока нет</p>;
  return (
    <div className="space-y-2.5">
      {[...history.events].reverse().map((event) => (
        <HistoryEvent key={event.id} event={event} formatValue={formatValue} formatTime={formatTime} />
      ))}
    </div>
  );
}
