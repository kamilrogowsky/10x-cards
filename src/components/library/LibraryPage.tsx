import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useFlashcards } from "../../hooks/useFlashcards";
import type { FlashcardDto, FlashcardCreateDto, FlashcardUpdateDto } from "../../types";

import { FlashcardsList } from "./FlashcardsList";
import { FlashcardCreateForm } from "./FlashcardCreateForm";
import { FlashcardEditModal } from "./FlashcardEditModal";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { LoadingSpinner } from "./LoadingSpinner";

interface LibraryPageState {
  showCreateForm: boolean;
  editingFlashcard: FlashcardDto | null;
  deletingFlashcardId: number | null;
}

interface LibraryPageProps {
  authenticated?: boolean;
}

export function LibraryPage({ authenticated = false }: LibraryPageProps) {
  const {
    flashcards,
    pagination,
    loading,
    error,
    fetchFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    clearError,
  } = useFlashcards();

  const [state, setState] = useState<LibraryPageState>({
    showCreateForm: false,
    editingFlashcard: null,
    deletingFlashcardId: null,
  });

  // Ładowanie fiszek przy mount
  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  // Obsługa błędów przez toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleAddNew = useCallback(() => {
    setState((prev) => ({ ...prev, showCreateForm: true }));
  }, []);

  const handleCancelCreate = useCallback(() => {
    setState((prev) => ({ ...prev, showCreateForm: false }));
  }, []);

  const handleSaveCreate = useCallback(
    async (data: FlashcardCreateDto) => {
      const success = await createFlashcard(data);
      if (success) {
        setState((prev) => ({ ...prev, showCreateForm: false }));
        toast.success("Fiszka została dodana");
        // Odświeżenie listy
        if (pagination) {
          fetchFlashcards(pagination.page);
        } else {
          fetchFlashcards();
        }
      }
    },
    [createFlashcard, pagination, fetchFlashcards]
  );

  const handleEdit = (flashcard: FlashcardDto) => {
    setState((prev) => ({ ...prev, editingFlashcard: flashcard }));
  };

  const handleCancelEdit = () => {
    setState((prev) => ({ ...prev, editingFlashcard: null }));
  };

  const handleSaveEdit = async (data: FlashcardUpdateDto) => {
    if (!state.editingFlashcard) return;

    const success = await updateFlashcard(state.editingFlashcard.id, data);
    if (success) {
      setState((prev) => ({ ...prev, editingFlashcard: null }));
      toast.success("Fiszka została zaktualizowana");
      // Odświeżenie listy
      if (pagination) {
        fetchFlashcards(pagination.page);
      } else {
        fetchFlashcards();
      }
    }
  };

  const handleDelete = (id: number) => {
    setState((prev) => ({ ...prev, deletingFlashcardId: id }));
  };

  const handleCancelDelete = () => {
    setState((prev) => ({ ...prev, deletingFlashcardId: null }));
  };

  const handleConfirmDelete = async () => {
    if (!state.deletingFlashcardId) return;

    const success = await deleteFlashcard(state.deletingFlashcardId);
    if (success) {
      setState((prev) => ({ ...prev, deletingFlashcardId: null }));
      toast.success("Fiszka została usunięta");
      // Odświeżenie listy
      if (pagination) {
        fetchFlashcards(pagination.page);
      } else {
        fetchFlashcards();
      }
    }
  };

  const handlePageChange = (page: number) => {
    fetchFlashcards(page);
  };

  // Check authentication
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-2xl font-bold text-foreground mb-4">Dostęp ograniczony</h1>
          <p className="text-muted-foreground mb-6">Aby uzyskać dostęp do biblioteki fiszek, musisz się zalogować.</p>
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Zaloguj się
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background mt-20">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Moja biblioteka fiszek</h1>
              <p className="text-muted-foreground mt-2">Zarządzaj swoimi fiszkami - twórz, edytuj i usuwaj</p>
            </div>
            <button
              onClick={handleAddNew}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
            >
              + Dodaj Fiszkę
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading && !flashcards.length && (
          <div className="py-12">
            <LoadingSpinner text="Ładowanie fiszek..." />
          </div>
        )}

        {!loading && flashcards.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-muted/30 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-foreground mb-2">Brak fiszek</h3>
              <p className="text-muted-foreground mb-4">
                Nie masz jeszcze żadnych fiszek. Dodaj pierwszą fiszkę, aby rozpocząć naukę.
              </p>
              <button
                onClick={handleAddNew}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors"
              >
                Dodaj pierwszą fiszkę
              </button>
            </div>
          </div>
        )}

        {flashcards.length > 0 && (
          <FlashcardsList
            flashcards={flashcards}
            pagination={pagination}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPageChange={handlePageChange}
          />
        )}

        {/* Create Form Modal */}
        <FlashcardCreateForm
          visible={state.showCreateForm}
          onSave={handleSaveCreate}
          onCancel={handleCancelCreate}
          loading={loading}
        />

        {/* Edit Modal */}
        <FlashcardEditModal
          visible={!!state.editingFlashcard}
          flashcard={state.editingFlashcard}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          loading={loading}
        />

        {/* Delete Confirmation */}
        <ConfirmationDialog
          visible={!!state.deletingFlashcardId}
          title="Potwierdź usunięcie"
          message="Czy na pewno chcesz usunąć tę fiszkę? Tej akcji nie można cofnąć."
          confirmText="Usuń fiszkę"
          cancelText="Anuluj"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          loading={loading}
          variant="destructive"
        />
      </main>
    </div>
  );
}
