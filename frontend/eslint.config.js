import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier'; // 설치된 패키지 import
import react from 'eslint-plugin-react'; // React 일반 규칙
import prettierPlugin from 'eslint-plugin-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y'; // JSX 접근성
import importPlugin from 'eslint-plugin-import'; // Import 순서 및 경로
import fsdImportPlugin from 'eslint-plugin-fsd-import';
// import tailwindcss from "eslint-plugin-tailwindcss"; // Tailwind CSS

export default defineConfig([
  // 무시할 파일 설정
  globalIgnores(['dist', 'node_modules', '.vscode', 'eslint.config.js', 'vite.config.ts']),
  // 상속받는 기본 설정들

  js.configs.recommended, // ESLint 기본 규칙
  ...tseslint.configs.recommended, // TypeScript 권장 규칙
  ...tseslint.configs.recommendedTypeChecked, // 타입 체크 규칙 추가
  reactHooks.configs['recommended-latest'], // Hooks 규칙
  reactRefresh.configs.vite, // Vite + React Refresh 규칙
  // tailwindcss.configs.recommended, // Tailwind CSS 규칙
  {
    files: ['**/*.{ts,tsx}'],
    // 플러그인 정의
    plugins: {
      react: react,
      import: importPlugin,
      // tailwindcss: tailwindcss,
      prettier: prettierPlugin,
      'fsd-import': fsdImportPlugin,
    },

    languageOptions: {
      // 일반 JS 언어 옵션
      ecmaVersion: 2020,
      globals: globals.browser,
      // 파서 설정
      parser: tseslint.parser,
      parserOptions: {
        // project: ["./tsconfig.json"],
        project: ['./tsconfig.app.json'],
        sourceType: 'module',
      },
    },
    // 개별 규칙 설정
    rules: {
      // **React/TypeScript 필수 규칙**
      // JSX를 포함하는 파일에서 React import 요구 비활성화 (React 17+ JSDX Transform)
      'react/react-in-jsx-scope': 'off',
      // 사용하지 않는 변수 경고 (인수는 예외로 둠)
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // 명시적인 any 사용은 경고로 낮춤 (프로젝트 성격에 따라 error로 변경 가능)
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-base-to-string': 'warn',
      // **FSD를 위한 Import 순서 규칙** (핵심)
      // 모듈 간의 순서를 강제하여 아키텍처 레이어별 분리를 명확히 함
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          // FSD 레이어별 import 패턴 정의
          pathGroups: [
            { pattern: 'app/**', group: 'internal', position: 'before' },
            { pattern: 'pages/**', group: 'internal', position: 'before' },
            { pattern: 'widgets/**', group: 'internal', position: 'before' },
            { pattern: 'features/**', group: 'internal', position: 'before' },
            { pattern: 'entities/**', group: 'internal', position: 'before' },
            { pattern: 'shared/**', group: 'internal', position: 'before' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // FSD 레이어 의존성 제한
      'fsd-import/layer-imports': [
        'error',
        {
          alias: '@', // src 기준 alias
          ignoreImportPatterns: ['**/testing/**'],
        },
      ],

      'prettier/prettier': 'error', // Prettier 위반 시 ESLint error
      'react-refresh/only-export-components': 'off', // Fast Refresh 규칙 끄기
    },

    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  eslintConfigPrettier,
]);
