import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { configDefaults } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // =========================================================
  // Vitest 설정
  // =========================================================
  test: {
    // 테스트 환경으로 JSDOM을 사용합니다 (DOM을 시뮬레이션)
    environment: 'jsdom',

    // 테스트 파일을 찾을 패턴
    include: ['**/*.{test,spec}.{ts,tsx}'],

    // 테스트 전 전역 설정 파일을 로드합니다.
    setupFiles: ['./src/setupTests.ts'],

    // 테스트에서 제외할 파일 목록
    exclude: [...configDefaults.exclude],

    // coverage 설정
    coverage: {
      provider: 'v8', // 커버리지 제공자
      reporter: ['text', 'json', 'html'], // 보고서 형식
      include: ['src/**/*.{ts,tsx}'], // 커버리지 측정 대상
      exclude: [
        'src/main.tsx', // 엔트리 포인트 제외
        'src/shared/components/ui/**', // UI 컴포넌트는 커버리지에서 제외할 수도 있음
        // FSD 구조에 따라 제외할 파일 추가 (예: types, constants)
      ],
    },

    // 타입 체크 (TypeScript 사용 시 권장)
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
