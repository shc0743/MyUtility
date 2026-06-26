/* ========== 配置类型 ========== */

export interface KeyConfig {
  type: 'env' | 'file' | 'plaintext';
  value: string;
}

export interface ProviderConfig {
  name: string;
  mode: 'openai';
  base_url: string;
  key: KeyConfig;
}

export interface RoleConfig {
  summary: string;
  provider: string;
  model: string;
  /** DeepSeek thinking 模式：{ type: "enabled" } 开启，不传则关闭 */
  thinking?: { type: 'enabled' | 'disabled' };
  /** DeepSeek reasoning_effort：如 "max", "medium", "minimal" */
  reasoning_effort?: string;
}

export interface JudgeConfig {
  enabled: boolean;
  provider: string;
  model: string;
  /** 最低启用轮次 */
  minimumRound?: number;
  thinking?: { type: 'enabled' | 'disabled' };
  reasoning_effort?: string;
}

export interface DebateConfig {
  topic: string;
  language: string;
  first: 'affirmative' | 'negative';
  affirmative: RoleConfig;
  negative: RoleConfig;
  judge: JudgeConfig;
  maxRound: number;
}

export interface AppConfig {
  providers: Record<string, ProviderConfig>;
  debate: Record<string, DebateConfig>;
  activeConfig: string;
}

/* ========== 消息类型 ========== */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/* ========== 辩论历史条目（中性存储，不绑定 API role） ========== */

export interface DebateEntry {
  speaker: 'affirmative' | 'negative';
  content: string;
}

/* ========== 流式响应 ========== */

export interface StreamDelta {
  content?: string;
  reasoning_content?: string;
}

export interface StreamChoice {
  delta: StreamDelta;
  finish_reason?: string | null;
}

export interface StreamChunk {
  choices: StreamChoice[];
}

/* ========== 裁判输出 ========== */

export interface JudgeOutput {
  stop: boolean;
  winner?: 'affirmative' | 'negative';
  text?: string;
}

/* ========== 单轮记录 ========== */

export interface TurnSpeakerRecord {
  model: string;
  provider: string;
  content: string;
  reasoningContent: string;
  durationMs: number;
}

export interface TurnJudgeRecord {
  model: string;
  provider: string;
  rawOutput: string;
  reasoningContent: string;
  parsed: JudgeOutput | null;
  durationMs: number;
}

export interface RoundRecord {
  round: number;
  affirmative: TurnSpeakerRecord;
  negative: TurnSpeakerRecord;
  judge?: TurnJudgeRecord;
}

/* ========== 保存文件结构 ========== */

export interface SaveFile {
  appid: string;
  config: string;
  topic: string;
  startedAt: string;
  endedAt: string;
  result: {
    winner: string | null;
    reason: string;
    totalRounds: number;
  };
  rounds: RoundRecord[];
}

/* ========== 运行时上下文 ========== */

export interface ResolvedProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
}

export interface RuntimeContext {
  appConfig: AppConfig;
  useConfig: string;
  debateConfig: DebateConfig;
  providers: Record<string, ResolvedProvider>;
}
