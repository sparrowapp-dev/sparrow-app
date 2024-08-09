import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [svelte()],
  resolve: {
    alias: {
      $lib: path.resolve("./src/packages/@deprecate"),
      "@library": path.resolve("./src/packages/@library"),
      "@app": path.resolve("./src/packages/@app"),
      "@common": path.resolve("./src/packages/@common"),
      "@teams": path.resolve("./src/packages/@teams"),
      "@workspaces": path.resolve("./src/packages/@workspaces"),
      "@support": path.resolve("./src/packages/@support"),
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },
  build: { target: "esnext" },
  // 3. to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_"],
}));
