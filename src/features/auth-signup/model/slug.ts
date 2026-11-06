const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

/**
 * Адрес из названия бизнеса: «Кофе & Чай» → kofe-chay. Только подсказка —
 * правила (3–30 латинских букв, цифр и дефисов) проверяет сервер.
 */
export function slugFromName(name: string): string {
  const latin = [...name.toLowerCase()].map((ch) => TRANSLIT[ch] ?? ch).join("");
  return latin
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30)
    .replace(/-+$/g, "");
}

/** То же правило, что у сервера, — чтобы не спрашивать его о заведомо неверном. */
export const isWellFormedSlug = (slug: string) =>
  slug.length >= 3 && slug.length <= 30 && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug) && !slug.includes("--");
