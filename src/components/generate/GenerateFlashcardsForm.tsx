import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface GenerateFlashcardsFormProps {
  sourceText: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error?: string;
}

export function GenerateFlashcardsForm({
  sourceText,
  onChange,
  onSubmit,
  isSubmitting,
  error,
}: GenerateFlashcardsFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const isValid = sourceText.length >= 1000 && sourceText.length <= 10000;
  const charCount = sourceText.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="source-text">Tekst źródłowy</Label>
        <Textarea
          id="source-text"
          placeholder="Wklej tutaj tekst, z którego chcesz wygenerować fiszki (1000-10000 znaków)..."
          value={sourceText}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          rows={12}
          className="min-h-[200px] max-h-[200px]"
        />
        <div className="flex justify-between items-center text-sm">
          <span className={`text-muted-foreground ${charCount < 1000 || charCount > 10000 ? "text-destructive" : ""}`}>
            {charCount} / 10000 znaków
            {charCount < 1000 && ` (minimum 1000)`}
          </span>
          {error && <span className="text-destructive text-sm">{error}</span>}
        </div>
      </div>

      <Button type="submit" disabled={!isValid || isSubmitting} className="space-y-6">
        {isSubmitting ? "Generowanie..." : "Generuj fiszki"}
      </Button>
    </form>
  );
}
