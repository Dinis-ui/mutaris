import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

/**
 * Shared ESLint flat config for Next.js apps in the MUTARIS monorepo.
 * Combines Next's core-web-vitals + typescript presets (which already
 * register react, react-hooks, jsx-a11y, import and @typescript-eslint)
 * with Prettier conflict-disabling.
 */
const nextConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettierConfig,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];

export default nextConfig;
