// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: "expo",
  ignorePatterns: ["/dist/*"],
  rules: {
    // Expo preset does not resolve `paths` from tsconfig; `pnpm typecheck` covers imports.
    "import/no-unresolved": "off",
  },
};
