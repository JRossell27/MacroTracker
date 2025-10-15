import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

export async function createSupabaseServerClient(): Promise<
  SupabaseClient<Database>
> {
  const requestCookies = await cookies();

  const swallowMutationError = (error: unknown) => {
    if (
      error instanceof Error &&
      error.message.includes(
        "Cookies can only be modified in a Server Action or Route Handler",
      )
    ) {
      return;
    }

    throw error;
  };

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return requestCookies.get(name)?.value ?? null;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            requestCookies.set({ name, value, ...options });
          } catch (error) {
            swallowMutationError(error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            requestCookies.delete({ name, ...options });
          } catch (error) {
            swallowMutationError(error);
          }
        },
      },
    },
  );
}
