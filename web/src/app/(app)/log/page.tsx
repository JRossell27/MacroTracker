import { MobileShell } from "@/components/layout/mobile-shell";
import { Progress } from "@/components/ui/progress";
import { InlineDeleteButton } from "@/components/ui/inline-delete-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDisplayDate, getLocalISODate } from "@/lib/date";
import { deleteMealAction, deleteNoteAction } from "./actions";
import { AddMealForm } from "./_components/add-meal-form";
import { QuickRecipesPanel } from "./_components/quick-recipes-panel";
import { AddHydrationForm } from "./_components/add-hydration-form";
import { ActiveCaloriesForm } from "./_components/active-calories-form";
import { AddNoteForm } from "./_components/add-note-form";
import { DailySummaryForm } from "./_components/daily-summary-form";
import { calculateMealTotals } from "@/lib/nutrition";
import {
  FALLBACK_USER_SETTINGS,
  fetchUserSettings,
  inchesToFeetAndInches,
} from "@/lib/user-settings";
import { readTimezoneOffsetFromCookies } from "@/lib/timezone.server";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarPlus, StickyNote, UtensilsCrossed } from "lucide-react";
import type { Database } from "@/lib/database.types";

type DailyLogRow = Database["public"]["Tables"]["daily_logs"]["Row"];
type MealRow = Database["public"]["Tables"]["meals"]["Row"];
type NoteRow = Database["public"]["Tables"]["daily_notes"]["Row"];

type DailyLogWithRelations = DailyLogRow & {
  meals: Pick<
    MealRow,
    "id" | "name" | "logged_at" | "calories" | "protein" | "carbs" | "fat" | "created_at"
  >[];
  daily_notes: Pick<NoteRow, "id" | "note" | "created_at">[];
};

export default async function LogPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const timezoneOffset = await readTimezoneOffsetFromCookies();
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
        basal_calories,
        active_calories,
        hydration_target_oz,
        hydration_oz,
        weight,
        calories_intake,
        protein_intake,
        carbs_intake,
        fat_intake,
        meals (
          id,
          name,
          logged_at,
          calories,
          protein,
          carbs,
          fat,
          created_at
        ),
        daily_notes (
          id,
          note,
          created_at
        )
      `,
    )
    .eq("user_id", session?.user.id ?? "")
    .eq("log_date", today)
    .order("logged_at", { foreignTable: "meals", ascending: true, nullsFirst: true })
    .order("created_at", { foreignTable: "daily_notes", ascending: false })
    .returns<DailyLogWithRelations[]>()
    .maybeSingle();

  const userId = session?.user.id ?? null;
  const userSettings = userId
    ? await fetchUserSettings(supabase, userId)
    : FALLBACK_USER_SETTINGS;

  const dailyLogId = log?.id ?? null;
  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, name, description, calories, protein, carbs, fat")
    .eq("user_id", session?.user.id ?? "")
    .order("created_at", { ascending: false });

  const meals = log?.meals ?? [];
  const notes = log?.daily_notes ?? [];

  const mealTotals = calculateMealTotals(meals);

  const actualCalories = log?.calories_intake ?? mealTotals.calories;
  const actualProtein = log?.protein_intake ?? mealTotals.protein;
  const actualCarbs = log?.carbs_intake ?? mealTotals.carbs;
  const actualFat = log?.fat_intake ?? mealTotals.fat;

  const safeCalories = actualCalories ?? 0;
  const completion =
    log?.calories_goal && log.calories_goal > 0
      ? Math.min(100, Math.round((safeCalories / log.calories_goal) * 100))
      : 0;

  const summaryDefaults = {
    caloriesGoal: log?.calories_goal ?? userSettings.goals.calories,
    proteinGoal: log?.protein_goal ?? userSettings.goals.protein,
    carbsGoal: log?.carbs_goal ?? userSettings.goals.carbs,
    fatGoal: log?.fat_goal ?? userSettings.goals.fat,
    basalCalories: log?.basal_calories ?? userSettings.goals.basal,
    activeCalories: log?.active_calories ?? userSettings.goals.active,
    hydrationTarget: log?.hydration_target_oz ?? userSettings.goals.hydrationTarget,
    hydrationActual: log?.hydration_oz ?? 0,
    weight: log?.weight ?? userSettings.weightLbs,
  };

  const heightParts = inchesToFeetAndInches(userSettings.bmr.heightInches);
  const bmrDefaults = {
    weightLbs: userSettings.bmr.weightLbs,
    heightFeet: Math.max(4, heightParts.feet || 0),
    heightInches: Math.min(11, Math.max(0, heightParts.inches || 0)),
    age: userSettings.bmr.age,
    sex: userSettings.bmr.sex,
    basalEstimate: userSettings.goals.basal,
  };

  const displayDate = formatDisplayDate(log?.log_date ?? today);
  const hydrationPercent =
    summaryDefaults.hydrationTarget > 0
      ? Math.min(
          100,
          Math.round(
            (summaryDefaults.hydrationActual /
              summaryDefaults.hydrationTarget) *
              100,
          ),
        )
      : 0;
  const hasDailySummary = Boolean(dailyLogId);

  return (
    <MobileShell
      title="Daily log"
      subtitle={`Entries for ${displayDate}`}
    >
      <section className="card space-y-5 p-5">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
            Daily summary
          </p>
          <h2 className="text-xl font-semibold text-slate-50">
            Fine-tune today&apos;s targets
          </h2>
        </header>
        <DailySummaryForm
          logDate={log?.log_date ?? today}
          existing={hasDailySummary}
          defaults={summaryDefaults}
          bmrDefaults={bmrDefaults}
        />
        <p className="text-xs text-slate-500">
          {hasDailySummary
            ? "Update targets anytime—your meals and hydration will adjust instantly."
            : "Save this summary to unlock hydration, activity, meals, and notes for the day."}
        </p>
      </section>

      {hasDailySummary ? (
        <>
          <section className="surface space-y-5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Nutrition logged
                </p>
                <h2 className="text-2xl font-semibold text-slate-50">
                  {safeCalories} kcal
                </h2>
              </div>
              <span className="rounded-full bg-slate-800/70 px-3 py-1 text-xs font-semibold text-slate-300">
                {completion}% of target
              </span>
            </div>
            <Progress value={completion} />
            <div className="grid gap-3 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>Protein</span>
                <span className="font-semibold text-slate-100">
                  {actualProtein}g
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Carbs</span>
                <span className="font-semibold text-slate-100">
                  {actualCarbs}g
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fat</span>
                <span className="font-semibold text-slate-100">
                  {actualFat}g
                </span>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="card space-y-5 p-5">
              <header>
                <h3 className="text-lg font-semibold text-slate-100">
                  Hydration
                </h3>
                <p className="text-xs text-slate-400">
                  Log ounces to keep pace with your target.
                </p>
              </header>
              <Progress value={hydrationPercent} showLabel />
              <div className="text-sm text-slate-300">
                <p>
                  {summaryDefaults.hydrationActual} / {summaryDefaults.hydrationTarget} oz
                </p>
                <p className="text-xs text-slate-500">
                  Tip: aim for half your target before midday.
                </p>
              </div>
              <AddHydrationForm
                dailyLogId={dailyLogId}
                logDate={log?.log_date ?? today}
              />
            </div>

            <div className="card space-y-5 p-5">
              <header>
                <h3 className="text-lg font-semibold text-slate-100">
                  Activity & stats
                </h3>
                <p className="text-xs text-slate-400">
                  Keep weight and burn numbers current for accurate coaching.
                </p>
              </header>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center justify-between">
                  <span>Scale weight</span>
                  <span className="font-semibold text-slate-50">
                    {summaryDefaults.weight ? `${summaryDefaults.weight} lb` : "—"}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Basal calories</span>
                  <span className="font-semibold text-slate-50">
                    {summaryDefaults.basalCalories} kcal
                  </span>
                </li>
              </ul>
              <ActiveCaloriesForm
                dailyLogId={dailyLogId}
                logDate={log?.log_date ?? today}
                currentActive={summaryDefaults.activeCalories}
              />
            </div>
          </section>

          <section className="card space-y-5 p-5">
            <header>
              <h3 className="text-lg font-semibold text-slate-100">
                Add a meal
              </h3>
              <p className="text-xs text-slate-400">
                Log calories and macros to keep your totals accurate.
              </p>
            </header>
            <QuickRecipesPanel recipes={recipes ?? []} dailyLogId={dailyLogId} />
            <AddMealForm dailyLogId={dailyLogId} />
          </section>

          <section className="space-y-4">
            {meals.length === 0 ? (
              <EmptyState
                variant="subtle"
                icon={<UtensilsCrossed className="h-5 w-5" />}
                title="No meals logged yet"
                description="Add your first meal to see macro breakdowns and timing here."
                className="px-6 py-8 text-sm"
              />
            ) : (
              meals.map((meal) => {
                const displayTime = meal.logged_at
                  ? meal.logged_at.slice(0, 5)
                  : "—";
                return (
                  <article key={meal.id} className="surface space-y-4 p-5">
                    <header className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-100">
                          {meal.name}
                        </h4>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          {displayTime}
                        </p>
                      </div>
                      <div className="text-right text-sm text-slate-300">
                        <span className="block font-semibold text-slate-100">
                          {meal.calories ?? 0} kcal
                        </span>
                        <span>
                          {meal.protein ?? 0}P • {meal.carbs ?? 0}C •{" "}
                          {meal.fat ?? 0}F
                        </span>
                      </div>
                    </header>
                    <footer className="flex items-center justify-end">
                      <form action={deleteMealAction}>
                        <input type="hidden" name="mealId" value={meal.id} />
                        <input
                          type="hidden"
                          name="dailyLogId"
                          value={log?.id ?? ""}
                        />
                        <InlineDeleteButton label="Delete meal" />
                      </form>
                    </footer>
                  </article>
                );
              })
            )}
          </section>

          <section className="card space-y-5 p-5">
            <header>
              <h3 className="text-lg font-semibold text-slate-100">
                Notes & observations
              </h3>
              <p className="text-xs text-slate-400">
                Capture energy levels, cravings, or anything your coach should
                know.
              </p>
            </header>
            <AddNoteForm dailyLogId={log?.id ?? null} />
            {notes.length === 0 ? (
              <EmptyState
                variant="subtle"
                icon={<StickyNote className="h-5 w-5" />}
                title="No notes yet"
                description="Use notes to flag stand-out workouts, stress, or nutrition wins."
                className="px-6 py-8 text-sm"
              />
            ) : (
              <ul className="space-y-3 text-sm text-slate-300">
                {notes.map((note) => (
                  <li
                    key={note.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-3"
                  >
                    <span>{note.note}</span>
                    <form action={deleteNoteAction}>
                      <input type="hidden" name="noteId" value={note.id} />
                      <InlineDeleteButton label="Remove" />
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : (
        <EmptyState
          icon={<CalendarPlus className="h-5 w-5" />}
          title="Ready to start logging?"
          description="Save your day summary above to unlock hydration, activity, meals, and notes for today."
          action={
            <span className="text-xs text-slate-500">
              Tip: we already prefilled your targets based on recent days.
            </span>
          }
        />
      )}
    </MobileShell>
  );
}
