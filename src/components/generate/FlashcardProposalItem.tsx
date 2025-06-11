import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, Edit3, AlertCircle } from "lucide-react";
import type { FlashcardProposalViewModel } from "../../types";

interface FlashcardProposalItemProps {
  proposal: FlashcardProposalViewModel;
  index: number;
  onStatusChange: (id: string, status: "accepted" | "rejected" | "pending") => void;
  onEditSubmit: (id: string, front: string, back: string) => void;
}

export function FlashcardProposalItem({ proposal, index, onStatusChange, onEditSubmit }: FlashcardProposalItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editFront, setEditFront] = useState(proposal.front);
  const [editBack, setEditBack] = useState(proposal.back);
  const [frontError, setFrontError] = useState<string | undefined>();
  const [backError, setBackError] = useState<string | undefined>();

  const handleStatusChange = (status: "accepted" | "rejected" | "pending") => {
    onStatusChange(proposal.id, status);
  };

  const handleEditSubmit = () => {
    // Walidacja
    let hasErrors = false;

    if (!editFront || editFront.trim().length === 0) {
      setFrontError("Przód fiszki nie może być pusty");
      hasErrors = true;
    } else if (editFront.length > 200) {
      setFrontError("Przód fiszki może mieć maksymalnie 200 znaków");
      hasErrors = true;
    } else {
      setFrontError(undefined);
    }

    if (!editBack || editBack.trim().length === 0) {
      setBackError("Tył fiszki nie może być pusty");
      hasErrors = true;
    } else if (editBack.length > 500) {
      setBackError("Tył fiszki może mieć maksymalnie 500 znaków");
      hasErrors = true;
    } else {
      setBackError(undefined);
    }

    if (hasErrors) return;

    // Zapisz zmiany
    onEditSubmit(proposal.id, editFront.trim(), editBack.trim());
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditFront(proposal.front);
    setEditBack(proposal.back);
    setFrontError(undefined);
    setBackError(undefined);
    setIsEditing(false);
  };

  const getStatusBadge = () => {
    switch (proposal.status) {
      case "accepted":
        return (
          <Badge variant="default" className="bg-green-500">
            Zaakceptowana
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Odrzucona</Badge>;
      default:
        return <Badge variant="secondary">Oczekuje</Badge>;
    }
  };

  const getSourceBadge = () => {
    return proposal.source === "ai-edited" ? (
      <Badge variant="outline">Edytowana</Badge>
    ) : (
      <Badge variant="outline">AI</Badge>
    );
  };

  return (
    <Card
      className={`transition-all ${proposal.status === "accepted" ? "ring-2 ring-green-500" : proposal.status === "rejected" ? "opacity-60" : ""}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Fiszka #{index}</span>
            {getSourceBadge()}
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={proposal.status === "accepted" ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange(proposal.status === "accepted" ? "pending" : "accepted")}
            >
              <Check className="h-4 w-4 mr-1" />
              {proposal.status === "accepted" ? "Zaakceptowana" : "Zatwierdź"}
            </Button>
            <Button
              variant={proposal.status === "rejected" ? "destructive" : "outline"}
              size="sm"
              onClick={() => handleStatusChange(proposal.status === "rejected" ? "pending" : "rejected")}
            >
              <X className="h-4 w-4 mr-1" />
              {proposal.status === "rejected" ? "Odrzucona" : "Odrzuć"}
            </Button>
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edytuj
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edytuj fiszkę #{index}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-front">Przód fiszki</Label>
                    <Textarea
                      id="edit-front"
                      value={editFront}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditFront(e.target.value)}
                      rows={3}
                      className={frontError ? "border-destructive" : ""}
                    />
                    <div className="flex justify-between items-center text-sm">
                      <span className={editFront.length > 200 ? "text-destructive" : "text-muted-foreground"}>
                        {editFront.length} / 200 znaków
                      </span>
                      {frontError && (
                        <span className="text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {frontError}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-back">Tył fiszki</Label>
                    <Textarea
                      id="edit-back"
                      value={editBack}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditBack(e.target.value)}
                      rows={4}
                      className={backError ? "border-destructive" : ""}
                    />
                    <div className="flex justify-between items-center text-sm">
                      <span className={editBack.length > 500 ? "text-destructive" : "text-muted-foreground"}>
                        {editBack.length} / 500 znaków
                      </span>
                      {backError && (
                        <span className="text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {backError}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleEditCancel}>
                      Anuluj
                    </Button>
                    <Button onClick={handleEditSubmit}>Zapisz zmiany</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Przód</Label>
          <div className="mt-1 p-3 bg-muted rounded-md">
            <p className="text-sm whitespace-pre-wrap">{proposal.front}</p>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium">Tył</Label>
          <div className="mt-1 p-3 bg-muted rounded-md">
            <p className="text-sm whitespace-pre-wrap">{proposal.back}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
