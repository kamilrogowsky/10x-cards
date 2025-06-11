import { z } from "zod";

// ------------------------------------------------------------------------------------------------
// Base schema for flashcard creation/update validation
// ------------------------------------------------------------------------------------------------
export const FlashcardCreateSchema = z
  .object({
    front: z
      .string()
      .min(1, "Front text is required")
      .max(200, "Front text must not exceed 200 characters")
      .transform((str) => str.trim()),
    back: z
      .string()
      .min(1, "Back text is required")
      .max(500, "Back text must not exceed 500 characters")
      .transform((str) => str.trim()),
    source: z.enum(["ai-full", "ai-edited", "manual"], {
      errorMap: () => ({ message: "Source must be one of: ai-full, ai-edited, manual" }),
    }),
    generation_id: z.number().nullable(),
  })
  .refine(
    (data) => {
      // generation_id is required for AI sources
      if ((data.source === "ai-full" || data.source === "ai-edited") && data.generation_id === null) {
        return false;
      }
      // generation_id must be null for manual source
      if (data.source === "manual" && data.generation_id !== null) {
        return false;
      }
      return true;
    },
    {
      message: "generation_id is required for AI sources and must be null for manual source",
      path: ["generation_id"],
    }
  );

// ------------------------------------------------------------------------------------------------
// Schema for creating multiple flashcards (POST /flashcards)
// ------------------------------------------------------------------------------------------------
export const FlashcardsCreateCommandSchema = z.object({
  flashcards: z
    .array(FlashcardCreateSchema)
    .min(1, "At least one flashcard is required")
    .max(50, "Cannot create more than 50 flashcards at once"),
});

// ------------------------------------------------------------------------------------------------
// Schema for updating flashcards (PUT /flashcards/{id})
// ------------------------------------------------------------------------------------------------
export const FlashcardUpdateSchema = z
  .object({
    front: z
      .string()
      .min(1, "Front text is required")
      .max(200, "Front text must not exceed 200 characters")
      .transform((str) => str.trim())
      .optional(),
    back: z
      .string()
      .min(1, "Back text is required")
      .max(500, "Back text must not exceed 500 characters")
      .transform((str) => str.trim())
      .optional(),
    source: z
      .enum(["ai-full", "ai-edited", "manual"], {
        errorMap: () => ({ message: "Source must be one of: ai-full, ai-edited, manual" }),
      })
      .optional(),
    generation_id: z.number().nullable().optional(),
  })
  .refine(
    (data) => {
      // Only validate if both source and generation_id are provided
      if (data.source !== undefined && data.generation_id !== undefined) {
        if ((data.source === "ai-full" || data.source === "ai-edited") && data.generation_id === null) {
          return false;
        }
        if (data.source === "manual" && data.generation_id !== null) {
          return false;
        }
      }
      return true;
    },
    {
      message: "generation_id is required for AI sources and must be null for manual source",
      path: ["generation_id"],
    }
  );

// ------------------------------------------------------------------------------------------------
// Schema for flashcard ID parameter validation
// ------------------------------------------------------------------------------------------------
export const FlashcardIdSchema = z.number().int().positive("Flashcard ID must be a positive integer");

// ------------------------------------------------------------------------------------------------
// Schema for GET /flashcards query parameters
// ------------------------------------------------------------------------------------------------
export const FlashcardsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "Page must be a positive integer"),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, "Limit must be between 1 and 100"),
  sort: z.enum(["created_at", "updated_at", "front", "back"]).optional().default("created_at"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  source: z.enum(["ai-full", "ai-edited", "manual"]).optional(),
  generation_id: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || (!isNaN(val) && val > 0), "generation_id must be a positive integer"),
});

// ------------------------------------------------------------------------------------------------
// Type helpers for better TypeScript support
// ------------------------------------------------------------------------------------------------
export type FlashcardCreateInput = z.infer<typeof FlashcardCreateSchema>;
export type FlashcardsCreateCommandInput = z.infer<typeof FlashcardsCreateCommandSchema>;
export type FlashcardUpdateInput = z.infer<typeof FlashcardUpdateSchema>;
export type FlashcardsQueryInput = z.infer<typeof FlashcardsQuerySchema>;
