import { MobileShell } from "@/components/layout/mobile-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLocalISODate } from "@/lib/date";
import type { Database } from "@/lib/database.types";
import { GoalSummaryPanel } from "../log/_components/goal-summary-panel";
import { RecipesManager } from "./recipes-manager";
import {
  FALLBACK_USER_SETTINGS,
  fetchUserSettings,
  inchesToFeetAndInches,
} from "@/lib/user-settings";

type DailyLogRow = Database["public"]["Tables"]["daily_logs"]["Row"];

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const today = getLocalISODate();

  const { data: log } = await supabase
    .from("daily_logs")
    .select(
      `
        id,
        log_date,
        calories_goal,
        protein_goal,
        carbs_goal,
        fat_goal,
        basal_calories,
        active_calories,
        hydration_target_oz,
        hydration_oz,
        weight
      `,
    )
    .eq("user_id", session?.user.id ?? "")
    .eq("log_date", today)
    .returns<DailyLogRow[]>()
    .maybeSingle();

  const userId = session?.user.id ?? null;
  const userSettings = userId
    ? await fetchUserSettings(supabase, userId)
    : FALLBACK_USER_SETTINGS;

  const heightParts = inchesToFeetAndInches(userSettings.bmr.heightInches);
  const bmrDefaults = {
    weightLbs: userSettings.bmr.weightLbs,
    heightFeet: Math.max(4, heightParts.feet || 0),
    heightInches: Math.min(11, Math.max(0, heightParts.inches || 0)),
    age: userSettings.bmr.age,
    sex: userSettings.bmr.sex,
    basalEstimate: userSettings.goals.basal,
  };

  const summaryDefaults = {
    caloriesGoal: log?.calories_goal ?? userSettings.goals.calories,
    proteinGoal: log?.protein_goal ?? userSettings.goals.protein,
    carbsGoal: log?.carbs_goal ?? userSettings.goals.carbs,
    fatGoal: log?.fat_goal ?? userSettings.goals.fat,
    basalCalories: log?.basal_calories ?? userSettings.goals.basal,
    activeCalories: log?.active_calories ?? userSettings.goals.active,
    hydrationTarget: log?.hydration_target_oz ?? userSettings.goals.hydrationTarget,
    hydrationActual: log?.hydration_oz ?? 0,
    weight: log?.weight ?? userSettings.weightLbs,
  };

  const { data: recipes } = await supabase
    .from("recipes")
    .select(
      "id, name, description, calories, protein, carbs, fat, created_at",
    )
    .eq("user_id", session?.user.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <MobileShell
      title="Settings"
      subtitle="Update your targets and manage quick recipes."
    >
      <GoalSummaryPanel
        logDate={log?.log_date ?? today}
        existing={Boolean(log)}
        defaults={summaryDefaults}
        bmrDefaults={bmrDefaults}
        dailyLogId={log?.id ?? null}
      />
      <RecipesManager recipes={recipes ?? []} />
    </MobileShell>
  );
}
