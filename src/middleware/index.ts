import { createSupabaseServerInstance } from "../db/supabase.client.ts";
import { defineMiddleware } from "astro:middleware";

// Paths that don't require authentication (but should still check if user is logged in)
const PUBLIC_PATHS = ["/login"];

// Public API paths that don't require authentication
const PUBLIC_API_PATHS = ["/api/auth/login", "/api/auth/logout", "/api"];

// Paths that are fully public and don't need auth check at all
const SKIP_AUTH_PATHS = ["/login"];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Add supabase client to locals
  locals.supabase = supabase;

  // Skip auth check completely for API auth endpoints and login page
  if (SKIP_AUTH_PATHS.includes(url.pathname) || PUBLIC_API_PATHS.includes(url.pathname)) {
    return next();
  }

  try {
    // IMPORTANT: Always get user session first before any other operations
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Auth error in middleware:", error.message);
    }

    if (user) {
      // User is authenticated
      locals.authenticated = true;
      locals.user_id = user.id;
      locals.user = {
        email: user.email || "",
        id: user.id,
      };
    } else {
      // User not authenticated
      locals.authenticated = false;
      locals.user_id = undefined;
      // User not authenticated - redirect to login for protected routes only
      // Homepage (/) should be accessible to everyone but should check auth status
      if (!PUBLIC_PATHS.includes(url.pathname) && url.pathname !== "/") {
        return redirect("/login", 302);
      }
    }
  } catch (error) {
    console.error("Middleware error:", error);

    // For protected routes, redirect to login on error
    if (!PUBLIC_PATHS.includes(url.pathname) && url.pathname !== "/") {
      return redirect("/login", 302);
    }
  }

  return next();
});
