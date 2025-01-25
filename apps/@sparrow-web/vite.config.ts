import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";
import eslintPlugin from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    svelte(),
    eslintPlugin({
      fix: false, // Auto-fix linting errors
      emitError: true, // Emit errors on the console (terminal)
    }),
  ],
  resolve: {
    alias: {
      src: path.resolve("./src/"),
      "@app": path.resolve("./src/"),
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1422,
    strictPort: true,
  },
  build: { target: "esnext" },
  // 3. to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_"],
}));
