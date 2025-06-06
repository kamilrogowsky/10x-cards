import type { SupabaseClient } from "../db/supabase.client";
import { DEFAULT_USER_ID } from "../db/supabase.client";
import type { 
  GenerateFlashcardsCommand, 
  FlashcardProposalDto, 
  GenerationCreateResponseDto,
  Generation
} from "../types";
import crypto from "crypto";

/**
 * Service for handling flashcard generation using AI (with mocks for development)
 */
export class GenerationService {
  constructor(private supabase: SupabaseClient) {}
  
  private get userId(): string {
    return DEFAULT_USER_ID;
  }

  /**
   * Generate flashcards from source text
   */
  async generateFlashcards(command: GenerateFlashcardsCommand): Promise<GenerationCreateResponseDto> {
    const startTime = Date.now();
    
    try {
      // Generate hash of source text for privacy
      const sourceTextHash = crypto
        .createHash("md5")
        .update(command.source_text)
        .digest("hex");

      // Mock AI call - in production this would call actual AI service
      const flashcardsProposals = await this.mockAICall(command.source_text);
      const generatedCount = flashcardsProposals.length;
      const generationDuration = Date.now() - startTime;

      // Save generation metadata to database
      const { data: generation, error: dbError } = await this.supabase
        .from("generations")
        .insert({
          user_id: this.userId,
          model: "gpt-4", // In production: actual model name
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
      const generationDuration = Date.now() - startTime;
      
      // Log error to generation_error_logs
      await this.logGenerationError(
        error as Error,
        command.source_text,
        generationDuration
      );

      throw error;
    }
  }

  /**
   * Mock AI service call - replaces actual AI integration during development
   */
  private async mockAICall(sourceText: string): Promise<FlashcardProposalDto[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error("AI service temporarily unavailable");
    }

    // Generate mock flashcards based on text length
    const wordCount = sourceText.split(/\s+/).length;
    const flashcardCount = Math.min(Math.max(Math.floor(wordCount / 100), 2), 10);

    const mockFlashcards: FlashcardProposalDto[] = [];
    
    for (let i = 1; i <= flashcardCount; i++) {
      mockFlashcards.push({
        front: `Question ${i} - What is the key concept from section ${i}?`,
        back: `Answer ${i} - This is a mock answer generated from the provided text. In production, this would be an AI-generated response based on the actual content.`,
        source: "ai-full",
      });
    }

    return mockFlashcards;
  }

  /**
   * Log generation errors to the database
   */
  private async logGenerationError(
    error: Error,
    sourceText: string,
    generationDuration: number
  ): Promise<void> {
    try {
      const sourceTextHash = crypto
        .createHash("md5")
        .update(sourceText)
        .digest("hex");

      await this.supabase.from("generation_error_logs").insert({
        user_id: this.userId,
        error_code: error.name || "UNKNOWN_ERROR",
        error_message: error.message || "Unknown error occurred",
        model: "gpt-4",
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