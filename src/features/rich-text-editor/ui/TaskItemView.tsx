import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

/**
 * Пункт чек-листа. Свой node view вместо встроенного ради одного: галочка
 * должна ставиться и в режиме чтения — как в Jira, без входа в правку.
 * Встроенный TaskItem в read-only документ не меняет; `updateAttributes`
 * меняет его напрямую, и изменение уходит наверх через onUpdate.
 */
export function TaskItemView({ node, updateAttributes }: NodeViewProps) {
  const checked = Boolean(node.attrs.checked);
  return (
    <NodeViewWrapper as="li" data-type="taskItem" data-checked={checked} className="flex items-start gap-2">
      <label contentEditable={false} className="flex-shrink-0 mt-[0.2rem] leading-none">
        <input type="checkbox" checked={checked} onChange={(e) => updateAttributes({ checked: e.target.checked })} className="accent-brand-500 cursor-pointer" />
      </label>
      <NodeViewContent as="div" className={`flex-1 min-w-0 ${checked ? "text-slate-400 line-through" : ""}`} />
    </NodeViewWrapper>
  );
}
