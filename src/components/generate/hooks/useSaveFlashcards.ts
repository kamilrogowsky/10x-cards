import { useState } from 'react';
import type { FlashcardCreateDto, FlashcardsCreateCommand, FlashcardDto } from '../../../types';

interface UseSaveFlashcardsReturn {
  save: (flashcards: FlashcardCreateDto[]) => Promise<FlashcardDto[] | null>;
  data: FlashcardDto[] | null;
  error: string | null;
  isLoading: boolean;
  success: boolean;
  clearState: () => void;
}

export function useSaveFlashcards(): UseSaveFlashcardsReturn {
  const [data, setData] = useState<FlashcardDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const clearState = () => {
    setError(null);
    setSuccess(false);
  };

  const save = async (flashcards: FlashcardCreateDto[]): Promise<FlashcardDto[] | null> => {
    if (!flashcards || flashcards.length === 0) {
      setError('Brak fiszek do zapisania');
      setSuccess(false);
      return null;
    }

    if (flashcards.length > 50) {
      setError('Można zapisać maksymalnie 50 fiszek jednocześnie');
      setSuccess(false);
      return null;
    }

    // Walidacja każdej fiszki
    for (const flashcard of flashcards) {
      if (!flashcard.front || flashcard.front.length === 0 || flashcard.front.length > 200) {
        setError('Przód fiszki musi mieć między 1 a 200 znaków');
        setSuccess(false);
        return null;
      }
      
      if (!flashcard.back || flashcard.back.length === 0 || flashcard.back.length > 500) {
        setError('Tył fiszki musi mieć między 1 a 500 znaków');
        setSuccess(false);
        return null;
      }

      if (!['ai-full', 'ai-edited', 'manual'].includes(flashcard.source)) {
        setError('Nieprawidłowe źródło fiszki');
        setSuccess(false);
        return null;
      }
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const command: FlashcardsCreateCommand = {
        flashcards
      };

      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Musisz być zalogowany, aby zapisać fiszki');
          setSuccess(false);
          return null;
        }
        
        if (response.status === 400) {
          const errorData = await response.json().catch(() => null);
          setError(errorData?.message || 'Nieprawidłowe dane fiszek');
          setSuccess(false);
          return null;
        }

        if (response.status >= 500) {
          setError('Wystąpił błąd serwera. Spróbuj ponownie później.');
          setSuccess(false);
          return null;
        }

        setError('Wystąpił nieoczekiwany błąd podczas zapisywania');
        setSuccess(false);
        return null;
      }

      const result = await response.json();
      const savedFlashcards: FlashcardDto[] = result.flashcards || [];
      setData(savedFlashcards);
      setSuccess(true);
      return savedFlashcards;

    } catch (err) {
      console.error('Error saving flashcards:', err);
      setError('Wystąpił błąd podczas komunikacji z serwerem');
      setSuccess(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    save,
    data,
    error,
    isLoading,
    success,
    clearState,
  };
} 