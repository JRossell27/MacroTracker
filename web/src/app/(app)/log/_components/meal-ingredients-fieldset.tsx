"use client";

import { useEffect, useMemo, useState } from "react";
import { MinusCircle, Plus } from "lucide-react";

export type IngredientInput = {
  id: string;
  name: string;
  amount: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};

export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type MealIngredientsFieldsetProps = {
  onChange: (ingredients: IngredientInput[]) => void;
  onTotalsChange?: (totals: MacroTotals) => void;
  disabled?: boolean;
};

const emptyIngredient = (): IngredientInput => ({
  id: crypto.randomUUID(),
  name: "",
  amount: "",
  calories: undefined,
  protein: undefined,
  carbs: undefined,
  fat: undefined,
});

export function MealIngredientsFieldset({
  onChange,
  onTotalsChange,
  disabled = false,
}: MealIngredientsFieldsetProps) {
  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    emptyIngredient(),
  ]);

  const totals = useMemo<MacroTotals>(() => {
    return ingredients.reduce(
      (acc, ingredient) => ({
        calories: acc.calories + Number(ingredient.calories || 0),
        protein: acc.protein + Number(ingredient.protein || 0),
        carbs: acc.carbs + Number(ingredient.carbs || 0),
        fat: acc.fat + Number(ingredient.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }, [ingredients]);

  useEffect(() => {
    onChange(ingredients);
    onTotalsChange?.(totals);
  }, [ingredients, totals, onChange, onTotalsChange]);

  const updateIngredient = (
    id: string,
    field: keyof IngredientInput,
    value: string,
  ) => {
    setIngredients((prev) =>
      prev.map((ingredient) =>
        ingredient.id === id
          ? {
              ...ingredient,
              [field]:
                field === "name" || field === "amount"
                  ? value
                  : value === ""
                    ? undefined
                    : Number(value),
            }
          : ingredient,
      ),
    );
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, emptyIngredient()]);
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) =>
      prev.length === 1 ? [emptyIngredient()] : prev.filter((item) => item.id !== id),
    );
  };

  return (
    <fieldset className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-950/40 p-4 text-sm text-slate-200">
      <legend className="flex items-center gap-2 px-2 text-xs uppercase tracking-[0.26em] text-slate-500">
        Ingredients
      </legend>

      <p className="text-xs text-slate-400">
        Add each ingredient with an estimated serving and macros. Totals below
        update automatically so you can copy them into the meal macros.
      </p>

      <div className="space-y-4">
        {ingredients.map((ingredient, index) => (
          <div
            key={ingredient.id}
            className="grid gap-3 rounded-xl border border-slate-800/70 bg-slate-900/30 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <label className="flex flex-col gap-1">
                  Ingredient name
                  <input
                    value={ingredient.name}
                    onChange={(event) =>
                      updateIngredient(ingredient.id, "name", event.target.value)
                    }
                    disabled={disabled}
                    className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="Chicken breast"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => removeIngredient(ingredient.id)}
                className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-slate-500 transition hover:border-rose-400/60 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Remove ingredient ${index + 1}`}
                disabled={disabled}
              >
                <MinusCircle className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
              <label className="flex flex-col gap-1">
                Amount
                <input
                  value={ingredient.amount}
                  onChange={(event) =>
                    updateIngredient(ingredient.id, "amount", event.target.value)
                  }
                  placeholder="e.g. 6 oz"
                  disabled={disabled}
                  className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
              <label className="flex flex-col gap-1">
                Calories
                <input
                  type="number"
                  min={0}
                  value={ingredient.calories ?? ""}
                  onChange={(event) =>
                    updateIngredient(ingredient.id, "calories", event.target.value)
                  }
                  disabled={disabled}
                  className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
              <label className="flex flex-col gap-1">
                Protein (g)
                <input
                  type="number"
                  min={0}
                  value={ingredient.protein ?? ""}
                  onChange={(event) =>
                    updateIngredient(ingredient.id, "protein", event.target.value)
                  }
                  disabled={disabled}
                  className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
              <label className="flex flex-col gap-1">
                Carbs (g)
                <input
                  type="number"
                  min={0}
                  value={ingredient.carbs ?? ""}
                  onChange={(event) =>
                    updateIngredient(ingredient.id, "carbs", event.target.value)
                  }
                  disabled={disabled}
                  className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
              <label className="flex flex-col gap-1">
                Fat (g)
                <input
                  type="number"
                  min={0}
                  value={ingredient.fat ?? ""}
                  onChange={(event) =>
                    updateIngredient(ingredient.id, "fat", event.target.value)
                  }
                  disabled={disabled}
                  className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800/70 bg-slate-900/20 px-3 py-2 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-200">
            From ingredients:
          </span>
          <span>{totals.calories} kcal</span>
          <span>{totals.protein} g protein</span>
          <span>{totals.carbs} g carbs</span>
          <span>{totals.fat} g fat</span>
        </div>
        <button
          type="button"
          onClick={addIngredient}
          disabled={disabled}
          className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3 w-3" />
          Add ingredient
        </button>
      </div>

      <input
        type="hidden"
        name="mealIngredients"
        value={JSON.stringify(ingredients)}
      />
    </fieldset>
  );
}
