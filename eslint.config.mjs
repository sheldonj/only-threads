/* eslint-disable canonical/id-match */
// eslint-disable-next-line import/extensions
import canonicalAuto from 'eslint-config-canonical/configurations/auto.js';
import { defineConfig, globalIgnores } from 'eslint/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eslintConfig = defineConfig([
  ...canonicalAuto,
  {
    rules: {
      // Custom global rules
      'canonical/filename-match-exported': 0,
      'canonical/filename-match-regex': 'off',
      'eslint-comments/no-unlimited-disable': 'off',
      'func-style': 0,
      indent: ['error', 2, { SwitchCase: 1 }],
      'react-hooks/rules-of-hooks': 'off',
      // 'import/no-unassigned-import': 0,
      'react/forbid-component-props': 0,
      'react/function-component-definition': 0,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: path.resolve(__dirname, './tsconfig.json'),
        },
      },
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'zenstack/**/*.ts',
    'zenstack/**/*.js',
    'zenstack/**/*.db',
    'pnpm-lock.yaml',
    '!.github',
    '!.vscode',
    '**/next-env.d.ts',
    '**/.vercel/**/*',
    '**/.next/**/*',
  ]),
]);

export default eslintConfig;
