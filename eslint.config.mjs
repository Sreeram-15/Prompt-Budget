import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname
});

const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", ".test-dist/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript")
];

export default eslintConfig;
