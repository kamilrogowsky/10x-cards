import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "../db/database.types.ts";

export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

// Helper function to parse cookie header string into individual cookies
export const parseCookieHeader = (cookieHeader: string) => {
  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .filter((cookie) => cookie.length > 0)
    .map((cookie) => {
      const [name, ...valueParts] = cookie.split("=");
      return {
        name: name.trim(),
        value: valueParts.join("=").trim(),
      };
    });
};

export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(import.meta.env.SUPABASE_URL!, import.meta.env.SUPABASE_KEY!, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  return supabase;
};

// Export the type for use in other files
export type SupabaseServerClient = ReturnType<typeof createSupabaseServerInstance>;

// Export SupabaseClient as an alias for backward compatibility
export type SupabaseClient = SupabaseServerClient;
