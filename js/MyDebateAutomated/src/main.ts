import { resolve } from 'node:path';
import { printBanner, printError, printInfo } from './logger.js';
import { loadConfig, resolveUseConfig, getDebateConfig } from './config-loader.js';
import { resolveProviders, getProvider } from './provider.js';
import { createSaveFile, finalizeSave } from './saver.js';
import { runDebate } from './debate-engine.js';
import type { RuntimeContext } from './types.js';

/* ========== CLI 入口 ========== */

function parseArgs(): {
  configPath: string;
  savePath: string;
  useConfigOverride?: string;
} {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('用法: npx my-debate-automated <config.json5> <save.json> [useConfig]');
    console.error('');
    console.error('  config.json  - 辩论配置文件 (JSON5 格式)');
    console.error('  save.json    - 辩论记录保存路径');
    console.error('  useConfig    - (可选) 指定使用哪个辩论配置，覆盖 activeConfig');
    process.exit(1);
  }

  return {
    configPath: resolve(args[0]),
    savePath: resolve(args[1]),
    useConfigOverride: args.length >= 3 ? args[2] : undefined,
  };
}

async function main(): Promise<void> {
  // 解析命令行参数
  const { configPath, savePath, useConfigOverride } = parseArgs();

  // 打印横幅
  printBanner();

  // 1. 加载配置文件
  printInfo(`加载配置: ${configPath}`);
  const appConfig = loadConfig(configPath);

  // 2. 解析 useConfig
  const useConfig = resolveUseConfig(appConfig, useConfigOverride);
  const debateConfig = getDebateConfig(appConfig, useConfig);
  printInfo(`使用辩论配置: ${useConfig}`);
  printInfo(`辩题: ${debateConfig.topic}`);

  // 3. 解析 Provider（含 API Key）
  const providers = resolveProviders(appConfig);

  // 校验引用的 Provider 是否存在
  getProvider(providers, debateConfig.affirmative.provider, '正方');
  getProvider(providers, debateConfig.negative.provider, '反方');
  if (debateConfig.judge?.enabled) {
    getProvider(providers, debateConfig.judge.provider, '裁判');
  }

  // 4. 构建运行时上下文
  const ctx: RuntimeContext = {
    appConfig,
    useConfig,
    debateConfig,
    providers,
  };

  // 5. 创建保存文件
  const saveFile = createSaveFile(useConfig, debateConfig.topic);

  // 6. 注册 uncaught 异常处理
  let isShuttingDown = false;
  const emergencySave = () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    try {
      finalizeSave(savePath, saveFile, null, '异常退出');
    } catch { /* 尽力保存 */ }
  };

  process.on('uncaughtException', (err) => {
    printError(`未捕获异常: ${err.message}`);
    emergencySave();
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    printError(`未处理的 Promise 拒绝: ${String(reason)}`);
    emergencySave();
    process.exit(1);
  });

  // 7. 运行辩论
  try {
    await runDebate(ctx, savePath, saveFile, () => {
      // 正常退出回调（已在 runDebate 内部保存）
    });
  } catch (e: any) {
    printError(`辩论运行异常: ${e.message}`);
    emergencySave();
    process.exit(1);
  }
}

main();
