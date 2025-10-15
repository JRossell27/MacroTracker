import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

export async function createSupabaseServerClient(): Promise<
  SupabaseClient<Database>
> {
  const requestCookies = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return requestCookies.get(name)?.value ?? null;
        },
        set(name: string, value: string, options: CookieOptions) {
          requestCookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          requestCookies.delete({ name, ...options });
        },
      },
    },
  );
}
