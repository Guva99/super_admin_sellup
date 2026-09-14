import { useState } from "react";
import { EMPTY_FILTERS, hasActiveFilters, type TaskFilters } from "./filterTasks";

export interface BoardFiltersController {
  filters: TaskFilters;
  isActive: boolean;
  setQuery: (query: string) => void;
  toggleMember: (id: string) => void;
  patch: (patch: Partial<TaskFilters>) => void;
  reset: () => void;
}

/** Состояние тулбара доски. Живёт, пока открыта страница задач. */
export function useBoardFilters(): BoardFiltersController {
  const [filters, setFilters] = useState<TaskFilters>(EMPTY_FILTERS);
  return {
    filters,
    isActive: hasActiveFilters(filters),
    setQuery: (query) => setFilters((prev) => ({ ...prev, query })),
    toggleMember: (id) =>
      setFilters((prev) => ({
        ...prev,
        memberIds: prev.memberIds.includes(id) ? prev.memberIds.filter((m) => m !== id) : [...prev.memberIds, id],
      })),
    patch: (next) => setFilters((prev) => ({ ...prev, ...next })),
    reset: () => setFilters(EMPTY_FILTERS),
  };
}
