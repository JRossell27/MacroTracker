import type { ReactNode } from "react";

type MobileShellProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  headerAction?: ReactNode;
};

export function MobileShell({
  title,
  subtitle,
  children,
  headerAction,
}: MobileShellProps) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      {(title || subtitle || headerAction) && (
        <header className="flex items-center justify-between gap-3">
          <div>
            {title && (
              <h1 className="text-xl font-semibold tracking-tight text-slate-50">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-slate-400">{subtitle}</p>
            )}
          </div>
          {headerAction}
        </header>
      )}
      <main className="flex flex-1 flex-col gap-4">{children}</main>
    </div>
  );
}
