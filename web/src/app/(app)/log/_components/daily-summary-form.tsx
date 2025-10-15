"use client";

import { useActionState } from "react";
import { upsertDailyLogAction, INITIAL_STATE } from "../actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";

type DailySummaryFormProps = {
  logDate: string;
  existing: boolean;
  defaults: {
    caloriesGoal: number;
    proteinGoal: number;
    carbsGoal: number;
    fatGoal: number;
    basalCalories: number;
    activeCalories: number;
    hydrationTarget: number;
    hydrationActual: number;
    weight: number | null;
  };
};

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "";
  if (Number.isNaN(value)) return "";
  return value.toString();
}

export function DailySummaryForm({
  logDate,
  existing,
  defaults,
}: DailySummaryFormProps) {
  const [state, dispatch] = useActionState(
    upsertDailyLogAction,
    INITIAL_STATE,
  );

  return (
    <form action={dispatch} className="space-y-4">
      <input type="hidden" name="logDate" value={logDate} />
      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Calories goal
          <input
            name="caloriesGoal"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={formatNumber(defaults.caloriesGoal)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            placeholder="2200"
          />
        </label>
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Protein goal (g)
          <input
            name="proteinGoal"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={formatNumber(defaults.proteinGoal)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            placeholder="165"
          />
        </label>
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Carbs goal (g)
          <input
            name="carbsGoal"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={formatNumber(defaults.carbsGoal)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            placeholder="210"
          />
        </label>
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Fat goal (g)
          <input
            name="fatGoal"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={formatNumber(defaults.fatGoal)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            placeholder="70"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Basal calories
          <input
            name="basalCalories"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={formatNumber(defaults.basalCalories)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            placeholder="1800"
          />
        </label>
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Active calories
          <input
            name="activeCalories"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={formatNumber(defaults.activeCalories)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            placeholder="650"
          />
        </label>
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Hydration target (oz)
          <input
            name="hydrationTarget"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={formatNumber(defaults.hydrationTarget)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            placeholder="110"
          />
        </label>
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Hydration logged (oz)
          <input
            name="hydrationActual"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={formatNumber(defaults.hydrationActual)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            placeholder="96"
          />
        </label>
      </div>

      <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-sm text-slate-300">
        Scale weight (lb)
        <input
          name="weight"
          type="number"
          inputMode="decimal"
          step="0.1"
          defaultValue={formatNumber(defaults.weight)}
          className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
          placeholder="184.2"
        />
      </label>

      {state.status === "error" && (
        <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {state.message ?? "Unable to save. Try again."}
        </p>
      )}

      <FormSubmitButton pendingLabel={existing ? "Updating…" : "Creating…"}>
        {existing ? "Update day summary" : "Create day summary"}
      </FormSubmitButton>
    </form>
  );
}
