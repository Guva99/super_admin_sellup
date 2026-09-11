import type { Client } from "../model/types";

interface ClientAvatarProps {
  client: Pick<Client, "initials" | "color">;
  /** Классы размера и скругления, например "w-7 h-7 rounded-lg text-[10px]". */
  className?: string;
}

export function ClientAvatar({ client, className = "w-7 h-7 rounded-lg text-[10px]" }: ClientAvatarProps) {
  return (
    <div
      className={`flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
      style={{ backgroundColor: client.color }}
    >
      {client.initials}
    </div>
  );
}
