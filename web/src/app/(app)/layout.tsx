import type { ReactNode } from "react";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { signOutAction } from "@/app/(auth)/actions";
import type { Database } from "@/lib/database.types";
import { TimezoneSync } from "@/components/timezone-sync";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let displayName =
    session?.user?.user_metadata?.full_name ?? session?.user?.email ?? "You";

  if (session?.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", session.user.id)
      .returns<
        Pick<Database["public"]["Tables"]["profiles"]["Row"], "display_name">[]
      >()
      .maybeSingle();

    if (profile?.display_name) {
      displayName = profile.display_name;
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col gap-6 px-4 pb-24 pt-6">
      <TimezoneSync />
      <header className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-900/40 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
            Logged in
          </p>
          <p className="text-sm font-semibold text-slate-200">{displayName}</p>
        </div>
        <form action={signOutAction}>
          <SignOutButton />
        </form>
      </header>
      <div className="flex flex-1 flex-col gap-6">{children}</div>
      <MobileNav />
    </div>
  );
}
