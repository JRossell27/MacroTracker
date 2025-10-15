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
  _prevState: AuthActionState | void,
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

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from("profiles")
      .upsert({ id: user.id, display_name: user.user_metadata?.full_name ?? null })
      .throwOnError();
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUpAction(
  _prevState: AuthActionState | void,
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

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  const sessionUser = data.session?.user;

  if (sessionUser) {
    const profileUpsert = {
      id: sessionUser.id,
      display_name:
        displayName ||
        sessionUser.user_metadata?.full_name ||
        sessionUser.email ||
        null,
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
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/signin");
}
