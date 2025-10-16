// vite-plugin-class-obfuscator/index.js
import crypto from 'crypto'

/**
 * @typedef {Object} ClassObfuscatorOptions
 * @property {(name: string) => string | undefined | null} transform - 自定义混淆函数
 * @property {boolean} [emitMap=false] - 是否输出 class-map.json
 */

/**
 * Vite 插件：混淆 CSS 类名
 * @param {ClassObfuscatorOptions} options
 * @returns {import('vite').Plugin}
 */
export default function classObfuscator(options = {}) {
  const {
    transform = (name) => '_' + crypto.createHash('md5').update(name).digest('hex').slice(0, 6),
    emitMap = false,
  } = options

  const classMap = new Map()

  return {
    name: 'vite-plugin-class-obfuscator',
    enforce: 'post',

    generateBundle(_, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        // 1️⃣ 处理 CSS 文件
        if (chunk.type === 'asset' && fileName.endsWith('.css')) {
          chunk.source = chunk.source.replace(/\.(\w[\w-]*)/g, (m, cls) => {
            const newName = transform(cls)
            if (!newName) return m
            classMap.set(cls, newName)
            return '.' + newName
          })
        }

        // 2️⃣ 处理 JS 文件（包括 Vue SFC 打包后的代码）
        if (chunk.type === 'chunk' && fileName.endsWith('.js')) {
          classMap.forEach((newCls, oldCls) => {
            const re = new RegExp(`(['"\`\\s])${oldCls}(['"\\s])`, 'g')
            chunk.code = chunk.code.replace(re, `$1${newCls}$2`)
          })
        }
      }

      // 3️⃣ 可选输出映射文件
      if (emitMap && classMap.size > 0) {
        this.emitFile({
          type: 'asset',
          fileName: 'class-map.json',
          source: JSON.stringify(Object.fromEntries(classMap), null, 2),
        })
      }
    },
  }
}
