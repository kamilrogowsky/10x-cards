import { describe, it, expect } from "vitest";
import {
  FlashcardCreateSchema,
  FlashcardsCreateCommandSchema,
  FlashcardUpdateSchema,
  FlashcardsQuerySchema,
  FlashcardIdSchema,
} from "../flashcardSchemas";

describe("FlashcardSchemas", () => {
  describe("FlashcardCreateSchema", () => {
    it("should validate AI flashcard with generation_id", () => {
      // Arrange
      const validAIFlashcard = {
        front: "What is TypeScript?",
        back: "TypeScript is a typed superset of JavaScript",
        source: "ai-full" as const,
        generation_id: 123,
      };

      // Act
      const result = FlashcardCreateSchema.safeParse(validAIFlashcard);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.front).toBe("What is TypeScript?");
        expect(result.data.source).toBe("ai-full");
        expect(result.data.generation_id).toBe(123);
      }
    });

    it("should validate manual flashcard without generation_id", () => {
      // Arrange
      const validManualFlashcard = {
        front: "Manual question",
        back: "Manual answer",
        source: "manual" as const,
        generation_id: null,
      };

      // Act
      const result = FlashcardCreateSchema.safeParse(validManualFlashcard);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.source).toBe("manual");
        expect(result.data.generation_id).toBeNull();
      }
    });

    it("should reject AI flashcard without generation_id", () => {
      // Arrange
      const invalidAIFlashcard = {
        front: "Question",
        back: "Answer",
        source: "ai-full" as const,
        generation_id: null, // Invalid for AI source
      };

      // Act
      const result = FlashcardCreateSchema.safeParse(invalidAIFlashcard);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("generation_id is required for AI sources");
      }
    });

    it("should reject manual flashcard with generation_id", () => {
      // Arrange
      const invalidManualFlashcard = {
        front: "Question",
        back: "Answer",
        source: "manual" as const,
        generation_id: 123, // Invalid for manual source
      };

      // Act
      const result = FlashcardCreateSchema.safeParse(invalidManualFlashcard);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("must be null for manual source");
      }
    });

    it("should trim whitespace from front and back text", () => {
      // Arrange
      const flashcardWithWhitespace = {
        front: "  Question with spaces  ",
        back: "  Answer with spaces  ",
        source: "manual" as const,
        generation_id: null,
      };

      // Act
      const result = FlashcardCreateSchema.safeParse(flashcardWithWhitespace);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.front).toBe("Question with spaces");
        expect(result.data.back).toBe("Answer with spaces");
      }
    });

    it("should reject empty front text", () => {
      // Arrange
      const flashcardWithEmptyFront = {
        front: "",
        back: "Valid answer",
        source: "manual" as const,
        generation_id: null,
      };

      // Act
      const result = FlashcardCreateSchema.safeParse(flashcardWithEmptyFront);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Front text is required");
      }
    });

    it("should reject front text exceeding 200 characters", () => {
      // Arrange
      const flashcardWithLongFront = {
        front: "a".repeat(201), // Exceeds limit
        back: "Valid answer",
        source: "manual" as const,
        generation_id: null,
      };

      // Act
      const result = FlashcardCreateSchema.safeParse(flashcardWithLongFront);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Front text must not exceed 200 characters");
      }
    });

    it("should reject back text exceeding 500 characters", () => {
      // Arrange
      const flashcardWithLongBack = {
        front: "Valid question",
        back: "a".repeat(501), // Exceeds limit
        source: "manual" as const,
        generation_id: null,
      };

      // Act
      const result = FlashcardCreateSchema.safeParse(flashcardWithLongBack);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Back text must not exceed 500 characters");
      }
    });
  });

  describe("FlashcardsCreateCommandSchema", () => {
    it("should validate array of flashcards", () => {
      // Arrange
      const validCommand = {
        flashcards: [
          {
            front: "Question 1",
            back: "Answer 1",
            source: "manual" as const,
            generation_id: null,
          },
          {
            front: "Question 2",
            back: "Answer 2",
            source: "ai-full" as const,
            generation_id: 123,
          },
        ],
      };

      // Act
      const result = FlashcardsCreateCommandSchema.safeParse(validCommand);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.flashcards).toHaveLength(2);
      }
    });

    it("should reject empty flashcards array", () => {
      // Arrange
      const invalidCommand = {
        flashcards: [],
      };

      // Act
      const result = FlashcardsCreateCommandSchema.safeParse(invalidCommand);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("At least one flashcard is required");
      }
    });

    it("should reject more than 50 flashcards", () => {
      // Arrange
      const flashcards = Array.from({ length: 51 }, (_, i) => ({
        front: `Question ${i}`,
        back: `Answer ${i}`,
        source: "manual" as const,
        generation_id: null,
      }));

      const invalidCommand = { flashcards };

      // Act
      const result = FlashcardsCreateCommandSchema.safeParse(invalidCommand);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Cannot create more than 50 flashcards at once");
      }
    });
  });

  describe("FlashcardsQuerySchema", () => {
    it("should sanitize and validate pagination parameters", () => {
      // Arrange
      const queryParams = {
        page: "2",
        limit: "25",
        sort: "created_at",
        order: "desc",
      };

      // Act
      const result = FlashcardsQuerySchema.safeParse(queryParams);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(25);
        expect(result.data.sort).toBe("created_at");
        expect(result.data.order).toBe("desc");
      }
    });

    it("should use default values for missing parameters", () => {
      // Arrange
      const emptyQuery = {};

      // Act
      const result = FlashcardsQuerySchema.safeParse(emptyQuery);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
        expect(result.data.sort).toBe("created_at");
        expect(result.data.order).toBe("desc");
      }
    });

    it("should reject invalid page parameter", () => {
      // Arrange
      const invalidQuery = {
        page: "0", // Invalid: must be positive
      };

      // Act
      const result = FlashcardsQuerySchema.safeParse(invalidQuery);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Page must be a positive integer");
      }
    });

    it("should reject limit exceeding 100", () => {
      // Arrange
      const invalidQuery = {
        limit: "101", // Exceeds maximum
      };

      // Act
      const result = FlashcardsQuerySchema.safeParse(invalidQuery);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Limit must be between 1 and 100");
      }
    });

    it("should parse generation_id filter correctly", () => {
      // Arrange
      const queryWithGenerationId = {
        generation_id: "123",
      };

      // Act
      const result = FlashcardsQuerySchema.safeParse(queryWithGenerationId);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.generation_id).toBe(123);
      }
    });
  });

  describe("FlashcardIdSchema", () => {
    it("should validate positive integer ID", () => {
      // Arrange
      const validId = 123;

      // Act
      const result = FlashcardIdSchema.safeParse(validId);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(123);
      }
    });

    it("should reject negative ID", () => {
      // Arrange
      const invalidId = -1;

      // Act
      const result = FlashcardIdSchema.safeParse(invalidId);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Flashcard ID must be a positive integer");
      }
    });

    it("should reject zero ID", () => {
      // Arrange
      const invalidId = 0;

      // Act
      const result = FlashcardIdSchema.safeParse(invalidId);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Flashcard ID must be a positive integer");
      }
    });
  });
});
