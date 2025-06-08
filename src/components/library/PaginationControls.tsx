import React from 'react';
import { Button } from '../ui/button';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function PaginationControls({ 
  page, 
  totalPages, 
  onPageChange, 
  disabled = false 
}: PaginationControlsProps) {
  const canGoPrevious = page > 1 && !disabled;
  const canGoNext = page < totalPages && !disabled;

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <Button
        variant="outline"
        onClick={() => onPageChange(page - 1)}
        disabled={!canGoPrevious}
        className="flex items-center gap-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Poprzednia
      </Button>

      <div className="flex items-center gap-2 px-4 py-2 text-sm">
        <span className="text-muted-foreground">Strona</span>
        <span className="font-medium text-foreground">{page}</span>
        <span className="text-muted-foreground">z</span>
        <span className="font-medium text-foreground">{totalPages}</span>
      </div>

      <Button
        variant="outline"
        onClick={() => onPageChange(page + 1)}
        disabled={!canGoNext}
        className="flex items-center gap-2"
      >
        Następna
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Button>
    </div>
  );
} 