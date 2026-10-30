import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    // v0.4 ships extensionless ESM imports; let Vite resolve them for Node tests.
    server: { deps: { inline: ["@material/material-color-utilities"] } },
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});
