import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Check } from 'lucide-react';
import type { FlashcardProposalViewModel } from '../../types';

interface SaveActionsProps {
  generationId: number;
  proposals: FlashcardProposalViewModel[];
  isSaving: boolean;
  onSaveAll: () => void;
  onSaveAccepted: () => void;
}

export function SaveActions({
  generationId,
  proposals,
  isSaving,
  onSaveAll,
  onSaveAccepted
}: SaveActionsProps) {
  const acceptedCount = proposals.filter(p => p.status === 'accepted').length;
  const totalCount = proposals.length;

  const canSaveAccepted = acceptedCount > 0 && !isSaving;
  const canSaveAll = totalCount > 0 && !isSaving;

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-start">
      <Button
        onClick={onSaveAccepted}
        disabled={!canSaveAccepted}
        variant="default"
        className="w-fit"
      >
        <Check className="h-4 w-4 mr-2" />
        {isSaving ? 'Zapisywanie...' : `Zapisz zaakceptowane (${acceptedCount})`}
      </Button>
      
      <Button
        onClick={onSaveAll}
        disabled={!canSaveAll}
        variant="default"
        className="w-fit"
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? 'Zapisywanie...' : `Zapisz wszystkie (${totalCount})`}
      </Button>
    </div>
  );
} 