import React, { useState, useEffect } from 'react';
import { GenerateFlashcardsForm } from './GenerateFlashcardsForm';
import { SkeletonList } from './SkeletonList';
import { ErrorAlert } from './ErrorAlert';
import { FlashcardsProposalsList } from './FlashcardsProposalsList';
import { SaveActions } from './SaveActions';
import { useGenerateFlashcards } from './hooks/useGenerateFlashcards';
import { useSaveFlashcards } from './hooks/useSaveFlashcards';
import { toast } from 'sonner';
import type { FlashcardProposalViewModel } from '../../types';

export default function GenerateFlashcardsContainer() {
  const [sourceText, setSourceText] = useState('');
  const [proposals, setProposals] = useState<FlashcardProposalViewModel[]>([]);
  const [generationId, setGenerationId] = useState<number | null>(null);
  const [lastSaveAction, setLastSaveAction] = useState<'all' | 'accepted' | null>(null);

  const {
    generate,
    data: generationData,
    error: generationError,
    isLoading: isGenerating
  } = useGenerateFlashcards();

  const {
    save,
    error: saveError,
    isLoading: isSaving,
    success: saveSuccess,
    clearState: clearSaveState
  } = useSaveFlashcards();

  // Handle save success
  useEffect(() => {
    if (saveSuccess && lastSaveAction) {
      const acceptedCount = proposals.filter(p => p.status === 'accepted').length;
      const totalCount = proposals.length;
      
      if (lastSaveAction === 'accepted') {
        toast.success(`Zapisano ${acceptedCount} zaakceptowanych fiszek!`, {
          description: `Pomyślnie dodano fiszki do bazy danych.`
        });
      } else {
        toast.success(`Zapisano ${totalCount} fiszek!`, {
          description: `Pomyślnie dodano wszystkie fiszki do bazy danych.`
        });
      }
      
      // Reset form to initial state after successful save
      setTimeout(() => {
        setSourceText('');
        setProposals([]);
        setGenerationId(null);
        clearSaveState();
        setLastSaveAction(null);
      }, 100);
    }
  }, [saveSuccess, lastSaveAction, proposals, clearSaveState]);

  const handleSourceTextChange = (text: string) => {
    setSourceText(text);
  };

  const handleGenerate = async () => {
    try {
      const result = await generate(sourceText);
      if (result) {
        setGenerationId(result.generation_id);
        
        // Przekształć propozycje z API na ViewModels
        const proposalViewModels: FlashcardProposalViewModel[] = result.flashcards_proposals.map(
          (proposal: any, index: number) => ({
            id: `proposal-${index}`,
            front: proposal.front,
            back: proposal.back,
            source: proposal.source,
            generationId: result.generation_id,
            status: 'pending' as const,
          })
        );
        
        setProposals(proposalViewModels);
      }
    } catch (error) {
      console.error('Failed to generate flashcards:', error);
    }
  };

  const handleProposalStatusChange = (id: string, status: 'accepted' | 'rejected' | 'pending') => {
    setProposals(prev => 
      prev.map(proposal => 
        proposal.id === id ? { ...proposal, status } : proposal
      )
    );
  };

  const handleProposalEdit = (id: string, front: string, back: string) => {
    setProposals(prev => 
      prev.map(proposal => 
        proposal.id === id 
          ? { 
              ...proposal, 
              front, 
              back, 
              source: 'ai-edited' as const,
              validationErrors: undefined
            } 
          : proposal
      )
    );
    
    toast.success('Fiszka została edytowana', {
      description: 'Zmiany zostały zapisane lokalnie.'
    });
  };

  const handleSaveAll = async () => {
    if (!generationId) return;
    
    setLastSaveAction('all');
    
    const flashcardsToSave = proposals.map(proposal => ({
      front: proposal.front,
      back: proposal.back,
      source: proposal.source,
      generation_id: proposal.generationId,
    }));

    await save(flashcardsToSave);
  };

  const handleSaveAccepted = async () => {
    if (!generationId) return;
    
    setLastSaveAction('accepted');
    
    const acceptedProposals = proposals.filter(p => p.status === 'accepted');
    const flashcardsToSave = acceptedProposals.map(proposal => ({
      front: proposal.front,
      back: proposal.back,
      source: proposal.source,
      generation_id: proposal.generationId,
    }));

    await save(flashcardsToSave);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Generuj fiszki</h1>
          <p className="mt-2 text-muted-foreground">
            Wklej tekst (1000-10000 znaków), a AI wygeneruje dla Ciebie fiszki do nauki
          </p>
        </div>

        <GenerateFlashcardsForm
          sourceText={sourceText}
          onChange={handleSourceTextChange}
          onSubmit={handleGenerate}
          isSubmitting={isGenerating}
        />

        {generationError && (
          <ErrorAlert message={generationError} />
        )}

        {isGenerating && <SkeletonList />}

        {proposals.length > 0 && (
          <SaveActions
            generationId={generationId!}
            proposals={proposals}
            isSaving={isSaving}
            onSaveAll={handleSaveAll}
            onSaveAccepted={handleSaveAccepted}
          />
        )}

        {proposals.length > 0 && (
          <FlashcardsProposalsList
            proposals={proposals}
            onStatusChange={handleProposalStatusChange}
            onEdit={handleProposalEdit}
          />
        )}

        {saveError && (
          <ErrorAlert message={saveError} />
        )}
      </div>
    </div>
  );
} 