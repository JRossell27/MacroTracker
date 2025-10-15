"use client";

import { useActionState } from "react";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import {
  createRecipeAction,
  deleteRecipeAction,
  type RecipeFormState,
} from "./actions";
import { LOG_ACTION_INITIAL_STATE } from "../log/shared-state";
import { InlineDeleteButton } from "@/components/ui/inline-delete-button";

type Recipe = {
  id: string;
  name: string;
  description: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  created_at: string | null;
};

type RecipesManagerProps = {
  recipes: Recipe[];
};

export function RecipesManager({ recipes }: RecipesManagerProps) {
  const [formState, formAction, formPending] = useActionState<
    RecipeFormState | void,
    FormData
  >(createRecipeAction, LOG_ACTION_INITIAL_STATE);

  const currentState =
    formState && "status" in formState
      ? formState
      : LOG_ACTION_INITIAL_STATE;

  return (
    <section className="space-y-6">
      <div className="surface space-y-4 p-5">
        <header>
          <h2 className="text-lg font-semibold text-slate-100">
            Save quick recipes
          </h2>
          <p className="text-xs text-slate-400">
            Store meals you repeat often. They show up as quick-add buttons on
            your log so tracking takes seconds.
          </p>
        </header>
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Recipe name
            <input
              name="name"
              required
              className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
              placeholder="Overnight oats"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Optional note
            <input
              name="description"
              className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
              placeholder="Add berries & almond butter"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Calories
            <input
              name="calories"
              type="number"
              min={0}
              className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
              placeholder="320"
            />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Protein
              <input
                name="protein"
                type="number"
                min={0}
                className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                placeholder="24"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Carbs
              <input
                name="carbs"
                type="number"
                min={0}
                className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                placeholder="38"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Fat
              <input
                name="fat"
                type="number"
                min={0}
                className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                placeholder="8"
              />
            </label>
          </div>

          {currentState.status === "error" && (
            <p className="col-span-full rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {currentState.message ?? "Unable to save recipe."}
            </p>
          )}

          <FormSubmitButton
            pendingLabel="Saving recipe..."
            disabled={formPending}
            className="col-span-full bg-emerald-500 text-slate-900 hover:bg-emerald-400"
          >
            Save recipe
          </FormSubmitButton>
        </form>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
          Your library
        </h3>
        {recipes.length === 0 ? (
          <p className="rounded-2xl border border-slate-800/70 bg-slate-900/40 px-4 py-3 text-sm text-slate-400">
            No recipes yet. Add one above to create quick add links.
          </p>
        ) : (
          <ul className="grid gap-3">
            {recipes.map((recipe) => (
              <li
                key={recipe.id}
                className="surface flex flex-col gap-3 rounded-2xl border border-slate-800/70 p-4 text-sm text-slate-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-semibold text-slate-50">
                      {recipe.name}
                    </h4>
                    {recipe.description && (
                      <p className="text-xs text-slate-400">
                        {recipe.description}
                      </p>
                    )}
                  </div>
                  <form action={deleteRecipeAction}>
                    <input type="hidden" name="recipeId" value={recipe.id} />
                    <InlineDeleteButton label="Delete" />
                  </form>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                  <span>{recipe.calories ?? 0} kcal</span>
                  <span>{recipe.protein ?? 0} g protein</span>
                  <span>{recipe.carbs ?? 0} g carbs</span>
                  <span>{recipe.fat ?? 0} g fat</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
