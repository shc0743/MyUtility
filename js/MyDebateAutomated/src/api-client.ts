import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';
import type { ChatMessage } from './types.js';
import { printError } from './logger.js';

/* ========== API 调用结果 ========== */

export interface ApiResult {
  content: string;
  reasoningContent: string;
  durationMs: number;
}

/**
 * 流式调用 OpenAI 兼容 Chat Completions API（使用 Vercel AI SDK v7）
 */
export async function streamChatCompletion(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  onThinking: (text: string) => void,
  onContent: (text: string) => void,
  thinking?: { type: 'enabled' | 'disabled' },
  reasoningEffort?: string,
): Promise<ApiResult> {
  const startTime = Date.now();

  const enableThinking = thinking?.type === 'enabled';

  // 自定义 fetch：注入 DeepSeek thinking / reasoning_effort 参数
  const customFetch: typeof globalThis.fetch = async (input, init) => {
    if (enableThinking && init?.body) {
      try {
        const bodyStr = init.body as string;
        const body = JSON.parse(bodyStr);
        body.thinking = thinking;
        if (reasoningEffort) {
          body.reasoning_effort = reasoningEffort;
        }
        init = { ...init, body: JSON.stringify(body) };
      } catch {
        // body 不是 JSON 字符串则忽略
      }
    }
    return globalThis.fetch(input, init);
  };

  // 创建 OpenAI 兼容 Provider
  const provider = createOpenAICompatible({
    name: 'custom',
    baseURL: baseUrl,
    apiKey,
    fetch: customFetch,
  });

  const chatModel = provider.chatModel(model);

  // 分离 system 消息（AI SDK v7 要求通过 system 参数单独传递）
  const systemMsg = messages.find(m => m.role === 'system');
  const otherMsgs = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  let content = '';
  let reasoningContent = '';

  try {
    const result = streamText({
      model: chatModel,
      system: systemMsg?.content,
      messages: otherMsgs,
    });

    // 使用 fullStream 获取完整流（包含 reasoning + text + error）
    for await (const part of result.fullStream) {
      switch (part.type) {
        case 'reasoning-delta':
          reasoningContent += part.text;
          onThinking(part.text);
          break;
        case 'text-delta':
          content += part.text;
          onContent(part.text);
          break;
        case 'error':
          // API 返回错误（如模型名无效、额度不足等），立即抛出
          throw part.error;
      }
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    printError(`API 请求失败 (${model}): ${msg}`);
    // 重新抛出，让上层统一保存并退出
    throw e;
  }

  const durationMs = Date.now() - startTime;
  return { content, reasoningContent, durationMs };
}
