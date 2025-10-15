"use client";

import { useActionState } from "react";
import {
  signInAction,
  signUpAction,
  type AuthActionState,
} from "../actions";

const INITIAL_STATE: AuthActionState = { status: "idle" };

export function AuthForms() {
  const [signInState, signInDispatch, signInPending] = useActionState(
    signInAction,
    INITIAL_STATE,
  );
  const [signUpState, signUpDispatch, signUpPending] = useActionState(
    signUpAction,
    INITIAL_STATE,
  );

  const currentSignInState = signInState ?? INITIAL_STATE;
  const currentSignUpState = signUpState ?? INITIAL_STATE;

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <header>
          <h2 className="text-lg font-semibold text-slate-50">
            Sign in
          </h2>
          <p className="text-sm text-slate-400">
            Access your personal macro dashboard.
          </p>
        </header>
        <form action={signInDispatch} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">
              Email
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                placeholder="you@example.com"
              />
            </label>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">
              Password
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                placeholder="••••••••"
              />
            </label>
          </div>
          {currentSignInState.status === "error" && (
            <p className="text-sm text-rose-400">
              {currentSignInState.message ?? "Unable to sign in. Try again."}
            </p>
          )}
          <button
            type="submit"
            disabled={signInPending}
            className="inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signInPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>

      <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-slate-500">
        <span className="h-px flex-1 bg-slate-800" />
        or
        <span className="h-px flex-1 bg-slate-800" />
      </div>

      <section className="space-y-4">
        <header>
          <h2 className="text-lg font-semibold text-slate-50">
            Create a free account
          </h2>
          <p className="text-sm text-slate-400">
            Start tracking macros, hydration, and calorie balance.
          </p>
        </header>
        <form action={signUpDispatch} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">
              Display name
              <input
                name="displayName"
                type="text"
                autoComplete="name"
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                placeholder="Jason"
              />
            </label>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">
              Email
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                placeholder="you@example.com"
              />
            </label>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">
              Password
              <input
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                placeholder="At least 6 characters"
              />
            </label>
          </div>
          {currentSignUpState.status === "error" && (
            <p className="text-sm text-rose-400">
              {currentSignUpState.message ?? "Unable to create an account. Try again."}
            </p>
          )}
          <button
            type="submit"
            disabled={signUpPending}
            className="inline-flex w-full items-center justify-center rounded-full border border-sky-400/80 px-4 py-3 text-sm font-semibold text-sky-300 transition hover:border-sky-300 hover:text-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signUpPending ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="text-xs text-slate-500">
          After signing up, we’ll prompt you to set your macro targets. Make
          sure email confirmations are enabled in Supabase to complete
          registration.
        </p>
      </section>
    </div>
  );
}
