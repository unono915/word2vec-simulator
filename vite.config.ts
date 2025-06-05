import path from 'path';
import { defineConfig, loadEnv } from 'vite';
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/word2vec-simulator/',
  // 기타 설정
});

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
