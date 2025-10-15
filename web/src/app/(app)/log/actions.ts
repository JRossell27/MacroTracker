"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLocalISODate } from "@/lib/date";
import type { Database } from "@/lib/database.types";

export type ActionResponse = {
  status: "idle" | "error";
  message?: string;
};

const INITIAL_STATE: ActionResponse = { status: "idle" };

const REVALIDATE_PATHS = ["/dashboard", "/log", "/trends", "/coach"];

function toNumber(value: FormDataEntryValue | null, fallback = 0) {
  if (value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function recalculateDailyTotals(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  dailyLogId: string,
) {
  const { data: meals } = await supabase
    .from("meals")
    .select("calories, protein, carbs, fat")
    .eq("daily_log_id", dailyLogId)
    .returns<
      Pick<
        Database["public"]["Tables"]["meals"]["Row"],
        "calories" | "protein" | "carbs" | "fat"
      >[]
    >();

  type MacroTotals = {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };

  const totals = (meals ?? []).reduce<MacroTotals>(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories ?? 0),
      protein: acc.protein + (meal.protein ?? 0),
      carbs: acc.carbs + (meal.carbs ?? 0),
      fat: acc.fat + (meal.fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  await supabase
    .from("daily_logs")
    .update({
      calories_intake: totals.calories,
      protein_intake: totals.protein,
      carbs_intake: totals.carbs,
      fat_intake: totals.fat,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dailyLogId);
}

function triggerRevalidate() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}

export async function upsertDailyLogAction(
  _prevState: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "You need to sign in again." };
  }

  const logDate =
    String(formData.get("logDate") ?? "") || getLocalISODate(new Date());

  const payload: Database["public"]["Tables"]["daily_logs"]["Insert"] = {
    user_id: user.id,
    log_date: logDate,
    calories_goal: toNumber(formData.get("caloriesGoal"), 0),
    protein_goal: toNumber(formData.get("proteinGoal"), 0),
    carbs_goal: toNumber(formData.get("carbsGoal"), 0),
    fat_goal: toNumber(formData.get("fatGoal"), 0),
    basal_calories: toNumber(formData.get("basalCalories"), 0),
    active_calories: toNumber(formData.get("activeCalories"), 0),
    hydration_target_oz: toNumber(formData.get("hydrationTarget"), 0),
    hydration_oz: toNumber(formData.get("hydrationActual"), 0),
    weight:
      formData.get("weight") && formData.get("weight") !== ""
        ? Number(formData.get("weight"))
        : null,
  };

  const { data, error } = await supabase
    .from("daily_logs")
    .upsert(payload, { onConflict: "user_id,log_date" })
    .select("id")
    .single();

  if (error) {
    return {
      status: "error",
      message: error.message ?? "Unable to save daily log.",
    };
  }

  await recalculateDailyTotals(supabase, data.id);
  triggerRevalidate();
  return INITIAL_STATE;
}

export async function addMealAction(
  _prevState: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Please sign in to add a meal." };
  }

  const dailyLogId = String(formData.get("dailyLogId") ?? "");
  if (!dailyLogId) {
    return { status: "error", message: "Create your daily log before adding meals." };
  }

  const name = String(formData.get("mealName") ?? "").trim();
  const loggedAt = String(formData.get("mealTime") ?? "").trim();

  if (!name) {
    return { status: "error", message: "Add a name for your meal." };
  }

  const { error } = await supabase.from("meals").insert({
    daily_log_id: dailyLogId,
    name,
    logged_at: loggedAt || null,
    calories: toNumber(formData.get("mealCalories"), 0),
    protein: toNumber(formData.get("mealProtein"), 0),
    carbs: toNumber(formData.get("mealCarbs"), 0),
    fat: toNumber(formData.get("mealFat"), 0),
  });

  if (error) {
    return {
      status: "error",
      message: error.message ?? "Unable to add meal.",
    };
  }

  await recalculateDailyTotals(supabase, dailyLogId);
  triggerRevalidate();
  return INITIAL_STATE;
}

export async function deleteMealAction(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const mealId = String(formData.get("mealId") ?? "");
  const dailyLogId = String(formData.get("dailyLogId") ?? "");

  if (!mealId || !dailyLogId) {
    return;
  }

  await supabase.from("meals").delete().eq("id", mealId);
  await recalculateDailyTotals(supabase, dailyLogId);
  triggerRevalidate();
}

export async function addNoteAction(
  _prevState: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  const supabase = createSupabaseServerClient();
  const dailyLogId = String(formData.get("dailyLogId") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!dailyLogId) {
    return { status: "error", message: "Create your daily log to store notes." };
  }

  if (!note) {
    return { status: "error", message: "Write a note before saving." };
  }

  const { error } = await supabase.from("daily_notes").insert({
    daily_log_id: dailyLogId,
    note,
  });

  if (error) {
    return { status: "error", message: error.message ?? "Unable to save note." };
  }

  triggerRevalidate();
  return INITIAL_STATE;
}

export async function deleteNoteAction(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const noteId = String(formData.get("noteId") ?? "");

  if (!noteId) return;

  await supabase.from("daily_notes").delete().eq("id", noteId);
  triggerRevalidate();
}

export { INITIAL_STATE };
