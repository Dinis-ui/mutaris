import baseConfig from "./packages/config/prettier/index.mjs";

/** @type {import("prettier").Config} */
export default {
  ...baseConfig,
  tailwindStylesheet: "./apps/web/src/app/globals.css",
};
