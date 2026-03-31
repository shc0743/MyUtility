import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

const mode = process.env.MODE

export default defineConfig({
  input: 'src/main.ts',
  plugins: [
    ...(mode === 'cjs' ? [] : [dts({
        build: true,
    })]),
  ],
  output: {
    dir: 'dist',
    format: mode === 'cjs' ? 'cjs' : 'esm',
    entryFileNames: mode === 'cjs' ? '[name].cjs' : undefined,
  },
});
