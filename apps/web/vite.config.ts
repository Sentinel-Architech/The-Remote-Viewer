import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@trv/shared": path.resolve(__dirname, "../shared/src"),
    },
  },
  server: {
    port: 5173,
  },
});
