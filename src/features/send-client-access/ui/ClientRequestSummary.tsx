import { CLIENT_SECTION_LABEL, type ClientRequest } from "@/entities/client";

/** Что бизнес просил в заявке на лендинге — с этого начинается созвон. */
export function ClientRequestSummary({ request }: { request: ClientRequest }) {
  // Сайт показываем отдельной строкой, а не ещё одним разделом.
  const sections = request.sections.filter((key) => key !== "SITE_BUILDER");

  return (
    <div>
      <p className="text-[10px] text-ink-400 uppercase tracking-wide font-medium mb-2.5">Заявка</p>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-ink-400">Сайт</span>
          <span className="text-ink-700 font-medium">
            {request.needsSite === null ? "—" : request.needsSite ? "Нужен" : "Не нужен"}
          </span>
        </div>
        <div>
          <p className="text-ink-400 mb-1">Разделы</p>
          {sections.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {sections.map((key) => (
                <span key={key} className="px-1.5 py-0.5 rounded bg-ink-100 text-ink-600 text-[10px] font-medium">
                  {CLIENT_SECTION_LABEL[key] ?? key}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-ink-700 font-medium">—</p>
          )}
        </div>
        {request.message && <p className="text-ink-500 whitespace-pre-line break-words">{request.message}</p>}
      </div>
    </div>
  );
}
