# Specyfikacja modułu logowania (Authentication) – 10x-cards

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Layouty
- PublicLayout (`src/layouts/PublicLayout.astro`)
  - Strony dostępne bez logowania: `/` (strona główna), `/login`.
  - Nagłówek z logo i przyciskiem/linkiem do logowania.
- AuthLayout (`src/layouts/AuthLayout.astro`)
  - Strony chronione: `/library`, `/generate`.
  - Serwerowe ładowanie sesji użytkownika przy pomocy Supabase Auth Helpers.
  - Pasek nawigacji z linkami: "Moje fiszki", "Generowanie fiszek" i przycisk "Wyloguj się".

### 1.2 Strony
- `/login` (`src/pages/login.astro`)
  - Renderuje komponent React `LoginForm`.
  - Formularz z polami:
    - `email` (wymagany, walidacja formatu)
    - `password` (wymagane, min. 6 znaków)
  - Walidacja po stronie klienta:
    - Błędy pod każdym polem.
    - Globalny komunikat dla niepoprawnych danych.
  - Akcja: wysyła POST do `/api/auth/login`.
  - Obsługa odpowiedzi: sukces → redirect do `/`, błąd → display error.

- `/` (strona główna, `src/pages/index.astro`)
  - Publiczna, informuje o funkcjonalnościach.
  - CTA: link do logowania.

### 1.3 Komponenty React
- `src/components/LoginForm.tsx`
  - Pola formularza, walidacja lokalna (useState/useEffect).
  - Fetch POST `/api/auth/login`.
  - Po sukcesie: `useNavigate` do `/`.
  - Błędy wyświetlane inline i globalnie.
- `src/components/Navbar.tsx`
  - W AuthLayout: renderuje linki do chronionych widoków i przycisk "Wyloguj się".
  - Odbiera `userEmail` z props lub kontekstu.

## 2. LOGIKA BACKENDOWA

### 2.1 Endpoints API (`src/pages/api/auth`)
- POST `/login` (`login.ts`)
  - Parsuje `email` i `password` z JSON.
  - Walidacja Zod.
  - `supabaseServerClient.auth.signInWithPassword`.
  - Sukces: status 200, ustawia cookie sesji.
  - Błąd: status 401, message.

- POST `/logout` (`logout.ts`)
  - `supabaseServerClient.auth.signOut`.
  - Czyści cookie.
  - Zwraca 200.

### 2.2 Modele danych
- `LoginDTO` w `src/types.ts`
  ```ts
  export interface LoginDTO {
    email: string;
    password: string;
  }
  ```
- Typ `User` (Supabase) w `src/types.ts`.

### 2.3 Walidacja i obsługa wyjątków
- Zod dla wszystkich endpointów.
- Early return przy błędnych danych.
- HTTP status codes:
  - 400 – błędne dane wejściowe
  - 401 – nieautoryzowany
  - 500 – błąd serwera
- Logging (console.error, Sentry opcjonalnie).

### 2.4 Konfiguracja Astro
- `astro.config.mjs`
  - Dodanie integracji `@supabase/auth-helpers-astro`.
  - Ustawienie zmiennych środowiskowych: `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
- `src/lib/supabaseClient.ts`
  - Eksport klienta serwerowego i przeglądarkowego.

## 3. SYSTEM AUTENTYKACJI

### 3.1 Supabase Auth Helpers i przekazywanie user props
- Zamiast dedykowanego endpointu `/me`, w punktach wejścia aplikacji (np. `src/pages/index.astro`, `src/pages/flashcards.astro`, `src/pages/generate.astro`) używamy `createServerSupabaseClient` w load funkcji lub serwerowym bloku, aby pobrać aktualną sesję i obiekt `user`.
- W `index.astro` przekazujemy `user` jako props do głównego komponentu React:
  ```astro
  ---
  import { homepage } from '../components/Homepage';
  import { createServerSupabaseClient } from '@supabase/auth-helpers-astro';

  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  ---

  <Layout>
    <Homepage client:load user={user} />
  </Layout>
  ```
- Na stronie `flashcards.astro` i `generate.astro` analogicznie przekazujemy `user` do komponentów React, co pozwala na inicjalizację auth store po stronie klienta.
- Auth store (np. Zustand lub React Context) inicjalizuje się na podstawie przekazanego `user`:
  - początkowy stan z `user` lub `null`
  - metody do aktualizacji sesji (logout, refresh)

### 3.2 Obsługa sesji
- Cookies HTTP Only, Secure, SameSite=Lax.
- Czas życia: domyślnie 7 dni.

### 3.3 Wylogowanie
- Wylogowanie: POST `/api/auth/logout`.

---

*Specyfikacja uwzględnia istniejącą architekturę Astro + React + Supabase oraz wymagania z PRD (US-001).* 