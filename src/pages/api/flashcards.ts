import type { APIRoute } from "astro";
import { z } from "zod";
import type { FlashcardsCreateCommand, FlashcardDto } from "../../types";
import type { SupabaseClient } from "../../db/supabase.client";
import { FlashcardService } from "../../lib/flashcard.service";

export const prerender = false;

// Zod schema for validating flashcard creation data
const FlashcardCreateSchema = z.object({
  front: z
    .string()
    .min(1, "Front text is required")
    .max(200, "Front text must not exceed 200 characters"),
  back: z
    .string()
    .min(1, "Back text is required")
    .max(500, "Back text must not exceed 500 characters"),
  source: z.enum(["ai-full", "ai-edited", "manual"], {
    errorMap: () => ({ message: "Source must be one of: ai-full, ai-edited, manual" }),
  }),
  generation_id: z.number().nullable(),
});

// Zod schema for the full request body
const FlashcardsCreateCommandSchema = z.object({
  flashcards: z
    .array(FlashcardCreateSchema)
    .min(1, "At least one flashcard is required")
    .max(50, "Cannot create more than 50 flashcards at once"),
});

// Custom validation for generation_id based on source
const validateGenerationIdForSource = (flashcards: any[]): string | null => {
  for (const flashcard of flashcards) {
    const { source, generation_id } = flashcard;
    
    if ((source === "ai-full" || source === "ai-edited") && generation_id === null) {
      return `generation_id is required for source: ${source}`;
    }
    
    if (source === "manual" && generation_id !== null) {
      return `generation_id must be null for source: manual`;
    }
  }
  return null;
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get supabase client from locals (set by middleware)
    const supabase = locals.supabase as SupabaseClient;
    
    if (!supabase) {
      return new Response(
        JSON.stringify({ error: "Database connection not available" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate request structure
    const validation = FlashcardsCreateCommandSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validation.error.errors.map(err => ({
            field: err.path.join("."),
            message: err.message,
          })),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { flashcards } = validation.data;

    // Custom validation for generation_id based on source
    const generationIdError = validateGenerationIdForSource(flashcards);
    if (generationIdError) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: [{ field: "generation_id", message: generationIdError }],
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create flashcard service instance
    const flashcardService = new FlashcardService(supabase);
    
    // Create flashcards using the service
    const createdFlashcards = await flashcardService.createFlashcards({ flashcards });

    return new Response(
      JSON.stringify({ flashcards: createdFlashcards }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in POST /flashcards:", error);
    
    // Handle specific known errors
    if (error instanceof Error) {
      if (error.message.includes("unauthorized") || error.message.includes("access denied")) {
        return new Response(
          JSON.stringify({ error: "Unauthorized access" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
      
      if (error.message.includes("validation")) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}; 