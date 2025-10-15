"use client";

import { useActionState } from "react";
import { updateActiveCaloriesAction } from "../actions";
import { LOG_ACTION_INITIAL_STATE } from "../shared-state";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { QUICK_HYDRATION_AMOUNTS } from "./add-hydration-form";

const QUICK_ACTIVE_BURN = QUICK_HYDRATION_AMOUNTS.map((oz) => oz * 5);

type ActiveCaloriesFormProps = {
  dailyLogId: string | null;
  logDate: string;
  currentActive: number;
};

export function ActiveCaloriesForm({
  dailyLogId,
  logDate,
  currentActive,
}: ActiveCaloriesFormProps) {
  const [state, dispatch, pending] = useActionState(
    updateActiveCaloriesAction,
    LOG_ACTION_INITIAL_STATE,
  );
  const currentState = state ?? LOG_ACTION_INITIAL_STATE;

  return (
    <form action={dispatch} className="space-y-3">
      <input type="hidden" name="dailyLogId" value={dailyLogId ?? ""} />
      <input type="hidden" name="logDate" value={logDate} />
      <p className="text-xs text-slate-400">
        Current logged active calories:{" "}
        <span className="font-semibold text-slate-200">
          {currentActive} kcal
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIVE_BURN.map((amount) => (
          <button
            key={amount}
            type="submit"
            name="amount"
            value={amount}
            disabled={pending}
            className="inline-flex items-center justify-center rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-sky-400 hover:text-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Set to {amount}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-xs text-slate-300">
        Custom value
        <input
          name="amount"
          type="number"
          min={0}
          placeholder="e.g. 650"
          className="w-24 rounded-xl border border-slate-800 bg-slate-950/70 px-2 py-1 text-xs text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
        />
      </label>

      {currentState.status === "error" && (
        <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {currentState.message ?? "Unable to update active calories."}
        </p>
      )}

      <FormSubmitButton
        pendingLabel="Updating..."
        disabled={pending}
        className="w-full bg-amber-500 text-slate-900 hover:bg-amber-400"
      >
        Save active calories
      </FormSubmitButton>
    </form>
  );
}
