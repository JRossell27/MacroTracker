import type { Database } from "./database.types";

type MealRow = Pick<
  Database["public"]["Tables"]["meals"]["Row"],
  "calories" | "protein" | "carbs" | "fat"
> & Record<string, unknown>;
type DailyLogRow = Database["public"]["Tables"]["daily_logs"]["Row"];

export function calculateMealTotals(meals: MealRow[] = []) {
  return meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories ?? 0),
      protein: acc.protein + (meal.protein ?? 0),
      carbs: acc.carbs + (meal.carbs ?? 0),
      fat: acc.fat + (meal.fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function calculateNetCalories(log: Pick<
  DailyLogRow,
  "calories_intake" | "basal_calories" | "active_calories"
>) {
  const intake = log.calories_intake ?? 0;
  const basal = log.basal_calories ?? 0;
  const active = log.active_calories ?? 0;
  return intake - basal - active;
}

export function estimateWeightChange(netCalories: number) {
  if (!Number.isFinite(netCalories)) return 0;
  const pounds = netCalories / 3500;
  return Math.round(pounds * 100) / 100;
}
