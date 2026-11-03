import { API_URL } from "@/shared/api";

/** Сайт, на котором выходит блог: ссылки «Открыть на сайте» и превью сниппета. */
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "https://sellup-system.online").replace(/\/$/, "");

export const blogPostUrl = (slug: string) => `${SITE_URL}/blog/${slug}`;

/**
 * Сколько видят поисковики: длиннее они обрежут. Это подсказка, а не запрет —
 * жёсткие пределы бэкенда шире (120 и 320).
 */
export const SEO_TITLE_LIMIT = 60;
export const SEO_DESCRIPTION_LIMIT = 160;
export const SEO_TITLE_MAX = 120;
export const SEO_DESCRIPTION_MAX = 320;
export const TITLE_MAX = 200;
export const EXCERPT_MAX = 600;
export const SLUG_MAX = 100;
export const FAQ_MAX = 30;

/**
 * Живые обложки — сцены, которые рисует сайт (sellup_web, pages/blog/scenes) вместо
 * картинки. Тот же список в бэкенде (service/blog.go, blogScenes). Новая сцена — во всех трёх.
 */
export const BLOG_SCENES = [
  {
    id: "ai-seller-chat",
    label: "ИИ-продавец: переписка с покупателем",
    hint: "Слева шаги, справа телефон: покупатель спрашивает, ИИ отвечает, собирает заказ и передаёт менеджеру.",
  },
] as const;

/** Автор по умолчанию — так же подставляет бэкенд, если поле пустое. */
export const DEFAULT_AUTHOR = "Команда SellUp";

/** Картинка в тексте статьи — `blog-image:<id>`; на сайте она грузится по публичной ссылке. */
const IMAGE_PREFIX = "blog-image:";
export const blogImageRef = (id: string) => `${IMAGE_PREFIX}${id}`;
export const blogImageKey = (src: string): string | null => (src.startsWith(IMAGE_PREFIX) ? src.slice(IMAGE_PREFIX.length) : null);
export const blogImageUrl = (id: string) => `${API_URL}/public/blog/images/${id}`;

/** Как у бэкенда: только растровые картинки (SVG может нести скрипт) до 5 МБ. */
export const BLOG_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
export const BLOG_IMAGE_ACCEPT = BLOG_IMAGE_TYPES.join(",");
export const BLOG_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export function blogImageError(file: File): string | null {
  if (!BLOG_IMAGE_TYPES.includes(file.type)) return "Картинка — PNG, JPEG, WebP или GIF";
  if (file.size > BLOG_IMAGE_MAX_BYTES) return "Картинка больше 5 МБ";
  return null;
}
