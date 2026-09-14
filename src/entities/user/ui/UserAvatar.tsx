const SIZES = {
  xs: "w-5 h-5 text-[9px]",
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
} as const;

/** Палитра аватаров: цвет выбирается по имени, поэтому у человека он всегда один. */
const COLORS = ["bg-indigo-500", "bg-violet-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-pink-500", "bg-cyan-600", "bg-orange-500", "bg-lime-600", "bg-teal-500"];

export const userInitials = (fullName: string): string =>
  fullName.split(/\s+/).map((word) => word.match(/\p{L}/u)?.[0] ?? "").filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";

function colorFor(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return COLORS[hash % COLORS.length];
}

interface UserAvatarProps {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}

/** Аватар-инициалы сотрудника. Пустое имя — серый кружок «?» (не назначен). */
export function UserAvatar({ name, size = "sm", className = "" }: UserAvatarProps) {
  const empty = name.trim() === "";
  return (
    <span
      title={empty ? "Не назначен" : name}
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white flex-shrink-0 ${SIZES[size]} ${empty ? "bg-slate-300" : colorFor(name)} ${className}`}
    >
      {userInitials(name)}
    </span>
  );
}
