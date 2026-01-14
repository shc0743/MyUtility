import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import dts from 'vite-plugin-dts'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

const createConfig = () => ({
  plugins: [
    vue(),
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
  const config = createConfig();
  if (mode === 'unobfuscated') {
    config.build.lib.entry = fileURLToPath(new URL('./src/unobfuscated.ts', import.meta.url));
    config.build.lib.fileName = _ => `unobfuscated.${_}.js`;
    config.plugins.push(cssInjectedByJsPlugin());
  } else if (mode === 'cssless') {
    config.build.lib.entry = fileURLToPath(new URL('./src/unobfuscated.ts', import.meta.url));
    config.build.lib.fileName = _ => `cssless.${_}.js`;
  } else if (mode === 'cssless-obfuscated') {
    config.build.lib.entry = fileURLToPath(new URL('./src/index.ts', import.meta.url));
    config.build.lib.fileName = _ => `cssless-obfuscated.${_}.js`;
    config.build.rollupOptions.output.assetFileNames = (assetInfo) => {
      if (assetInfo.name && assetInfo.name === 'vue-dialog-view.css') {
        return 'vue-dialog-view-obfuscated.css'
      }
      return undefined
    };
  } else {
    config.build.lib.entry = fileURLToPath(new URL('./src/index.ts', import.meta.url));
    config.build.lib.fileName = _ => `dialog-view.${_}.js`;
    config.plugins.push(cssInjectedByJsPlugin());
  }
  return defineConfig(config);
})
