const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const { includeIgnoreFile } = require("@eslint/compat");
const { resolve } = require("path");

module.exports = [
  includeIgnoreFile(resolve(__dirname, ".gitignore")),
  ...tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended, {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "no-useless-constructor": "off",
      "@typescript-eslint/no-useless-constructor": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "lines-between-class-members": ["error", "always"],
    },
    ignores: ["**/.prettierrc.js", "**/cli.js", "**/jest.config.js"],
  }),
];
