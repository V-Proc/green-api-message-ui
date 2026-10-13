import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import boundaries from 'eslint-plugin-boundaries';

export default [
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat['jsx-runtime'],

  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
    settings: {
      react: {
        version: 'detect',
      },
      // Boundaries classify dependencies by their RESOLVED file path, so the
      // "@" alias must be resolvable (tsconfig paths "@/*" -> "./src/*").
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
      'boundaries/elements': [
        // Order matters: first match wins.
        // Documented FSD exception (AGENTS.md, "Redux Typed Hooks Exception"):
        // only this element of the `app` layer may be imported from lower layers,
        // and only via its entry files (index.ts = store/types, ReduxHooks.ts = hooks).
        { type: 'app-store', pattern: 'src/app/store' },
        { type: 'app', pattern: 'src/app' },
        { type: 'view', pattern: 'src/views/*' },
        { type: 'widget', pattern: 'src/widgets/*' },
        { type: 'feature', pattern: 'src/features/*' },
        { type: 'entity', pattern: 'src/entities/*' },
        // FSD: `shared` has no slices, its segments (ui, lib, api, config) are the units.
        { type: 'shared', pattern: 'src/shared/*' },
      ],
      // Tests may import internals of their own slice and setup actions of other
      // slices, so they are exempt from boundary checks (FSD allows this for tests).
      'boundaries/ignore': ['src/**/__test__/**'],
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      'react-hooks': reactHooks,
      boundaries,
    },
    rules: {
      // --- Code style (matches the actual conventions of this codebase) ---
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'comma-dangle': ['error', 'always-multiline'],
      'eol-last': ['error', 'always'],
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
      'no-console': ['error', { allow: ['error'] }],
      'prefer-const': 'error',
      'eqeqeq': ['error', 'smart'],

      // --- TypeScript ---
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-empty-function': 'off',

      // --- React ---
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // --- Import order (FSD: shared -> entities -> features -> widgets -> views -> app) ---
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Side effect imports (e.g. global styles)
            ['^\\u0000'],
            // Library imports
            ['^react$', '^react-dom$', '^react-redux$', '^@reduxjs/toolkit$', '^redux$', '^@?\\w'],
            // FSD layer imports
            ['^@/shared/'],
            ['^@/entities/'],
            ['^@/features/'],
            ['^@/widgets/'],
            ['^@/views/'],
            ['^@/app/'],
            // Parent then local imports
            ['^\\.\\./'],
            ['^\\./'],
            // Type imports
            ['^@?\\w.*\\u0000$', '^[^.].*\\u0000$'],
            ['^\\..*\\u0000$'],
            // Style imports
            ['^.+\\.scss$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',

      // --- FSD boundaries (see AGENTS.md) ---
      // Canonical rule of eslint-plugin-boundaries (v6+). The legacy rules
      // `element-types` / `entry-point` are deprecated.
      // Layer matrix: a slice may only import from slices strictly below,
      // with two documented exceptions:
      //   1. `app-store` (Redux typed hooks/types) — allowed for every layer.
      //   2. entity -> entity — allowed only via the @x cross-public API.
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            // Downward slice imports — only via the slice public API (index.ts);
            // everything else falls to default "disallow".
            { from: { type: 'app' }, allow: { to: { type: ['view', 'widget', 'feature', 'entity'], internalPath: 'index.ts' } } },
            { from: { type: 'app-store' }, allow: { to: { type: ['entity', 'feature'], internalPath: 'index.ts' } } },
            { from: { type: 'view' }, allow: { to: { type: ['widget', 'feature', 'entity'], internalPath: 'index.ts' } } },
            { from: { type: 'widget' }, allow: { to: { type: ['feature', 'entity'], internalPath: 'index.ts' } } },
            { from: { type: 'feature' }, allow: { to: { type: 'entity', internalPath: 'index.ts' } } },
            // Entities may cross-import each other, but only via the @x API (AGENTS.md).
            { from: { type: 'entity' }, allow: { to: { type: 'entity', internalPath: '@x/**' } } },
            // shared: segments are imported directly (they have no unified slice entry).
            { from: { type: '*' }, allow: { to: { type: 'shared' } } },
            // The ONLY app-layer module reachable from below, and only its two
            // documented files (AGENTS.md, Redux Typed Hooks Exception).
            ...['app', 'view', 'widget', 'feature', 'entity', 'shared'].map((type) => ({
              from: { type },
              allow: { to: { type: 'app-store', internalPath: ['index.ts', 'ReduxHooks.ts'] } },
            })),
          ],
        },
      ],
    },
  },

  {
    files: ['vite.config.ts', 'eslint.config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];