import type { ClientStatus } from "../model/types";
import { CLIENT_STATUS_LABEL, CLIENT_STATUS_CLASS } from "../model/dictionaries";

interface StatusBadgeProps {
  status: ClientStatus;
  className?: string;
}

export function StatusBadge({ status, className = "text-[11px]" }: StatusBadgeProps) {
  return (
    <span className={`px-2 py-0.5 rounded-full font-medium ${CLIENT_STATUS_CLASS[status]} ${className}`}>
      {CLIENT_STATUS_LABEL[status]}
    </span>
  );
}
