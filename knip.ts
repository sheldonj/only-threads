import { type KnipConfig } from 'knip';

const config: KnipConfig = {
  // Next.js plugin is enabled by default when Next.js is detected
  // It auto-detects pages, API routes, middleware, and app directory

  // Entry points beyond what Next.js plugin detects
  entry: [
    'app/**/layout.tsx',
    'app/**/page.tsx',
    'tailwind-plugin.mts',
    'postcss.config.mjs',
    'next.config.ts',
    'proxy.ts',
    'lib/auth/server.ts',
    'lib/database/client.ts',
    'lib/zenstack/generated/**/*.ts',
    'components/ui/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}', // UI component library hooks
  ],

  // Ignore patterns
  ignore: [
    'node_modules/**',
    '.next/**',
    'out/**',
    'public/**',
    '**/*.d.ts',
    'next-env.d.ts',
    'global.d.ts',
    'tsconfig.tsbuildinfo',
    // Generated files from zenstack
    'lib/zenstack/generated/**',
    'lib/zenstack/schema/*.ts',
    'data/**',
  ],

  // Ignore dependencies that might be used but not directly imported
  ignoreDependencies: [
    // CLI tools used via scripts or manually
    '@better-auth/cli',
    'dotenv-cli',

    // ESLint configs extend other configs, not directly imported
    'eslint-config-next',
    'prettier',

    // Build tools and plugins
    'tailwindcss-animate', // Used in globals.css via @plugin directive

    // These are optional peer dependencies or used conditionally
    '@libsql/client',
    '@libsql/kysely-libsql',
    'mysql2',
    'dotenv',

    // Used for server-side only imports (convention-based)
    'server-only',

    // UI component dependencies that may be used in generated/shadcn components
    '@radix-ui/react-toast',
    'react-qr-code',
    'consola',
  ],

  // Ignore specific exports that are used by frameworks/tooling
  ignoreExportsUsedInFile: true,

  // Project files to include
  project: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    '!lib/zenstack/generated/**',
  ],
};

export default config;
