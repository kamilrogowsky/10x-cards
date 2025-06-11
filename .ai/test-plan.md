# Plan Testów dla projektu 10x-cards

## 1. Wprowadzenie i cele testowania
Celem testowania jest zapewnienie wysokiej jakości, niezawodności i bezpieczeństwa aplikacji 10x-cards poprzez wykrycie i poprawę błędów na różnych poziomach (jednostkowym, integracyjnym, e2e, wydajnościowym).

## 2. Zakres testów
- Backend (API Supabase, middleware, integracja z LLM)
- Frontend (Astro pages, React/Shadcn/ui komponenty)
- Workflow użytkownika: rejestracja/logowanie, generowanie fiszek, akceptacja/edycja/usuwanie, sesja nauki
- Integracja z zewnętrznymi usługami: Openrouter.ai (LLM)
- Bezpieczeństwo: autoryzacja, ochrona danych, RLS w Supabase
- Wydajność przy dużych payloadach (tekst >1000 znaków)

## 3. Typy testów
### 3.1 Testy jednostkowe
- Vitest + React Testing Library dla komponentów UI React
- @astro/test-utils dla komponentów Astro
- Testy funkcji pomocniczych w `src/lib` i walidacji inputów
- MSW do mockowania API calls

### 3.2 Testy integracyjne
- Vitest + MSW + Supertest dla endpointów Astro API w `src/pages/api`
- Testy warstwy autoryzacji middleware (`src/middleware/index.ts`)
- @astro/test-utils dla testowania SSR i Astro middleware
- Testy integracji z Supabase (test database)

### 3.3 Testy end-to-end (E2E)
- Playwright z TypeScript symulujące pełne scenariusze użytkownika
- Testy cross-browser (Chrome, Firefox, Safari)
- Testy mobile viewport

### 3.4 Testy wydajnościowe
- k6 do load testingu endpointów generowania fiszek
- Lighthouse CLI audits dla kluczowych stron Astro
- WebPageTest API do testów z różnych lokalizacji geograficznych
- Bundle analysis z Bundlemon

### 3.5 Testy bezpieczeństwa
- Semgrep SAST scans dla zaawansowanej analizy bezpieczeństwa
- ESLint security plugins
- Weryfikacja RLS w Supabase
- Testy penetracyjne na uwierzytelnianie i dostęp do zasobów

### 3.6 Testy dostępności (a11y)
- @axe-core/playwright w testach E2E do sprawdzenia WCAG
- Automatyczne testy dostępności w pipeline CI/CD

### 3.7 Testy wizualne (Visual Regression)
- Playwright + Percy lub Chromatic do wykrywania zmian UI
- Screenshot testing kluczowych widoków aplikacji

## 4. Scenariusze testowe kluczowych funkcjonalności
1. Autoryzacja użytkownika:
   - Logowanie z poprawnymi/niepoprawnymi danymi
   - Przekierowanie i ukrycie widoków chronionych
2. Generowanie fiszek:
   - Wysłanie tekstu <1000, >10 000 i w zakresie 1 000–10 000 znaków
   - Obsługa błędu API (timeout, brak odpowiedzi)
3. Przegląd i zatwierdzanie wygenerowanych fiszek:
   - Zatwierdzanie, edycja i odrzucenie jednostkowej fiszki
   - Zapis do bazy danych po kliknięciu "Zapisz"
4. CRUD fiszek ręcznych i AI:
   - Tworzenie, edycja i usuwanie w widoku "Moje fiszki"
   - Potwierdzenie usunięcia
5. Sesja nauki:
   - Przebieg sesji spaced repetition
   - Ocena fiszki i przejście do kolejnej
6. Bezpieczeństwo dostępu:
   - Próba dostępu do cudzych fiszek (błąd 403)

## 5. Środowisko testowe
- **Lokalne:** Supabase emulator, mock Openrouter.ai (MSW), Vitest watch mode
- **Staging:** prawdziwy Supabase, klucz testowy LLM, pełna integracja
- **Przeglądarki:** Chrome, Firefox, Safari, Edge + mobile viewports
- **CI/CD:** GitHub Actions z cache optimization, parallel test execution
- **Test Database:** dedykowana instancja Supabase dla testów integracyjnych

## 6. Narzędzia do testowania
- **Jednostkowe:** Vitest, React Testing Library, @astro/test-utils, MSW
- **Integracyjne/API:** Vitest + MSW + Supertest dla Astro API
- **E2E:** Playwright z TypeScript
- **Wydajność:** k6, Lighthouse CLI, WebPageTest API, Bundlemon
- **Bezpieczeństwo:** Semgrep, ESLint security plugins, @axe-core/playwright
- **Visual Regression:** Playwright + Percy/Chromatic
- **CI:** GitHub Actions z cache optimization i parallel execution

## 7. Harmonogram testów
| Faza               | Zadanie                                    | Czas        |
|--------------------|--------------------------------------------|-------------|
| Tydzień 1          | Setup Vitest + testy jednostkowe          | 3 dni       |
| Tydzień 2          | Testy integracyjne + @astro/test-utils    | 2 dni       |
| Tydzień 3          | E2E (Playwright) + testy wizualne         | 4 dni       |
| Tydzień 4          | k6, Lighthouse, Semgrep, bundle analysis  | 3 dni       |
| Tydzień 5          | Optymalizacja CI/CD i retesty             | 2 dni       |

## 8. Kryteria akceptacji testów
- Pokrycie testami jednostkowymi ≥ 80% linii krytycznych (Vitest coverage)
- Wszystkie scenariusze E2E (Playwright) bez błędów krytycznych
- Testy bezpieczeństwa (Semgrep) bez high/critical findings
- Visual regression tests bez nieakceptowanych różnic
- Bundle size w określonych limitach (Bundlemon)
- Lighthouse scores: Performance ≥90, Accessibility ≥95
- Brak otwartych blockerów lub krytycznych defektów

## 9. Role i odpowiedzialności
- QA Engineer: projektowanie i automatyzacja testów integracyjnych i E2E
- Developerzy: pisanie testów jednostkowych, fixy na podstawie raportów
- DevOps: konfiguracja pipeline CI/CD i środowisk testowych
- Product Owner: weryfikacja kryteriów akceptacji

## 10. Procedury raportowania błędów
1. Zgłaszanie w GitHub Issues z etykietami: `bug`, `severity/Px`.
2. Wypełnienie template'a: opis, kroki odtworzenia, oczekiwany rezultat, środowisko.
3. Priorytetyzacja i przydzielenie do zespołu.
4. Retesty po poprawkach i zamknięcie issue. 