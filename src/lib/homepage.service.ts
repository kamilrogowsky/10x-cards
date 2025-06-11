import type { HomepageResponseDto } from "../types";

/**
 * Homepage Service
 * Provides static data for the homepage endpoint
 */
export class HomepageService {
  /**
   * Get homepage data with app information, features, and call-to-action
   * @returns Promise<HomepageResponseDto> Static homepage data
   */
  static async getHomepageData(): Promise<HomepageResponseDto> {
    try {
      const homepageData: HomepageResponseDto = {
        app_info: {
          name: "10xCards",
          description: "Aplikacja do automatycznego generowania fiszek przy użyciu sztucznej inteligencji",
          version: "1.0.0",
        },
        features: [
          {
            title: "Generowanie fiszek przez AI",
            description: "Generuj wysokiej jakości fiszki z dowolnego tekstu, używając zaawansowanych modeli AI",
          },
          {
            title: "Ręczne tworzenie fiszek",
            description: "Twórz i zarządzaj własnymi, niestandardowymi fiszkami",
          },
          {
            title: "Nauka z powtarzaniem przestankowym",
            description: "Ucz się efektywnie dzięki naukowo potwierdzonemu algorytmowi powtarzania przestankowego",
          },
        ],
        cta: {
          title: "Zacznij już dziś",
          description: "Zaloguj się i zacznij generować fiszki w kilka minut",
          login_url: "/login",
        },
      };

      return homepageData;
    } catch (error) {
      // Log error for monitoring
      console.error("Error in HomepageService.getHomepageData:", error);

      // Return fallback data
      return {
        app_info: {
          name: "10xCards",
          description: "Aplikacja do automatycznego generowania fiszek przy użyciu sztucznej inteligencji",
          version: "1.0.0",
        },
        features: [],
        cta: {
          title: "Zacznij już dziś",
          description: "Zaloguj się i zacznij generować fiszki w kilka minut",
          login_url: "/login",
        },
      };
    }
  }
}
