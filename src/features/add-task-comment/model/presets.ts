/** Быстрые заготовки — вставляются в поле комментария по клику. */
export interface CommentPreset {
  emoji: string;
  text: string;
}

export const COMMENT_PRESETS: CommentPreset[] = [
  { emoji: "🎉", text: "Выглядит отлично!" },
  { emoji: "👋", text: "Нужна помощь?" },
  { emoji: "🛑", text: "Заблокировано: " },
  { emoji: "🔍", text: "Можешь уточнить: " },
  { emoji: "✅", text: "Готово, проверьте." },
];
