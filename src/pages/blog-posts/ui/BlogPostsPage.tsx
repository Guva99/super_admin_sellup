import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ExternalLink, FileText, Lock, Plus } from "lucide-react";
import { useSession } from "@/entities/session";
import { canEditBlog } from "@/entities/user";
import { SITE_URL, blogPostUrl, useBlogPosts, type BlogPostSummary } from "@/entities/blog-post";
import { formatDateTimeMoscow } from "@/shared/lib";

/** «Лендинг» → «Статьи»: блог на сайте. Писать может владелец и администратор. */
export default function BlogPostsPage() {
  const { user } = useSession();
  if (!canEditBlog(user?.roleKey)) {
    return (
      <div className="p-8 flex items-center gap-2 text-sm text-ink-400">
        <Lock size={14} />
        Статьи блога доступны владельцу и администратору
      </div>
    );
  }
  return <PostsList />;
}

function PostsList() {
  const { posts, isLoading, error } = useBlogPosts();
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-5 max-w-[1280px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500">
          Блог на сайте —{" "}
          <a href={`${SITE_URL}/blog`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline">
            {SITE_URL.replace(/^https?:\/\//, "")}/blog
            <ExternalLink size={12} />
          </a>
          . Опубликованная статья появляется там сразу.
        </p>
        <Link
          to="/landing/posts/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-brand-500 text-white hover:bg-brand-600"
        >
          <Plus size={13} />
          Новая статья
        </Link>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">
          <AlertCircle size={13} />
          {error}
        </div>
      )}

      {isLoading && posts.length === 0 ? (
        <div className="h-[240px] bg-surface border border-ink-200 rounded-xl animate-pulse" />
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-14 bg-surface border border-ink-200 rounded-xl text-center">
          <FileText size={22} className="text-ink-300" />
          <p className="text-sm text-ink-600">Статей пока нет. Напишите первую — она появится в блоге на сайте.</p>
          <Link to="/landing/posts/new" className="text-xs font-semibold text-brand-600 hover:underline">
            Написать статью
          </Link>
        </div>
      ) : (
        <div className="bg-surface border border-ink-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead className="text-ink-400 border-b border-ink-100">
              <tr>
                <th className="px-5 py-2.5 text-left font-medium">Статья</th>
                <th className="px-3 py-2.5 text-left font-medium">Рубрика</th>
                <th className="px-3 py-2.5 text-left font-medium">Статус</th>
                <th className="px-3 py-2.5 text-left font-medium">Дата</th>
                <th className="px-5 py-2.5" aria-label="На сайте" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {posts.map((post) => (
                <tr key={post.id} onClick={() => navigate(`/landing/posts/${post.id}`)} className="cursor-pointer hover:bg-ink-50/60">
                  <td className="px-5 py-3 max-w-[520px]">
                    <span className="block text-sm font-medium text-ink-900 truncate">{post.title}</span>
                    <span className="block text-ink-400 truncate">{post.excerpt || `/blog/${post.slug}`}</span>
                  </td>
                  <td className="px-3 py-3 text-ink-600 whitespace-nowrap">{post.rubric || "—"}</td>
                  <td className="px-3 py-3">
                    <StatusBadge post={post} />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-ink-600">
                    {post.status === "published" && post.publishedAt
                      ? formatDateTimeMoscow(post.publishedAt)
                      : `изменена ${formatDateTimeMoscow(post.updatedAt)}`}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {post.status === "published" && (
                      <a
                        href={blogPostUrl(post.slug)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        title="Открыть на сайте"
                        className="inline-flex text-ink-400 hover:text-brand-600"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ post }: { post: BlogPostSummary }) {
  return post.status === "published" ? (
    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium">Опубликована</span>
  ) : (
    <span className="px-2 py-0.5 rounded-full bg-ink-100 text-ink-600 text-[11px] font-medium">Черновик</span>
  );
}
