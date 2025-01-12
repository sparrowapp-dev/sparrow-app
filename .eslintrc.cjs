module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  parser: "svelte-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    extraFileExtensions: [".svelte"],
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["svelte", "@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
  },
};
