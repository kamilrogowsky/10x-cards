import type { SupabaseClient } from "../db/supabase.client";
import { DEFAULT_USER_ID } from "../db/supabase.client";
import type { 
  FlashcardsCreateCommand, 
  FlashcardDto,
  FlashcardInsert
} from "../types";

/**
 * Service for handling flashcard operations
 */
export class FlashcardService {
  constructor(private supabase: SupabaseClient) {}
  
  private get userId(): string {
    return DEFAULT_USER_ID;
  }

  /**
   * Create multiple flashcards in a batch operation
   */
  async createFlashcards(command: FlashcardsCreateCommand): Promise<FlashcardDto[]> {
    if (!command.flashcards || command.flashcards.length === 0) {
      throw new Error("At least one flashcard is required");
    }

    try {
      // Prepare flashcards for database insertion
      const flashcardsToInsert: FlashcardInsert[] = command.flashcards.map(flashcard => ({
        user_id: this.userId,
        front: flashcard.front.trim(),
        back: flashcard.back.trim(),
        source: flashcard.source,
        generation_id: flashcard.generation_id,
      }));

      // Validate generation_id references exist if needed
      await this.validateGenerationIds(flashcardsToInsert);

      // Perform batch insert
      const { data: insertedFlashcards, error: insertError } = await this.supabase
        .from("flashcards")
        .insert(flashcardsToInsert)
        .select("id, front, back, source, generation_id, created_at, updated_at");

      if (insertError) {
        console.error("Database insert error:", insertError);
        throw new Error(`Failed to create flashcards: ${insertError.message}`);
      }

      if (!insertedFlashcards || insertedFlashcards.length === 0) {
        throw new Error("No flashcards were created");
      }

      // Return created flashcards as DTOs
      return insertedFlashcards.map(flashcard => ({
        id: flashcard.id,
        front: flashcard.front,
        back: flashcard.back,
        source: flashcard.source,
        generation_id: flashcard.generation_id,
        created_at: flashcard.created_at,
        updated_at: flashcard.updated_at,
      }));

    } catch (error) {
      console.error("Error creating flashcards:", error);
      
      if (error instanceof Error) {
        // Re-throw known errors
        throw error;
      }
      
      throw new Error("Failed to create flashcards due to unexpected error");
    }
  }

  /**
   * Validate that generation_id references exist for AI-generated flashcards
   */
  private async validateGenerationIds(flashcards: FlashcardInsert[]): Promise<void> {
    const generationIds = flashcards
      .filter(f => f.generation_id !== null)
      .map(f => f.generation_id as number);

    if (generationIds.length === 0) {
      return; // No generation IDs to validate
    }

    // Remove duplicates
    const uniqueGenerationIds = [...new Set(generationIds)];

    // Check if all generation IDs exist and belong to the current user
    const { data: existingGenerations, error } = await this.supabase
      .from("generations")
      .select("id")
      .in("id", uniqueGenerationIds)
      .eq("user_id", this.userId);

    if (error) {
      throw new Error(`Failed to validate generation IDs: ${error.message}`);
    }

    const existingIds = existingGenerations?.map(g => g.id) || [];
    const missingIds = uniqueGenerationIds.filter(id => !existingIds.includes(id));

    if (missingIds.length > 0) {
      throw new Error(`Invalid generation_id(s): ${missingIds.join(", ")}. These generations do not exist or do not belong to the current user.`);
    }
  }

  /**
   * Get flashcard by ID
   */
  async getFlashcardById(id: number): Promise<FlashcardDto | null> {
    const { data, error } = await this.supabase
      .from("flashcards")
      .select("id, front, back, source, generation_id, created_at, updated_at")
      .eq("id", id)
      .eq("user_id", this.userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      console.error("Error fetching flashcard:", error);
      throw new Error(`Failed to fetch flashcard: ${error.message}`);
    }

    return data;
  }

  /**
   * Get flashcards with pagination
   */
  async getFlashcards(page = 1, limit = 20): Promise<{ flashcards: FlashcardDto[]; total: number }> {
    const offset = (page - 1) * limit;

    // Get total count
    const { count, error: countError } = await this.supabase
      .from("flashcards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", this.userId);

    if (countError) {
      throw new Error(`Failed to count flashcards: ${countError.message}`);
    }

    // Get flashcards for the current page
    const { data: flashcards, error: fetchError } = await this.supabase
      .from("flashcards")
      .select("id, front, back, source, generation_id, created_at, updated_at")
      .eq("user_id", this.userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      throw new Error(`Failed to fetch flashcards: ${fetchError.message}`);
    }

    return {
      flashcards: flashcards || [],
      total: count || 0,
    };
  }
} 