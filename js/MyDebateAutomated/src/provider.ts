import { readFileSync, existsSync } from 'node:fs';
import type { AppConfig, KeyConfig, ResolvedProvider, ProviderConfig } from './types.js';
import { readEnvAndClear } from './utils.js';
import { printError, printWarn } from './logger.js';

/** 解析单个 API Key */
export function resolveApiKey(keyConfig: KeyConfig): string {
  switch (keyConfig.type) {
    case 'env': {
      const val = readEnvAndClear(keyConfig.value);
      if (!val) {
        printError(`API Key 环境变量 ${keyConfig.value} 未设置或为空`);
        process.exit(1);
      }
      return val;
    }
    case 'file': {
      try {
        const val = readFileSync(keyConfig.value, 'utf-8').trim();
        if (!val) {
          printError(`API Key 文件 ${keyConfig.value} 为空`);
          process.exit(1);
        }
        return val;
      } catch {
        printError(`无法读取 API Key 文件: ${keyConfig.value}`);
        process.exit(1);
      }
    }
    case 'plaintext': {
      if (!keyConfig.value) {
        printError('plaintext 类型的 API Key 值为空');
        process.exit(1);
      }
      printWarn('警告：API Key 以明文存储在配置文件中，建议使用 env 或 file 类型');
      return keyConfig.value;
    }
    default: {
      printError(`未知的 Key 类型: ${(keyConfig as any).type}`);
      process.exit(1);
    }
  }
}

/** 解析所有 Provider，返回 id → ResolvedProvider 映射 */
export function resolveProviders(config: AppConfig): Record<string, ResolvedProvider> {
  const resolved: Record<string, ResolvedProvider> = {};

  for (const [id, provider] of Object.entries(config.providers)) {
    if (provider.mode !== 'openai') {
      printWarn(`Provider "${provider.name}" 的 mode 不是 "openai"（当前仅支持 OpenAI 兼容格式），跳过`);
      continue;
    }
    let apiKey: string;
    try {
      apiKey = resolveApiKey(provider.key);
    } catch {
      // resolveApiKey 内部会 exit
      throw new Error('unreachable');
    }
    resolved[id] = {
      id,
      name: provider.name,
      baseUrl: provider.base_url.replace(/\/+$/, ''),
      apiKey,
    };
  }

  if (Object.keys(resolved).length === 0) {
    printError('没有可用的 Provider');
    process.exit(1);
  }

  return resolved;
}

/** 获取指定 ID 的 Provider（带校验） */
export function getProvider(
  providers: Record<string, ResolvedProvider>,
  id: string,
  role: string,
): ResolvedProvider {
  const p = providers[id];
  if (!p) {
    printError(`${role} 引用的 Provider "${id}" 不存在或 mode 不兼容`);
    process.exit(1);
  }
  return p;
}
