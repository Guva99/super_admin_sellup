import { CircleDot } from "lucide-react";
import type { ReactNode } from "react";

/** Карточка экранов без входа: вход, регистрация, восстановление пароля. */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-full flex items-center justify-center bg-ink-50 px-4 py-10">
      <div className={`w-full ${wide ? "max-w-[560px]" : "max-w-[360px]"}`}>
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <CircleDot size={16} className="text-white" />
          </div>
          <span className="text-base font-semibold text-ink-900">SellUp</span>
        </div>

        <div className="bg-surface rounded-2xl border border-ink-200 p-6">
          <h1 className="text-sm font-semibold text-ink-900">{title}</h1>
          {subtitle && <p className="text-xs text-ink-500 mt-1 mb-5">{subtitle}</p>}
          {!subtitle && <div className="mb-5" />}
          {children}
        </div>
        {footer && <p className="text-xs text-ink-500 text-center mt-4">{footer}</p>}
      </div>
    </div>
  );
}
