import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: 'src/main.ts',
  outDir: 'dist',
  format: ['esm'],
  platform: 'node',
  sourcemap: true,
  minify: true,
  clean: true,
  target: 'node22',
});
