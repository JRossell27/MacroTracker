import { Metadata } from "next";
import Link from "next/link";
import { AuthForms } from "./auth-forms";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-800/80 bg-slate-900/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
          MacroTracker
        </div>
        <h1 className="text-3xl font-semibold text-slate-50">
          Welcome back
        </h1>
        <p className="text-sm text-slate-400">
          Log meals, track hydration, and stay consistent with your macro goal.
        </p>
      </header>
      <AuthForms />
      <footer className="rounded-2xl border border-slate-800/70 bg-slate-900/40 px-4 py-3 text-center text-xs text-slate-500">
        Need help configuring Supabase auth?{" "}
        <Link
          className="text-sky-300 underline decoration-dotted underline-offset-2"
          href="https://supabase.com/docs/guides/auth"
          target="_blank"
          rel="noreferrer"
        >
          View the quickstart guide.
        </Link>
      </footer>
    </div>
  );
}
