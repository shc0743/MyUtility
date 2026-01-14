#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';


const SRC_DIR = path.resolve('./src');
const OBF_SUFFIX = '.obf.vue';
const PROJECT_NAME = 'https://registry.npmjs.org/vue-dialog-view/';
const PROJECT_SCOPE = 'npm';

// ----------------------------
// 遍历 Vue 文件（跳过 .obf.vue）
// ----------------------------
function getVueFiles(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(getVueFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.vue') && !item.name.endsWith(OBF_SUFFIX)) {
      files.push(fullPath);
    }
  }
  return files;
}

class CRC64 {
  static ECMA182_POLY = 0xC96C5795D7870F42n;
  static ISO3309_POLY = 0xD800000000000000n;

  static table = null;

  static initTable(poly = CRC64.ECMA182_POLY) {
    if (CRC64.table) return;

    CRC64.table = new Array(256);
    for (let i = 0; i < 256; i++) {
      let crc = BigInt(i);
      for (let j = 0; j < 8; j++) {
        if (crc & 1n) {
          crc = (crc >> 1n) ^ poly;
        } else {
          crc = crc >> 1n;
        }
      }
      CRC64.table[i] = crc;
    }
  }

  static calculate(data, initial = 0n, poly = CRC64.ECMA182_POLY) {
    CRC64.initTable(poly);

    let crc = initial;

    if (typeof data === 'string') {
      data = Buffer.from(data);
    }

    for (let i = 0; i < data.length; i++) {
      const index = Number((crc ^ BigInt(data[i])) & 0xFFn);
      crc = (crc >> 8n) ^ CRC64.table[index];
    }

    return crc;
  }

  static calculateECMA182(data) {
    return CRC64.calculate(data, 0n, CRC64.ECMA182_POLY);
  }

  static calculateISO3309(data) {
    return CRC64.calculate(data, 0n, CRC64.ISO3309_POLY);
  }
}

// ----------------------------
// SHA256 混淆类名
// ----------------------------
function obfClass(name) {
  const sha256 = crypto.createHash('sha256')
    .update(PROJECT_SCOPE + '@' + PROJECT_NAME + '::' + name)
    .digest();

  return '_' + CRC64.calculateECMA182(sha256).toString(16).padStart(16, '0')
}

// ----------------------------
// 提取 template 内的 class
// ----------------------------
function extractClasses(template) {
  const classes = new Set();

  // class="..."
  const classAttrRegex = /class\s*=\s*"([^"]+)"/g;
  let match;
  while ((match = classAttrRegex.exec(template)) !== null) {
    match[1].split(/\s+/).forEach(cls => cls && classes.add(cls));
  }

  return classes;
}

// ----------------------------
// 替换模板和 style 中的 class
// ----------------------------
function replaceClasses(content, classMap) {
  // 替换 class="..."
  content = content.replace(/class\s*=\s*"([^"]+)"/g, (match, group1) => {
    const replaced = group1.split(/\s+/).map(cls => classMap[cls] || cls).join(' ');
    return `class="${replaced}"`;
  });

  // 替换 <style> 中的类名
  content = content.replace(/(\.)([\w-]+)/g, (match, dot, cls) => {
    return classMap[cls] ? `.${classMap[cls]}` : match;
  }).replace(/<style\s+scoped/g, '<style');

  return content;
}

// ----------------------------
// 主程序
// ----------------------------
function main() {
  const startTime = Date.now()

  const vueFiles = getVueFiles(SRC_DIR);
  const allClasses = new Set();

  // 提取所有 template class
  vueFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/);
    if (!templateMatch) return;
    const templateContent = templateMatch[1];
    extractClasses(templateContent).forEach(cls => allClasses.add(cls));
  });

  // 按长度降序避免短类名覆盖长类名
  const classList = Array.from(allClasses).sort((a, b) => b.length - a.length);
  const classMap = {};
  classList.forEach(cls => { classMap[cls] = obfClass(cls); });

  console.log('🔹 Obfuscation Map: ');
  console.table(classMap);

  // 替换并生成 .obf.vue 文件
  vueFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const replacedContent = replaceClasses(content, classMap);

    const obfFile = path.join(path.dirname(file), path.basename(file, '.vue') + OBF_SUFFIX);
    fs.writeFileSync(obfFile, replacedContent, 'utf-8');
    console.log(`✅ ${file} -> ${obfFile}`);
  });

  console.log('🎉 Obfuscate SUCCESSFUL in ' + ((Date.now() - startTime)) + 'ms');
}

main();
