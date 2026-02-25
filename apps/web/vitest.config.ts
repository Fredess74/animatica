import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@Animatica/editor': path.resolve(__dirname, '../../packages/editor/src/index.ts'),
      '@Animatica/engine': path.resolve(__dirname, '../../packages/engine/src/index.ts'),
      '@Animatica/platform': path.resolve(__dirname, '../../packages/platform/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
