import type {
  RuntimeContext,
  DebateEntry,
  ChatMessage,
  RoundRecord,
  JudgeOutput,
  SaveFile,
} from './types.js';
import { DEBATER_SYSTEM_PROMPT, buildDebaterPreConfig } from './prompts/debater.js';
import { JUDGE_SYSTEM_PROMPT, buildJudgePreConfig } from './prompts/judge.js';
import { streamChatCompletion, type ApiResult } from './api-client.js';
import {
  printDebateInfo,
  printRoundHeader,
  printThinking,
  printContent,
  printJudgeText,
  printInfo,
  printWarn,
  printDone,
  C,
} from './logger.js';
import { extractJson } from './utils.js';
import { appendRound, finalizeSave, saveToFile } from './saver.js';

/* ========== 构建 API 消息列表 ========== */

/**
 * 根据辩论历史和当前发言者，构建完整的 messages 数组。
 *
 * 规则：
 * - messages[0] = system prompt（始终不变）
 * - messages[1] = pre-config（根据当前发言者变化）
 * - 后续 = 辩论历史，其中：
 *     - 自己的历史发言 → role: "assistant"
 *     - 对手的历史发言 → role: "user"
 * - 第一轮第一人没有历史，插入 "Please start..." 作为 user
 */
function buildMessages(
  speaker: 'affirmative' | 'negative',
  history: DebateEntry[],
  topic: string,
  language: string,
  summary: string,
  isFirstTurn: boolean,
): ChatMessage[] {
  const messages: ChatMessage[] = [];

  // 1. System prompt
  messages.push({ role: 'system', content: DEBATER_SYSTEM_PROMPT });

  // 2. Pre-config
  messages.push({
    role: 'user',
    content: buildDebaterPreConfig(topic, language, speaker, summary),
  });

  // 3. 起始消息（仅第一轮第一个发言者）
  if (isFirstTurn && history.length === 0) {
    messages.push({
      role: 'user',
      content: `Please start debating using the preferred language.`,
    });
  }

  // 4. 辩论历史
  for (const entry of history) {
    const role: 'user' | 'assistant' =
      entry.speaker === speaker ? 'assistant' : 'user';
    messages.push({ role, content: entry.content });
  }

  return messages;
}

/* ========== 裁判消息构建 ========== */

function buildJudgeMessages(
  history: DebateEntry[],
  topic: string,
  language: string,
): ChatMessage[] {
  const debateJson = JSON.stringify(
    history.map(entry => ({
      role: entry.speaker,
      content: entry.content,
    })),
  );

  return [
    { role: 'system', content: JUDGE_SYSTEM_PROMPT },
    {
      role: 'user',
      content: buildJudgePreConfig(topic, language) + '\n\n' + debateJson,
    },
  ];
}

/* ========== 调用辩手 AI ========== */

async function callDebater(
  ctx: RuntimeContext,
  speaker: 'affirmative' | 'negative',
  history: DebateEntry[],
  round: number,
): Promise<{ entry: DebateEntry; reasoningContent: string; durationMs: number; model: string; provider: string }> {
  const debateConfig = ctx.debateConfig;
  const roleConfig = speaker === 'affirmative' ? debateConfig.affirmative : debateConfig.negative;
  const resolved = ctx.providers[roleConfig.provider];
  const isFirstTurn = round === 1 && speaker === debateConfig.first;

  const messages = buildMessages(
    speaker,
    history,
    debateConfig.topic,
    debateConfig.language,
    roleConfig.summary,
    isFirstTurn,
  );

  // 打印轮次标题
  printRoundHeader(round, speaker);

  const result = await streamChatCompletion(
    resolved.baseUrl,
    resolved.apiKey,
    roleConfig.model,
    messages,
    // onThinking
    (text) => printThinking(text),
    // onContent
    (text) => printContent(text),
    // thinking 配置
    roleConfig.thinking,
    roleConfig.reasoning_effort,
  );

  // 换行（流式输出后）
  console.log('');
  console.log('');

  return {
    entry: { speaker, content: result.content },
    reasoningContent: result.reasoningContent,
    durationMs: result.durationMs,
    model: roleConfig.model,
    provider: resolved.name,
  };
}

/* ========== 调用裁判 AI ========== */

async function callJudge(
  ctx: RuntimeContext,
  history: DebateEntry[],
  round: number,
): Promise<{
  output: JudgeOutput | null;
  rawOutput: string;
  reasoningContent: string;
  durationMs: number;
  model: string;
  provider: string;
}> {
  const debateConfig = ctx.debateConfig;
  const judgeConfig = debateConfig.judge;
  const resolved = ctx.providers[judgeConfig.provider];

  // 打印轮次标题
  printRoundHeader(round, 'judge');

  // 最多 3 次尝试（初次 + 2 次重试）
  const maxAttempts = 3;
  let lastRaw = '';
  let lastDuration = 0;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      printWarn(`裁判 JSON 解析失败，正在重试 (${attempt + 1}/${maxAttempts})...`);
      console.log('');
    }

    const messages = buildJudgeMessages(history, debateConfig.topic, debateConfig.language);

    let reasoningContent = '';
    let rawContent = '';

    const result = await streamChatCompletion(
      resolved.baseUrl,
      resolved.apiKey,
      judgeConfig.model,
      messages,
      // onThinking：实时显示
      (text) => printThinking(text),
      // onContent：不实时显示（收集后解析）
      (text) => { rawContent += text; },
      // thinking 配置
      judgeConfig.thinking,
      judgeConfig.reasoning_effort,
    );

    console.log('');
    console.log('');

    lastRaw = rawContent;
    lastDuration = result.durationMs;

    // 尝试解析 JSON
    const jsonStr = extractJson(rawContent);
    if (!jsonStr) {
      continue; // 重试
    }

    try {
      const parsed: JudgeOutput = JSON.parse(jsonStr);
      // 基本校验
      if (typeof parsed.stop !== 'boolean') continue;
      if (parsed.stop && parsed.winner && !['affirmative', 'negative'].includes(parsed.winner)) {
        continue;
      }
      // 成功
      if (parsed.text) {
        printJudgeText(parsed.text);
        console.log('');
      }
      return {
        output: parsed,
        rawOutput: rawContent,
        reasoningContent: result.reasoningContent,
        durationMs: lastDuration,
        model: judgeConfig.model,
        provider: resolved.name,
      };
    } catch {
      continue; // JSON 解析失败，重试
    }
  }

  // 全部重试失败
  printWarn('裁判 JSON 解析全部重试失败，强制退出');
  return {
    output: null,
    rawOutput: lastRaw,
    reasoningContent: '',
    durationMs: lastDuration,
    model: judgeConfig.model,
    provider: resolved.name,
  };
}

/* ========== 主辩论循环 ========== */

export async function runDebate(
  ctx: RuntimeContext,
  saveFilePath: string,
  saveFile: SaveFile,
  onExit: () => void,
): Promise<void> {
  const debateConfig = ctx.debateConfig;
  const firstSpeaker: 'affirmative' | 'negative' = debateConfig.first;
  const secondSpeaker: 'affirmative' | 'negative' =
    firstSpeaker === 'affirmative' ? 'negative' : 'affirmative';
  const judgeEnabled = debateConfig.judge?.enabled !== false;
  const judgeMinRound = debateConfig.judge?.minimumRound ?? 0;

  // 打印辩论信息
  const affResolved = ctx.providers[debateConfig.affirmative.provider];
  const negResolved = ctx.providers[debateConfig.negative.provider];
  printDebateInfo(
    debateConfig.topic,
    affResolved.name,
    debateConfig.affirmative.model,
    negResolved.name,
    debateConfig.negative.model,
  );

  // 辩论历史
  const history: DebateEntry[] = [];
  let winner: string | null = null;
  let endReason = '';

  // 注册退出处理
  let isExiting = false;
  const gracefulExit = (reason: string) => {
    if (isExiting) return;
    isExiting = true;
    endReason = reason;
    finalizeSave(saveFilePath, saveFile, winner, reason);
    printDone(reason);
    onExit();
  };

  // Ctrl-C 处理
  process.on('SIGINT', () => {
    gracefulExit('用户中断 (Ctrl-C)');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    gracefulExit('进程被终止 (SIGTERM)');
    process.exit(0);
  });

  // 主循环
  for (let round = 1; round <= debateConfig.maxRound; round++) {
    // ---- 先发言方 ----
    const firstResult = await callDebater(ctx, firstSpeaker, history, round);
    history.push(firstResult.entry);

    // ---- 后发言方 ----
    const secondResult = await callDebater(ctx, secondSpeaker, history, round);
    history.push(secondResult.entry);

    // 分辨哪条记录是正方、哪条是反方
    const affResult = firstSpeaker === 'affirmative' ? firstResult : secondResult;
    const negResult = firstSpeaker === 'negative' ? firstResult : secondResult;

    // 构建轮次记录
    const roundRecord: RoundRecord = {
      round,
      affirmative: {
        model: affResult.model,
        provider: affResult.provider,
        content: affResult.entry.content,
        reasoningContent: affResult.reasoningContent,
        durationMs: affResult.durationMs,
      },
      negative: {
        model: negResult.model,
        provider: negResult.provider,
        content: negResult.entry.content,
        reasoningContent: negResult.reasoningContent,
        durationMs: negResult.durationMs,
      },
    };

    // ---- 裁判（如果启用 且 达到最低轮次） ----
    if (judgeEnabled && round >= judgeMinRound) {
      const judgeResult = await callJudge(ctx, history, round);

      roundRecord.judge = {
        model: judgeResult.model,
        provider: judgeResult.provider,
        rawOutput: judgeResult.rawOutput,
        reasoningContent: judgeResult.reasoningContent,
        parsed: judgeResult.output,
        durationMs: judgeResult.durationMs,
      };

      // 裁判解析失败 → 先保存再报错退出
      if (judgeResult.output === null) {
        appendRound(saveFilePath, saveFile, roundRecord);
        gracefulExit('裁判输出无法解析（已重试 3 次）');
        process.exit(1);
      }

      // 裁判判定停止
      if (judgeResult.output.stop) {
        winner = judgeResult.output.winner || null;
        // 先保存本轮，再退出
        appendRound(saveFilePath, saveFile, roundRecord);
        const reason = judgeResult.output.text || '裁判判定辩论结束';
        gracefulExit(reason);
        return;
      }
    }

    // 实时保存（裁判未判定停止、或裁判禁用时）
    appendRound(saveFilePath, saveFile, roundRecord);

    // 达到最大轮次
    if (round >= debateConfig.maxRound) {
      gracefulExit(`达到最大轮次 (${debateConfig.maxRound})`);
      return;
    }
  }

  // 理论上不会走到这里（循环内已处理 maxRound）
  gracefulExit('辩论结束');
}
