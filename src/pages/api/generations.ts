import type { APIRoute } from "astro";
import { z } from "zod";
import type { GenerateFlashcardsCommand, GenerationCreateResponseDto } from "../../types";
import type { SupabaseClient } from "../../db/supabase.client";
import { GenerationService } from "../../lib/generation.service";

export const prerender = false;

// Zod schema for validating the request body
const GenerateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Source text must be at least 1000 characters")
    .max(10000, "Source text must not exceed 10000 characters"),
});

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

    // Get OpenRouter API key from environment
    const openRouterApiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenRouter API key not configured" }),
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

    const validation = GenerateFlashcardsSchema.safeParse(body);
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

    const { source_text } = validation.data;

    // Create generation service instance with OpenRouter API key
    const generationService = new GenerationService(supabase, openRouterApiKey);
    
    // Generate flashcards using the service
    const result = await generationService.generateFlashcards({ source_text });

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in POST /generations:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}; 