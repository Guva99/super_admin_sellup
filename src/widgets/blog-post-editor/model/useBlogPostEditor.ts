import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { describeApiError } from "@/shared/api";
import { useDraft } from "@/shared/lib";
import {
  DEFAULT_AUTHOR,
  blogPostApi,
  describeBlogError,
  slugError,
  slugify,
  type BlogFaqItem,
  type BlogPost,
  type BlogPostInput,
} from "@/entities/blog-post";

/** Всё, что правится на экране статьи. Текст — документ редактора строкой JSON. */
export interface PostForm {
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  rubric: string;
  excerpt: string;
  coverImageId: string | null;
  content: string;
  faq: BlogFaqItem[];
  author: string;
}

const EMPTY_FORM: PostForm = {
  title: "",
  slug: "",
  seoTitle: "",
  seoDescription: "",
  rubric: "",
  excerpt: "",
  coverImageId: null,
  content: "",
  faq: [],
  author: DEFAULT_AUTHOR,
};

const formOf = (post: BlogPost): PostForm => ({
  title: post.title,
  slug: post.slug,
  seoTitle: post.seoTitle,
  seoDescription: post.seoDescription,
  rubric: post.rubric,
  excerpt: post.excerpt,
  coverImageId: post.coverImageId,
  content: JSON.stringify(post.content),
  faq: post.faq,
  author: post.author,
});

const inputOf = (form: PostForm): BlogPostInput => ({
  ...form,
  content: form.content ? (JSON.parse(form.content) as unknown) : { type: "doc", content: [] },
});

const sameForm = (a: PostForm, b: PostForm) => JSON.stringify(a) === JSON.stringify(b);

/** Черновик статьи пишется на сервер сам — через столько после последней правки. */
const AUTOSAVE_MS = 1500;

export type SaveState = "idle" | "saving" | "saved" | "error";

export interface BlogPostEditorController {
  /** null — ещё грузится или статьи нет (смотрите loadError). */
  post: BlogPost | null;
  isNew: boolean;
  isLoading: boolean;
  loadError: string | null;
  form: PostForm;
  update: (patch: Partial<PostForm>) => void;
  setTitle: (title: string) => void;
  setSlug: (slug: string) => void;
  /** Адрес снова собирается из заголовка. */
  resetSlug: () => void;
  slugTouched: boolean;
  dirty: boolean;
  saveState: SaveState;
  savedAt: Date | null;
  /** Ошибка сохранения или публикации — по-русски. */
  error: string | null;
  /** Почему сохранить пока нельзя; null — можно. */
  blocker: string | null;
  save: () => Promise<boolean>;
  publish: () => Promise<boolean>;
  unpublish: () => Promise<boolean>;
  remove: () => Promise<boolean>;
  /** Правки, не дошедшие до сервера (закрытая вкладка), подставлены из браузера. */
  restored: boolean;
  discardRestored: () => void;
}

interface Options {
  /** "new" — новая статья: на сервере она появится с первым сохранением. */
  postId: string;
  pendingUploads: number;
  onCreated: (id: string) => void;
  onDeleted: () => void;
}

/**
 * Экран статьи. Черновик сохраняется на сервер сам, через полторы секунды
 * после правки. Опубликованная статья — только кнопкой: каждое её сохранение
 * сразу видно на сайте. Несохранённые правки дублируются в браузер —
 * на случай закрытой вкладки — с версией статьи в ключе: чужие или
 * устаревшие правки поверх свежей статьи не подставятся.
 */
export function useBlogPostEditor({ postId, pendingUploads, onCreated, onDeleted }: Options): BlogPostEditorController {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(postId !== "new");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  // То, что сейчас лежит на сервере, в формате формы: от него считается «есть правки».
  const [savedForm, setSavedForm] = useState<PostForm>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(postId === "new");

  // Только что созданная статья: адрес страницы сменится на её id — грузить её заново не нужно.
  const ownId = useRef<string | null>(null);
  const saving = useRef<Promise<boolean> | null>(null);

  useEffect(() => {
    if (postId === "new" || postId === ownId.current) return;
    let cancelled = false;
    setIsLoading(true);
    setReady(false);
    blogPostApi.get(postId).then((result) => {
      if (cancelled) return;
      setIsLoading(false);
      if (!result.ok) {
        setLoadError(result.error.code === "not_found" ? "Статья не найдена — возможно, её удалили" : describeApiError(result.error));
        return;
      }
      ownId.current = result.data.id;
      setPost(result.data);
      setForm(formOf(result.data));
      setSavedForm(formOf(result.data));
      setSlugTouched(true);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const dirty = !sameForm(form, savedForm);

  const draft = useDraft<PostForm>({
    key: ready ? `blog-post:${post?.id ?? "new"}:${post?.updatedAt ?? ""}` : null,
    value: form,
    restore: (saved) => setForm(saved),
    isEmpty: (value) => sameForm(value, savedForm) || (!post && value.title.trim() === "" && value.content === ""),
  });

  const update = useCallback((patch: Partial<PostForm>) => setForm((prev) => ({ ...prev, ...patch })), []);

  const setTitle = useCallback(
    (title: string) => setForm((prev) => ({ ...prev, title, ...(slugTouched ? {} : { slug: slugify(title) }) })),
    [slugTouched],
  );
  const setSlug = useCallback((slug: string) => {
    setSlugTouched(true);
    setForm((prev) => ({ ...prev, slug }));
  }, []);
  const resetSlug = useCallback(() => {
    setSlugTouched(false);
    setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
  }, []);

  const blocker = useMemo(() => {
    if (!form.title.trim()) return "Напишите заголовок — без него статью не сохранить";
    const slug = slugError(form.slug);
    if (slug) return slug;
    if (form.faq.some((item) => (item.question.trim() === "") !== (item.answer.trim() === ""))) return "У каждого вопроса должен быть ответ";
    if (pendingUploads > 0) return "Дождитесь загрузки картинок";
    return null;
  }, [form, pendingUploads]);

  const save = useCallback((): Promise<boolean> => {
    if (saving.current) return saving.current;
    if (blocker) {
      setError(blocker);
      return Promise.resolve(false);
    }
    const sent = form;
    setSaveState("saving");
    const run = (async () => {
      const input = inputOf(sent);
      const result = post ? await blogPostApi.update(post.id, input) : await blogPostApi.create(input);
      saving.current = null;
      if (!result.ok) {
        setSaveState("error");
        setError(describeBlogError(result.error));
        return false;
      }
      // Ключ черновика сменится вместе с версией статьи — прежний больше не нужен.
      draft.clear();
      setPost(result.data);
      setSavedForm(sent);
      setSaveState("saved");
      setSavedAt(new Date());
      setError(null);
      if (!post) {
        ownId.current = result.data.id;
        onCreated(result.data.id);
      }
      return true;
    })();
    saving.current = run;
    return run;
  }, [blocker, form, post, draft, onCreated]);

  // Автосохранение — только черновика: опубликованная статья меняется на сайте лишь по кнопке.
  const autosave = ready && dirty && !blocker && saveState !== "saving" && (post === null || post.status === "draft");
  useEffect(() => {
    if (!autosave) return;
    const timer = setTimeout(() => void save(), AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [autosave, form, save]);

  const changeStatus = useCallback(
    async (publish: boolean): Promise<boolean> => {
      // Сначала правки, потом статус: иначе на сайт ушла бы прежняя версия.
      if (dirty || !post) {
        const saved = await save();
        if (!saved) return false;
      }
      const id = ownId.current;
      if (!id) return false;
      const result = publish ? await blogPostApi.publish(id) : await blogPostApi.unpublish(id);
      if (!result.ok) {
        setError(describeBlogError(result.error));
        return false;
      }
      draft.clear();
      setPost(result.data);
      setError(null);
      return true;
    },
    [dirty, post, save, draft],
  );

  const remove = useCallback(async () => {
    if (!post) {
      draft.clear();
      onDeleted();
      return true;
    }
    const result = await blogPostApi.remove(post.id);
    if (!result.ok) {
      setError(describeApiError(result.error));
      return false;
    }
    draft.clear();
    onDeleted();
    return true;
  }, [post, draft, onDeleted]);

  // Закрыть вкладку с несохранённым — браузер переспросит; правки к тому же уже в черновике.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return {
    post,
    isNew: post === null,
    isLoading,
    loadError,
    form,
    update,
    setTitle,
    setSlug,
    resetSlug,
    slugTouched,
    dirty,
    saveState,
    savedAt,
    error,
    blocker,
    save,
    publish: () => changeStatus(true),
    unpublish: () => changeStatus(false),
    remove,
    restored: draft.restored,
    discardRestored: () => {
      draft.clear();
      setForm(savedForm);
    },
  };
}
