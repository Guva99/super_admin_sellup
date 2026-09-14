/** Ключ задачи «SC-4» — моноширинный, чтобы читался как идентификатор. */
export function TaskKey({ value, className = "" }: { value: string; className?: string }) {
  return <span className={`font-mono text-[11px] text-slate-500 tracking-tight ${className}`}>{value}</span>;
}
