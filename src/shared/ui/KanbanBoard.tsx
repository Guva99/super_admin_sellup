import { Fragment, useState, type ReactNode } from "react";

export interface KanbanColumn<TId extends string = string> {
  id: TId;
  label: string;
  description?: string;
  accent?: string;
}

/** Пропсы, которые карточка обязана раскрыть на своём корневом элементе. */
export interface KanbanCardHandlers {
  draggable: true;
  onDragStart: () => void;
  onDragEnd: () => void;
}

interface KanbanBoardProps<TItem, TId extends string> {
  columns: readonly KanbanColumn<TId>[];
  items: readonly TItem[];
  getItemId: (item: TItem) => string;
  getItemColumn: (item: TItem) => TId | null;
  onMove: (itemId: string, columnId: TId) => void;
  renderCard: (item: TItem, handlers: KanbanCardHandlers, isDragging: boolean) => ReactNode;
  renderColumnHeader: (column: KanbanColumn<TId>, count: number) => ReactNode;
  renderEmptyColumn?: (column: KanbanColumn<TId>, isDragOver: boolean) => ReactNode;
  /** Низ колонки — например, кнопка «Создать». */
  renderColumnFooter?: (column: KanbanColumn<TId>) => ReactNode;
  /**
   * Обёртка доски. По умолчанию доска занимает всю высоту страницы и
   * скроллится по горизонтали; секция внутри группы задаёт свои отступы.
   */
  wrapperClassName?: string;
  /** Ширина колонки, например "w-72". */
  columnClassName?: string;
  /** Отступ между колонками, например "gap-4". */
  boardClassName?: string;
  /** Отступы списка карточек, например "px-3 pb-3 min-h-[60px]". */
  listClassName?: string;
}

/**
 * Доска с перетаскиванием карточек между колонками.
 * Владеет только drag-состоянием; что такое карточка и колонка — решает потребитель.
 */
export function KanbanBoard<TItem, TId extends string>({
  columns,
  items,
  getItemId,
  getItemColumn,
  onMove,
  renderCard,
  renderColumnHeader,
  renderEmptyColumn,
  renderColumnFooter,
  wrapperClassName = "flex-1 overflow-x-auto overflow-y-hidden p-5",
  columnClassName = "w-72",
  boardClassName = "gap-4",
  listClassName = "px-3 pb-3 min-h-[60px]",
}: KanbanBoardProps<TItem, TId>) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TId | null>(null);

  const resetDrag = () => {
    setDraggingId(null);
    setDragOverCol(null);
  };

  const handleDrop = (columnId: TId) => {
    if (draggingId) onMove(draggingId, columnId);
    resetDrag();
  };

  return (
    <div className={wrapperClassName}>
      <div className={`flex h-full min-w-fit ${boardClassName}`}>
        {columns.map((col) => {
          const colItems = items.filter((item) => getItemColumn(item) === col.id);
          const isDragOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              className={`flex flex-col flex-shrink-0 rounded-xl transition-colors ${columnClassName} ${
                isDragOver ? "bg-brand-50/60" : "bg-slate-100/60"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverCol(col.id);
              }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={() => handleDrop(col.id)}
            >
              {renderColumnHeader(col, colItems.length)}

              <div className={`flex-1 overflow-y-auto space-y-2 ${listClassName}`}>
                {colItems.map((item) => {
                  const id = getItemId(item);
                  const handlers: KanbanCardHandlers = {
                    draggable: true,
                    onDragStart: () => setDraggingId(id),
                    onDragEnd: resetDrag,
                  };
                  return (
                    <Fragment key={id}>
                      {renderCard(item, handlers, draggingId === id)}
                    </Fragment>
                  );
                })}

                {colItems.length === 0 && renderEmptyColumn?.(col, isDragOver)}
              </div>

              {renderColumnFooter?.(col)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
