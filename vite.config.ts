/**
 * Vite build configuration.
 * Plugins: React (fast refresh + JSX), Tailwind CSS v4.
 * Path alias: @ -> ./src for clean imports.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
