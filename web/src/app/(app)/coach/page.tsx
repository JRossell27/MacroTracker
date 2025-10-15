import { MobileShell } from "@/components/layout/mobile-shell";
import { dailyLog, weeklyTrend } from "@/lib/mock-data";
import {
  Brain,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

const suggestions = [
  {
    icon: Sparkles,
    title: "Optimise evening meal timing",
    detail:
      "Shift your final meal 30 minutes earlier to improve recovery scores recorded by your wearable.",
  },
  {
    icon: Brain,
    title: "Keep protein above 30g/meal",
    detail:
      "Breakfast logged 32g today—great job. Maintain this to support muscle retention while in a deficit.",
  },
  {
    icon: ShieldCheck,
    title: "Recovery focus",
    detail:
      "Schedule a mobility session tomorrow. HRV dipped 4% below your 2-week average after today’s strength workout.",
  },
];

export default function CoachPage() {
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
              {weeklyTrend.averageNetCalories} kcal daily deficit
            </h3>
          </div>
          <span className="rounded-full bg-slate-800/70 px-3 py-1 text-xs font-semibold text-slate-300">
            Trend: {weeklyTrend.averageWeightChange} lb/week
          </span>
        </header>
        <p className="text-sm text-slate-300">
          Keep logging workouts so we can fine-tune your calorie target and
          maintain a sustainable pace of change.
        </p>
      </section>

      <section className="space-y-4">
        {suggestions.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.title}
              className="card flex gap-3 p-5 text-slate-200"
            >
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
              Next action
            </h3>
            <p className="text-xs text-slate-500">
              Improve recovery and stay hydrated tomorrow.
            </p>
          </div>
        </header>
        <ul className="space-y-3 text-sm text-slate-300">
          <li className="rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2">
            Add 16 oz of hydration before noon to stay ahead of your target.
          </li>
          <li className="rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2">
            Log a 15-minute mobility session to bolster recovery after strength
            training.
          </li>
          <li className="rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2">
            Prep tomorrow&apos;s breakfast tonight so you maintain strong
            protein intake.
          </li>
        </ul>
      </section>

      <section className="card space-y-3 p-5">
        <h3 className="text-lg font-semibold text-slate-100">
          Notes from today
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
