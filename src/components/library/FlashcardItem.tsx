import React from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import type { FlashcardDto } from "../../types";

interface FlashcardItemProps {
  flashcard: FlashcardDto;
  onEdit: () => void;
  onDelete: () => void;
}

export const FlashcardItem = React.memo(function FlashcardItem({ flashcard, onEdit, onDelete }: FlashcardItemProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "ai-full":
        return "AI - pełne";
      case "ai-edited":
        return "AI - edytowane";
      case "manual":
        return "Ręczne";
      default:
        return source;
    }
  };

  const getSourceVariant = (source: string) => {
    switch (source) {
      case "ai-full":
        return "default" as const;
      case "ai-edited":
        return "secondary" as const;
      case "manual":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Front */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-muted-foreground">Przód:</span>
            </div>
            <p className="text-foreground font-medium leading-relaxed break-words">{flashcard.front}</p>
          </div>

          {/* Back */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-muted-foreground">Tył:</span>
            </div>
            <p className="text-foreground leading-relaxed break-words">{flashcard.back}</p>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 flex-wrap">
            <Badge variant={getSourceVariant(flashcard.source)} className="text-xs">
              {getSourceLabel(flashcard.source)}
            </Badge>
            <span className="text-xs text-muted-foreground">Utworzono: {formatDate(flashcard.created_at)}</span>
            {flashcard.updated_at !== flashcard.created_at && (
              <span className="text-xs text-muted-foreground">Edytowano: {formatDate(flashcard.updated_at)}</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0 justify-end sm:justify-start">
          <Button variant="outline" size="sm" onClick={onEdit} className="text-xs px-3 py-1">
            Edytuj
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete} className="text-xs px-3 py-1">
            Usuń
          </Button>
        </div>
      </div>
    </div>
  );
});
