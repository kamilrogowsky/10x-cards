import type { SupabaseClient } from "../db/supabase.client";
import type {
  GenerateFlashcardsCommand,
  FlashcardProposalDto,
  GenerationCreateResponseDto,
  Generation,
} from "../types";
import { OpenRouterService } from "./openrouter.service";
import crypto from "crypto";

/**
 * Service for handling flashcard generation using AI
 */
export class GenerationService {
  private openRouterService: OpenRouterService;

  constructor(
    private supabase: SupabaseClient,
    private userId: string,
    openRouterApiKey: string
  ) {
    this.openRouterService = new OpenRouterService({
      apiKey: openRouterApiKey,
    });

    // Set up the system prompt for flashcard generation
    this.openRouterService.setSystemMessage(
      `
You are an expert educational content creator specializing in creating high-quality flashcards for learning.

Your task is to analyze the provided text and create effective flashcards that help students learn and remember key concepts, facts, and relationships.

Guidelines for creating flashcards:
1. Create clear, concise questions that test understanding
2. Provide complete, accurate answers
3. Focus on the most important concepts and facts
4. Use varied question types (definitions, explanations, examples, applications)
5. Ensure questions are specific and unambiguous
6. Make answers complete but not overly lengthy

Create 2-10 flashcards depending on the length and complexity of the content.
Each flashcard should have a "front" (question) and "back" (answer).
    `.trim()
    );

    // Set up the response format schema
    this.openRouterService.setResponseFormat({
      name: "flashcards",
      schema: {
        type: "object",
        properties: {
          flashcards: {
            type: "array",
            items: {
              type: "object",
              properties: {
                front: { type: "string" },
                back: { type: "string" },
              },
              required: ["front", "back"],
            },
          },
        },
        required: ["flashcards"],
      },
    });
  }

  /**
   * Generate flashcards from source text
   */
  async generateFlashcards(command: GenerateFlashcardsCommand): Promise<GenerationCreateResponseDto> {
    const startTime = Date.now();

    try {
      // Generate hash of source text for privacy
      const sourceTextHash = crypto.createHash("md5").update(command.source_text).digest("hex");

      // Generate flashcards using OpenRouter
      const flashcardsProposals = await this.generateFlashcardsWithAI(command.source_text);
      const generatedCount = flashcardsProposals.length;
      const generationDuration = Date.now() - startTime;

      // Save generation metadata to database
      const { data: generation, error: dbError } = await this.supabase
        .from("generations")
        .insert({
          user_id: this.userId,
          model: "qwen/qwen3-235b-a22b:free", // Current model from OpenRouter service
          source_text_hash: sourceTextHash,
          source_text_length: command.source_text.length,
          generated_count: generatedCount,
          generation_duration: generationDuration,
        })
        .select()
        .single();

      if (dbError || !generation) {
        throw new Error(`Failed to save generation: ${dbError?.message || "Unknown error"}`);
      }

      return {
        generation_id: generation.id,
        flashcards_proposals: flashcardsProposals,
        generated_count: generatedCount,
      };
    } catch (error) {
      // Log error to generation_error_logs
      await this.logGenerationError(error as Error, command.source_text);

      throw error;
    }
  }

  /**
   * Generate flashcards using OpenRouter AI service
   */
  private async generateFlashcardsWithAI(sourceText: string): Promise<FlashcardProposalDto[]> {
    try {
      // Set the user message with the source text
      this.openRouterService.setUserMessage(
        `
Please create flashcards based on the following text:

${sourceText}
      `.trim()
      );

      // Get response from AI
      const response = await this.openRouterService.sendChatMessage();

      // Parse the JSON response
      const parsedResponse = JSON.parse(response);

      // Transform AI response to our DTO format
      const flashcards: FlashcardProposalDto[] = parsedResponse.flashcards.map(
        (card: { front: string; back: string }) => ({
          front: card.front,
          back: card.back,
          source: "ai-full" as const,
        })
      );

      return flashcards;
    } catch (error) {
      throw new Error(`Failed to generate flashcards: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Log generation errors to the database
   */
  private async logGenerationError(error: Error, sourceText: string): Promise<void> {
    try {
      const sourceTextHash = crypto.createHash("md5").update(sourceText).digest("hex");

      await this.supabase.from("generation_error_logs").insert({
        user_id: this.userId,
        error_code: error.name || "UNKNOWN_ERROR",
        error_message: error.message || "Unknown error occurred",
        model: "qwen/qwen3-235b-a22b:free",
        source_text_hash: sourceTextHash,
        source_text_length: sourceText.length,
      });
    } catch (logError) {
      // If we can't log the error, at least log it to console
      console.error("Failed to log generation error:", logError);
      console.error("Original error:", error);
    }
  }

  /**
   * Get generation by ID with associated flashcards
   */
  async getGenerationById(generationId: number): Promise<Generation | null> {
    const { data, error } = await this.supabase
      .from("generations")
      .select("*")
      .eq("id", generationId)
      .eq("user_id", this.userId)
      .single();

    if (error) {
      console.error("Error fetching generation:", error);
      return null;
    }

    return data;
  }
}
