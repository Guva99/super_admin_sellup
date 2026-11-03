import { SLUG_MAX } from "./config";

/**
 * Транслит для адреса статьи — тот же, что у Яндекса в адресах: ц → c,
 * х → h, й → y. «ИИ-продавец для магазина» → ii-prodavec-dlya-magazina.
 */
const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

/** Адрес из заголовка: латиница, цифры, дефисы; длинный обрезается по слову. */
export function slugify(title: string): string {
  const latin = [...title.toLowerCase()].map((ch) => TRANSLIT[ch] ?? ch).join("");
  const words = latin.split(/[^a-z0-9]+/).filter(Boolean);
  let slug = "";
  for (const word of words) {
    const next = slug ? `${slug}-${word}` : word;
    if (next.length > 60) break;
    slug = next;
  }
  return slug || words[0]?.slice(0, SLUG_MAX) || "";
}

/** Ввод в поле адреса: только то, что примет бэкенд, без двойных дефисов. */
export function normaliseSlugInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-/, "")
    .slice(0, SLUG_MAX);
}

/** Текст ошибки адреса или null. */
export function slugError(slug: string): string | null {
  if (slug === "") return "Укажите адрес";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return "Адрес — латиница, цифры и дефисы, без дефиса в конце";
  return null;
}
