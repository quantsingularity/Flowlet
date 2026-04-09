import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: [
      "**/__tests__/**/*.{ts,tsx}",
      "**/*.test.{ts,tsx}",
      "components/wallet/Dashboard.test.tsx",
    ],
    exclude: [
      "node_modules/**",
      "dist/**",
      // Exclude compiled JS duplicates - use TS files only
      "**/__tests__/**/*.test.js",
      "**/*.test.js",
      // Exclude old jest config based files
      "jest.config.cjs",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "**/*.d.ts",
        "**/__mocks__/**",
        "**/types/**",
        "**/*.config.*",
        "test/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
