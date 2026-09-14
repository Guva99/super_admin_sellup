/**
 * История общения с клиентом. Записи будут храниться в бэкенде — до тех пор
 * показывать выдуманные звонки и письма нельзя.
 */
export function ClientHistory() {
  return (
    <div className="max-w-[700px]">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">История общения</h3>
      <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center">
        <p className="text-sm text-slate-400">Истории пока нет</p>
      </div>
    </div>
  );
}
