import { useState, useEffect, useCallback } from "react";
import type { HomepageResponseDto } from "@/types";

interface UseHomepageDataReturn {
  data: HomepageResponseDto | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useHomepageData = (): UseHomepageDataReturn => {
  const [data, setData] = useState<HomepageResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomepageData = useCallback(async (): Promise<HomepageResponseDto> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch("/api/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Validate response structure
      if (!result.app_info || !Array.isArray(result.features) || !result.cta) {
        throw new Error("Invalid response structure from API");
      }

      return result as HomepageResponseDto;
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error) {
        if (fetchError.name === "AbortError") {
          throw new Error("Request timeout - please try again");
        }
        throw fetchError;
      }
      throw new Error("Unknown error occurred while fetching data");
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await fetchHomepageData();
      setData(result);
    } catch (loadError) {
      console.error("Error loading homepage data:", loadError);

      const errorMessage = loadError instanceof Error ? loadError.message : "Failed to load homepage data";

      setError(errorMessage);

      // Set fallback data on error
      setData({
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
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchHomepageData]);

  const refetch = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};
