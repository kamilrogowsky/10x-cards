# Plan wdrożenia punktów końcowych CRUD dla Flashcards

## 1. Przegląd endpointów
- **GET `/flashcards`** – pobieranie listy fiszek z paginacją, sortowaniem i filtrami.
- **GET `/flashcards/{id}`** – pobieranie szczegółów pojedynczej fiszki.
- **POST `/flashcards`** – tworzenie jednej lub wielu fiszek.
- **PUT `/flashcards/{id}`** – aktualizacja istniejącej fiszki.
- **DELETE `/flashcards/{id}`** – usuwanie fiszki.

## 2. Szczegóły żądań

### GET `/flashcards`
- Metoda HTTP: `GET`
- URL: `/api/flashcards`
- Nagłówki:
  - `Authorization: Bearer <token>`
- Query Parameters:
  - Wymagane:
    - `page` (liczba, domyślnie `1`)
    - `limit` (liczba, domyślnie `10`)
  - Opcjonalne:
    - `sort` (string, np. `created_at`)
    - `order` (`asc` lub `desc`, domyślnie `desc`)
    - `source` (`ai-full` | `ai-edited` | `manual`)
    - `generation_id` (number)
- Body: brak

### GET `/flashcards/{id}`
- Metoda HTTP: `GET`
- URL: `/api/flashcards/{id}`
- Parametry ścieżki:
  - `id`: `number`
- Nagłówki:
  - `Authorization: Bearer <token>`
- Body: brak

### POST `/flashcards`
- Metoda HTTP: `POST`
- URL: `/api/flashcards`
- Nagłówki:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- Body (JSON):
  ```json
  {
    "flashcards": [
      { "front": "Question 1", "back": "Answer 1", "source": "manual", "generation_id": null },
      { "front": "Question 2", "back": "Answer 2", "source": "ai-full", "generation_id": 123 }
    ]
  }
  ```

### PUT `/flashcards/{id}`
- Metoda HTTP: `PUT`
- URL: `/api/flashcards/{id}`
- Nagłówki:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- Parametry ścieżki:
  - `id`: `number`
- Body (JSON): pola do aktualizacji, np.: `{ "front": "Nowe pytanie", "back": "Nowa odpowiedź" }`

### DELETE `/flashcards/{id}`
- Metoda HTTP: `DELETE`
- URL: `/api/flashcards/{id}`
- Nagłówki:
  - `Authorization: Bearer <token>`
- Parametry ścieżki:
  - `id`: `number`
- Body: brak

## 3. Wykorzystywane typy
- DTO i modele komend:
  - `FlashcardDto`
  - `FlashcardsListResponseDto`
  - `FlashcardCreateDto`
  - `FlashcardsCreateCommand`
  - `FlashcardUpdateDto`

## 4. Szczegóły odpowiedzi

### GET `/flashcards`
- Status: `200 OK`
- Body: `FlashcardsListResponseDto`
  ```json
  {
    "data": [ { /* FlashcardDto */ } ],
    "pagination": { "page": 1, "limit": 10, "total": 100 }
  }
  ```

### GET `/flashcards/{id}`
- Status: `200 OK`
- Body: `FlashcardDto`

### POST `/flashcards`
- Status: `201 Created`
- Body:
  ```json
  { "flashcards": [ /* utworzone FlashcardDto */ ] }
  ```

### PUT `/flashcards/{id}`
- Status: `200 OK`
- Body: zaktualizowany `FlashcardDto`

### DELETE `/flashcards/{id}`
- Status: `200 OK`
- Body:
  ```json
  { "message": "Flashcard deleted successfully." }
  ```

## 5. Przepływ danych
1. Klient wysyła żądanie HTTP z tokenem w nagłówku.
2. Middleware uwierzytelnia użytkownika i przekazuje `user_id` oraz klienta Supabase w `context.locals`.
3. Handler endpointa waliduje parametry i body przy użyciu Zod.
4. Handler wywołuje metodę odpowiedniego serwisu (`flashcardsService`).
5. Serwis używa `context.locals.supabase` do zapytań do bazy danych, uwzględniając `user_id`.
6. Wynik zwracany jest do handlera, który formatuje odpowiedź i zwraca ją klientowi.

## 6. Względy bezpieczeństwa
- Uwierzytelnianie za pomocą tokena JWT Supabase Auth.
- Autoryzacja: każda operacja filtrowana po `user_id` – brak dostępu do cudzych fiszek.
- Walidacja wejścia z Zod, ochrona przed nieprawidłowymi lub złośliwymi danymi.
- Unikanie masowego przypisania – jawne mapowanie pól.

## 7. Obsługa błędów
- `400 Bad Request`: niepoprawne parametry zapytania lub body (szczegółowe błędy walidacji).
- `401 Unauthorized`: brak lub niepoprawny token.
- `403 Forbidden`: próba dostępu do zasobu innego użytkownika (opcjonalnie zamieniane na `404`).
- `404 Not Found`: zasób o podanym `id` nie istnieje lub należy do innego użytkownika.
- `500 Internal Server Error`: nieoczekiwany błąd serwera.

## 8. Rozważania dotyczące wydajności
- Paginacja (LIMIT/OFFSET) i indeksy na kolumnach `user_id`, `created_at`.
- Selekcja tylko potrzebnych kolumn.
- Możliwość wprowadzenia cursors-based pagination w przyszłości.

## 9. Kroki implementacji
1. Utworzyć schematy Zod w `src/lib/schemas/flashcardSchemas.ts`.
2. Stworzyć serwis `src/lib/services/flashcardsService.ts` z metodami CRUD, przyjmujący `supabase` i `userId`.
3. Utworzyć endpointy w Astro:
   - `src/pages/api/flashcards/index.ts` (GET, POST)
   - `src/pages/api/flashcards/[id].ts` (GET, PUT, DELETE)
4. W endpointach zaimplementować:
   - Parsowanie i walidację zapytania oraz body.
   - Wywołania metod serwisu.
   - Obsługę statusów HTTP i formatowanie odpowiedzi.
5. Zapewnić middleware `src/middleware/index.ts` dla uwierzytelniania Supabase.