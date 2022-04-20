// eslint-disable-next-line @typescript-eslint/no-var-requires
const prettierRc = require("./.prettierrc");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
module.exports = {
  env: {
    jest: true,
    node: true,
  },
  extends: ["plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: path.resolve(__dirname, "tsconfig.eslint.json"),
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "sort-keys-fix"],
  rules: {
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-useless-constructor": "error",
    "lines-between-class-members": ["error", "always"],
    "no-unused-vars": "off",
    "no-useless-constructor": "off",
    "prettier/prettier": ["error", prettierRc],
    "sort-keys-fix/sort-keys-fix": "error",
  },
};
