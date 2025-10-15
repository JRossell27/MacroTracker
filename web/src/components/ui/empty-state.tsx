import type { ReactNode } from "react";
import { clsx } from "clsx";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  variant?: "raised" | "subtle";
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = "raised",
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center gap-4 px-6 py-10 text-center text-slate-300",
        variant === "raised"
          ? "surface"
          : "rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/20",
        className,
      )}
    >
      {icon ? (
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-500/10 text-sky-300">
          {icon}
        </span>
      ) : null}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-50">{title}</h3>
        {description ? (
          <p className="text-sm text-slate-400">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}
