import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

const normalizeChunkName = (value: string) =>
  value
    .replace(/^@/, "")
    .replace(/[\/]/g, "-")
    .replace(/[^a-zA-Z0-9_-]/g, "-");

const getNodeModulePackageName = (id: string) => {
  const cleanId = id.split("?")[0];
  const nodeModulesMarker = "node_modules/";
  let packagePath = cleanId.slice(
    cleanId.lastIndexOf(nodeModulesMarker) + nodeModulesMarker.length,
  );

  if (packagePath.startsWith(".pnpm/")) {
    const nestedNodeModules = packagePath.indexOf("/node_modules/");
    if (nestedNodeModules >= 0) {
      packagePath = packagePath.slice(
        nestedNodeModules + "/node_modules/".length,
      );
    }
  }

  const segments = packagePath.split("/");
  if (!segments[0]) return null;
  if (segments[0].startsWith("@") && segments[1]) {
    return `${segments[0]}/${segments[1]}`;
  }
  return segments[0];
};

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    svelte(),
    // svelte-motion calls window.getComputedStyle() after a component unmounts,
    // passing a detached (non-Element) node. This only crashes in production builds
    // because of chunk-initialization order differences versus the dev server.
    // Guard the wrapper so it returns a no-op style object instead of throwing.
    {
      name: "patch-svelte-motion-getcomputedstyle",
      transform(code: string, id: string) {
        if (
          id.includes("node_modules/svelte-motion") &&
          id.endsWith("visual-element.js")
        ) {
          return code.replace(
            "function getComputedStyle(element) {\n    return window.getComputedStyle(element);\n}",
            "function getComputedStyle(element) {\n    if (!element || !(element instanceof Element)) return { getPropertyValue: function() { return ''; } };\n    return window.getComputedStyle(element);\n}",
          );
        }
      },
    },
    // @tauri-apps/plugin-updater: invoke('plugin:updater|check') resolves to null
    // when no update is available. Production builds may access .available on the
    // result before the null check, causing a TypeError. Harden the check function.
    {
      name: "patch-tauri-updater-null-check",
      transform(code: string, id: string) {
        if (id.includes("node_modules/@tauri-apps/plugin-updater")) {
          return code.replace(
            "return metadata ? new Update(metadata) : null;",
            "return (metadata != null && typeof metadata === 'object') ? new Update(metadata) : null;",
          );
        }
      },
    },
    // svelte-navigator: document.querySelector('[data-svnav-route-start=...]') can
    // return null when the route marker hasn't been mounted yet (production build
    // timing differs from dev). Guard queryHeading against a null marker.
    {
      name: "patch-svelte-navigator-query-heading",
      transform(code: string, id: string) {
        if (id.includes("node_modules/svelte-navigator")) {
          return code.replace(
            'const marker = query(`[data-svnav-route-start="${id}"]`);\n\tlet current = marker.nextElementSibling;',
            'const marker = query(`[data-svnav-route-start="${id}"]`);\n\tif (!marker) return null;\n\tlet current = marker.nextElementSibling;',
          );
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@app": path.resolve("./src/"),
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
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("monaco-editor")) return "vendor-monaco";
            if (id.includes("rxdb") || id.includes("rxjs"))
              return "vendor-data";
            if (
              id.includes("@editorjs") ||
              id.includes("editorjs-parser") ||
              id.includes("jsoneditor") ||
              id.includes("svelte-jsoneditor")
            ) {
              return "vendor-rich-editor";
            }
            if (id.includes("graphql")) return "vendor-graphql";
            if (
              id.includes("socket.io-client") ||
              id.includes("engine.io-client")
            ) {
              return "vendor-realtime";
            }
            if (id.includes("@tauri-apps")) return "vendor-tauri";
            if (id.includes("svelte")) return "vendor-svelte";

            const packageName = getNodeModulePackageName(id);
            if (packageName) {
              return `vendor-${normalizeChunkName(packageName)}`;
            }

            return "vendor-misc";
          }

          // Keep each workspace package as a single chunk to avoid circular
          // chunk dependencies caused by cross-feature imports within the package.
          if (id.includes("/packages/@sparrow-workspaces/")) {
            return "feature-workspaces";
          }
          if (id.includes("/packages/@sparrow-library/"))
            return "feature-library";
          if (id.includes("/packages/@sparrow-common/"))
            return "feature-common";
          if (id.includes("/packages/@sparrow-support/"))
            return "feature-support";
          if (id.includes("/packages/@sparrow-teams/")) return "feature-teams";
          if (id.includes("/packages/@sparrow-marketplace/")) {
            return "feature-marketplace";
          }
        },
      },
    },
  },
  // 3. to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_"],

  // Need this to make top level await work for curl converter
  optimizeDeps: {
    exclude: [
      "@tauri-apps/api",
      "@tauri-apps/plugin-deep-link",
      "@tauri-apps/plugin-dialog",
      "@tauri-apps/plugin-fs",
      "@tauri-apps/plugin-os",
      "@tauri-apps/plugin-process",
      "@tauri-apps/plugin-shell",
      "@tauri-apps/plugin-updater",
    ],
    esbuildOptions: {
      target: "esnext",
    },
  },
}));
