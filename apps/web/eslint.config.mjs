import nextConfig from "../../packages/config/eslint/next.mjs";

export default [
  {
    ignores: [".next/**", "next-env.d.ts"],
  },
  ...nextConfig,
];
