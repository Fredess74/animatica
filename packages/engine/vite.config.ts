import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AnimaticaEngine',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'three', '@react-three/fiber']
    }
  }
});
