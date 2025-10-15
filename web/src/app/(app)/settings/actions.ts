"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";
import {
  LOG_ACTION_INITIAL_STATE,
  type LogActionState,
} from "../log/shared-state";

export type RecipeFormState = LogActionState;

export async function createRecipeAction(
  _prevState: RecipeFormState | void,
  formData: FormData,
): Promise<RecipeFormState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sign back in to add a recipe." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const calories = Number(formData.get("calories") ?? 0);
  const protein = Number(formData.get("protein") ?? 0);
  const carbs = Number(formData.get("carbs") ?? 0);
  const fat = Number(formData.get("fat") ?? 0);

  if (!name) {
    return { status: "error", message: "Give your recipe a name." };
  }

  const insertPayload: Database["public"]["Tables"]["recipes"]["Insert"] = {
    user_id: user.id,
    name,
    description,
    calories,
    protein,
    carbs,
    fat,
  };

  const { error } = await supabase.from("recipes").insert(insertPayload);

  if (error) {
    return {
      status: "error",
      message: error.message ?? "Unable to save recipe right now.",
    };
  }

  revalidatePath("/settings");
  revalidatePath("/log");
  return LOG_ACTION_INITIAL_STATE;
}

export async function deleteRecipeAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const recipeId = String(formData.get("recipeId") ?? "");

  if (!recipeId) return;

  await supabase.from("recipes").delete().eq("id", recipeId);

  revalidatePath("/settings");
  revalidatePath("/log");
}
