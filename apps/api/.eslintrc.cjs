/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@telemed/eslint-config/nextjs"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
};
