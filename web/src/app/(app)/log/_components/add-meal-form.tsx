"use client";

import { useActionState, useState } from "react";
import { addMealAction } from "../actions";
import { LOG_ACTION_INITIAL_STATE } from "../shared-state";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { MealIngredientsFieldset, type MacroTotals } from "./meal-ingredients-fieldset";

type AddMealFormProps = {
  dailyLogId: string | null;
  disabled?: boolean;
};

export function AddMealForm({ dailyLogId, disabled }: AddMealFormProps) {
  const [state, dispatch] = useActionState(
    addMealAction,
    LOG_ACTION_INITIAL_STATE,
  );
  const currentState = state ?? LOG_ACTION_INITIAL_STATE;
  const isDisabled = disabled || !dailyLogId;
  const [ingredientTotals, setIngredientTotals] = useState<MacroTotals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  return (
    <form action={dispatch} className="space-y-4">
      <input type="hidden" name="dailyLogId" value={dailyLogId ?? ""} />
      <MealIngredientsFieldset
        onChange={() => {}}
        onTotalsChange={setIngredientTotals}
        disabled={isDisabled}
      />

      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Meal name
          <input
            name="mealName"
            type="text"
            required
            disabled={isDisabled}
            className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="Lunch"
          />
        </label>
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Time (optional)
          <input
            name="mealTime"
            type="time"
            disabled={isDisabled}
            className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>
      </div>

      <p className="text-xs text-slate-400">
        Macro totals calculated from ingredients:{" "}
        <span className="font-semibold text-slate-200">
          {ingredientTotals.calories} kcal
        </span>{" "}
        · {ingredientTotals.protein}P / {ingredientTotals.carbs}C /{" "}
        {ingredientTotals.fat}F. Adjust below if you want to round or tweak.
      </p>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Calories
          <input
            name="mealCalories"
            type="number"
            inputMode="numeric"
            min={0}
            disabled={isDisabled}
            className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="480"
          />
        </label>
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Protein (g)
          <input
            name="mealProtein"
            type="number"
            inputMode="numeric"
            min={0}
            disabled={isDisabled}
            className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="38"
          />
        </label>
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Carbs (g)
          <input
            name="mealCarbs"
            type="number"
            inputMode="numeric"
            min={0}
            disabled={isDisabled}
            className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="52"
          />
        </label>
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Fat (g)
          <input
            name="mealFat"
            type="number"
            inputMode="numeric"
            min={0}
            disabled={isDisabled}
            className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="18"
          />
        </label>
      </div>

      {currentState.status === "error" && (
        <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {currentState.message ?? "Unable to add meal. Try again."}
        </p>
      )}

      <FormSubmitButton
        disabled={isDisabled}
        pendingLabel="Adding meal…"
      >
        {isDisabled ? "Create summary before adding meals" : "Add meal"}
      </FormSubmitButton>
    </form>
  );
}
