import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import dts from 'vite-plugin-dts'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

const config = ({
  plugins: [
    vue(),
    cssInjectedByJsPlugin(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: null,
      name: 'DialogView',
      fileName: () => { throw new Error('stub function') },
      formats: ['umd', 'es'],
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue'
        },
      },
    },
    sourcemap: true,
    emptyOutDir: false,
  },
  css: {
    modules: {
      generateScopedName: '[hash:sha256]',
    },
  },
});

export default defineConfig(({ mode }) => {
  if (mode === 'unobfuscated') {
    config.build.lib.entry = fileURLToPath(new URL('./src/unobfuscated.ts', import.meta.url));
    config.build.lib.fileName = _ => `unobfuscated.${_}.js`;
  } else {
    config.build.lib.entry = fileURLToPath(new URL('./src/index.ts', import.meta.url));
    config.build.lib.fileName = _ => `dialog-view.${_}.js`;
  }
  return defineConfig(config);
})
