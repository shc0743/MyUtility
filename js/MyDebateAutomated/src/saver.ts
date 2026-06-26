import { writeFileSync } from 'node:fs';
import type { SaveFile, RoundRecord } from './types.js';
import { APPID } from './config.js';

/** 创建初始保存结构 */
export function createSaveFile(
  configId: string,
  topic: string,
): SaveFile {
  return {
    appid: APPID,
    config: configId,
    topic,
    startedAt: new Date().toISOString(),
    endedAt: '',
    result: {
      winner: null,
      reason: '',
      totalRounds: 0,
    },
    rounds: [],
  };
}

/** 实时保存到文件 */
export function saveToFile(path: string, data: SaveFile): void {
  try {
    writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e: any) {
    // 保存失败不中断辩论，仅打印警告
    console.error(`\x1b[33m[警告] 保存文件失败: ${e.message}\x1b[0m`);
  }
}

/** 追加一轮记录并保存 */
export function appendRound(
  filePath: string,
  saveFile: SaveFile,
  round: RoundRecord,
): void {
  saveFile.rounds.push(round);
  saveFile.result.totalRounds = round.round;
  saveToFile(filePath, saveFile);
}

/** 完成辩论并最终保存 */
export function finalizeSave(
  filePath: string,
  saveFile: SaveFile,
  winner: string | null,
  reason: string,
): void {
  saveFile.endedAt = new Date().toISOString();
  saveFile.result.winner = winner;
  saveFile.result.reason = reason;
  saveToFile(filePath, saveFile);
}
