import React from "react";
import { FlashcardItem } from "./FlashcardItem";
import { PaginationControls } from "./PaginationControls";
import type { FlashcardDto, PaginationDto } from "../../types";

interface FlashcardsListProps {
  flashcards: FlashcardDto[];
  pagination: PaginationDto | null;
  loading: boolean;
  onEdit: (flashcard: FlashcardDto) => void;
  onDelete: (id: number) => void;
  onPageChange: (page: number) => void;
}

export function FlashcardsList({
  flashcards,
  pagination,
  loading,
  onEdit,
  onDelete,
  onPageChange,
}: FlashcardsListProps) {
  if (flashcards.length === 0) {
    return null; // Empty state is handled by parent component
  }

  return (
    <div className="space-y-6">
      {/* Flashcards Grid */}
      <div className="grid gap-4">
        {flashcards.map((flashcard) => (
          <FlashcardItem
            key={flashcard.id}
            flashcard={flashcard}
            onEdit={() => onEdit(flashcard)}
            onDelete={() => onDelete(flashcard.id)}
          />
        ))}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm">Ładowanie...</span>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total > pagination.limit && (
        <PaginationControls
          page={pagination.page}
          totalPages={Math.ceil(pagination.total / pagination.limit)}
          onPageChange={onPageChange}
          disabled={loading}
        />
      )}
    </div>
  );
}
