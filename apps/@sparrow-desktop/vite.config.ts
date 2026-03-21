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
  plugins: [svelte()],
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

          const workspacesFeatureMatch = id.match(
            /\/packages\/@sparrow-workspaces\/src\/features\/([^/]+)/,
          );
          if (workspacesFeatureMatch?.[1]) {
            return `feature-workspaces-${normalizeChunkName(
              workspacesFeatureMatch[1],
            )}`;
          }

          const librarySectionMatch = id.match(
            /\/packages\/@sparrow-library\/src\/(?:features|components|ui|forms)\/([^/]+)/,
          );
          if (librarySectionMatch?.[1]) {
            return `feature-library-${normalizeChunkName(
              librarySectionMatch[1],
            )}`;
          }

          const desktopPageMatch = id.match(
            /\/apps\/@sparrow-desktop\/src\/pages\/([^/]+)/,
          );

          const desktopWorkspaceSubPageMatch = id.match(
            /\/apps\/@sparrow-desktop\/src\/pages\/workspace-page\/sub-pages\/([^/]+)/,
          );
          if (desktopWorkspaceSubPageMatch?.[1]) {
            return `desktop-workspace-subpage-${normalizeChunkName(
              desktopWorkspaceSubPageMatch[1],
            )}`;
          }

          if (
            id.includes(
              "/apps/@sparrow-desktop/src/pages/workspace-page/CollectionPage.ViewModel.ts",
            )
          ) {
            return "desktop-workspace-collection-viewmodel";
          }

          if (
            id.includes(
              "/apps/@sparrow-desktop/src/pages/workspace-page/EnvironmentPage.ViewModel.ts",
            )
          ) {
            return "desktop-workspace-environment-viewmodel";
          }

          if (
            id.includes(
              "/apps/@sparrow-desktop/src/pages/workspace-page/CollectionsPage.svelte",
            )
          ) {
            return "desktop-workspace-collections-page";
          }

          if (desktopPageMatch?.[1]) {
            return `desktop-page-${normalizeChunkName(desktopPageMatch[1])}`;
          }

          if (id.includes("/apps/@sparrow-desktop/src/database/")) {
            return "desktop-database";
          }
          if (id.includes("/apps/@sparrow-desktop/src/repositories/")) {
            return "desktop-repositories";
          }
          if (id.includes("/apps/@sparrow-desktop/src/store/")) {
            return "desktop-store";
          }

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
    esbuildOptions: {
      target: "esnext",
    },
  },
}));
