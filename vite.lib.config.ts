import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    lib: {
      entry: { index: "src/kit/index.ts", icons: "src/kit/material-icons.ts" },
      formats: ["es"],
      fileName: (_format, entry) => `${entry}.js`,
      cssFileName: "styles",
    },
    rollupOptions: {
      external: (id) =>
        !id.startsWith(".") && !id.startsWith("/") && !id.includes(":"),
    },
  },
});
