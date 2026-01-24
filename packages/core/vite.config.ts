import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Pong404',
      fileName: 'pong404',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
  },
});
