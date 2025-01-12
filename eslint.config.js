import eslintPluginSvelte from "eslint-plugin-svelte";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    files: ["*.svelte"],
    processor: "svelte/svelte",
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      extraFileExtensions: [".svelte"],
    },
    plugins: {
      svelte: eslintPluginSvelte,
    },
    rules: {},
  },
  {
    files: ["*.ts", "*.tsx"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": typescriptEslintPlugin,
    },
    rules: {},
  },
  {
    languageOptions: {
      globals: {
        browser: true,
        es2021: true,
      },
    },
    plugins: {
      svelte: eslintPluginSvelte,
      "@typescript-eslint": typescriptEslintPlugin,
    },
    rules: {
      "no-console": "warn", // Example rule from eslint:recommended
      "no-debugger": "error",
      "@typescript-eslint/no-explicit-any": "off",
      // Add additional general ESLint recommended rules manually
    },
  },
];
