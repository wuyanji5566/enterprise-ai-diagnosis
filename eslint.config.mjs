import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "node:url";
import path from "node:path";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const compat = new FlatCompat({ baseDirectory: currentDirectory });

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "outputs/**",
      "components/DiagnosisForm.tsx.bak",
      "components/DiagnosisForm_test_jsx.txt",
      "components/DiagnosisTest.tsx",
      "next-env.d.ts"
    ]
  }
];

export default config;
