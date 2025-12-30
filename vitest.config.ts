import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    css: true,
    exclude: ["**/node_modules/**", "**/dist/**", "tests/e2e/**"],
    testTimeout: 30000,
    hookTimeout: 30000,
    threads: true,
    maxThreads: 2,
    minThreads: 1,
    isolate: true,
    teardownTimeout: 10000,
  },
});
