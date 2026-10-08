/** @type {import("prettier").Config} */
const baseConfig = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 90,
  plugins: ["prettier-plugin-tailwindcss"],
};

export default baseConfig;
