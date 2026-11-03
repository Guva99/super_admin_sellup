import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { useSession } from "@/entities/session";
import { canEditBlog } from "@/entities/user";
import { BlogPostEditor } from "@/widgets/blog-post-editor";

/** Одна статья блога: /landing/posts/:postId, новая — /landing/posts/new. */
export default function BlogPostPage() {
  const { user } = useSession();
  const { postId = "new" } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  // Новая статья получает id с первым сохранением — адрес меняется без перехода назад.
  const onCreated = useCallback((id: string) => navigate(`/landing/posts/${id}`, { replace: true }), [navigate]);
  const onDeleted = useCallback(() => navigate("/landing/posts"), [navigate]);

  if (!canEditBlog(user?.roleKey)) {
    return (
      <div className="p-8 flex items-center gap-2 text-sm text-ink-400">
        <Lock size={14} />
        Статьи блога доступны владельцу и администратору
      </div>
    );
  }
  return (
    <div className="p-6 max-w-[1280px]">
      <BlogPostEditor postId={postId} onCreated={onCreated} onDeleted={onDeleted} />
    </div>
  );
}
