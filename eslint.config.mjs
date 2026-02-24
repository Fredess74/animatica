import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "**/dist/",
      "**/build/",
      "**/out/",
      "**/.next/",
      "**/node_modules/",
      "**/.turbo/",
      "**/coverage/",
      "**/*.d.ts",
      "pnpm-lock.yaml"
    ]
  },
  {
      rules: {
          "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
          "@typescript-eslint/no-explicit-any": "warn",
          "no-undef": "off"
      }
  }
];
