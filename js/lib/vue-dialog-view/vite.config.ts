import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import dts from 'vite-plugin-dts'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

type ExtractElement<T> = T extends (infer U)[] ? U : T;

const createConfig = () => defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: [],
      name: 'DialogView',
      fileName: () => { throw new Error('stub function') },
      formats: ['umd', 'es'],
    },
    rolldownOptions: {
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
  if (!(config.plugins && config.build?.lib && config.build.rolldownOptions?.output)) throw config;
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
    (config.build.rolldownOptions.output as ExtractElement<typeof config.build.rolldownOptions.output>).assetFileNames = (assetInfo) => {
      const name = assetInfo.names[0]
      if (!name) return '[name][extname]'
      if (name && name === 'vue-dialog-view.css') {
        return 'vue-dialog-view-obfuscated.css'
      }
      return name
    };
  } else {
    config.build.lib.entry = fileURLToPath(new URL('./src/index.ts', import.meta.url));
    config.build.lib.fileName = _ => `dialog-view.${_}.js`;
    config.plugins.push(cssInjectedByJsPlugin());
  }
  return defineConfig(config);
})
