import type { ComponentType } from "react";
import { MobileShell } from "@/components/layout/mobile-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLocalISODate } from "@/lib/date";
import { readTimezoneOffsetFromCookies } from "@/lib/timezone.server";
import {
  calculateNetCalories,
  estimateWeightChange,
} from "@/lib/nutrition";
import {
  Brain,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import type { Database } from "@/lib/database.types";

type DailyLogRow = Database["public"]["Tables"]["daily_logs"]["Row"];
type NoteRow = Database["public"]["Tables"]["daily_notes"]["Row"];

type DailyLogWithNotes = DailyLogRow & {
  daily_notes: Pick<NoteRow, "id" | "note">[];
};

type WeeklyLog = Pick<
  DailyLogRow,
  "calories_intake" | "active_calories" | "basal_calories"
>;

type Suggestion = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  detail: string;
};

export default async function CoachPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const timezoneOffset = readTimezoneOffsetFromCookies();
  const todayIso = getLocalISODate(new Date(), timezoneOffset);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);
  const startIso = getLocalISODate(startDate, timezoneOffset);

  const { data: todayLog } = await supabase
    .from("daily_logs")
    .select(
      "id, log_date, calories_goal, protein_goal, carbs_goal, fat_goal, calories_intake, protein_intake, carbs_intake, fat_intake, hydration_oz, hydration_target_oz, active_calories, basal_calories, weight, daily_notes(id, note)",
    )
    .eq("user_id", session?.user.id ?? "")
    .eq("log_date", todayIso)
    .returns<DailyLogWithNotes[]>()
    .maybeSingle();

  const { data: weeklyLogs } = await supabase
    .from("daily_logs")
    .select("calories_intake, active_calories, basal_calories")
    .eq("user_id", session?.user.id ?? "")
    .gte("log_date", startIso)
    .lte("log_date", todayIso)
    .order("log_date", { ascending: true })
    .returns<WeeklyLog[]>();

  const weeklyNetValues = (weeklyLogs ?? []).map((log) =>
    calculateNetCalories({
      calories_intake: log.calories_intake ?? 0,
      active_calories: log.active_calories ?? 0,
      basal_calories: log.basal_calories ?? 0,
    }),
  );

  const averageNet = weeklyNetValues.length
    ? Math.round(
        weeklyNetValues.reduce((sum, value) => sum + value, 0) /
          weeklyNetValues.length,
      )
    : 0;

  const todayNet = todayLog
    ? calculateNetCalories({
        calories_intake: todayLog.calories_intake ?? 0,
        active_calories: todayLog.active_calories ?? 0,
        basal_calories: todayLog.basal_calories ?? 0,
      })
    : 0;

  const todayWeightChange = estimateWeightChange(todayNet);
  const hydrationTarget = todayLog?.hydration_target_oz ?? 0;
  const hydrationActual = todayLog?.hydration_oz ?? 0;
  const hydrationGap = Math.max(0, hydrationTarget - hydrationActual);

  const proteinGoal = todayLog?.protein_goal ?? 0;
  const proteinActual = todayLog?.protein_intake ?? 0;
  const proteinGap = Math.max(0, proteinGoal - proteinActual);

  const suggestions: Suggestion[] = [];

  if (!todayLog) {
    suggestions.push({
      icon: Sparkles,
      title: "Set up today’s macro targets",
      detail:
        "Create your day summary so we can coach you on calories, macros, and hydration.",
    });
  } else {
    if (hydrationGap >= 16) {
      suggestions.push({
        icon: ShieldCheck,
        title: "Hydration lagging",
        detail: `You’re ${hydrationGap} oz short of today’s goal. Aim for a 16 oz glass in the next hour.`,
      });
    }

    if (proteinGoal > 0 && proteinGap > proteinGoal * 0.15) {
      suggestions.push({
        icon: Brain,
        title: "Boost evening protein",
        detail:
          "Add 20-25g of protein to dinner or a late snack to hit today’s target and support recovery.",
      });
    }

    if (todayNet < -600) {
      suggestions.push({
        icon: Sparkles,
        title: "Deficit running hot",
        detail:
          "You’re deep in a deficit today. Consider a carb-focused snack to keep energy stable.",
      });
    } else if (todayNet > 150) {
      suggestions.push({
        icon: Sparkles,
        title: "Slight surplus detected",
        detail:
          "You’re trending above maintenance. Trim ~150 kcal from dinner to stay on target.",
      });
    }
  }

  if (suggestions.length === 0) {
    suggestions.push({
      icon: Sparkles,
      title: "Strong consistency",
      detail:
        "Your logging looks great today. Keep the streak alive and prepare tomorrow’s meals now.",
    });
  }

  const nextActions: string[] = [];

  if (hydrationGap > 0) {
    nextActions.push(`Drink ${hydrationGap} oz of water before bed to close the gap.`);
  }

  if ((todayLog?.active_calories ?? 0) < 400) {
    nextActions.push(
      "Schedule a brisk 20-minute walk or ride to lift active calories tomorrow.",
    );
  }

  if (proteinGap > 0) {
    nextActions.push(
      "Prep a high-protein snack (Greek yogurt, shake) to stay over 30g per meal.",
    );
  }

  if (nextActions.length === 0) {
    nextActions.push(
      "Review tomorrow’s meal plan now so tracking stays effortless when the day gets busy.",
    );
  }

  const notes = todayLog?.daily_notes ?? [];

  return (
    <MobileShell
      title="Coach"
      subtitle="Personalised guidance based on your logging patterns."
    >
      <section className="surface space-y-4 p-5">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Focus metric
            </p>
            <h3 className="text-lg font-semibold text-slate-50">
              {averageNet} kcal average deficit this week
            </h3>
          </div>
          <span className="rounded-full bg-slate-800/70 px-3 py-1 text-xs font-semibold text-slate-300">
            Today: {todayWeightChange} lb est.
          </span>
        </header>
        <p className="text-sm text-slate-300">
          Stay within a 350-550 kcal deficit for sustainable progress. Your current
          trajectory keeps you on pace if you stay consistent with logging.
        </p>
      </section>

      <section className="space-y-4">
        {suggestions.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="card flex gap-3 p-5 text-slate-200">
              <Icon className="mt-1 h-6 w-6 text-sky-300" />
              <div>
                <h4 className="text-base font-semibold text-slate-50">
                  {item.title}
                </h4>
                <p className="text-sm text-slate-400">{item.detail}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="surface space-y-4 p-5">
        <header className="flex items-center gap-3">
          <Target className="h-10 w-10 rounded-full bg-sky-500/10 p-2 text-sky-300" />
          <div>
            <h3 className="text-lg font-semibold text-slate-50">
              Next best actions
            </h3>
            <p className="text-xs text-slate-500">
              Small adjustments to keep momentum rolling.
            </p>
          </div>
        </header>
        <ul className="space-y-3 text-sm text-slate-300">
          {nextActions.map((action) => (
            <li
              key={action}
              className="rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2"
            >
              {action}
            </li>
          ))}
        </ul>
      </section>

      <section className="card space-y-3 p-5">
        <h3 className="text-lg font-semibold text-slate-100">
          Notes from today
        </h3>
        <ul className="space-y-2 text-sm text-slate-300">
          {notes.length === 0 ? (
            <li className="rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2 text-slate-500">
              No notes yet. Jot down observations on the log screen to power future coaching.
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
