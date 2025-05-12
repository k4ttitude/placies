import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: { globals: globals.node },
    plugins: { js },
    extends: ["js/recommended"],
  },

  tseslint.configs.recommended,

  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
]);
