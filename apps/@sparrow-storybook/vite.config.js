import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import eslintPlugin from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    eslintPlugin({
      fix: false, // Auto-fix linting errors
      emitError: true, // Emit errors on the console (terminal)
    }),
  ],
});
