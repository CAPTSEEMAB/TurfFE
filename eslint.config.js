import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "warn",
      
      // Security rules
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      "no-with": "error",
      
      // Best practices
      "eqeqeq": ["warn", "always", { null: "ignore" }],
      "no-var": "error",
      "prefer-const": "warn",
      "prefer-arrow-callback": "warn",
      "no-else-return": "warn",
      "no-empty-function": "warn",
      "no-floating-decimal": "warn",
      "no-implicit-coercion": "warn",
      "no-multi-spaces": "warn",
      "no-throw-literal": "warn",
      "prefer-template": "warn",
      
      // Error prevention
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-unreachable": "error",
      "no-unsafe-finally": "error",
      "valid-typeof": "error",
      "no-constant-condition": "warn",
      "no-unused-labels": "error",
      "no-fallthrough": "error",
      
      // Code quality
      "complexity": ["warn", 10],
      "max-depth": ["warn", 4],
      "max-nested-callbacks": ["warn", 3],
      "max-params": ["warn", 4],
      "no-shadow": "warn",
      "no-shadow-restricted-names": "error",
      "no-undef": "error",
      
      // TypeScript specific
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-inferrable-types": "warn",
    },
  },
);
