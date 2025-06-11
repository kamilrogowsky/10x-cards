import type { SupabaseClient } from "../../db/supabase.client";
import type {
  FlashcardsCreateCommand,
  FlashcardDto,
  FlashcardInsert,
  FlashcardUpdateDto,
  FlashcardsListResponseDto,
  PaginationDto,
} from "../../types";

/**
 * Service for handling flashcard CRUD operations
 * Accepts supabase client and userId to ensure proper isolation and security
 */
export class FlashcardsService {
  constructor(
    private supabase: SupabaseClient,
    private userId: string
  ) {}

  /**
   * Get flashcards with pagination, sorting, and filtering
   */
  async getFlashcards(options: {
    page: number;
    limit: number;
    sort: "created_at" | "updated_at" | "front" | "back";
    order: "asc" | "desc";
    source?: "ai-full" | "ai-edited" | "manual";
    generation_id?: number;
  }): Promise<FlashcardsListResponseDto> {
    try {
      const { page, limit, sort, order, source, generation_id } = options;
      const offset = (page - 1) * limit;

      // Build query for counting total records
      let countQuery = this.supabase
        .from("flashcards")
        .select("*", { count: "exact", head: true })
        .eq("user_id", this.userId);

      // Build query for fetching flashcards
      let fetchQuery = this.supabase
        .from("flashcards")
        .select("id, front, back, source, generation_id, created_at, updated_at")
        .eq("user_id", this.userId);

      // Apply filters
      if (source) {
        countQuery = countQuery.eq("source", source);
        fetchQuery = fetchQuery.eq("source", source);
      }

      if (generation_id) {
        countQuery = countQuery.eq("generation_id", generation_id);
        fetchQuery = fetchQuery.eq("generation_id", generation_id);
      }

      // Apply sorting and pagination
      fetchQuery = fetchQuery.order(sort, { ascending: order === "asc" }).range(offset, offset + limit - 1);

      // Execute queries in parallel
      const [countResult, fetchResult] = await Promise.all([countQuery, fetchQuery]);

      if (countResult.error) {
        throw new Error(`Failed to count flashcards: ${countResult.error.message}`);
      }

      if (fetchResult.error) {
        throw new Error(`Failed to fetch flashcards: ${fetchResult.error.message}`);
      }

      const pagination: PaginationDto = {
        page,
        limit,
        total: countResult.count || 0,
      };

      return {
        data: fetchResult.data || [],
        pagination,
      };
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      throw error instanceof Error ? error : new Error("Failed to fetch flashcards");
    }
  }

  /**
   * Get flashcard by ID
   */
  async getFlashcardById(id: number): Promise<FlashcardDto | null> {
    try {
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
        throw new Error(`Failed to fetch flashcard: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error fetching flashcard by ID:", error);
      throw error instanceof Error ? error : new Error("Failed to fetch flashcard");
    }
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
      const flashcardsToInsert: FlashcardInsert[] = command.flashcards.map((flashcard) => ({
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

      return insertedFlashcards;
    } catch (error) {
      console.error("Error creating flashcards:", error);
      throw error instanceof Error ? error : new Error("Failed to create flashcards");
    }
  }

  /**
   * Update an existing flashcard
   */
  async updateFlashcard(id: number, updateData: FlashcardUpdateDto): Promise<FlashcardDto | null> {
    try {
      // First check if flashcard exists and belongs to user
      const existingFlashcard = await this.getFlashcardById(id);
      if (!existingFlashcard) {
        return null;
      }

      // Prepare update data, filtering out undefined values
      const updatePayload: Record<string, any> = {};

      if (updateData.front !== undefined) {
        updatePayload.front = updateData.front.trim();
      }
      if (updateData.back !== undefined) {
        updatePayload.back = updateData.back.trim();
      }
      if (updateData.source !== undefined) {
        updatePayload.source = updateData.source;
      }
      if (updateData.generation_id !== undefined) {
        updatePayload.generation_id = updateData.generation_id;
      }

      // Add updated_at timestamp
      updatePayload.updated_at = new Date().toISOString();

      // Validate generation_id if being updated
      if (updatePayload.generation_id !== undefined && updatePayload.generation_id !== null) {
        await this.validateGenerationIds([
          {
            user_id: this.userId,
            generation_id: updatePayload.generation_id,
            front: "",
            back: "",
            source: updatePayload.source || existingFlashcard.source,
          },
        ]);
      }

      // Perform update
      const { data, error } = await this.supabase
        .from("flashcards")
        .update(updatePayload)
        .eq("id", id)
        .eq("user_id", this.userId)
        .select("id, front, back, source, generation_id, created_at, updated_at")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Not found or no access
        }
        throw new Error(`Failed to update flashcard: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error updating flashcard:", error);
      throw error instanceof Error ? error : new Error("Failed to update flashcard");
    }
  }

  /**
   * Delete a flashcard
   */
  async deleteFlashcard(id: number): Promise<boolean> {
    try {
      // First check if flashcard exists and belongs to user
      const existingFlashcard = await this.getFlashcardById(id);
      if (!existingFlashcard) {
        return false;
      }

      const { error } = await this.supabase.from("flashcards").delete().eq("id", id).eq("user_id", this.userId);

      if (error) {
        throw new Error(`Failed to delete flashcard: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      throw error instanceof Error ? error : new Error("Failed to delete flashcard");
    }
  }

  /**
   * Validate that generation_id references exist for AI-generated flashcards
   */
  private async validateGenerationIds(flashcards: FlashcardInsert[]): Promise<void> {
    const generationIds = flashcards.filter((f) => f.generation_id !== null).map((f) => f.generation_id as number);

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

    const existingIds = existingGenerations?.map((g: { id: number }) => g.id) || [];
    const missingIds = uniqueGenerationIds.filter((id) => !existingIds.includes(id));

    if (missingIds.length > 0) {
      throw new Error(
        `Invalid generation_id(s): ${missingIds.join(", ")}. These generations do not exist or do not belong to the current user.`
      );
    }
  }
}
