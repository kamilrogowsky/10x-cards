import type { APIRoute } from "astro";
import type { HomepageResponseDto } from "../../types";
import { HomepageService } from "../../lib/homepage.service";

export const prerender = false;

/**
 * GET /api/
 * Homepage endpoint - returns basic application information, features, and call-to-action
 * This is a public endpoint that doesn't require authentication
 * 
 * @returns HomepageResponseDto with app info, features array, and CTA
 */
export const GET: APIRoute = async () => {
  try {
    // Get homepage data from service
    const homepageData: HomepageResponseDto = await HomepageService.getHomepageData();

    return new Response(
      JSON.stringify(homepageData),
      {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600" // Cache for 1 hour since data is static 
        },
      }
    );

  } catch (error) {
    console.error("Error in GET /api/:", error);
    
    // Return fallback data with error logged
    const fallbackData: HomepageResponseDto = {
      app_info: {
        name: "10xCards",
        description: "Aplikacja do automatycznego generowania fiszek przy użyciu sztucznej inteligencji",
        version: "1.0.0"
      },
      features: [],
      cta: {
        title: "Zacznij już dziś",
        description: "Zaloguj się i zacznij generować fiszki w kilka minut",
        login_url: "/login"
      }
    };

    return new Response(
      JSON.stringify(fallbackData),
      {
        status: 200, // Still return 200 as per specification
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}; 