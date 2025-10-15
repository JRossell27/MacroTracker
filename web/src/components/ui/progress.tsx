type ProgressProps = {
  value: number;
  max?: number;
  showLabel?: boolean;
};

export function Progress({ value, max = 100, showLabel = false }: ProgressProps) {
  const percentage = Math.max(0, Math.min(100, Math.round((value / max) * 100)));

  return (
    <div className="flex w-full items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800/80">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-slate-400 tabular-nums">
          {percentage}%
        </span>
      )}
    </div>
  );
}
