# Plan implementacji widoku Moje fiszki

## 1. Przegląd
Widok "Moje fiszki" umożliwia zalogowanemu użytkownikowi przeglądanie, tworzenie, edycję oraz usuwanie własnych fiszek. Zapewnia paginację, walidację pól oraz potwierdzenia operacji.

## 2. Routing widoku
Ścieżka: `/library` (strona dostępna tylko dla uwierzytelnionych użytkowników)

## 3. Struktura komponentów
```
LibraryPage (src/pages/library.astro)
├─ FlashcardsList
│   ├─ FlashcardItem
│   │   ├─ EditButton
│   │   └─ DeleteButton
│   └─ PaginationControls
├─ FlashcardCreateForm
├─ FlashcardEditModal
└─ ConfirmationDialog
```  

## 4. Szczegóły komponentów

### LibraryPage
- Opis: Kontener strony, sprawdza uprawnienia, ładuje dane flashcards, zarządza stanem i wywołuje hooki.
- Elementy: nagłówek, przycisk "Dodaj fiszkę", komponenty listy, modale, paginacja, ToastProvider.
- Zdarzenia: onAddNew, onPageChange, onEdit, onDelete.
- Typy: brak props.

### FlashcardsList
- Opis: Renderuje listę fiszek z przekazanego stanu.
- Główne elementy: <ul> z elementami `FlashcardItem`.
- Zdarzenia: przekazuje onEdit(id) i onDelete(id) do dzieci.
- Typy props:
  - `flashcards`: FlashcardDto[]
  - `onEdit(id: number)`: () => void
  - `onDelete(id: number)`: () => void
  - `pagination`: PaginationDto
  - `onPageChange(page: number)`: () => void

### FlashcardItem
- Opis: Wyświetla front/back fiszki, źródło i daty.
- Elementy: tekst front, tekst back (tooltip/ukryty), meta, przyciski Edit/Delete.
- Zdarzenia: onEdit(), onDelete().
- Typy props:
  - `flashcard`: FlashcardDto
  - `onEdit()`, `onDelete()`

### FlashcardCreateForm
- Opis: Formularz do tworzenia nowej fiszki.
- Elementy: <input> front, <textarea> back, przyciski "Zapisz"/"Anuluj".
- Zdarzenia: onSave(data), onCancel().
- Walidacja:
  - front: wymagane, max 200 znaków
  - back: wymagane, max 500 znaków
- Typy props:
  - `visible`: boolean
  - `onSave(data: FlashcardCreateDto)`: () => void
  - `onCancel()`: () => void

### FlashcardEditModal
- Opis: Modal do edycji istniejącej fiszki.
- Elementy: pola front/back prewypełnione, przyciski "Zapisz"/"Anuluj".
- Zdarzenia: onSave(update: FlashcardUpdateDto), onCancel().
- Walidacja: jak w create.
- Typy props:
  - `visible`: boolean
  - `flashcard`: FlashcardDto
  - `onSave(data: FlashcardUpdateDto)`: () => void
  - `onCancel()`: () => void

### ConfirmationDialog
- Opis: Potwierdzenie usunięcia przedmiotu.
- Elementy: komunikat, przyciski "Potwierdź"/"Anuluj".
- Zdarzenia: onConfirm(), onCancel().
- Typy props:
  - `visible`: boolean
  - `message`: string
  - `onConfirm()`: () => void
  - `onCancel()`: () => void

### PaginationControls
- Opis: Sterowanie paginacją.
- Elementy: przyciski "Poprzednia"/"Następna", wyświetlenie strony / łącznej liczby.
- Zdarzenia: onPageChange(page: number).
- Typy props:
  - `page`: number
  - `totalPages`: number
  - `onPageChange(page: number)`: () => void

## 5. Typy
- FlashcardDto (id, front, back, source, generation_id, created_at, updated_at)
- PaginationDto (page, limit, total)
- FlashcardsListResponseDto (data: FlashcardDto[], pagination: PaginationDto)
- FlashcardCreateDto (front, back, source="manual", generation_id=null)
- FlashcardUpdateDto (Partial<{ front, back, source, generation_id }>)
- FlashcardViewModel (opcjonalnie rozszerza FlashcardDto o stany lokalne)

## 6. Zarządzanie stanem
Stworzyć custom hook `useFlashcards` w `src/hooks/useFlashcards.ts`:
- State: flashcards, pagination, loading, error
- Metody:
  - `fetchFlashcards(page: number, limit: number)`
  - `createFlashcard(data: FlashcardCreateDto)`
  - `updateFlashcard(id: number, data: FlashcardUpdateDto)`
  - `deleteFlashcard(id: number)`
Hook zwraca stan i metody do wykorzystania w `LibraryPage`.

## 7. Integracja API
- GET `/api/flashcards?page=&limit=&sort=created_at&order=desc` → `useFlashcards.fetchFlashcards`
- POST `/api/flashcards` z body `{ flashcards: [FlashcardCreateDto] }` → `createFlashcard`
- PUT `/api/flashcards/{id}` z body Partial → `updateFlashcard`
- DELETE `/api/flashcards/{id}` → `deleteFlashcard`
Typy request/response zdefiniowane w `src/types.ts`.

## 8. Interakcje użytkownika
1. Klik "Dodaj fiszkę" → otwarcie `FlashcardCreateForm`.
2. Wypełnienie pól → walidacja → klik "Zapisz" → wywołanie API → aktualizacja listy.
3. Klik "Edytuj" przy fiszce → otwarcie `FlashcardEditModal` z danymi.
4. Edycja → walidacja → klik "Zapisz" → wywołanie API → odświeżenie listy.
5. Klik "Usuń" przy fiszce → otwarcie `ConfirmationDialog` → klik "Potwierdź" → wywołanie API → usunięcie z listy.
6. Nawigacja paginacji → fetchFlashcards z nową stroną.

## 9. Warunki i walidacja
- front: wymagane, max 200 znaków
- back: wymagane, max 500 znaków
- przed zapisem formularz blokuje przycisk "Zapisz" przy błędach
- paginacja: numer strony ≥1, ≤totalPages

## 10. Obsługa błędów
- Błędy sieciowe: toast z komunikatem i opcja ponów
- Błędy walidacji API (400): wyświetlenie szczegółowych komunikatów przy polach
- 401: przekierowanie na `/login`
- 404 przy edycji/usunięciu: toast informujący o braku zasobu

## 11. Kroki implementacji
1. Utworzyć plik strony: `src/pages/library.astro`, dodać autoryzację i załadować `LibraryPage`.
2. Stworzyć hook `useFlashcards` w `src/hooks/useFlashcards.ts`.
3. Zaimplementować `LibraryPage.tsx` (import hook, render, zarządzanie modals).
4. Utworzyć `FlashcardsList.tsx` i `FlashcardItem.tsx`.
5. Utworzyć formularz `FlashcardCreateForm.tsx`.
6. Utworzyć modal `FlashcardEditModal.tsx`.
7. Utworzyć `ConfirmationDialog.tsx` (można użyć Shadcn/ui).
8. Utworzyć `PaginationControls.tsx`.
9. Dodać style Tailwind i komponenty Shadcn/ui.
10. Przetestować scenariusze: tworzenie, edycja, usuwanie, paginacja, obsługę błędów. 