"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLocalISODate } from "@/lib/date";
import type { Database } from "@/lib/database.types";
import {
  LOG_ACTION_INITIAL_STATE,
  type LogActionState,
} from "./shared-state";


export type GoalRecommendationPayload = {
  logDate: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

const REVALIDATE_PATHS = ["/dashboard", "/log", "/trends", "/coach", "/settings"];

function toNumber(value: FormDataEntryValue | null, fallback = 0) {
  if (value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function recalculateDailyTotals(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
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
    } as Database["public"]["Tables"]["daily_logs"]["Update"])
    .eq("id", dailyLogId);
}

function triggerRevalidate() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}

export async function upsertDailyLogAction(
  _prevState: LogActionState | void,
  formData: FormData,
): Promise<LogActionState> {
  const supabase = await createSupabaseServerClient();
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
    .returns<Pick<Database["public"]["Tables"]["daily_logs"]["Row"], "id">[]>()
    .maybeSingle();

  if (error || !data) {
    return {
      status: "error",
      message: error?.message ?? "Unable to save daily log.",
    };
  }

  await recalculateDailyTotals(supabase, data.id);
  triggerRevalidate();
  return LOG_ACTION_INITIAL_STATE;
}

export async function addMealAction(
  _prevState: LogActionState | void,
  formData: FormData,
): Promise<LogActionState> {
  const supabase = await createSupabaseServerClient();
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

  const rawIngredients = String(formData.get("mealIngredients") ?? "[]");
  let ingredients: {
    name: string;
    amount?: string;
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
  }[] = [];

  try {
    const parsed = JSON.parse(rawIngredients);
    if (Array.isArray(parsed)) {
      ingredients = parsed
        .map((item) => ({
          name: String(item.name ?? "").trim(),
          amount: item.amount ? String(item.amount) : undefined,
          calories:
            item.calories === undefined || item.calories === null
              ? null
              : Number(item.calories),
          protein:
            item.protein === undefined || item.protein === null
              ? null
              : Number(item.protein),
          carbs:
            item.carbs === undefined || item.carbs === null
              ? null
              : Number(item.carbs),
          fat:
            item.fat === undefined || item.fat === null
              ? null
              : Number(item.fat),
        }))
        .filter((item) => item.name.length > 0);
    }
  } catch {
    ingredients = [];
  }

  const mealInsert: Database["public"]["Tables"]["meals"]["Insert"] = {
    daily_log_id: dailyLogId,
    name,
    logged_at: loggedAt || null,
    calories: toNumber(formData.get("mealCalories"), 0),
    protein: toNumber(formData.get("mealProtein"), 0),
    carbs: toNumber(formData.get("mealCarbs"), 0),
    fat: toNumber(formData.get("mealFat"), 0),
  };

  const { data: mealRow, error } = await supabase
    .from("meals")
    .insert(mealInsert)
    .select("id")
    .maybeSingle();

  if (error || !mealRow) {
    return {
      status: "error",
      message: error?.message ?? "Unable to add meal.",
    };
  }

  if (ingredients.length > 0) {
    await supabase
      .from("meal_items")
      .insert(
        ingredients.map((ingredient) => ({
          meal_id: mealRow.id,
          name: ingredient.name,
          serving: ingredient.amount ?? null,
          calories: ingredient.calories,
          protein: ingredient.protein,
          carbs: ingredient.carbs,
          fat: ingredient.fat,
        })),
      )
      .throwOnError();
  }

  await recalculateDailyTotals(supabase, dailyLogId);
  triggerRevalidate();
  return LOG_ACTION_INITIAL_STATE;
}

export async function deleteMealAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
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
  _prevState: LogActionState | void,
  formData: FormData,
): Promise<LogActionState> {
  const supabase = await createSupabaseServerClient();
  const dailyLogId = String(formData.get("dailyLogId") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!dailyLogId) {
    return { status: "error", message: "Create your daily log to store notes." };
  }

  if (!note) {
    return { status: "error", message: "Write a note before saving." };
  }

  const noteInsert: Database["public"]["Tables"]["daily_notes"]["Insert"] = {
    daily_log_id: dailyLogId,
    note,
  };

  const { error } = await supabase.from("daily_notes").insert(noteInsert);

  if (error) {
    return { status: "error", message: error.message ?? "Unable to save note." };
  }

  triggerRevalidate();
  return LOG_ACTION_INITIAL_STATE;
}

export async function deleteNoteAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const noteId = String(formData.get("noteId") ?? "");

  if (!noteId) return;

  await supabase.from("daily_notes").delete().eq("id", noteId);
  triggerRevalidate();
}
export async function applyGoalRecommendationAction(
  _prevState: LogActionState | void,
  formData: FormData,
): Promise<LogActionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sign back in to update targets." };
  }

  const payloadRaw = formData.get("recommendedPayload");
  if (typeof payloadRaw !== "string") {
    return { status: "error", message: "Missing recommendation payload." };
  }

  let payload: GoalRecommendationPayload | null = null;
  try {
    payload = JSON.parse(payloadRaw) as GoalRecommendationPayload;
  } catch {
    payload = null;
  }

  if (!payload) {
    return { status: "error", message: "Unable to read recommendation payload." };
  }

  const logDate =
    payload.logDate || String(formData.get("logDate") ?? "") ||
    getLocalISODate(new Date());

  const upsertPayload: Database["public"]["Tables"]["daily_logs"]["Insert"] = {
    user_id: user.id,
    log_date: logDate,
    calories_goal: payload.calories,
    protein_goal: payload.protein,
    carbs_goal: payload.carbs,
    fat_goal: payload.fat,
  };

  const { error } = await supabase
    .from("daily_logs")
    .upsert(upsertPayload, { onConflict: "user_id,log_date" });

  if (error) {
    return {
      status: "error",
      message: error.message ?? "Unable to apply targets.",
    };
  }

  triggerRevalidate();
  return LOG_ACTION_INITIAL_STATE;
}
export async function addMealFromRecipeAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const recipeId = String(formData.get("recipeId") ?? "");
  const dailyLogId = String(formData.get("dailyLogId") ?? "");

  if (!recipeId || !dailyLogId) {
    return;
  }

  const { data: recipe } = await supabase
    .from("recipes")
    .select("name, calories, protein, carbs, fat")
    .eq("id", recipeId)
    .maybeSingle();

  if (!recipe) {
    return;
  }

  const mealInsert: Database["public"]["Tables"]["meals"]["Insert"] = {
    daily_log_id: dailyLogId,
    name: recipe.name,
    logged_at: null,
    calories: recipe.calories ?? 0,
    protein: recipe.protein ?? 0,
    carbs: recipe.carbs ?? 0,
    fat: recipe.fat ?? 0,
  };

  await supabase.from("meals").insert(mealInsert).throwOnError();
  await recalculateDailyTotals(supabase, dailyLogId);
  triggerRevalidate();
}
export async function addHydrationAction(
  _prevState: LogActionState | void,
  formData: FormData,
): Promise<LogActionState> {
  const supabase = await createSupabaseServerClient();
  const amountRaw = String(
    formData.get("amount") ?? formData.get("customAmount") ?? "0",
  ).trim();
  const amount = Number(amountRaw || 0);
  const dailyLogId = String(formData.get("dailyLogId") ?? "");
  const logDate = String(formData.get("logDate") ?? getLocalISODate(new Date()));

  if (!Number.isFinite(amount) || amount <= 0) {
    return { status: "error", message: "Enter a positive water amount." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sign back in to log water." };
  }

  let target = null as { id: string; hydration_oz: number | null } | null;

  if (dailyLogId) {
    const { data } = await supabase
      .from("daily_logs")
      .select("id, hydration_oz")
      .eq("id", dailyLogId)
      .maybeSingle();
    target = data;
  } else {
    const { data } = await supabase
      .from("daily_logs")
      .select("id, hydration_oz")
      .eq("user_id", user.id)
      .eq("log_date", logDate)
      .maybeSingle();
    target = data;
  }

  if (!target) {
    const { data, error } = await supabase
      .from("daily_logs")
      .upsert(
        {
          user_id: user.id,
          log_date: logDate,
          calories_goal: 2200,
          protein_goal: 160,
          carbs_goal: 210,
          fat_goal: 70,
          hydration_oz: amount,
        },
        { onConflict: "user_id,log_date" },
      )
      .select("id, hydration_oz")
      .maybeSingle();

    if (error || !data) {
      return {
        status: "error",
        message: error?.message ?? "Unable to log water right now.",
      };
    }

    target = data;
  } else {
    await supabase
      .from("daily_logs")
      .update({
        hydration_oz: (target.hydration_oz ?? 0) + amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", target.id)
      .throwOnError();
  }

  triggerRevalidate();
  return LOG_ACTION_INITIAL_STATE;
}


