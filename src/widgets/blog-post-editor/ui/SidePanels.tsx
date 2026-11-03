import { useRef, useState, type ReactNode } from "react";
import { ImagePlus, Lightbulb, Loader2, MessagesSquare, RotateCcw, Search, X } from "lucide-react";
import {
  BLOG_IMAGE_ACCEPT,
  BLOG_SCENES,
  SEO_DESCRIPTION_LIMIT,
  SEO_DESCRIPTION_MAX,
  SEO_TITLE_LIMIT,
  SEO_TITLE_MAX,
  SITE_URL,
  blogImageError,
  blogImageUrl,
  blogPostApi,
  describeBlogError,
  normaliseSlugInput,
  type BlogPost,
} from "@/entities/blog-post";
import { formatDateTimeMoscow } from "@/shared/lib";
import type { BlogPostEditorController } from "../model/useBlogPostEditor";
import { AutoTextarea } from "./AutoTextarea";

const fieldClass =
  "w-full px-3 py-2 text-sm border border-ink-200 rounded-lg bg-surface text-ink-800 placeholder:text-ink-300 focus:outline-none focus:border-brand-400";

function Panel({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section className="bg-surface border border-ink-200 rounded-xl p-4 space-y-3">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({ label, hint, counter, children }: { label: string; hint?: ReactNode; counter?: ReactNode; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="flex items-baseline justify-between gap-2 text-xs font-medium text-ink-700">
        {label}
        {counter}
      </span>
      {children}
      {hint && <span className="block text-[11px] leading-snug text-ink-400">{hint}</span>}
    </label>
  );
}

/** Сколько знаков из видимых в поиске; больше — поисковик обрежет, но сохранить можно. */
function Counter({ value, limit }: { value: string; limit: number }) {
  const over = value.length > limit;
  return (
    <span className={`text-[11px] tabular-nums ${over ? "text-amber-600 font-semibold" : "text-ink-400"}`}>
      {value.length}/{limit}
    </span>
  );
}

const statusText = (post: BlogPost | null) => {
  if (!post) return "Новая статья — появится на сервере с первым сохранением";
  if (post.status === "published") return `На сайте с ${formatDateTimeMoscow(post.publishedAt!)}`;
  return post.publishedAt ? "Снята с публикации — на сайте её нет" : "Черновик — на сайте его не видно";
};

export function PublicationPanel({ controller }: { controller: BlogPostEditorController }) {
  const { post, form, update } = controller;
  return (
    <Panel title="Публикация">
      <p className="text-xs leading-relaxed text-ink-600">{statusText(post)}</p>
      {post && <p className="text-xs text-ink-400">≈ {post.readingMinutes} мин чтения · считается при сохранении</p>}
      <Field label="Автор">
        <input value={form.author} onChange={(e) => update({ author: e.target.value })} maxLength={100} className={fieldClass} />
      </Field>
    </Panel>
  );
}

/** Адрес, title и description — с превью, как статья будет выглядеть в выдаче. */
export function SearchPanel({ controller }: { controller: BlogPostEditorController }) {
  const { form, update, setSlug, resetSlug, slugTouched } = controller;
  const host = SITE_URL.replace(/^https?:\/\//, "");
  const shownTitle = form.seoTitle.trim() || (form.title.trim() ? `${form.title.trim()} — блог SellUp` : "Заголовок статьи");
  const shownDescription = form.seoDescription.trim() || form.excerpt.trim() || "Описание — из поля ниже, а без него из анонса.";

  return (
    <Panel title="Адрес и поиск" icon={<Search size={12} />}>
      <Field
        label="Адрес"
        hint={
          slugTouched ? (
            <button type="button" onClick={resetSlug} className="inline-flex items-center gap-1 text-brand-600 hover:underline">
              <RotateCcw size={10} />
              Собрать из заголовка
            </button>
          ) : (
            "Собирается из заголовка, пока вы его не поменяете"
          )
        }
      >
        <div className="flex items-center rounded-lg border border-ink-200 bg-surface focus-within:border-brand-400">
          <span className="pl-3 text-sm text-ink-400 select-none">/blog/</span>
          <input
            value={form.slug}
            onChange={(e) => setSlug(normaliseSlugInput(e.target.value))}
            placeholder="ii-prodavec"
            className="flex-1 min-w-0 py-2 pr-3 text-sm bg-transparent text-ink-800 placeholder:text-ink-300 focus:outline-none font-mono"
          />
        </div>
      </Field>

      <Field label="Title для поиска" counter={<Counter value={form.seoTitle} limit={SEO_TITLE_LIMIT} />} hint="Пусто — возьмём заголовок статьи">
        <input
          value={form.seoTitle}
          onChange={(e) => update({ seoTitle: e.target.value })}
          maxLength={SEO_TITLE_MAX}
          placeholder="ИИ-продавец для магазина: ответы и заказы 24/7 | SellUp"
          className={fieldClass}
        />
      </Field>

      <Field label="Description" counter={<Counter value={form.seoDescription} limit={SEO_DESCRIPTION_LIMIT} />} hint="Пусто — возьмём анонс">
        <AutoTextarea
          value={form.seoDescription}
          onChange={(e) => update({ seoDescription: e.target.value })}
          maxLength={SEO_DESCRIPTION_MAX}
          placeholder="Пара предложений: о чём статья и зачем её читать"
          className={fieldClass}
        />
      </Field>

      <div className="rounded-lg border border-ink-100 bg-ink-50/60 p-3 space-y-1" aria-label="Так статья будет выглядеть в поиске">
        <p className="text-[11px] text-ink-400 truncate">
          {host} › blog › {form.slug || "adres"}
        </p>
        <p className="text-[15px] leading-snug text-brand-700 line-clamp-2">{shownTitle}</p>
        <p className="text-xs leading-relaxed text-ink-600 line-clamp-3">{shownDescription}</p>
      </div>
    </Panel>
  );
}

export function RubricCoverPanel({ controller, rubrics }: { controller: BlogPostEditorController; rubrics: string[] }) {
  const { form, update } = controller;
  return (
    <Panel title="Рубрика и обложка">
      <Field label="Рубрика" hint="По рубрикам на сайте можно отфильтровать статьи">
        <input
          value={form.rubric}
          onChange={(e) => update({ rubric: e.target.value })}
          list="blog-rubrics"
          maxLength={60}
          placeholder="ИИ в продажах"
          className={fieldClass}
        />
        <datalist id="blog-rubrics">
          {rubrics.map((rubric) => (
            <option key={rubric} value={rubric} />
          ))}
        </datalist>
      </Field>
      <CoverKind scene={form.coverScene} onChange={(coverScene) => update({ coverScene })} />
      <CoverField
        coverImageId={form.coverImageId}
        onChange={(coverImageId) => update({ coverImageId })}
        label={form.coverScene ? "Картинка для превью ссылки" : "Обложка"}
        hint={
          form.coverScene
            ? "На сайте — анимация, а эту картинку покажут мессенджеры и соцсети, когда делятся ссылкой. 1200×630."
            : "1200×630, PNG, JPEG или WebP до 5 МБ. Без обложки на сайте будет фирменная."
        }
      />
    </Panel>
  );
}

/** Обложка — картинка или живая сцена, которую рисует сайт. */
function CoverKind({ scene, onChange }: { scene: string; onChange: (scene: string) => void }) {
  const chosen = BLOG_SCENES.find((item) => item.id === scene);
  const option = (active: boolean) =>
    `px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${active ? "bg-surface text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-800"}`;
  return (
    <div className="space-y-2">
      <span className="block text-xs font-medium text-ink-700">Вид обложки</span>
      <div role="radiogroup" aria-label="Вид обложки" className="grid grid-cols-2 gap-0.5 p-0.5 rounded-lg bg-ink-100">
        <button type="button" role="radio" aria-checked={!scene} onClick={() => onChange("")} className={option(!scene)}>
          Картинка
        </button>
        <button type="button" role="radio" aria-checked={!!scene} onClick={() => onChange(scene || BLOG_SCENES[0].id)} className={option(!!scene)}>
          Анимация
        </button>
      </div>
      {scene && (
        <div className="rounded-lg border border-brand-100 bg-brand-50 px-3 py-2.5 space-y-1">
          {BLOG_SCENES.length > 1 ? (
            <select value={scene} onChange={(e) => onChange(e.target.value)} aria-label="Анимация" className={fieldClass}>
              {BLOG_SCENES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-xs font-medium text-ink-800">{chosen?.label ?? scene}</p>
          )}
          {chosen && <p className="text-[11px] leading-snug text-ink-500">{chosen.hint}</p>}
        </div>
      )}
    </div>
  );
}

function CoverField({
  coverImageId,
  onChange,
  label,
  hint,
}: {
  coverImageId: string | null;
  onChange: (id: string | null) => void;
  label: string;
  hint: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    const problem = blogImageError(file);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError(null);
    const result = await blogPostApi.uploadImage(file);
    setBusy(false);
    if (result.ok) onChange(result.data.id);
    else setError(describeBlogError(result.error));
  };

  return (
    <div className="space-y-1">
      <span className="block text-xs font-medium text-ink-700">{label}</span>
      {coverImageId ? (
        <div className="relative">
          <img src={blogImageUrl(coverImageId)} alt="" className="w-full aspect-[1200/630] object-cover rounded-lg border border-ink-200" />
          <div className="absolute top-2 right-2 flex gap-1">
            <button type="button" onClick={() => input.current?.click()} className="px-2 py-1 rounded-md bg-slate-900/70 text-[11px] text-white hover:bg-slate-900/85">
              Заменить
            </button>
            <button
              type="button"
              aria-label="Убрать обложку"
              onClick={() => onChange(null)}
              className="p-1 rounded-md bg-slate-900/70 text-white hover:bg-slate-900/85"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="w-full aspect-[1200/630] flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink-300 text-xs text-ink-500 hover:border-brand-400 hover:text-brand-600"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
          {busy ? "Загружаем…" : "Загрузить обложку"}
        </button>
      )}
      <span className="block text-[11px] leading-snug text-ink-400">{hint}</span>
      {error && <span className="block text-[11px] text-red-600">{error}</span>}
      <input
        ref={input}
        type="file"
        accept={BLOG_IMAGE_ACCEPT}
        className="hidden"
        onChange={(e) => {
          void upload(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/** Как оформить то, что на сайте выглядит особенно: диалог и таблицы. */
export function HintsPanel() {
  return (
    <Panel title="Подсказки" icon={<Lightbulb size={12} />}>
      <div className="flex gap-2 text-xs leading-relaxed text-ink-600">
        <MessagesSquare size={14} className="flex-shrink-0 mt-0.5 text-brand-500" />
        <p>
          <span className="font-medium text-ink-800">Диалог</span> — выделите реплики и нажмите «Цитата». Каждая с новой строки и с именем:
          «Клиент: …», «ИИ-продавец: …». На сайте это станет перепиской.
        </p>
      </div>
      <p className="text-xs leading-relaxed text-ink-600">
        Текст из Google Docs или Notion вставляется с заголовками, списками и таблицами. Заголовок статьи (H1) — в поле сверху, разделы
        внутри — H2.
      </p>
    </Panel>
  );
}
