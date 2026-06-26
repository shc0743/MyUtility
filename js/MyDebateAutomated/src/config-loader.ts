import { readFileSync } from 'node:fs';
import JSON5 from 'json5';
import type { AppConfig, DebateConfig } from './types.js';
import { isValidMaxRound } from './utils.js';
import { printError } from './logger.js';

/** 加载并校验 JSON5 配置文件 */
export function loadConfig(path: string): AppConfig {
  let raw: string;
  try {
    raw = readFileSync(path, 'utf-8');
  } catch {
    printError(`无法读取配置文件: ${path}`);
    process.exit(1);
  }

  let config: unknown;
  try {
    config = JSON5.parse(raw);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    printError(`配置文件 JSON5 解析失败: ${msg}`);
    process.exit(1);
  }

  // 基本结构校验
  if (!config || typeof config !== 'object') {
    printError('配置文件必须是对象');
    process.exit(1);
  }

  const cfg = config as Record<string, unknown>;

  if (!cfg.providers || typeof cfg.providers !== 'object') {
    printError('配置文件缺少 providers 字段');
    process.exit(1);
  }
  if (!cfg.debate || typeof cfg.debate !== 'object') {
    printError('配置文件缺少 debate 字段');
    process.exit(1);
  }

  return config as AppConfig;
}

/** 解析 useConfig：CLI 参数 > activeConfig */
export function resolveUseConfig(
  config: AppConfig,
  cliUseConfig?: string,
): string {
  if (cliUseConfig) return cliUseConfig;
  if (config.activeConfig) return config.activeConfig;
  printError('未指定 useConfig，且配置文件中没有 activeConfig');
  process.exit(1);
}

/** 校验辩论配置 */
export function validateDebateConfig(debate: DebateConfig): void {
  // 校验 first
  if (debate.first !== 'affirmative' && debate.first !== 'negative') {
    printError(`debate.first 必须是 "affirmative" 或 "negative"，当前值: ${debate.first}`);
    process.exit(1);
  }

  // 校验 maxRound
  if (!isValidMaxRound(debate.maxRound)) {
    if (!debate.judge?.enabled) {
      printError('judge.enabled 为 false 时，maxRound 必须是有效的非负有限整数');
      process.exit(1);
    }
    printError('maxRound 必须是有效的非负有限整数');
    process.exit(1);
  }
}

/** 获取指定的辩论配置 */
export function getDebateConfig(config: AppConfig, useConfig: string): DebateConfig {
  const debate = config.debate[useConfig];
  if (!debate) {
    printError(`未找到辩论配置: ${useConfig}`);
    process.exit(1);
  }
  validateDebateConfig(debate);
  return debate;
}
