Frontend - Astro z React dla komponentów interaktywnych:
- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI

Backend - Supabase jako kompleksowe rozwiązanie backendowe:
- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

AI - Komunikacja z modelami przez usługę Openrouter.ai:
- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

Testing - Stack testowy zapewniający wysoką jakość kodu:
- Vitest jako szybki framework do testów jednostkowych JavaScript/TypeScript
- React Testing Library do testowania komponentów React z naciskiem na user experience
- @astro/test-utils do testowania komponentów Astro i funkcjonalności SSR
- MSW (Mock Service Worker) do mockowania API calls w testach jednostkowych i integracyjnych
- Lighthouse CLI do automatycznych audytów wydajności stron Astro
- Semgrep do statycznej analizy bezpieczeństwa kodu (SAST)
- ESLint security plugins do wykrywania problemów bezpieczeństwa w kodzie

CI/CD i Hosting:
- Github Actions do tworzenia pipeline'ów CI/CD
- DigitalOcean do hostowania aplikacji za pośrednictwem obrazu docker