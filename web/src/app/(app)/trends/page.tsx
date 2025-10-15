import { MobileShell } from "@/components/layout/mobile-shell";
import { Progress } from "@/components/ui/progress";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLocalISODate, parseISODate } from "@/lib/date";
import { readTimezoneOffsetFromCookies } from "@/lib/timezone.server";
import { calculateNetCalories } from "@/lib/nutrition";
import { CalendarCheck, Flame, Trophy } from "lucide-react";

type WeeklyLog = {
  log_date: string;
  calories_intake: number | null;
  basal_calories: number | null;
  active_calories: number | null;
  protein_intake: number | null;
  carbs_intake: number | null;
  fat_intake: number | null;
  weight: number | null;
};

type RecentLog = {
  log_date: string;
};

function buildDateRange(start: Date, days: number, offset?: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const iso = getLocalISODate(date, offset);
    const labelDate = new Date(`${iso}T00:00:00`);
    const label = labelDate.toLocaleDateString(undefined, { weekday: "short" });
    return { iso, label, date: labelDate };
  });
}

function calculateStreak(logDates: RecentLog[], todayIso: string, offset?: number) {
  if (!logDates.length) return 0;
  const logSet = new Set(logDates.map((item) => item.log_date));
  let streak = 0;
  const cursor = parseISODate(todayIso);

  while (true) {
    const iso = getLocalISODate(cursor, offset);
    if (!logSet.has(iso)) {
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export default async function TrendsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const timezoneOffset = await readTimezoneOffsetFromCookies();
  const today = new Date();
  const todayIso = getLocalISODate(today, timezoneOffset);
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 6);
  const startIso = getLocalISODate(startDate, timezoneOffset);

  const { data: weeklyLogs } = await supabase
    .from("daily_logs")
    .select(
      "log_date, calories_intake, basal_calories, active_calories, protein_intake, carbs_intake, fat_intake, weight",
    )
    .eq("user_id", session?.user.id ?? "")
    .gte("log_date", startIso)
    .lte("log_date", todayIso)
    .order("log_date", { ascending: true })
    .returns<WeeklyLog[]>();

  const { data: recentLogs } = await supabase
    .from("daily_logs")
    .select("log_date")
    .eq("user_id", session?.user.id ?? "")
    .order("log_date", { ascending: false })
    .limit(30)
    .returns<RecentLog[]>();

  const logsByDate = new Map((weeklyLogs ?? []).map((log) => [log.log_date, log]));
  const range = buildDateRange(startDate, 7, timezoneOffset).map((day) => ({
    ...day,
    log: logsByDate.get(day.iso) ?? null,
  }));

  const daysWithEntries = range.filter((day) => day.log);
  const netValues = daysWithEntries.map((day) =>
    calculateNetCalories({
      calories_intake: day.log?.calories_intake ?? 0,
      basal_calories: day.log?.basal_calories ?? 0,
      active_calories: day.log?.active_calories ?? 0,
    }),
  );

  const averageNetCalories = netValues.length
    ? Math.round(netValues.reduce((sum, value) => sum + value, 0) / netValues.length)
    : 0;

  const energySeries = range.map((day) => ({
    date: day.label,
    netCalories: calculateNetCalories({
      calories_intake: day.log?.calories_intake ?? 0,
      basal_calories: day.log?.basal_calories ?? 0,
      active_calories: day.log?.active_calories ?? 0,
    }),
    present: Boolean(day.log),
  }));

  const maxMagnitude = Math.max(
    1,
    ...energySeries.map((point) => Math.abs(point.netCalories)),
  );

  const weights = range
    .map((day) => day.log?.weight)
    .filter((weight): weight is number => typeof weight === "number");

  let averageWeightChange = 0;
  if (weights.length >= 2) {
    const first = weights[0];
    const last = weights[weights.length - 1];
    averageWeightChange = Math.round((last - first) * 100) / 100;
  }

  const totalProtein = range.reduce(
    (sum, day) => sum + (day.log?.protein_intake ?? 0),
    0,
  );
  const totalCarbs = range.reduce(
    (sum, day) => sum + (day.log?.carbs_intake ?? 0),
    0,
  );
  const totalFat = range.reduce(
    (sum, day) => sum + (day.log?.fat_intake ?? 0),
    0,
  );

  const totalMacroCalories = totalProtein * 4 + totalCarbs * 4 + totalFat * 9;
  const macroBreakdown = totalMacroCalories
    ? {
        protein: Math.round(((totalProtein * 4) / totalMacroCalories) * 100),
        carbs: Math.round(((totalCarbs * 4) / totalMacroCalories) * 100),
        fat: Math.round(((totalFat * 9) / totalMacroCalories) * 100),
      }
    : { protein: 0, carbs: 0, fat: 0 };

  const loggedDays = daysWithEntries.length;
  const compliance = Math.round((loggedDays / range.length) * 100);

  const streak = calculateStreak(recentLogs ?? [], todayIso, timezoneOffset);

  return (
    <MobileShell
      title="Trends"
      subtitle="Zoom out to understand how habits affect your goals."
    >
      <section className="card grid gap-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Avg daily net
            </p>
            <p className="text-3xl font-semibold text-emerald-300">
              {averageNetCalories} kcal
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            {averageWeightChange} lb change
          </span>
        </div>
        <div className="text-xs text-slate-400">
          Based on data from {startIso} - {todayIso}.
        </div>
      </section>

      <section className="surface space-y-4 p-5">
        <header className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-100">
            Energy balance
          </h3>
          <span className="text-xs text-slate-500">Net calories</span>
        </header>
        <div className="relative flex items-end gap-3">
          {energySeries.map((point) => {
            const height = Math.min(
              100,
              Math.max(18, (Math.abs(point.netCalories) / maxMagnitude) * 100),
            );

            return (
              <div key={point.date} className="flex flex-1 flex-col gap-2">
                <div className="mx-auto flex h-28 w-[70%] items-end rounded-full bg-slate-900/70">
                  <div
                    className="mx-auto w-full rounded-full bg-gradient-to-t from-sky-500 via-sky-400 to-emerald-300"
                    style={{ height: `${height}%`, opacity: point.present ? 1 : 0.3 }}
                  />
                </div>
                <span className="text-center text-xs text-slate-500">
                  {point.date}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-400">
          Keep your average deficit between 350-550 kcal for steady fat loss.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <div className="card flex flex-col gap-3 p-5">
          <div className="flex items-center gap-3">
            <Trophy className="h-9 w-9 rounded-full bg-amber-500/10 p-2 text-amber-300" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Streak
              </p>
              <p className="text-xl font-semibold text-slate-50">{streak} days</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Log daily to grow your streak and unlock richer insights.
          </p>
        </div>

        <div className="card flex flex-col gap-3 p-5">
          <div className="flex items-center gap-3">
            <CalendarCheck className="h-9 w-9 rounded-full bg-sky-500/10 p-2 text-sky-300" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Plan compliance
              </p>
              <p className="text-xl font-semibold text-slate-50">{compliance}%</p>
            </div>
          </div>
          <Progress value={compliance} showLabel />
          <p className="text-xs text-slate-400">
            Logged meals and workouts covering {compliance}% of targets this week.
          </p>
        </div>
      </section>

      <section className="surface space-y-4 p-5">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              Macro averages
            </h3>
            <p className="text-xs text-slate-500">
              Breakdown of calories from each macro.
            </p>
          </div>
          <Flame className="h-5 w-5 text-sky-300" />
        </header>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Protein</span>
            <span className="text-slate-100">{macroBreakdown.protein}%</span>
          </div>
          <Progress value={macroBreakdown.protein} />
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Carbs</span>
            <span className="text-slate-100">{macroBreakdown.carbs}%</span>
          </div>
          <Progress value={macroBreakdown.carbs} />
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Fat</span>
            <span className="text-slate-100">{macroBreakdown.fat}%</span>
          </div>
          <Progress value={macroBreakdown.fat} />
        </div>
      </section>
    </MobileShell>
  );
}
