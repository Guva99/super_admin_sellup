export interface TabItem<TId extends string> {
  id: TId;
  label: string;
  count?: number;
}

interface TabsProps<TId extends string> {
  tabs: readonly TabItem<TId>[];
  active: TId;
  onChange: (id: TId) => void;
}

/** Компактные табы-таблетки, как переключатель разделов в «Настройках». */
export function Tabs<TId extends string>({ tabs, active, onChange }: TabsProps<TId>) {
  return (
    <div role="tablist" className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            active === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && <span className="ml-1 text-[10px] text-slate-400">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}
