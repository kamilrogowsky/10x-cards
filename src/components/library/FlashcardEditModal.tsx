import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import type { FlashcardDto, FlashcardUpdateDto } from "../../types";

interface FlashcardEditModalProps {
  visible: boolean;
  flashcard: FlashcardDto | null;
  onSave: (data: FlashcardUpdateDto) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface FormState {
  front: string;
  back: string;
}

interface ValidationErrors {
  front?: string;
  back?: string;
}

export function FlashcardEditModal({ visible, flashcard, onSave, onCancel, loading = false }: FlashcardEditModalProps) {
  const [formData, setFormData] = useState<FormState>({
    front: "",
    back: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const frontInputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize form when modal opens or flashcard changes
  useEffect(() => {
    if (visible && flashcard) {
      setFormData({
        front: flashcard.front,
        back: flashcard.back,
      });
      setErrors({});
      // Focus on first input when modal opens
      setTimeout(() => {
        frontInputRef.current?.focus();
      }, 100);
    }
  }, [visible, flashcard]);

  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    // Validate front
    if (!formData.front.trim()) {
      newErrors.front = "Pole przód jest wymagane";
    } else if (formData.front.trim().length > 200) {
      newErrors.front = "Maksymalna długość to 200 znaków";
    }

    // Validate back
    if (!formData.back.trim()) {
      newErrors.back = "Pole tył jest wymagane";
    } else if (formData.back.trim().length > 500) {
      newErrors.back = "Maksymalna długość to 500 znaków";
    }

    return newErrors;
  };

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const hasChanges = () => {
    if (!flashcard) return false;
    return formData.front.trim() !== flashcard.front || formData.back.trim() !== flashcard.back;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Only send changed fields
    const updateData: FlashcardUpdateDto = {};

    if (flashcard) {
      if (formData.front.trim() !== flashcard.front) {
        updateData.front = formData.front.trim();
      }
      if (formData.back.trim() !== flashcard.back) {
        updateData.back = formData.back.trim();
      }

      // Mark as manually edited if there are changes
      if (Object.keys(updateData).length > 0) {
        updateData.source = "ai-edited";
      }
    }

    onSave(updateData);
  };

  const handleCancel = () => {
    setErrors({});
    onCancel();
  };

  return (
    <Dialog open={visible && !!flashcard} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edytuj fiszkę</DialogTitle>
        </DialogHeader>

        <form id="edit-flashcard-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Front Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-front" className="text-sm font-medium">
              Przód fiszki *
            </Label>
            <Textarea
              ref={frontInputRef}
              id="edit-front"
              placeholder="Wpisz tekst na przód fiszki..."
              value={formData.front}
              onChange={(e) => handleInputChange("front", e.target.value)}
              className={`min-h-[80px] resize-none ${errors.front ? "border-destructive" : ""}`}
              disabled={loading}
            />
            <div className="flex justify-between items-center text-xs">
              {errors.front && <span className="text-destructive">{errors.front}</span>}
              <span className={`ml-auto ${formData.front.length > 180 ? "text-destructive" : "text-muted-foreground"}`}>
                {formData.front.length}/200
              </span>
            </div>
          </div>

          {/* Back Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-back" className="text-sm font-medium">
              Tył fiszki *
            </Label>
            <Textarea
              id="edit-back"
              placeholder="Wpisz tekst na tył fiszki..."
              value={formData.back}
              onChange={(e) => handleInputChange("back", e.target.value)}
              className={`min-h-[100px] resize-none ${errors.back ? "border-destructive" : ""}`}
              disabled={loading}
            />
            <div className="flex justify-between items-center text-xs">
              {errors.back && <span className="text-destructive">{errors.back}</span>}
              <span className={`ml-auto ${formData.back.length > 450 ? "text-destructive" : "text-muted-foreground"}`}>
                {formData.back.length}/500
              </span>
            </div>
          </div>

          {/* Source info */}
          <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-md">
            <strong>Uwaga:</strong> Edycja tej fiszki zmieni jej źródło na "AI - edytowane".
          </div>
        </form>

        <DialogFooter className="gap-3 sm:gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={loading} className="flex-1">
            Anuluj
          </Button>
          <Button
            type="submit"
            form="edit-flashcard-form"
            disabled={loading || !formData.front.trim() || !formData.back.trim() || !hasChanges()}
            className="flex-1"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                Zapisywanie...
              </div>
            ) : (
              "Zapisz zmiany"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
