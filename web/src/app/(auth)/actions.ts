"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

export type AuthActionState = {
  status: "idle" | "error";
  message?: string;
};

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState | void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      status: "error",
      message: "Enter your email address and password to continue.",
    };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState | void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!email || !password) {
    return {
      status: "error",
      message: "Email and password are required to create an account.",
    };
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  if (data.user) {
    const profileUpsert = {
      id: data.user.id,
      display_name: displayName || null,
    } satisfies Database["public"]["Tables"]["profiles"]["Insert"];

    await supabase
      .from("profiles")
      .upsert(profileUpsert)
      .throwOnError();
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/signin");
}
