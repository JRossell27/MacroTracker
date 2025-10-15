"use client";

import { useActionState, useMemo, useState } from "react";
import { Calculator, Info, Sparkles } from "lucide-react";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import {
  applyGoalRecommendationAction,
  type GoalRecommendationPayload,
} from "../actions";
import { LOG_ACTION_INITIAL_STATE } from "../shared-state";

type GoalAdvisorProps = {
  logDate: string;
  dailyLogId: string | null;
  currentGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  weight: number | null;
};

const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

const goalAdjustments: Record<string, number> = {
  lose: -450,
  maintain: 0,
  gain: 300,
};

const activityLabels: Record<string, string> = {
  sedentary: "Mostly seated / <5k steps",
  light: "Light exercise 1-2x weekly",
  moderate: "Exercise 3-5x weekly",
  active: "Manual work or 6-7 workouts",
  athlete: "Two-a-days or heavy training",
};


const sexOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const goalOptions = [
  { value: "lose", label: "Fat loss" },
  { value: "maintain", label: "Maintain" },
  { value: "gain", label: "Gain muscle" },
];

export function GoalAdvisor({
  logDate,
  dailyLogId,
  currentGoals,
  weight,
}: GoalAdvisorProps) {
  const [inputs, setInputs] = useState({
    weightLbs: weight ?? 180,
    heightFeet: 5,
    heightInches: 10,
    age: 30,
    sex: "male",
    activity: "moderate",
    goal: "lose",
    proteinPerLb: 1.0,
    fatPercent: 0.28,
  });

  const [state, dispatch, pending] = useActionState(
    applyGoalRecommendationAction,
    LOG_ACTION_INITIAL_STATE,
  );
  const currentState = state ?? LOG_ACTION_INITIAL_STATE;

  const recommendation = useMemo(() => {
    const weightLbs = Math.max(80, Number(inputs.weightLbs) || 80);
    const weightKg = weightLbs * 0.453592;
    const heightIn = Math.max(
      56,
      Number(inputs.heightFeet) * 12 + Number(inputs.heightInches) || 68,
    );
    const heightCm = heightIn * 2.54;
    const age = Math.max(16, Number(inputs.age) || 30);
    const activity = activityMultipliers[inputs.activity] ?? 1.55;
    const goalAdj = goalAdjustments[inputs.goal] ?? -450;
    const bmr =
      inputs.sex === "male"
        ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
        : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    const tdee = bmr * activity;
    const calories = Math.max(1200, Math.round(tdee + goalAdj));
    const protein = Math.round(
      Math.max(0.7, Number(inputs.proteinPerLb)) * weightLbs,
    );
    const fat = Math.round(
      Math.max(0.2, Math.min(0.4, Number(inputs.fatPercent))) *
        calories /
        9,
    );
    const carbs = Math.max(
      0,
      Math.round((calories - protein * 4 - fat * 9) / 4),
    );
    const deficit = Math.round(currentGoals.calories - calories);

    const payload: GoalRecommendationPayload = {
      logDate,
      calories,
      protein,
      carbs,
      fat,
    };

    return {
      calories,
      protein,
      carbs,
      fat,
      tdee: Math.round(tdee),
      deficit,
      payload,
    };
  }, [inputs, currentGoals, logDate]);

  const handleInputChange = (
    field: keyof typeof inputs,
    value: string | number,
  ) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <article className="surface space-y-5 p-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Goal Advisor
          </p>
          <h3 className="text-lg font-semibold text-slate-100">
            Personalised targets
          </h3>
        </div>
        <Sparkles className="h-6 w-6 text-sky-400" />
      </header>

      <div className="grid gap-3 text-sm text-slate-300">
        <label className="flex flex-col gap-1">
          Current weight (lb)
          <input
            type="number"
            min={80}
            max={600}
            value={inputs.weightLbs}
            onChange={(event) =>
              handleInputChange("weightLbs", Number(event.target.value))
            }
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            Height (ft)
            <input
              type="number"
              min={4}
              max={7}
              value={inputs.heightFeet}
              onChange={(event) =>
                handleInputChange("heightFeet", Number(event.target.value))
              }
              className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            />
          </label>
          <label className="flex flex-col gap-1">
            Inches
            <input
              type="number"
              min={0}
              max={11}
              value={inputs.heightInches}
              onChange={(event) =>
                handleInputChange("heightInches", Number(event.target.value))
              }
              className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          Age
          <input
            type="number"
            min={16}
            max={80}
            value={inputs.age}
            onChange={(event) =>
              handleInputChange("age", Number(event.target.value))
            }
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
          />
        </label>
        <label className="flex flex-col gap-1">
          Biological sex
          <select
            value={inputs.sex}
            onChange={(event) => handleInputChange("sex", event.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
          >
            {sexOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Activity
          <select
            value={inputs.activity}
            onChange={(event) =>
              handleInputChange("activity", event.target.value)
            }
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
          >
            {Object.entries(activityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Goal
          <select
            value={inputs.goal}
            onChange={(event) =>
              handleInputChange("goal", event.target.value)
            }
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
          >
            {goalOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            Protein (g/lb)
            <input
              type="number"
              min={0.6}
              max={1.3}
              step={0.05}
              value={inputs.proteinPerLb}
              onChange={(event) =>
                handleInputChange("proteinPerLb", Number(event.target.value))
              }
              className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            />
          </label>
          <label className="flex flex-col gap-1">
            Fat (% calories)
            <input
              type="number"
              min={0.2}
              max={0.4}
              step={0.02}
              value={inputs.fatPercent}
              onChange={(event) =>
                handleInputChange("fatPercent", Number(event.target.value))
              }
              className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4 text-sm text-slate-200">
        <header className="flex items-center gap-2 text-slate-100">
          <Calculator className="h-4 w-4 text-sky-400" />
          Recommended targets
        </header>
        <dl className="mt-3 grid gap-2">
          <div className="flex items-center justify-between">
            <dt>Total calories</dt>
            <dd className="font-semibold text-slate-50">
              {recommendation.calories} kcal
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>Protein</dt>
            <dd className="font-semibold text-slate-50">
              {recommendation.protein} g
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>Carbs</dt>
            <dd className="font-semibold text-slate-50">
              {recommendation.carbs} g
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>Fat</dt>
            <dd className="font-semibold text-slate-50">
              {recommendation.fat} g
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-slate-400">
          Estimated TDEE {recommendation.tdee} kcal.{" "}
          {recommendation.deficit > 0
            ? `This trims ~${Math.abs(recommendation.deficit)} kcal from your current goal.`
            : recommendation.deficit < 0
              ? `This adds ~${Math.abs(recommendation.deficit)} kcal to support growth.`
              : "Matches your current goal."}
        </p>
        <p className="mt-2 inline-flex items-center gap-2 text-xs text-slate-500">
          <Info className="h-3 w-3" />
          Protein set by lean-mass retention research; fats stay between 20-40%
          of calories.
        </p>
      </div>

      <form action={dispatch} className="space-y-3">
        <input type="hidden" name="logDate" value={logDate} />
        <input
          type="hidden"
          name="dailyLogId"
          value={dailyLogId ?? ""}
        />
        <input
          type="hidden"
          name="recommendedPayload"
          value={JSON.stringify(recommendation.payload)}
        />
        {currentState.status === "error" && (
          <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {currentState.message ??
              "Unable to apply targets right now. Try again shortly."}
          </p>
        )}
        <FormSubmitButton
          pendingLabel="Applying..."
          disabled={pending}
          className="bg-emerald-500 text-slate-900 hover:bg-emerald-400"
        >
          Apply recommendation to today
        </FormSubmitButton>
      </form>
    </article>
  );
}
