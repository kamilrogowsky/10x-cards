import { useState, useCallback } from 'react';
import type { 
  FlashcardDto, 
  PaginationDto, 
  FlashcardsListResponseDto,
  FlashcardCreateDto,
  FlashcardUpdateDto 
} from '../types';

interface UseFlashcardsState {
  flashcards: FlashcardDto[];
  pagination: PaginationDto | null;
  loading: boolean;
  error: string | null;
}

interface UseFlashcardsReturn extends UseFlashcardsState {
  fetchFlashcards: (page?: number, limit?: number) => Promise<void>;
  createFlashcard: (data: FlashcardCreateDto) => Promise<boolean>;
  updateFlashcard: (id: number, data: FlashcardUpdateDto) => Promise<boolean>;
  deleteFlashcard: (id: number) => Promise<boolean>;
  clearError: () => void;
}

const DEFAULT_LIMIT = 10;

export function useFlashcards(): UseFlashcardsReturn {
  const [state, setState] = useState<UseFlashcardsState>({
    flashcards: [],
    pagination: null,
    loading: false,
    error: null,
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const handleApiError = useCallback((error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Wystąpił nieoczekiwany błąd';
  }, []);

  const fetchFlashcards = useCallback(async (page = 1, limit = DEFAULT_LIMIT) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: 'created_at',
        order: 'desc'
      });
      
      const response = await fetch(`/api/flashcards?${params}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Przekierowanie na login - można to obsłużyć na poziomie aplikacji
          throw new Error('Sesja wygasła. Zaloguj się ponownie.');
        }
        throw new Error(`Błąd pobierania fiszek: ${response.status}`);
      }
      
      const data: FlashcardsListResponseDto = await response.json();
      
      setState(prev => ({
        ...prev,
        flashcards: data.data,
        pagination: data.pagination,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: handleApiError(error)
      }));
    }
  }, [handleApiError]);

  const createFlashcard = useCallback(async (data: FlashcardCreateDto): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flashcards: [data] // API expects array of flashcards
        }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesja wygasła. Zaloguj się ponownie.');
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Błąd walidacji danych');
        }
        throw new Error(`Błąd tworzenia fiszki: ${response.status}`);
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: handleApiError(error)
      }));
      return false;
    }
  }, [handleApiError]);

  const updateFlashcard = useCallback(async (id: number, data: FlashcardUpdateDto): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesja wygasła. Zaloguj się ponownie.');
        }
        if (response.status === 404) {
          throw new Error('Fiszka nie została znaleziona');
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Błąd walidacji danych');
        }
        throw new Error(`Błąd aktualizacji fiszki: ${response.status}`);
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: handleApiError(error)
      }));
      return false;
    }
  }, [handleApiError]);

  const deleteFlashcard = useCallback(async (id: number): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesja wygasła. Zaloguj się ponownie.');
        }
        if (response.status === 404) {
          throw new Error('Fiszka nie została znaleziona');
        }
        throw new Error(`Błąd usuwania fiszki: ${response.status}`);
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: handleApiError(error)
      }));
      return false;
    }
  }, [handleApiError]);

  return {
    ...state,
    fetchFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    clearError,
  };
} 