import { MobileShell } from "@/components/layout/mobile-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLocalISODate } from "@/lib/date";
import type { Database } from "@/lib/database.types";
import { GoalSummaryPanel } from "../log/_components/goal-summary-panel";
import { RecipesManager } from "./recipes-manager";

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

  const summaryDefaults = {
    caloriesGoal: log?.calories_goal ?? 2200,
    proteinGoal: log?.protein_goal ?? 160,
    carbsGoal: log?.carbs_goal ?? 210,
    fatGoal: log?.fat_goal ?? 70,
    basalCalories: log?.basal_calories ?? 1800,
    activeCalories: log?.active_calories ?? 500,
    hydrationTarget: log?.hydration_target_oz ?? 100,
    hydrationActual: log?.hydration_oz ?? 0,
    weight: log?.weight ?? null,
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
        dailyLogId={log?.id ?? null}
      />
      <RecipesManager recipes={recipes ?? []} />
    </MobileShell>
  );
}
