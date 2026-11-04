import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Check, ExternalLink, History, ImageOff, Loader2, Trash2, X } from "lucide-react";
import { ok } from "@/shared/api";
import { RichTextEditor, useRichTextEditor, type ImageRefs, type ImageResolver } from "@/features/rich-text-editor";
import { EXCERPT_MAX, FAQ_MAX, TITLE_MAX, blogImageKey, blogImageRef, blogImageUrl, blogPostUrl, useBlogPosts } from "@/entities/blog-post";
import { formatDateTimeMoscow } from "@/shared/lib";
import { extractFaq } from "../model/extractFaq";
import { useBlogImageUploader } from "../model/useBlogImageUploader";
import { useBlogPostEditor, type BlogPostEditorController } from "../model/useBlogPostEditor";
import { AutoTextarea } from "./AutoTextarea";
import { FaqEditor } from "./FaqEditor";
import { HintsPanel, PublicationPanel, RubricCoverPanel, SearchPanel } from "./SidePanels";

const IMAGE_REFS: ImageRefs = { ref: blogImageRef, key: blogImageKey };
// Картинки статьи публичные — ссылка известна сразу, токен не нужен.
const IMAGE_RESOLVER: ImageResolver = { load: async (id) => ok(blogImageUrl(id)), open: () => {} };

const secondaryButton =
  "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-ink-200 text-ink-700 hover:bg-ink-50 disabled:opacity-50 disabled:hover:bg-transparent";
const primaryButton =
  "inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:hover:bg-brand-500";

interface BlogPostEditorProps {
  /** "new" — новая статья. */
  postId: string;
  onCreated: (id: string) => void;
  onDeleted: () => void;
}

/**
 * Экран статьи блога: слева заголовок, анонс, текст и «Вопросы и ответы»,
 * справа — публикация, адрес и поиск, рубрика с обложкой и подсказки.
 */
export function BlogPostEditor({ postId, onCreated, onDeleted }: BlogPostEditorProps) {
  const uploader = useBlogImageUploader();
  const controller = useBlogPostEditor({ postId, pendingUploads: uploader.pending, onCreated, onDeleted });
  const { posts } = useBlogPosts();
  const rubrics = useMemo(() => [...new Set(posts.map((p) => p.rubric).filter(Boolean))].sort(), [posts]);
  const { form, update } = controller;
  const faqInText = useMemo(() => extractFaq(form.content), [form.content]);
  const [foreignImages, setForeignImages] = useState(0);

  const { editor, insertFiles } = useRichTextEditor({
    value: form.content,
    onChange: (content) => update({ content }),
    editable: true,
    placeholder: "Текст статьи. Его можно вставить из Google Docs или Notion — заголовки, списки и таблицы сохранятся.",
    uploader,
    resolver: IMAGE_RESOLVER,
    variant: "article",
    imageRefs: IMAGE_REFS,
    onForeignImages: (count) => setForeignImages((prev) => prev + count),
  });

  if (controller.loadError) {
    return (
      <div className="space-y-3">
        <BackLink />
        <div role="alert" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
          <AlertCircle size={14} />
          {controller.loadError}
        </div>
      </div>
    );
  }
  if (controller.isLoading) return <div className="h-[520px] bg-surface border border-ink-200 rounded-xl animate-pulse" />;

  return (
    <div className="space-y-4">
      <TopBar controller={controller} />

      {controller.restored && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-800">
          <History size={13} />
          <span className="flex-1">Подставили правки, которые не успели сохраниться (например, вкладку закрыли).</span>
          <button type="button" onClick={controller.discardRestored} className="font-medium hover:underline">
            Отбросить
          </button>
        </div>
      )}
      {foreignImages > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-ink-50 border border-ink-100 text-xs text-ink-700">
          <ImageOff size={13} className="flex-shrink-0 text-ink-400" />
          <span className="flex-1">
            Картинки из вставленного текста не перенеслись ({foreignImages}): сайт показывает только загруженные. Добавьте их кнопкой «Картинка» или
            перетащите файлы в текст.
          </span>
          <button type="button" aria-label="Скрыть" onClick={() => setForeignImages(0)} className="p-1 rounded hover:bg-ink-100">
            <X size={12} />
          </button>
        </div>
      )}
      {(controller.error || uploader.error) && (
        <div role="alert" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">
          <AlertCircle size={13} />
          {controller.error ?? uploader.error}
        </div>
      )}

      <div className="flex items-start gap-5 max-xl:flex-col">
        <div className="flex-1 min-w-0 w-full space-y-4">
          <div className="bg-surface border border-ink-200 rounded-xl px-5 py-4 space-y-3">
            <AutoTextarea
              value={form.title}
              onChange={(e) => controller.setTitle(e.target.value.replace(/\n/g, " "))}
              maxLength={TITLE_MAX}
              placeholder="Заголовок статьи — он же H1"
              aria-label="Заголовок"
              className="w-full bg-transparent text-2xl leading-tight font-semibold text-ink-900 placeholder:text-ink-300 focus:outline-none"
            />
            <AutoTextarea
              value={form.excerpt}
              onChange={(e) => update({ excerpt: e.target.value })}
              maxLength={EXCERPT_MAX}
              placeholder="Анонс: одно-два предложения — их видно в карточке статьи на сайте"
              aria-label="Анонс"
              className="w-full bg-transparent text-sm leading-relaxed text-ink-600 placeholder:text-ink-300 focus:outline-none"
            />
          </div>

          <RichTextEditor editor={editor} insertFiles={insertFiles} variant="article" className="bg-surface border border-ink-200 rounded-xl" />

          <FaqEditor
            items={form.faq}
            onChange={(faq) => update({ faq })}
            fromText={
              faqInText
                ? {
                    count: faqInText.items.length,
                    apply: () =>
                      update({
                        content: faqInText.content,
                        faq: [...form.faq.filter((item) => item.question.trim() || item.answer.trim()), ...faqInText.items].slice(0, FAQ_MAX),
                      }),
                  }
                : undefined
            }
          />
        </div>

        <aside className="w-[340px] flex-shrink-0 space-y-4 max-xl:w-full">
          <PublicationPanel controller={controller} />
          <SearchPanel controller={controller} />
          <RubricCoverPanel controller={controller} rubrics={rubrics} />
          <HintsPanel />
        </aside>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link to="/landing/posts" className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-800">
      <ArrowLeft size={13} />
      Все статьи
    </Link>
  );
}

function SaveIndicator({ controller }: { controller: BlogPostEditorController }) {
  const { saveState, dirty, post, savedAt } = controller;
  const published = post?.status === "published";
  if (saveState === "saving")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-ink-400">
        <Loader2 size={12} className="animate-spin" />
        Сохраняем…
      </span>
    );
  if (dirty && published) return <span className="text-xs text-amber-700">Есть правки — на сайте пока прежняя версия</span>;
  if (dirty) return <span className="text-xs text-ink-400">{post ? "Сохраним сами через пару секунд" : "Сохраним, как только будет заголовок"}</span>;
  if (savedAt)
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
        <Check size={12} />
        Сохранено в {savedAt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
      </span>
    );
  if (post) return <span className="text-xs text-ink-400">Изменена {formatDateTimeMoscow(post.updatedAt)}</span>;
  return null;
}

function TopBar({ controller }: { controller: BlogPostEditorController }) {
  const { post, dirty } = controller;
  const published = post?.status === "published";
  const [busy, setBusy] = useState<"save" | "publish" | "unpublish" | "delete" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const run = (action: NonNullable<typeof busy>, task: () => Promise<boolean>) => async () => {
    setBusy(action);
    await task();
    setBusy(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <BackLink />
      <span
        className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
          published ? "bg-emerald-50 text-emerald-700" : "bg-ink-100 text-ink-600"
        }`}
      >
        {published ? "Опубликована" : "Черновик"}
      </span>
      <SaveIndicator controller={controller} />

      <div className="ml-auto flex flex-wrap items-center gap-2">
        {published && post && (
          <a href={blogPostUrl(post.slug)} target="_blank" rel="noreferrer" className={secondaryButton}>
            <ExternalLink size={12} />
            Открыть на сайте
          </a>
        )}
        {confirmDelete ? (
          <span className="inline-flex items-center gap-2 text-xs text-ink-600">
            Удалить статью насовсем?
            <button type="button" onClick={run("delete", controller.remove)} className="font-semibold text-red-600 hover:underline">
              Удалить
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="hover:underline">
              Нет
            </button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirmDelete(true)} className={secondaryButton} aria-label="Удалить статью" title="Удалить статью">
            <Trash2 size={12} />
          </button>
        )}
        {published ? (
          <>
            <button type="button" onClick={run("unpublish", controller.unpublish)} disabled={busy !== null} className={secondaryButton}>
              Снять с публикации
            </button>
            <button type="button" onClick={run("save", controller.save)} disabled={busy !== null || !dirty} className={primaryButton}>
              {busy === "save" && <Loader2 size={12} className="animate-spin" />}
              Сохранить на сайте
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={run("save", controller.save)} disabled={busy !== null || (!dirty && post !== null)} className={secondaryButton}>
              Сохранить
            </button>
            <button type="button" onClick={run("publish", controller.publish)} disabled={busy !== null} className={primaryButton}>
              {busy === "publish" && <Loader2 size={12} className="animate-spin" />}
              Опубликовать
            </button>
          </>
        )}
      </div>
    </div>
  );
}
