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
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
      'boundaries/elements': [
        { type: 'app-store', pattern: 'src/app/store' },
        { type: 'app', pattern: 'src/app' },
        { type: 'view', pattern: 'src/views/*' },
        { type: 'widget', pattern: 'src/widgets/*' },
        { type: 'feature', pattern: 'src/features/*' },
        { type: 'entity', pattern: 'src/entities/*' },
        { type: 'shared', pattern: 'src/shared/*' },
      ],
      'boundaries/ignore': ['src/**/__test__/**'],
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      'react-hooks': reactHooks,
      boundaries,
    },
    rules: {
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

      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-empty-function': 'off',

      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'],
            ['^react$', '^react-dom$', '^react-redux$', '^@reduxjs/toolkit$', '^redux$', '^@?\\w'],
            ['^@/shared/'],
            ['^@/entities/'],
            ['^@/features/'],
            ['^@/widgets/'],
            ['^@/views/'],
            ['^@/app/'],
            ['^\\.\\./'],
            ['^\\./'],
            ['^@?\\w.*\\u0000$', '^[^.].*\\u0000$'],
            ['^\\..*\\u0000$'],
            ['^.+\\.scss$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',

      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: { type: 'app' },
              allow: {
                to: { type: ['view', 'widget', 'feature', 'entity'], internalPath: 'index.ts' },
              },
            },
            {
              from: { type: 'app-store' },
              allow: { to: { type: ['entity', 'feature'], internalPath: 'index.ts' } },
            },
            {
              from: { type: 'view' },
              allow: { to: { type: ['widget', 'feature', 'entity'], internalPath: 'index.ts' } },
            },
            {
              from: { type: 'widget' },
              allow: { to: { type: ['feature', 'entity'], internalPath: 'index.ts' } },
            },
            { from: { type: 'feature' }, allow: { to: { type: 'entity', internalPath: 'index.ts' } } },
            {
              from: { type: 'entity' },
              allow: { to: { type: 'entity', internalPath: '@x/**' } },
            },
            { from: { type: '*' }, allow: { to: { type: 'shared' } } },
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