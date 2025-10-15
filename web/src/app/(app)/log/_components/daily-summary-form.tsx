"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { Calculator } from "lucide-react";
import { saveBmrPreferencesAction, upsertDailyLogAction } from "../actions";
import { LOG_ACTION_INITIAL_STATE } from "../shared-state";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { calculateBmr, type BiologicalSex } from "@/lib/bmr";

type DailySummaryFormProps = {
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
  bmrDefaults: {
    weightLbs: number;
    heightFeet: number;
    heightInches: number;
    age: number;
    sex: BiologicalSex;
    basalEstimate: number;
  };
};

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "";
  if (Number.isNaN(value)) return "";
  return value.toString();
}

export function DailySummaryForm({
  logDate,
  existing,
  defaults,
  bmrDefaults,
}: DailySummaryFormProps) {
  const [state, dispatch] = useActionState(
    upsertDailyLogAction,
    LOG_ACTION_INITIAL_STATE,
  );
  const currentState = state ?? LOG_ACTION_INITIAL_STATE;
  const basalInputRef = useRef<HTMLInputElement | null>(null);

  const handleBasalEstimateApply = (calories: number) => {
    if (basalInputRef.current) {
      const safeValue = Math.round(Math.max(800, calories));
      basalInputRef.current.value = safeValue.toString();
      basalInputRef.current.focus();
    }
  };

  return (
    <form action={dispatch} className="space-y-4">
      <input type="hidden" name="logDate" value={logDate} />
      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Calories goal
          <input
            name="caloriesGoal"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={formatNumber(defaults.caloriesGoal)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            placeholder="2200"
          />
        </label>
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Protein goal (g)
          <input
            name="proteinGoal"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={formatNumber(defaults.proteinGoal)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            placeholder="165"
          />
        </label>
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Carbs goal (g)
          <input
            name="carbsGoal"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={formatNumber(defaults.carbsGoal)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            placeholder="210"
          />
        </label>
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Fat goal (g)
          <input
            name="fatGoal"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={formatNumber(defaults.fatGoal)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            placeholder="70"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Basal calories
          <input
            name="basalCalories"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={formatNumber(defaults.basalCalories)}
            ref={basalInputRef}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            placeholder="1800"
          />
        </label>
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Active calories
          <input
            name="activeCalories"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={formatNumber(defaults.activeCalories)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            placeholder="650"
          />
        </label>
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Hydration target (oz)
          <input
            name="hydrationTarget"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={formatNumber(defaults.hydrationTarget)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            placeholder="110"
          />
        </label>
        <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-slate-300">
          Hydration logged (oz)
          <input
            name="hydrationActual"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={formatNumber(defaults.hydrationActual)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            placeholder="96"
          />
        </label>
      </div>

      <BasalCalculator
        defaults={bmrDefaults}
        onApply={handleBasalEstimateApply}
      />

      <label className="surface flex flex-col gap-2 rounded-2xl px-3 py-3 text-sm text-slate-300">
        Scale weight (lb)
        <input
          name="weight"
          type="number"
          inputMode="decimal"
          step="0.1"
          defaultValue={formatNumber(defaults.weight)}
          className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
          placeholder="184.2"
        />
      </label>

      {currentState.status === "error" && (
        <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {currentState.message ?? "Unable to save. Try again."}
        </p>
      )}

      <FormSubmitButton pendingLabel={existing ? "Updating…" : "Creating…"}>
        {existing ? "Update day summary" : "Create day summary"}
      </FormSubmitButton>
    </form>
  );
}

const SEX_OPTIONS: { value: BiologicalSex; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

type BasalCalculatorDefaults = {
  weightLbs: number;
  heightFeet: number;
  heightInches: number;
  age: number;
  sex: BiologicalSex;
  basalEstimate: number;
};

type BasalCalculatorProps = {
  defaults: BasalCalculatorDefaults;
  onApply: (calories: number) => void;
};

function normalizeBmrInputs(defaults: BasalCalculatorDefaults) {
  const toNumber = (value: number, fallback: number) =>
    Number.isFinite(value) ? Number(value) : fallback;

  return {
    weightLbs: Math.round(Math.max(80, toNumber(defaults.weightLbs, 180))),
    heightFeet: Math.max(4, Math.min(7, Math.floor(toNumber(defaults.heightFeet, 5)))),
    heightInches: Math.max(
      0,
      Math.min(11, Math.round(toNumber(defaults.heightInches, 10))),
    ),
    age: Math.round(Math.max(16, Math.min(90, toNumber(defaults.age, 30)))),
    sex: defaults.sex === "female" ? "female" : ("male" as BiologicalSex),
  };
}

function BasalCalculator({ defaults, onApply }: BasalCalculatorProps) {
  const [open, setOpen] = useState(false);
  const [lastApplied, setLastApplied] = useState<number | null>(
    Number.isFinite(defaults.basalEstimate)
      ? Math.round(Number(defaults.basalEstimate))
      : null,
  );
  const [inputs, setInputs] = useState(() => normalizeBmrInputs(defaults));
  const [saving, startSaving] = useTransition();

  useEffect(() => {
    setInputs(normalizeBmrInputs(defaults));
    if (Number.isFinite(defaults.basalEstimate)) {
      setLastApplied(Math.round(Number(defaults.basalEstimate)));
    }
  }, [
    defaults.weightLbs,
    defaults.heightFeet,
    defaults.heightInches,
    defaults.age,
    defaults.sex,
    defaults.basalEstimate,
  ]);

  const estimatedBmr = useMemo(() => {
    const weightLbs = Math.max(80, Number(inputs.weightLbs) || 80);
    const heightInches = Math.max(
      56,
      Number(inputs.heightFeet) * 12 + Number(inputs.heightInches) || 68,
    );
    const age = Math.max(16, Number(inputs.age) || 30);
    const sex: BiologicalSex = inputs.sex === "female" ? "female" : "male";

    const bmr = calculateBmr({
      weightLbs,
      heightInches,
      age,
      sex,
    });

    return Math.round(Math.max(900, bmr));
  }, [inputs]);

  const handleInputChange = (
    field: keyof typeof inputs,
    value: string | number,
  ) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApply = () => {
    onApply(estimatedBmr);
    setLastApplied(estimatedBmr);
    startSaving(() =>
      saveBmrPreferencesAction({
        weightLbs: inputs.weightLbs,
        heightFeet: inputs.heightFeet,
        heightInches: inputs.heightInches,
        age: inputs.age,
        sex: inputs.sex,
        basalCalories: estimatedBmr,
      }),
    );
    setOpen(false);
  };

  return (
    <div className="space-y-2 text-xs">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 font-semibold text-sky-400 transition hover:text-sky-300"
      >
        <Calculator className="h-4 w-4" />
        Estimate basal calories
      </button>
      {lastApplied !== null && !open ? (
        <p className="text-[11px] text-slate-500">
          Saved basal estimate: {lastApplied} kcal.
        </p>
      ) : null}
      {open ? (
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
          <p className="text-xs text-slate-400">
            Uses the Mifflin-St Jeor equation. Update the fields below to match
            your stats, then apply the estimate.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              Weight (lb)
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
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
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
                    handleInputChange(
                      "heightInches",
                      Number(event.target.value),
                    )
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
                max={90}
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
                onChange={(event) =>
                  handleInputChange("sex", event.target.value as BiologicalSex)
                }
                className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
              >
                {SEX_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-slate-200">
              Estimated basal:{" "}
              <span className="font-semibold text-sky-300">
                {estimatedBmr} kcal
              </span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleApply}
                disabled={saving}
                className="rounded-xl bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-500/50"
              >
                {saving ? "Saving…" : "Use estimate"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-slate-100 disabled:cursor-not-allowed disabled:border-slate-700/60 disabled:text-slate-500"
              >
                Cancel
              </button>
            </div>
            {saving ? (
              <p className="text-[11px] text-slate-500">
                Saving your preferences…
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
