export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-800/70 bg-slate-950/60 p-8 shadow-[0_35px_60px_rgba(8,15,31,0.65)] backdrop-blur">
        {children}
      </div>
      <p className="mt-6 text-center text-xs text-slate-500">
        MacroTracker · built for everyday athletes
      </p>
    </div>
  );
}
