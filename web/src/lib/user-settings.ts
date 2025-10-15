import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { BiologicalSex } from "./bmr";

type Supabase = SupabaseClient<Database>;

export type UserSettingsRecord =
  Database["public"]["Tables"]["user_settings"]["Row"];

const FALLBACK_GOALS = {
  calories: 2200,
  protein: 160,
  carbs: 210,
  fat: 70,
  basal: 1800,
  active: 500,
  hydrationTarget: 100,
};

const FALLBACK_WEIGHT = null as number | null;

const FALLBACK_BMR = {
  weightLbs: 180,
  heightInches: 70,
  age: 30,
  sex: "male" as BiologicalSex,
};

const INITIAL_SETTINGS_ROW = {
  calories_goal: FALLBACK_GOALS.calories,
  protein_goal: FALLBACK_GOALS.protein,
  carbs_goal: FALLBACK_GOALS.carbs,
  fat_goal: FALLBACK_GOALS.fat,
  basal_calories: FALLBACK_GOALS.basal,
  active_calories: FALLBACK_GOALS.active,
  hydration_target_oz: FALLBACK_GOALS.hydrationTarget,
  weight_lbs: FALLBACK_WEIGHT,
  bmr_weight_lbs: FALLBACK_BMR.weightLbs,
  bmr_height_inches: FALLBACK_BMR.heightInches,
  bmr_age: FALLBACK_BMR.age,
  bmr_sex: FALLBACK_BMR.sex,
} satisfies Omit<
  Database["public"]["Tables"]["user_settings"]["Insert"],
  "user_id"
>;

export type NormalizedUserSettings = {
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    basal: number;
    active: number;
    hydrationTarget: number;
  };
  weightLbs: number | null;
  bmr: {
    weightLbs: number;
    heightInches: number;
    age: number;
    sex: BiologicalSex;
  };
};

export function normalizeUserSettings(
  row: UserSettingsRecord | null,
): NormalizedUserSettings {
  return {
    goals: {
      calories: row?.calories_goal ?? FALLBACK_GOALS.calories,
      protein: row?.protein_goal ?? FALLBACK_GOALS.protein,
      carbs: row?.carbs_goal ?? FALLBACK_GOALS.carbs,
      fat: row?.fat_goal ?? FALLBACK_GOALS.fat,
      basal: row?.basal_calories ?? FALLBACK_GOALS.basal,
      active: row?.active_calories ?? FALLBACK_GOALS.active,
      hydrationTarget:
        row?.hydration_target_oz ?? FALLBACK_GOALS.hydrationTarget,
    },
    weightLbs: row?.weight_lbs ?? FALLBACK_WEIGHT,
    bmr: {
      weightLbs: row?.bmr_weight_lbs ?? FALLBACK_BMR.weightLbs,
      heightInches: row?.bmr_height_inches ?? FALLBACK_BMR.heightInches,
      age: row?.bmr_age ?? FALLBACK_BMR.age,
      sex:
        row?.bmr_sex === "female"
          ? "female"
          : (row?.bmr_sex as BiologicalSex) ?? FALLBACK_BMR.sex,
    },
  };
}

export async function fetchUserSettings(
  supabase: Supabase,
  userId: string,
): Promise<NormalizedUserSettings> {
  const { data } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return normalizeUserSettings(data ?? null);
}

export async function mergeUserSettings(
  supabase: Supabase,
  userId: string,
  update: Partial<Database["public"]["Tables"]["user_settings"]["Row"]>,
): Promise<UserSettingsRecord> {
  const timestamp = new Date().toISOString();
  const { data } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    const insertPayload: Database["public"]["Tables"]["user_settings"]["Insert"] =
      {
        user_id: userId,
        created_at: timestamp,
        updated_at: timestamp,
        ...INITIAL_SETTINGS_ROW,
        ...update,
      };

    const { data: inserted } = await supabase
      .from("user_settings")
      .insert(insertPayload)
      .select("*")
      .maybeSingle();

    return (inserted ?? {
      ...insertPayload,
    }) as UserSettingsRecord;
  }

  await supabase
    .from("user_settings")
    .update({
      ...update,
      updated_at: timestamp,
    })
    .eq("user_id", userId)
    .throwOnError();

  return {
    ...(data as UserSettingsRecord),
    ...update,
    updated_at: timestamp,
  };
}

export function inchesToFeetAndInches(
  totalInches: number,
): { feet: number; inches: number } {
  const safeTotal = Number.isFinite(totalInches) ? Math.max(0, totalInches) : 0;
  const feet = Math.floor(safeTotal / 12);
  const inches = Math.round(safeTotal - feet * 12);
  return {
    feet,
    inches,
  };
}

export function feetAndInchesToInches(feet: number, inches: number): number {
  const safeFeet = Number.isFinite(feet) ? Math.max(0, feet) : 0;
  const safeInches = Number.isFinite(inches) ? Math.max(0, inches) : 0;
  return Math.round(safeFeet * 12 + safeInches);
}

export const FALLBACK_USER_SETTINGS: NormalizedUserSettings = {
  goals: { ...FALLBACK_GOALS },
  weightLbs: FALLBACK_WEIGHT,
  bmr: { ...FALLBACK_BMR },
};
