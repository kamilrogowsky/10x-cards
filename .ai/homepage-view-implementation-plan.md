# Plan implementacji widoku strony głównej

## 1. Przegląd
Strona główna aplikacji 10xCards to publiczny landing page dostępny zarówno dla użytkowników zalogowanych jak i niezalogowanych. Jej głównym celem jest przedstawienie aplikacji, jej kluczowych funkcjonalności oraz zachęcenie odwiedzających do zalogowania się i rozpoczęcia korzystania z aplikacji. Strona ma charakter informacyjny i marketingowy, prezentując wartość produktu w sposób przystępny i atrakcyjny wizualnie.

## 2. Routing widoku
- **Ścieżka**: `/`
- **Typ**: Astro page z elementami React dla interaktywności
- **Dostępność**: Publiczna (bez wymagań uwierzytelnienia)
- **SEO**: Zoptymalizowana pod kątem wyszukiwarek jako główna strona aplikacji

## 3. Struktura komponentów
```
src/pages/index.astro (główna strona Astro)
├── src/components/Homepage.tsx (główny kontener React)
    ├── HeroSection.tsx (sekcja powitalna)
    ├── FeaturesSection.tsx (sekcja funkcjonalności)
    │   └── FeatureCard.tsx (karta pojedynczej funkcjonalności)
    └── CallToActionSection.tsx (sekcja CTA)
```

## 4. Szczegóły komponentów

### Homepage (główny kontener)
- **Opis komponentu**: Główny komponent React zarządzający stanem strony głównej, pobierający dane z API i przekazujący je do komponentów potomnych
- **Główne elementy**: Container div z sekcjami Hero, Features i CTA, obsługa stanów loading i error
- **Obsługiwane interakcje**: Inicjalizacja pobierania danych, obsługa błędów, przekazywanie callbacks do komponentów potomnych
- **Obsługiwana walidacja**: Walidacja obecności danych z API, sprawdzenie struktury odpowiedzi
- **Typy**: HomepageResponseDto, LoadingState, ErrorState
- **Propsy**: Brak (komponent główny)

### HeroSection
- **Opis komponentu**: Sekcja powitalna wyświetlająca nazwę aplikacji, opis i główne value proposition
- **Główne elementy**: Header z tytułem (h1), paragraf z opisem, opcjonalnie subtitle z wersją aplikacji
- **Obsługiwane interakcje**: Brak bezpośrednich interakcji
- **Obsługiwana walidacja**: Sprawdzenie obecności danych app_info
- **Typy**: AppInfoDto
- **Propsy**: `appInfo: AppInfoDto`, `isLoading?: boolean`

### FeaturesSection
- **Opis komponentu**: Sekcja prezentująca główne funkcjonalności aplikacji w formie kartek
- **Główne elementy**: Nagłówek sekcji (h2), grid/lista komponentów FeatureCard
- **Obsługiwane interakcje**: Brak bezpośrednich interakcji
- **Obsługiwana walidacja**: Sprawdzenie obecności tablicy features i jej długości
- **Typy**: FeatureDto[]
- **Propsy**: `features: FeatureDto[]`, `isLoading?: boolean`

### FeatureCard
- **Opis komponentu**: Karta prezentująca pojedynczą funkcjonalność aplikacji z tytułem i opisem
- **Główne elementy**: Card container, nagłówek funkcjonalności (h3), paragraf z opisem
- **Obsługiwane interakcje**: Hover effects, opcjonalnie click dla przyszłych rozszerzeń
- **Obsługiwana walidacja**: Sprawdzenie obecności title i description
- **Typy**: FeatureDto
- **Propsy**: `feature: FeatureDto`

### CallToActionSection
- **Opis komponentu**: Sekcja zachęcająca do zalogowania z przyciskiem przekierowującym
- **Główne elementy**: Nagłówek CTA (h2), paragraf z opisem, przycisk "Zaloguj się"
- **Obsługiwane interakcje**: Kliknięcie przycisku - przekierowanie do /login
- **Obsługiwana walidacja**: Sprawdzenie obecności danych CTA i poprawności login_url
- **Typy**: CtaDto
- **Propsy**: `cta: CtaDto`, `isLoading?: boolean`

## 5. Typy
Wykorzystywane są istniejące typy z `src/types.ts`:

```typescript
// Główny typ odpowiedzi API
export interface HomepageResponseDto {
  app_info: AppInfoDto;
  features: FeatureDto[];
  cta: CtaDto;
}

// Informacje o aplikacji
export interface AppInfoDto {
  name: string;        // Nazwa aplikacji
  description: string; // Opis aplikacji
  version: string;     // Wersja aplikacji
}

// Pojedyncza funkcjonalność
export interface FeatureDto {
  title: string;       // Tytuł funkcjonalności
  description: string; // Opis funkcjonalności
}

// Call-to-action
export interface CtaDto {
  title: string;       // Tytuł CTA
  description: string; // Opis CTA
  login_url: string;   // URL do logowania
}
```

Dodatkowe typy pomocnicze dla komponentów:
```typescript
// Stan loading dla poszczególnych sekcji
interface LoadingState {
  isLoading: boolean;
}

// Stan błędu
interface ErrorState {
  error: string | null;
}
```

## 6. Zarządzanie stanem
Zarządzanie stanem będzie realizowane przez custom hook `useHomepageData()`:

```typescript
interface UseHomepageDataReturn {
  data: HomepageResponseDto | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

Hook będzie odpowiedzialny za:
- Pobieranie danych z API przy mount komponenta
- Zarządzanie stanami ładowania i błędów
- Cachowanie danych w pamięci
- Udostępnienie funkcji refetch w przypadku potrzeby odświeżenia

Stan lokalny komponentów będzie minimalny - głównie do obsługi loading states dla poszczególnych sekcji podczas renderowania.

## 7. Integracja API
- **Endpoint**: `GET /api/`
- **Typ żądania**: Brak body (GET request)
- **Typ odpowiedzi**: `HomepageResponseDto`
- **Wywołanie**: Przy mount głównego komponentu Homepage
- **Error handling**: Endpoint zawsze zwraca 200 OK z fallback data w przypadku błędów
- **Cachowanie**: API ma ustawione cachowanie na 1 godzinę
- **Implementacja**: Wykorzystanie fetch API z obsługą AbortController dla cleanup

```typescript
const fetchHomepageData = async (): Promise<HomepageResponseDto> => {
  const response = await fetch('/api/');
  if (!response.ok) {
    throw new Error('Failed to fetch homepage data');
  }
  return response.json();
};
```

## 8. Interakcje użytkownika
1. **Ładowanie strony**: Automatyczne pobranie danych i wyświetlenie loading skeleton
2. **Kliknięcie przycisku CTA**: Przekierowanie do `/login` przez `window.location.href` lub Astro navigation
3. **Responsive interactions**: Touch-friendly na urządzeniach mobilnych
4. **Keyboard navigation**: Wsparcie dla nawigacji klawiaturą (focus states)
5. **Hover effects**: Subtle animations na kartach funkcjonalności
6. **Scroll behavior**: Smooth scrolling między sekcjami (opcjonalnie)

## 9. Warunki i walidacja
- **Walidacja danych API**: Sprawdzenie struktury odpowiedzi przed renderowaniem
- **Walidacja URL**: Weryfikacja poprawności login_url w danych CTA
- **Walidacja długości**: Sprawdzenie czy tytuły i opisy nie są puste
- **Fallback content**: Wyświetlenie domyślnej zawartości gdy API zwróci błędne dane
- **Loading states**: Skeleton loading dla każdej sekcji podczas oczekiwania na dane
- **Error boundaries**: React Error Boundary dla obsługi nieoczekiwanych błędów renderowania

## 10. Obsługa błędów
- **API errors**: Graceful degradation z fallback content (endpoint zawsze zwraca 200)
- **Network errors**: Retry mechanism z informacją dla użytkownika
- **Parsing errors**: Fallback na domyślne dane aplikacji
- **Component errors**: Error boundaries z friendly error messages
- **Loading timeouts**: Timeout dla żądań API z odpowiednim komunikatem
- **Accessibility errors**: Zapewnienie alt texts i proper ARIA labels

Strategia obsługi błędów:
1. Try-catch w custom hook
2. Error boundary na poziomie Homepage component
3. Fallback UI dla każdej sekcji osobno
4. Console logging dla debugging
5. Graceful degradation - strona zawsze się wyświetli

## 11. Kroki implementacji

1. **Przygotowanie struktury plików**
   - Utworzenie `src/pages/index.astro` jako głównej strony
   - Utworzenie folderu `src/components/homepage/` dla komponentów

2. **Implementacja custom hook**
   - Utworzenie `src/lib/hooks/useHomepageData.ts`
   - Implementacja logiki pobierania danych i zarządzania stanem
   - Dodanie error handling i retry logic

3. **Implementacja komponentów atomowych**
   - `FeatureCard.tsx` - najprostszy komponent do testowania
   - `HeroSection.tsx` - implementacja sekcji powitalnej
   - `CallToActionSection.tsx` - sekcja z przyciskiem CTA

4. **Implementacja komponentów molekularnych**
   - `FeaturesSection.tsx` - kontener dla FeatureCard
   - Integracja z danymi z API

5. **Implementacja głównego komponentu**
   - `Homepage.tsx` - główny kontener React
   - Integracja z custom hook
   - Obsługa loading i error states

6. **Implementacja strony Astro**
   - `src/pages/index.astro` - główna strona
   - Integracja z komponentem Homepage
   - Konfiguracja SEO (title, meta tags)

7. **Stylowanie i responsywność**
   - Implementacja stylów Tailwind dla każdego komponentu
   - Testowanie responsywności na różnych urządzeniach
   - Dodanie hover effects i transitions
