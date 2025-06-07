# Plan implementacji widoku Generowanie fiszek

## 1. Przegląd
Widok umożliwia użytkownikowi wprowadzenie tekstu (1000-10000 znaków) i wysłanie go do API w celu wygenerowania propozycji fiszek przez AI. Następnie użytkownik może przeglądać, zatwierdzać, edytować lub odrzucać wygenerowane propozycje fiszek. Na koniec może zapisać do bazy danych wszystkie bądź tylko zaakceptowane fiszki.

## 2. Routing widoku
Ścieżka: `/generate`

## 3. Struktura komponentów
```
GenerateFlashcardsPage (src/pages/generate.astro)
└─ MainLayout
   └─ GenerateFlashcardsContainer
       ├─ GenerateFlashcardsForm
       ├─ SkeletonList (podczas ładowania)
       ├─ ErrorAlert (jeśli błąd)
       ├─ FlashcardsProposalsList
       │    └─ FlashcardProposalItem*
       ├─ SaveActions
       └─ ToastNotifications
``` 

## 4. Szczegóły komponentów

### GenerateFlashcardsForm
- Opis: Formularz z polem tekstowym i przyciskiem generowania.
- Główne elementy: Textarea (Shadcn/ui), Button "Generuj fiszki", komunikaty walidacji.
- Obsługiwane interakcje: wpisywanie tekstu, walidacja długości, submit.
- Walidacja: długość `sourceText` ∈ [1000,10000]; jeśli niepoprawne, przycisk zablokowany i wyświetlony error.
- Propsy:
  - `sourceText: string`
  - `onChange(text: string): void`
  - `onSubmit(): void`
  - `isSubmitting: boolean`
  - `error?: string`

### SkeletonList
- Opis: Wskaźnik ładowania listy propozycji (karty skeleton).
- Główne elementy: kilka elementów Skeleton (Shadcn/ui).
- Renderowane kiedy `isLoading` = true.

### ErrorAlert
- Opis: Wyświetla komunikaty o błędach API lub ogólne.
- Główne elementy: Alert/Toast (Shadcn/ui).
- Propsy:
  - `message: string`

### FlashcardsProposalsList
- Opis: Lista wygenerowanych propozycji.
- Główne elementy: `<ul>` z `FlashcardProposalItem`.
- Propsy:
  - `proposals: FlashcardProposalViewModel[]`
  - `onStatusChange(id, status): void`
  - `onEdit(id, front, back): void`

### FlashcardProposalItem
- Opis: Pojedyncza propozycja fiszki.
- Główne elementy: Card z front/back lub formą edycji, przyciski Zatwierdź, Odrzuć, Edytuj.
- Interakcje: 
  - Toggle status (`accepted`/`rejected`)
  - Edycja pola front/back (Modal/Dialog Shadcn/ui lub inline)
  - Zapis edycji (walidacja długości: front ∈ [1,200], back ∈ [1,500])
- Propsy:
  - `proposal: FlashcardProposalViewModel`
  - `onStatusChange(id: string, status: Status): void`
  - `onEditSubmit(id: string, front: string, back: string): void`

### SaveActions
- Opis: Przyciski do zapisu fiszek do bazy.
- Główne elementy: Button "Zapisz wszystkie", Button "Zapisz zaakceptowane".
- Interakcje: wywołanie `onSaveAll()` / `onSaveAccepted()`.
- Warunki blokady:
  - `Zapisz zaakceptowane` disabled jeśli brak zaakceptowanych.
  - Oba disabled jeśli `isSaving`.
- Propsy:
  - `generationId: number`
  - `proposals: FlashcardProposalViewModel[]`
  - `isSaving: boolean`
  - `onSaveAll(): void`
  - `onSaveAccepted(): void`

## 5. Typy
```ts
// DTO z backendu
type GenerationCreateResponseDto = {
  generation_id: number;
  flashcards_proposals: { front: string; back: string; source: 'ai-full' }[];
  generated_count: number;
};

// ViewModel w frontendzie
interface FlashcardProposalViewModel {
  id: string;                // unikalny identyfikator (np. index)
  front: string;
  back: string;
  source: 'ai-full' | 'ai-edited';
  generationId: number;
  status: 'accepted' | 'rejected' | 'pending';
  validationErrors?: { front?: string; back?: string };
}

// Do zapisu
interface FlashcardCreateDto {
  front: string;
  back: string;
  source: 'ai-full' | 'ai-edited';
  generation_id: number;
}

interface FlashcardsCreateCommand {
  flashcards: FlashcardCreateDto[];
}
``` 

## 6. Zarządzanie stanem
- `sourceText`, `sourceTextError`
- `isGenerating`, `generationError`
- `proposals: FlashcardProposalViewModel[]`
- `isSaving`, `saveError`, `saveSuccess`
- Hooki:
  - `useGenerateFlashcards()` ⇒ `{ generate(sourceText), data, error, isLoading }`
  - `useSaveFlashcards()` ⇒ `{ save(flashcards), data, error, isLoading }`

## 7. Integracja API
- **POST** `/api/generations`
  - Request: `{ source_text: string }`
  - Response: `GenerationCreateResponseDto`
- **POST** `/api/flashcards`
  - Request: `FlashcardsCreateCommand`
  - Response: `{ flashcards: FlashcardDto[] }`
- Użycie `fetch` z opcją `credentials: 'include'` dla ciasteczek auth.

## 8. Interakcje użytkownika
1. Wkleja tekst → walidacja długości → przycisk aktywny/nieaktywny.
2. Klik "Generuj fiszki" → widok skeleton → po otrzymaniu danych wyświetl listę.
3. Dla każdej propozycji:
   - Zatwierdź/Rezygnuj → zmiana statusu.
   - Edytuj → otwórz modal/inline edycję → walidacja → zatwierdź.
4. Klik "Zapisz zaakceptowane" lub "Zapisz wszystkie" → wysyłka do API → toast/alert.

## 9. Warunki i walidacja
- `sourceText.length ∈ [1000,10000]`
- co najmniej 1 proposal przed zapisem
- przy edycji: `front.length ∈ [1,200]`, `back.length ∈ [1,500]`
- max 50 fiszek w jednym zapytaniu

## 10. Obsługa błędów
- Walidacja formularza → inline
- Błędy 400/500 z `/generations` → ErrorAlert/toast
- Błędy 401 z `/flashcards` → redirect do `/login`
- Błędy 400 z `/flashcards` → inline w SaveActions lub per–item
- Toast na sukces `Zapisano fiszki`

## 11. Kroki implementacji
1. Utworzyć `src/pages/generate.astro` z importem `MainLayout` i `GenerateFlashcardsContainer` (`client:load`).
2. Stworzyć folder `src/components/generate/` oraz pliki dla komponentów: Form, List, Item, SaveActions, Skeleton, ErrorAlert.
3. Skorzystać z istniejących typów i jeśli istnieje konieczność stworzyć brakujące w `src/types.ts`.
4. Napisać hook `useGenerateFlashcards` (fetch, state, error).
5. Napisać hook `useSaveFlashcards` (fetch, state, error).
6. Zaimplementować `GenerateFlashcardsForm` z walidacją i eventami.
7. Zaimplementować `SkeletonList` i `ErrorAlert`.
8. Zaimplementować `FlashcardsProposalsList` i `FlashcardProposalItem` wraz z modalem/inline edycją.
9. Zaimplementować `SaveActions` z dwoma przyciskami i warunkami blokady.
10. Dodać ToastNotifications (Shadcn/ui) dla sukcesów i błędów.
11. Przetestować ręcznie wszystkie scenariusze: walidacja, generowanie, edycja, zapis, błędy.