import { apiFetch, apiUpload, type Result } from "@/shared/api";
import type { BlogImage, BlogPost, BlogPostInput, BlogPostSummary } from "../model/types";

/** Ответы бэкенда совпадают с моделью — маппер не нужен. Все ручки — Owner/Admin. */
export const blogPostApi = {
  list: (): Promise<Result<BlogPostSummary[]>> => apiFetch("/blog/posts"),

  get: (id: string): Promise<Result<BlogPost>> => apiFetch(`/blog/posts/${id}`),

  create: (input: BlogPostInput): Promise<Result<BlogPost>> => apiFetch("/blog/posts", { method: "POST", body: input }),

  /** Опубликованная статья меняется на сайте сразу. */
  update: (id: string, input: BlogPostInput): Promise<Result<BlogPost>> => apiFetch(`/blog/posts/${id}`, { method: "PUT", body: input }),

  publish: (id: string): Promise<Result<BlogPost>> => apiFetch(`/blog/posts/${id}/publish`, { method: "POST" }),

  unpublish: (id: string): Promise<Result<BlogPost>> => apiFetch(`/blog/posts/${id}/unpublish`, { method: "POST" }),

  remove: (id: string): Promise<Result<void>> => apiFetch(`/blog/posts/${id}`, { method: "DELETE" }),

  uploadImage: (file: File, onProgress?: (share: number) => void): Promise<Result<BlogImage>> => {
    const form = new FormData();
    form.append("file", file, file.name);
    return apiUpload("/blog/images", form, { onProgress });
  },
};
