import { readFileSync } from 'node:fs';

/** 读取文本文件，自动 trim */
export function readTextFile(path: string): string {
  return readFileSync(path, 'utf-8').trim();
}

/** 从环境变量读取，读取后清除（安全措施） */
export function readEnvAndClear(name: string): string | undefined {
  const val = process.env[name];
  if (val) {
    delete process.env[name];
    return val.trim();
  }
  return undefined;
}

/** 判断值是否为有效的有限正整数 */
export function isValidMaxRound(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 && v < Infinity;
}

/** 提取 JSON 字符串（处理可能的 markdown 代码块包裹） */
export function extractJson(text: string): string {
  let s = text.trim();
  // 去掉 ```json ... ``` 包裹
  const fenceMatch = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    s = fenceMatch[1].trim();
  }
  // 找到第一个 { 到最后一个 }
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    s = s.slice(start, end + 1);
  }
  return s;
}
