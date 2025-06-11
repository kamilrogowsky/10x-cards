import { defineConfig } from "vitest/config";
import { getViteConfig } from "astro/config";

export default defineConfig(
  getViteConfig({
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        exclude: ["node_modules/", "src/test/", "**/*.d.ts", "**/*.config.*", "dist/", ".astro/", "public/"],
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
          },
        },
      },
      include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
      exclude: ["node_modules/", "dist/", ".astro/", "public/"],
    },
  })
);
