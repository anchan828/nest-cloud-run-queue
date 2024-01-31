module.exports = {
  "*.{ts}": ["eslint --fix", "prettier --write"],
  "*.{js,json,yml,yaml,md}": ["prettier --write"],
};
