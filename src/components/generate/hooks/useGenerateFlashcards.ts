import { useState } from "react";
import type { GenerationCreateResponseDto, GenerateFlashcardsCommand } from "../../../types";

interface UseGenerateFlashcardsReturn {
  generate: (sourceText: string) => Promise<GenerationCreateResponseDto | null>;
  data: GenerationCreateResponseDto | null;
  error: string | null;
  isLoading: boolean;
}

export function useGenerateFlashcards(): UseGenerateFlashcardsReturn {
  const [data, setData] = useState<GenerationCreateResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generate = async (sourceText: string): Promise<GenerationCreateResponseDto | null> => {
    if (sourceText.length < 1000 || sourceText.length > 10000) {
      setError("Tekst musi mieć między 1000 a 10000 znaków");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const command: GenerateFlashcardsCommand = {
        source_text: sourceText,
      };

      const response = await fetch("/api/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Musisz być zalogowany, aby generować fiszki");
          // Redirect to login could be handled here
          return null;
        }

        if (response.status === 400) {
          const errorData = await response.json().catch(() => null);
          setError(errorData?.message || "Nieprawidłowe dane wejściowe");
          return null;
        }

        if (response.status >= 500) {
          setError("Wystąpił błąd serwera. Spróbuj ponownie później.");
          return null;
        }

        setError("Wystąpił nieoczekiwany błąd");
        return null;
      }

      const result: GenerationCreateResponseDto = await response.json();
      setData(result);
      return result;
    } catch (err) {
      console.error("Error generating flashcards:", err);
      setError("Wystąpił błąd podczas komunikacji z serwerem");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generate,
    data,
    error,
    isLoading,
  };
}
