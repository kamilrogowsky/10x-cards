import type { APIRoute } from "astro";
import type { SupabaseClient } from "../../../db/supabase.client";
import { FlashcardsService } from "../../../lib/services/flashcardsService";
import { FlashcardsCreateCommandSchema, FlashcardsQuerySchema } from "../../../lib/schemas/flashcardSchemas";

export const prerender = false;

// GET /api/flashcards - List flashcards with pagination, sorting, and filtering
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    // Get supabase client from locals (set by middleware)
    const supabase = locals.supabase as SupabaseClient;

    if (!supabase) {
      return new Response(JSON.stringify({ error: "Database connection not available" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user ID from middleware authentication
    const user = locals.user;
    if (!user || !user.id) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate query parameters
    const searchParams = new URLSearchParams(url.search);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validation = FlashcardsQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: validation.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { page, limit, sort, order, source, generation_id } = validation.data;

    // Create flashcards service instance
    const flashcardsService = new FlashcardsService(supabase, user.id);

    // Get flashcards using the service
    const result = await flashcardsService.getFlashcards({
      page,
      limit,
      sort,
      order,
      source,
      generation_id,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/flashcards:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// POST /api/flashcards - Create one or multiple flashcards
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get supabase client from locals (set by middleware)
    const supabase = locals.supabase as SupabaseClient;

    if (!supabase) {
      return new Response(JSON.stringify({ error: "Database connection not available" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user ID from middleware authentication
    const user = locals.user;
    if (!user || !user.id) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate request structure
    const validation = FlashcardsCreateCommandSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validation.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create flashcard service instance
    const flashcardsService = new FlashcardsService(supabase, user.id);

    // Create flashcards using the service
    const createdFlashcards = await flashcardsService.createFlashcards(validation.data);

    return new Response(JSON.stringify({ flashcards: createdFlashcards }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST /api/flashcards:", error);

    // Handle specific known errors
    if (error instanceof Error) {
      if (error.message.includes("unauthorized") || error.message.includes("access denied")) {
        return new Response(JSON.stringify({ error: "Unauthorized access" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (error.message.includes("validation") || error.message.includes("Invalid generation_id")) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
