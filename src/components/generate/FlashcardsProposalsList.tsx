import React from 'react';
import { FlashcardProposalItem } from './FlashcardProposalItem';
import type { FlashcardProposalViewModel } from '../../types';

interface FlashcardsProposalsListProps {
  proposals: FlashcardProposalViewModel[];
  onStatusChange: (id: string, status: 'accepted' | 'rejected' | 'pending') => void;
  onEdit: (id: string, front: string, back: string) => void;
}

export function FlashcardsProposalsList({
  proposals,
  onStatusChange,
  onEdit
}: FlashcardsProposalsListProps) {
  if (proposals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Brak wygenerowanych propozycji fiszek</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Wygenerowane propozycje fiszek</h2>
        <p className="text-muted-foreground">
          Przejrzyj propozycje, zatwierdź lub odrzuć je, a następnie zapisz wybrane fiszki
        </p>
      </div>
      
      <div className="space-y-4">
        {proposals.map((proposal, index) => (
          <FlashcardProposalItem
            key={proposal.id}
            proposal={proposal}
            index={index + 1}
            onStatusChange={onStatusChange}
            onEditSubmit={onEdit}
          />
        ))}
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        Wygenerowano {proposals.length} {proposals.length === 1 ? 'propozycję' : 'propozycji'}
      </div>
    </div>
  );
} 