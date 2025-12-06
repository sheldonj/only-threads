import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import canonical from "eslint-plugin-canonical";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      canonical,
    },
    rules: {
      "canonical/prefer-inline-type-import": "error",
      "canonical/sort-react-dependencies": "error",
      "indent": ["error", 2, { "SwitchCase": 1 }],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
