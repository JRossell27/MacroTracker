import { MobileShell } from "@/components/layout/mobile-shell";
import { Progress } from "@/components/ui/progress";
import { dailyLog } from "@/lib/mock-data";
import { Camera, CopyPlus, NotebookPen } from "lucide-react";

export default function LogPage() {
  const completion = Math.round(
    (dailyLog.intake.calories / dailyLog.goal.calories) * 100,
  );

  return (
    <MobileShell
      title="Daily log"
      subtitle="Keep meals detailed for more accurate coaching."
      headerAction={
        <button className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-700/60 px-4 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-900/80">
          <NotebookPen className="h-4 w-4 text-sky-400" />
          Quick add
        </button>
      }
    >
      <section className="surface space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Nutrition logged
            </p>
            <h2 className="text-2xl font-semibold text-slate-50">
              {dailyLog.intake.calories} kcal
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
              {dailyLog.intake.protein}g
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Carbs</span>
            <span className="font-semibold text-slate-100">
              {dailyLog.intake.carbs}g
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Fat</span>
            <span className="font-semibold text-slate-100">
              {dailyLog.intake.fat}g
            </span>
          </div>
        </div>
      </section>

      <section className="card space-y-3 p-5">
        <h3 className="text-lg font-semibold text-slate-100">
          Logging shortcuts
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm font-medium">
          <button className="surface flex items-center gap-2 rounded-2xl px-4 py-3 text-left text-slate-200 transition hover:border-slate-700 hover:bg-slate-900/80">
            <Camera className="h-5 w-5 text-sky-400" />
            Scan barcode
          </button>
          <button className="surface flex items-center gap-2 rounded-2xl px-4 py-3 text-left text-slate-200 transition hover:border-slate-700 hover:bg-slate-900/80">
            <CopyPlus className="h-5 w-5 text-sky-400" />
            Copy yesterday
          </button>
        </div>
      </section>

      <section className="space-y-4">
        {dailyLog.meals.map((meal) => (
          <article key={meal.name} className="surface space-y-4 p-5">
            <header className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-100">
                  {meal.name}
                </h4>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {meal.time}
                </p>
              </div>
              <div className="text-right text-sm text-slate-300">
                <span className="block font-semibold text-slate-100">
                  {meal.macros.calories} kcal
                </span>
                <span>
                  {meal.macros.protein}P • {meal.macros.carbs}C •{" "}
                  {meal.macros.fat}F
                </span>
              </div>
            </header>
            <ul className="space-y-3 text-sm text-slate-300">
              {meal.items.map((item) => (
                <li
                  key={`${meal.name}-${item.name}`}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-slate-200">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.serving}</p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    {item.macros.calories && (
                      <p className="text-slate-100">
                        {item.macros.calories} kcal
                      </p>
                    )}
                    <p>
                      {item.macros.protein ? `${item.macros.protein}P ` : ""}
                      {item.macros.carbs ? `${item.macros.carbs}C ` : ""}
                      {item.macros.fat ? `${item.macros.fat}F` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </MobileShell>
  );
}
