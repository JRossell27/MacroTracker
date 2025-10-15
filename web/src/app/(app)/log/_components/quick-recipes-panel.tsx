"use client";

import { addMealFromRecipeAction } from "../actions";

 type Recipe = {
  id: string;
  name: string;
  description: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
};

 type QuickRecipesPanelProps = {
  recipes: Recipe[];
  dailyLogId: string | null;
};

 export function QuickRecipesPanel({
  recipes,
  dailyLogId,
}: QuickRecipesPanelProps) {
  const disabled = !dailyLogId;

  if (!recipes.length) {
    return (
      <p className="rounded-2xl border border-slate-800/70 bg-slate-900/40 px-4 py-3 text-sm text-slate-400">
        Save favorites in Settings to create quick-add buttons here.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-slate-500">
        Quick recipes
      </h4>
      <div className="flex flex-wrap gap-2">
        {recipes.map((recipe) => (
          <form
            key={recipe.id}
            action={addMealFromRecipeAction}
            className="inline-flex"
          >
            <input type="hidden" name="recipeId" value={recipe.id} />
            <input type="hidden" name="dailyLogId" value={dailyLogId ?? ""} />
            <button
              type="submit"
              disabled={disabled}
              className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-sky-400 hover:text-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {recipe.name}
              <span className="text-[10px] text-slate-500">
                {recipe.calories ?? 0} kcal
              </span>
            </button>
          </form>
        ))}
      </div>
    </div>
  );
 }
