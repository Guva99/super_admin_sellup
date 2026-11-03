import { useCallback, useEffect, useState } from "react";
import { describeApiError } from "@/shared/api";
import { blogPostApi } from "../api/blogPostApi";
import type { BlogPostSummary } from "./types";

export interface BlogPostsState {
  posts: BlogPostSummary[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Все статьи — для списка «Лендинг → Статьи». Живут на странице, а не в
 * общем сторе: нужны только там.
 */
export function useBlogPosts(): BlogPostsState {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    blogPostApi.list().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setPosts(result.data);
        setError(null);
      } else setError(describeApiError(result.error));
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { posts, isLoading, error, reload };
}
