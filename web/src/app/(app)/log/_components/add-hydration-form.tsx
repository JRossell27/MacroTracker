"use client";

import { useActionState } from "react";
import { addHydrationAction } from "../actions";
import { LOG_ACTION_INITIAL_STATE } from "../shared-state";
import { FormSubmitButton } from "@/components/ui/form-submit-button";

type AddHydrationFormProps = {
  dailyLogId: string | null;
  logDate: string;
};

const QUICK_AMOUNTS = [8, 12, 16, 20];

export function AddHydrationForm({
  dailyLogId,
  logDate,
}: AddHydrationFormProps) {
  const [state, dispatch, pending] = useActionState(
    addHydrationAction,
    LOG_ACTION_INITIAL_STATE,
  );
  const currentState = state ?? LOG_ACTION_INITIAL_STATE;
  const disabled = (!dailyLogId && !logDate) || pending;

  return (
    <form action={dispatch} className="space-y-3">
      <input type="hidden" name="dailyLogId" value={dailyLogId ?? ""} />
      <input type="hidden" name="logDate" value={logDate} />
      <div className="flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="submit"
            name="amount"
            value={amount}
            disabled={disabled}
            className="inline-flex items-center justify-center rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-sky-400 hover:text-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            +{amount} oz
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-xs text-slate-300">
        Custom amount
        <input
          name="customAmount"
          type="number"
          min={1}
          placeholder="enter oz"
          className="w-24 rounded-xl border border-slate-800 bg-slate-950/70 px-2 py-1 text-xs text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
        />
      </label>
      {currentState.status === "error" && (
        <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {currentState.message ?? "Unable to log water right now."}
        </p>
      )}
      <FormSubmitButton
        pendingLabel="Logging water..."
        disabled={pending}
        className="w-full bg-sky-500 text-slate-900 hover:bg-sky-400"
      >
        Log water
      </FormSubmitButton>
    </form>
  );
}
