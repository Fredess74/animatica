import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    alias: {
      '@Animatica/editor': path.resolve(__dirname, '../../packages/editor/src/index.ts'),
      '@Animatica/engine': path.resolve(__dirname, '../../packages/engine/src/index.ts'),
    },
    setupFiles: [],
  },
});
