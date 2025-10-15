import { MobileShell } from "@/components/layout/mobile-shell";
import { Progress } from "@/components/ui/progress";
import {
  dailyLog,
  getEstimatedWeightChange,
  getNetCalories,
} from "@/lib/mock-data";
import {
  Activity,
  Flame,
  Droplet,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const macroLabels: Record<"protein" | "carbs" | "fat", string> = {
  protein: "Protein",
  carbs: "Carbs",
  fat: "Fat",
};

const macroUnits: Record<"protein" | "carbs" | "fat", string> = {
  protein: "g",
  carbs: "g",
  fat: "g",
};

export default function DashboardPage() {
  const netCalories = getNetCalories(dailyLog);
  const estimatedChange = getEstimatedWeightChange(netCalories);
  const hydrationPercent = Math.min(
    100,
    Math.round((dailyLog.hydrationOz / dailyLog.hydrationTargetOz) * 100),
  );

  const weightChangeLabel =
    estimatedChange === 0
      ? "maintenance"
      : `${estimatedChange > 0 ? "+" : ""}${estimatedChange} lb est. today`;

  return (
    <MobileShell
      title="Dashboard"
      subtitle="Keep logging to stay on track with your goals."
      headerAction={
        <button className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-700/60 px-4 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-900/80">
          <Flame className="h-4 w-4 text-sky-400" />
          Log food
        </button>
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
                {dailyLog.intake.calories} kcal
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Active calories</dt>
              <dd className="font-semibold text-emerald-300">
                -{dailyLog.activeCalories}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Basal burn</dt>
              <dd className="font-semibold text-emerald-300">
                -{dailyLog.basalCalories}
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
          {(Object.keys(macroLabels) as (keyof typeof macroLabels)[]).map(
            (key) => {
              const goal = dailyLog.goal[key];
              const actual = dailyLog.intake[key];
              const percent = Math.min(100, Math.round((actual / goal) * 100));

              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-200">
                      {macroLabels[key]}
                    </span>
                    <span className="text-slate-400">
                      {actual}
                      {macroUnits[key]} / {goal}
                      {macroUnits[key]}
                    </span>
                  </div>
                  <Progress value={percent} />
                </div>
              );
            },
          )}
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
                {dailyLog.hydrationOz} / {dailyLog.hydrationTargetOz} oz
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
                {dailyLog.activeCalories} kcal
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Logged from Apple Watch strength session + 9,100 steps.
          </p>
          <button className="text-sm font-medium text-sky-400">
            Sync wearable
          </button>
        </div>
      </section>

      <section className="surface space-y-3 p-5">
        <h3 className="text-lg font-semibold text-slate-100">
          Coach insights
        </h3>
        <ul className="space-y-2 text-sm text-slate-300">
          {dailyLog.notes.map((note) => (
            <li
              key={note}
              className="rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2"
            >
              {note}
            </li>
          ))}
        </ul>
      </section>
    </MobileShell>
  );
}
