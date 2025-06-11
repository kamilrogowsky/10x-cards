import type { APIRoute } from "astro";
import type { SupabaseClient } from "../../../db/supabase.client";
import { FlashcardsService } from "../../../lib/services/flashcardsService";
import { FlashcardUpdateSchema, FlashcardIdSchema } from "../../../lib/schemas/flashcardSchemas";

export const prerender = false;

// Helper function to extract and validate flashcard ID from params
function validateFlashcardId(params: Record<string, string | undefined>): number | null {
  const idParam = params.id;

  if (!idParam) {
    return null;
  }

  const idAsNumber = parseInt(idParam, 10);
  const validation = FlashcardIdSchema.safeParse(idAsNumber);

  return validation.success ? idAsNumber : null;
}

// GET /api/flashcards/{id} - Get single flashcard by ID
export const GET: APIRoute = async ({ params, locals }) => {
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

    // Validate flashcard ID
    const flashcardId = validateFlashcardId(params);
    if (flashcardId === null) {
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID",
          details: [{ field: "id", message: "Flashcard ID must be a positive integer" }],
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create flashcards service instance
    const flashcardsService = new FlashcardsService(supabase, user.id);

    // Get flashcard by ID
    const flashcard = await flashcardsService.getFlashcardById(flashcardId);

    if (!flashcard) {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/flashcards/{id}:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// PUT /api/flashcards/{id} - Update existing flashcard
export const PUT: APIRoute = async ({ params, request, locals }) => {
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

    // Validate flashcard ID
    const flashcardId = validateFlashcardId(params);
    if (flashcardId === null) {
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID",
          details: [{ field: "id", message: "Flashcard ID must be a positive integer" }],
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
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

    // Validate update data
    const validation = FlashcardUpdateSchema.safeParse(body);
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

    // Check if there's at least one field to update
    const updateData = validation.data;
    const hasUpdateFields = Object.keys(updateData).length > 0;

    if (!hasUpdateFields) {
      return new Response(
        JSON.stringify({
          error: "No fields to update",
          details: [{ field: "body", message: "At least one field must be provided for update" }],
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create flashcards service instance
    const flashcardsService = new FlashcardsService(supabase, user.id);

    // Update flashcard
    const updatedFlashcard = await flashcardsService.updateFlashcard(flashcardId, updateData);

    if (!updatedFlashcard) {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(updatedFlashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in PUT /api/flashcards/{id}:", error);

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

// DELETE /api/flashcards/{id} - Delete flashcard
export const DELETE: APIRoute = async ({ params, locals }) => {
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

    // Validate flashcard ID
    const flashcardId = validateFlashcardId(params);
    if (flashcardId === null) {
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID",
          details: [{ field: "id", message: "Flashcard ID must be a positive integer" }],
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create flashcards service instance
    const flashcardsService = new FlashcardsService(supabase, user.id);

    // Delete flashcard
    const deleted = await flashcardsService.deleteFlashcard(flashcardId);

    if (!deleted) {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Flashcard deleted successfully." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in DELETE /api/flashcards/{id}:", error);

    // Handle specific known errors
    if (error instanceof Error) {
      if (error.message.includes("unauthorized") || error.message.includes("access denied")) {
        return new Response(JSON.stringify({ error: "Unauthorized access" }), {
          status: 401,
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
