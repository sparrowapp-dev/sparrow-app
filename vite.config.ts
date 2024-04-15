import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [svelte()],
  resolve: {
    alias: {
      $lib: path.resolve("./src/lib"),

      "@sparrow/icons": path.resolve("./src/lib/assets/icons"),
      "@sparrow/ui": path.resolve("./src/lib/components"),
      "@sparrow/forms": path.resolve("./src/lib/components"),
      "@sparrow/typography": path.resolve("./src/lib/components"),

      "@common": path.resolve("./src/features/@common"),
      "@rest-explorer": path.resolve("./src/features/rest-explorer"),
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
