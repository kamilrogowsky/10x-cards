# API Endpoint Implementation Plan: POST /generations

## 1. Przegląd punktu końcowego
Endpoint umożliwia inicjację procesu generowania propozycji fiszek AI na podstawie dostarczonego tekstu przez użytkownika.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Ścieżka: `/generations`
- Nagłówki:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (Supabase Auth)
- Parametry:
  - Wymagane:
    - `source_text` (string, 1000–10000 znaków)
  - Opcjonalne: brak
- Body (JSON):
  ```json
  {
    "source_text": "..."
  }
  ```

## 3. Wykorzystywane typy
- `GenerateFlashcardsCommand` (src/types.ts)
- `FlashcardProposalDto` (src/types.ts)
- `GenerationCreateResponseDto` (src/types.ts)
- `Zod`-owa definicja wejścia (np. `GenerationSchemas`)  

## 4. Szczegóły odpowiedzi
- Status 201 Created
- Body (JSON):
  ```json
  {
    "generation_id": 123,
    "flashcards_proposals": [
      { "front": "Question", "back": "Answer", "source": "ai-full" }
    ],
    "generated_count": 5
  }
  ```

## 5. Przepływ danych
1. Middleware lub Astro Server Endpoint pobiera `supabase` z `context.locals` i weryfikuje użytkownika.
2. Walidacja `source_text` z użyciem Zod (długość 1000–10000).
3. Wywołanie dedykowanego serwisu (np. `generation.service`), który:
   - Przekazuje `source_text` do zewnętrznego serwisu AI w celu wygenerowania propozycji fiszek.
   - Oblicza i zapisuje metadane generacji w tabeli `generations` (m.in. `model`, `generated_count`, `source_text_hash`, `source_text_length`, `generation_duration`).
4. W przypadku wystąpienia błędu podczas wywołania AI, rejestrowanie błędu w tabeli `generation_error_logs` z odpowiednimi danymi (np. `error_code`, `error_message`, `model`).
5. Zwrócenie odpowiedzi do klienta z danymi zgodnymi z modelem `GenerationCreateResponseDto`.

## 6. Względy bezpieczeństwa
- Autoryzacja: tylko uwierzytelnieni użytkownicy (Supabase Auth).
- Walidacja wejścia: Zod, długość i typ.
- Uniknięcie ataków DoS: limit wielkości ciała żądania (10 000 znaków).
- Hashowanie tekstu: zabezpieczenie prywatnych danych.
- Obsługa błędów: nie wyciekać szczegółów wewnętrznych w 500.

## 7. Obsługa błędów
- 400 Bad Request: niepoprawne dane wejściowe (Zod błędy).
- 401 Unauthorized: brak lub nieważny token.
- 500 Internal Server Error:
  - Błąd wywołania AI → zapis do `generation_error_logs` + generowanie odpowiedzi z generycznym komunikatem.
  - Błąd bazy danych → generyczny komunikat.

## 8. Rozważania dotyczące wydajności
- **Timeout dla wywołania AI**: 60 sekund na czas oczekiwania, inaczej błąd timeout.
- **Asynchroniczne przetwarzanie**: Rozważ możliwość przetwarzania asynchronicznego generacji, zwłaszcza w warunkach dużego obciążenia.
- **Monitoring**: Implementuj mechanizmy monitorowania wydajności endpointu i serwisu AI.

## 9. Kroki implementacji
1. Utworzenie pliku endpointu w katalogu `/src/pages/api`, np. `generations.ts`.
2. Implementacja walidacji żądania przy użyciu `zod` (sprawdzenie długości `source_text`).
3. Stworzenie serwisu (`/src/lib/generation.service`), który:
   - Integruje się z zewnętrznym serwisem AI. Na etapie developmentu skorzystamy z mocków zamiast wywoływania serwisu AI.
   - Obsługuje logikę zapisu do tabeli `generations` oraz rejestracji błędów w `generation_error_logs`.
4. Dodanie mechanizmu uwierzytelniania poprzez Supabase Auth.
5. Implementacja logiki endpointu, wykorzystującej utworzony serwis.
6. Dodanie szczegółowego logowania akcji i błędów.