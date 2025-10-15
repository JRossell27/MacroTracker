import { MobileShell } from "@/components/layout/mobile-shell";
import { Progress } from "@/components/ui/progress";
import { weeklyTrend } from "@/lib/mock-data";
import { CalendarCheck, Flame, Trophy } from "lucide-react";

export default function TrendsPage() {
  const maxMagnitude = Math.max(
    ...weeklyTrend.energySeries.map((point) => Math.abs(point.netCalories)),
  );

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
              {weeklyTrend.averageNetCalories} kcal
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            {weeklyTrend.averageWeightChange} lb / week est.
          </span>
        </div>
        <div className="text-xs text-slate-400">
          Based on data from {weeklyTrend.startDate} - {weeklyTrend.endDate}.
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
          {weeklyTrend.energySeries.map((point) => {
            const height = Math.min(
              100,
              Math.max(18, (Math.abs(point.netCalories) / maxMagnitude) * 100),
            );

            return (
              <div key={point.date} className="flex flex-1 flex-col gap-2">
                <div className="mx-auto flex h-28 w-[70%] items-end rounded-full bg-slate-900/70">
                  <div
                    className="mx-auto w-full rounded-full bg-gradient-to-t from-sky-500 via-sky-400 to-emerald-300"
                    style={{ height: `${height}%` }}
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
              <p className="text-xl font-semibold text-slate-50">
                {weeklyTrend.streak} days
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Great consistency. Missing fewer than two days keeps your streak
            active.
          </p>
        </div>

        <div className="card flex flex-col gap-3 p-5">
          <div className="flex items-center gap-3">
            <CalendarCheck className="h-9 w-9 rounded-full bg-sky-500/10 p-2 text-sky-300" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Plan compliance
              </p>
              <p className="text-xl font-semibold text-slate-50">
                {weeklyTrend.compliance}%
              </p>
            </div>
          </div>
          <Progress value={weeklyTrend.compliance} showLabel />
          <p className="text-xs text-slate-400">
            Logged meals and workouts covering {weeklyTrend.compliance}% of
            targets.
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
            <span className="text-slate-100">
              {weeklyTrend.macroBreakdown.protein}%
            </span>
          </div>
          <Progress value={weeklyTrend.macroBreakdown.protein} />
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Carbs</span>
            <span className="text-slate-100">
              {weeklyTrend.macroBreakdown.carbs}%
            </span>
          </div>
          <Progress value={weeklyTrend.macroBreakdown.carbs} />
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Fat</span>
            <span className="text-slate-100">
              {weeklyTrend.macroBreakdown.fat}%
            </span>
          </div>
          <Progress value={weeklyTrend.macroBreakdown.fat} />
        </div>
      </section>
    </MobileShell>
  );
}
