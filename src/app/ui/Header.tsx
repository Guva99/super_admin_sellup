import { Search, Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  onOpenSearch: () => void;
}

export function Header({ title, onOpenSearch }: HeaderProps) {
  return (
    <header className="h-[49px] bg-surface border-b border-ink-200 flex items-center px-5 gap-3 flex-shrink-0">
      <h1 className="text-sm font-semibold text-ink-900 flex-1">{title}</h1>
      <button
        onClick={onOpenSearch}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-ink-200 text-ink-400 text-xs hover:border-ink-300 hover:text-ink-600 transition-colors"
      >
        <Search size={12} /><span>Поиск</span>
        <kbd className="ml-1 px-1 py-0.5 text-[10px] bg-ink-50 border border-ink-200 rounded font-mono">⌘K</kbd>
      </button>
      <button className="text-ink-500 hover:text-ink-700 p-1.5 rounded-md hover:bg-ink-50 transition-colors">
        <Bell size={16} />
      </button>
    </header>
  );
}
