import { DailySummaryForm } from "./daily-summary-form";
import { GoalAdvisor } from "./goal-advisor";

type GoalSummaryPanelProps = {
  logDate: string;
  existing: boolean;
  defaults: {
    caloriesGoal: number;
    proteinGoal: number;
    carbsGoal: number;
    fatGoal: number;
    basalCalories: number;
    activeCalories: number;
    hydrationTarget: number;
    hydrationActual: number;
    weight: number | null;
  };
  dailyLogId: string | null;
};

export function GoalSummaryPanel({
  logDate,
  existing,
  defaults,
  dailyLogId,
}: GoalSummaryPanelProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <article className="surface space-y-5 p-5">
        <header>
          <h3 className="text-lg font-semibold text-slate-100">
            Daily targets
          </h3>
          <p className="text-xs text-slate-500">
            This stays constant unless you intentionally change it—update
            goals when your training or body composition shifts.
          </p>
        </header>
        <DailySummaryForm
          logDate={logDate}
          existing={existing}
          defaults={defaults}
        />
      </article>
      <GoalAdvisor
        logDate={logDate}
        dailyLogId={dailyLogId}
        currentGoals={{
          calories: defaults.caloriesGoal,
          protein: defaults.proteinGoal,
          carbs: defaults.carbsGoal,
          fat: defaults.fatGoal,
        }}
        weight={defaults.weight}
      />
    </section>
  );
}
