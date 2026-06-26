import { VERSION } from './config.js';

/* ========== ANSI 颜色码 ========== */
export const C = {
  RESET: '\x1b[0m',
  DIM: '\x1b[90m',
  BOLD: '\x1b[1m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
} as const;

/* ========== 带颜色的控制台输出 ========== */

function ts(): string {
  return new Date().toISOString();
}

/** 打印横幅 */
export function printBanner(): void {
  console.log(`${C.CYAN}${C.BOLD}========== MyDebateAutomated v${VERSION} ==========${C.RESET}`);
  console.log(`${C.DIM}启动时间: ${ts()}${C.RESET}`);
  console.log('');
}

/** 辩论信息 */
export function printDebateInfo(topic: string, affProvider: string, affModel: string, negProvider: string, negModel: string): void {
  console.log(`${C.BOLD}辩题：${topic}${C.RESET}`);
  console.log(`${C.BLUE}正方：${affProvider} - ${affModel}${C.RESET}`);
  console.log(`${C.RED}反方：${negProvider} - ${negModel}${C.RESET}`);
  console.log('');
}

/** 轮次标题 */
export function printRoundHeader(round: number, role: 'affirmative' | 'negative' | 'judge'): void {
  const roleLabel: Record<string, string> = {
    affirmative: '正方',
    negative: '反方',
    judge: '裁判',
  };
  const color: Record<string, string> = {
    affirmative: C.BLUE,
    negative: C.RED,
    judge: C.YELLOW,
  };
  console.log(`${color[role]}${C.BOLD}---------- ${round}.${roleLabel[role]} ----------${C.RESET}`);
}

/** 思考内容（灰色） */
export function printThinking(text: string): void {
  process.stdout.write(`${C.DIM}${text}${C.RESET}`);
}

/** 普通内容 */
export function printContent(text: string): void {
  process.stdout.write(text);
}

/** 裁判 text 输出 */
export function printJudgeText(text: string): void {
  console.log(`${C.YELLOW}${text}${C.RESET}`);
}

/** 信息 */
export function printInfo(text: string): void {
  console.log(`${C.CYAN}${text}${C.RESET}`);
}

/** 错误 */
export function printError(text: string): void {
  console.error(`${C.RED}${C.BOLD}[错误] ${text}${C.RESET}`);
}

/** 警告 */
export function printWarn(text: string): void {
  console.warn(`${C.YELLOW}[警告] ${text}${C.RESET}`);
}

/** 完成 */
export function printDone(reason: string): void {
  console.log('');
  console.log(`${C.GREEN}${C.BOLD}辩论结束：${reason}${C.RESET}`);
}
