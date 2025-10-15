import Link from "next/link";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Progress } from "@/components/ui/progress";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLocalISODate } from "@/lib/date";
import { readTimezoneOffsetFromCookies } from "@/lib/timezone.server";
import {
  calculateMealTotals,
  calculateNetCalories,
  estimateWeightChange,
} from "@/lib/nutrition";
import {
  Activity,
  Flame,
  Droplet,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { Database } from "@/lib/database.types";

type DailyLogRow = Database["public"]["Tables"]["daily_logs"]["Row"];
type MealRow = Database["public"]["Tables"]["meals"]["Row"];
type NoteRow = Database["public"]["Tables"]["daily_notes"]["Row"];

type DailyLogWithRelations = DailyLogRow & {
  meals: Pick<MealRow, "calories" | "protein" | "carbs" | "fat">[];
  daily_notes: Pick<NoteRow, "id" | "note">[];
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const timezoneOffset = readTimezoneOffsetFromCookies();
  const today = getLocalISODate(new Date(), timezoneOffset);

  const { data: log } = await supabase
    .from("daily_logs")
    .select(
      `
        id,
        log_date,
        calories_goal,
        protein_goal,
        carbs_goal,
        fat_goal,
        calories_intake,
        protein_intake,
        carbs_intake,
        fat_intake,
        active_calories,
        basal_calories,
        hydration_oz,
        hydration_target_oz,
        meals (calories, protein, carbs, fat),
        daily_notes (id, note)
      `,
    )
    .eq("user_id", session?.user.id ?? "")
    .eq("log_date", today)
    .returns<DailyLogWithRelations[]>()
    .maybeSingle();

  const meals = log?.meals ?? [];
  const notes = log?.daily_notes ?? [];
  const mealTotals = calculateMealTotals(meals);

  const actualCalories = log?.calories_intake ?? mealTotals.calories;
  const actualProtein = log?.protein_intake ?? mealTotals.protein;
  const actualCarbs = log?.carbs_intake ?? mealTotals.carbs;
  const actualFat = log?.fat_intake ?? mealTotals.fat;

  const netCalories = log
    ? calculateNetCalories({
        calories_intake: actualCalories,
        basal_calories: log.basal_calories,
        active_calories: log.active_calories,
      })
    : 0;

  const estimatedChange = estimateWeightChange(netCalories);
  const weightChangeLabel =
    estimatedChange === 0
      ? "maintenance"
      : `${estimatedChange > 0 ? "+" : ""}${estimatedChange} lb est. today`;

  const hydrationTarget = log?.hydration_target_oz ?? 0;
  const hydrationActual = log?.hydration_oz ?? 0;
  const hydrationPercent =
    hydrationTarget > 0
      ? Math.min(100, Math.round((hydrationActual / hydrationTarget) * 100))
      : 0;

  const macroProgress = [
    {
      key: "protein",
      label: "Protein",
      actual: actualProtein ?? 0,
      goal: log?.protein_goal ?? 0,
      unit: "g",
    },
    {
      key: "carbs",
      label: "Carbs",
      actual: actualCarbs ?? 0,
      goal: log?.carbs_goal ?? 0,
      unit: "g",
    },
    {
      key: "fat",
      label: "Fat",
      actual: actualFat ?? 0,
      goal: log?.fat_goal ?? 0,
      unit: "g",
    },
  ];

  return (
    <MobileShell
      title="Dashboard"
      subtitle="Keep logging to stay on track with your goals."
      headerAction={
        <Link
          href="/log"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-700/60 px-4 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-900/80"
        >
          <Flame className="h-4 w-4 text-sky-400" />
          Log food
        </Link>
      }
    >
      <section className="card space-y-4 p-5">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Today&apos;s balance
            </p>
            <h2 className="text-2xl font-semibold text-slate-50">
              {netCalories} kcal
            </h2>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
              netCalories <= 0
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-rose-500/10 text-rose-400"
            }`}
          >
            {netCalories <= 0 ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            {weightChangeLabel}
          </span>
        </header>

        <div className="rounded-2xl border border-slate-800/60 bg-[#080f1f]/80 p-4">
          <dl className="grid gap-3 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <dt>Food consumed</dt>
              <dd className="font-semibold text-slate-100">
                {actualCalories} kcal
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Active calories</dt>
              <dd className="font-semibold text-emerald-300">
                -{log?.active_calories ?? 0}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Basal burn</dt>
              <dd className="font-semibold text-emerald-300">
                -{log?.basal_calories ?? 0}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="surface space-y-4 p-5">
        <header>
          <h3 className="text-lg font-semibold text-slate-100">
            Macro progress
          </h3>
          <p className="text-xs text-slate-400">
            Targets auto-adjust when your weight or activity trends change.
          </p>
        </header>

        <div className="space-y-4">
          {macroProgress.map(({ key, label, actual, goal, unit }) => {
            const percent =
              goal > 0 ? Math.min(100, Math.round((actual / goal) * 100)) : 0;

            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-200">{label}</span>
                  <span className="text-slate-400">
                    {actual}
                    {unit} / {goal}
                    {unit}
                  </span>
                </div>
                <Progress value={percent} />
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <div className="card flex flex-col gap-4 p-5">
          <div className="flex items-center gap-3">
            <Droplet className="h-10 w-10 rounded-full bg-sky-500/10 p-2 text-sky-400" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Hydration
              </p>
              <p className="text-lg font-semibold text-slate-50">
                {hydrationActual} / {hydrationTarget} oz
              </p>
            </div>
          </div>
          <Progress value={hydrationPercent} />
          <p className="text-xs text-slate-400">
            Add another 16 oz to hit your target.
          </p>
        </div>

        <div className="card flex flex-col gap-4 p-5">
          <div className="flex items-center gap-3">
            <Activity className="h-10 w-10 rounded-full bg-emerald-500/10 p-2 text-emerald-400" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Active calories
              </p>
              <p className="text-lg font-semibold text-slate-50">
                {log?.active_calories ?? 0} kcal
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Sync your wearable to import workouts automatically.
          </p>
          <Link href="/log" className="text-sm font-medium text-sky-400">
            Update today&apos;s data
          </Link>
        </div>
      </section>

      <section className="surface space-y-3 p-5">
        <h3 className="text-lg font-semibold text-slate-100">
          Coach insights
        </h3>
        <ul className="space-y-2 text-sm text-slate-300">
          {notes.length === 0 ? (
            <li className="rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2 text-slate-500">
              No insights yet. Add notes on the log tab to build your coaching
              feed.
            </li>
          ) : (
            notes.map((note) => (
              <li
                key={note.id}
                className="rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2"
              >
                {note.note}
              </li>
            ))
          )}
        </ul>
      </section>
    </MobileShell>
  );
}
