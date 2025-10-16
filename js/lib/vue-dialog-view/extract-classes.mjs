#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ---------------------------
// 配置：要扫描的目录
// ---------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const targetDir = path.resolve(__dirname, './src')
const outputFile = path.resolve(__dirname, 'vue-classes.json')

// ---------------------------
// 工具函数
// ---------------------------

/**
 * 递归获取所有 .vue 文件
 */
function getVueFiles(dir) {
  let files = []
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      files = files.concat(getVueFiles(fullPath))
    } else if (item.isFile() && item.name.endsWith('.vue')) {
      files.push(fullPath)
    }
  }
  return files
}

/**
 * 提取 class 属性中的静态类名
 * 支持 class="..." 和 :class="['...', '...']"
 */
function extractClassesFromTemplate(templateContent) {
  const classes = new Set()

  // 1️⃣ 普通 class="..."
  const classAttrRegex = /class\s*=\s*"([^"]+)"/g
  let match
  while ((match = classAttrRegex.exec(templateContent)) !== null) {
    match[1].split(/\s+/).forEach(cls => cls && classes.add(cls))
  }

  // 2️⃣ v-bind / :class="['a', 'b']"（只处理简单数组字符串）
  const bindClassRegex = /:class\s*=\s*\[([^\]]+)\]/g
  while ((match = bindClassRegex.exec(templateContent)) !== null) {
    match[1].split(',').forEach(cls => {
      cls = cls.trim().replace(/^['"`]|['"`]$/g, '')
      cls && classes.add(cls)
    })
  }

  return classes
}

// ---------------------------
// 主程序
// ---------------------------
function main() {
  const vueFiles = getVueFiles(targetDir)
  const allClasses = new Set()

  vueFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8')
    const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/)
    if (!templateMatch) return
    const templateContent = templateMatch[1]
    const classes = extractClassesFromTemplate(templateContent)
    classes.forEach(cls => allClasses.add(cls))
  })

  const classArray = Array.from(allClasses).sort()
  fs.writeFileSync(outputFile, JSON.stringify(classArray, null, 2), 'utf-8')
  console.log(`✅ 提取完成，共 ${classArray.length} 个 class，输出到 ${outputFile}`)
}

main()
