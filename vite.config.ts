import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  // Prepare all calendar entry points before a lazy Forms & Dates page opens.
  optimizeDeps: {
    include: ["react-day-picker", "react-day-picker/persian", "react-day-picker/locale"],
  },
  build: { outDir: "showcase-dist" },
});
