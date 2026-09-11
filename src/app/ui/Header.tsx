import { Search, Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  onOpenSearch: () => void;
}

export function Header({ title, onOpenSearch }: HeaderProps) {
  return (
    <header className="h-[49px] bg-white border-b border-slate-200 flex items-center px-5 gap-3 flex-shrink-0">
      <h1 className="text-sm font-semibold text-slate-900 flex-1">{title}</h1>
      <button
        onClick={onOpenSearch}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 text-slate-400 text-xs hover:border-slate-300 hover:text-slate-600 transition-colors"
      >
        <Search size={12} /><span>Поиск</span>
        <kbd className="ml-1 px-1 py-0.5 text-[10px] bg-slate-50 border border-slate-200 rounded font-mono">⌘K</kbd>
      </button>
      <button className="relative text-slate-500 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-50 transition-colors">
        <Bell size={16} />
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">3</span>
      </button>
    </header>
  );
}
