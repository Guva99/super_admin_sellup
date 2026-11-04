/**
 * Статья блога лендинга. Формат — как у бэкенда (`/blog/posts`), маппер не
 * нужен. Текст — документ редактора (Tiptap JSON): бэкенд пропускает в нём
 * только то, что умеет нарисовать сайт (backend/internal/service/blog_content.go).
 */

export type BlogPostStatus = "draft" | "published";

export interface BlogFaqItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  /** Адрес на сайте: /blog/<slug>. */
  slug: string;
  /** H1 страницы. */
  title: string;
  /** Пусто — сайт возьмёт заголовок. */
  seoTitle: string;
  /** Пусто — сайт возьмёт анонс. */
  seoDescription: string;
  rubric: string;
  excerpt: string;
  coverImageId: string | null;
  /** Живая обложка сайта вместо картинки (BLOG_SCENES); пусто — картинка. */
  coverScene: string;
  content: unknown;
  faq: BlogFaqItem[];
  author: string;
  readingMinutes: number;
  status: BlogPostStatus;
  /** Первая публикация; null — ещё не публиковалась. */
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BlogPostSummary = Pick<
  BlogPost,
  "id" | "slug" | "title" | "rubric" | "excerpt" | "coverImageId" | "coverScene" | "author" | "readingMinutes" | "status" | "publishedAt" | "updatedAt"
>;

/** Всё, что правит консоль; статус меняют publish / unpublish. */
export type BlogPostInput = Pick<
  BlogPost,
  "slug" | "title" | "seoTitle" | "seoDescription" | "rubric" | "excerpt" | "coverImageId" | "coverScene" | "content" | "faq" | "author"
>;

export interface BlogImage {
  id: string;
  contentType: string;
  size: number;
  createdAt: string;
}
