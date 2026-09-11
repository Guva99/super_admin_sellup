import { healthLevel, healthTextClass, HEALTH_BAR_CLASS } from "../model/health";

interface HealthBarProps {
  label: string;
  value: number;
}

export function HealthBar({ label, value }: HealthBarProps) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-600">{label}</span>
        <span className={`font-semibold font-mono ${healthTextClass(value)}`}>{value}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${HEALTH_BAR_CLASS[healthLevel(value)]} rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
