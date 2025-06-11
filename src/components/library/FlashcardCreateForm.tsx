import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import type { FlashcardCreateDto } from "../../types";

interface FlashcardCreateFormProps {
  visible: boolean;
  onSave: (data: FlashcardCreateDto) => void;
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

export function FlashcardCreateForm({ visible, onSave, onCancel, loading = false }: FlashcardCreateFormProps) {
  const [formData, setFormData] = useState<FormState>({
    front: "",
    back: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const frontInputRef = useRef<HTMLTextAreaElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setFormData({ front: "", back: "" });
      setErrors({});
      // Focus on first input when modal opens
      setTimeout(() => {
        frontInputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const flashcardData: FlashcardCreateDto = {
      front: formData.front.trim(),
      back: formData.back.trim(),
      source: "manual",
      generation_id: null,
    };

    onSave(flashcardData);
  };

  const handleCancel = () => {
    setFormData({ front: "", back: "" });
    setErrors({});
    onCancel();
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dodaj nową fiszkę</DialogTitle>
        </DialogHeader>

        <form id="create-flashcard-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Front Field */}
          <div className="space-y-2">
            <Label htmlFor="front" className="text-sm font-medium">
              Przód fiszki *
            </Label>
            <Textarea
              ref={frontInputRef}
              id="front"
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
            <Label htmlFor="back" className="text-sm font-medium">
              Tył fiszki *
            </Label>
            <Textarea
              id="back"
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
        </form>

        <DialogFooter className="gap-3 sm:gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={loading} className="flex-1">
            Anuluj
          </Button>
          <Button
            type="submit"
            form="create-flashcard-form"
            disabled={loading || !formData.front.trim() || !formData.back.trim()}
            className="flex-1"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                Zapisywanie...
              </div>
            ) : (
              "Zapisz fiszkę"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
