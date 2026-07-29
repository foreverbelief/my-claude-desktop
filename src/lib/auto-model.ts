/**
 * Lightweight task type detection for automatic model switching.
 * Only uses keyword/regex rules — no API calls.
 * Only activates when the active provider is DeepSeek.
 */

import type { ModelId } from '../stores/settingsStore';

export type TaskType = 'pro' | 'flash';

// ── Reasoning indicators ──
const REASONING_PATTERNS = [
  /推理|推断|逻辑|论证|演绎|归纳|推论/i,
  /分析|剖析|辨析|分解|拆解|深究/i,
  /批判|评价|评估|权衡|利弊|优劣|对比/i,
  /原因|根源|本质|原理|机制|因果/i,
  /reason|analy[sz]e|deduce|infer|logic|critical/i,
  /why|what.*cause|root.*(cause|reason)/i,
];

// ── Planning/architecture indicators ──
const PLANNING_PATTERNS = [
  /规划|计划|方案|路线图|路径|步骤|流程/i,
  /设计|架构|体系|结构|框架|搭建/i,
  /策略|战略|战术|布局|统筹|安排/i,
  /plan|design|architect|roadmap|strategy|blueprint/i,
  /proposal|propose|suggest.*approach/i,
];

// ── Math indicators ──
const MATH_PATTERNS = [
  /计算|数学|公式|方程|函数|导数|积分/i,
  /统计|概率|分布|回归|拟合|优化/i,
  /矩阵|向量|张量|线性|代数|几何/i,
  /math|calculate|compute|equation|formula|derivative/i,
  /statistic|probability|regression/i,
  /\$\$?.+?\$\$?/,  // Inline LaTeX $...$ or $$...$$
];

// ── Simple task indicators (remain on flash) ──
// These are not used to DETECT flash (default is flash),
// but they help avoid false-positive pro detection.
const SIMPLE_PATTERNS = [
  // When the user explicitly asks for flash / lightweight
  /用flash|用轻量|快速回答|简单回答/i,
  /flash|lightweight|quick|simple/i,
];

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

/**
 * Detect task type from user input.
 * Returns 'pro' for demanding tasks, 'flash' for everything else.
 */
export function detectTaskType(text: string): TaskType {
  if (!text || text.trim().length < 3) return 'flash';

  // If user explicitly asks for flash, respect that
  if (matchesAny(text, SIMPLE_PATTERNS)) return 'flash';

  // Score-based detection: count how many categories match
  let score = 0;
  if (matchesAny(text, REASONING_PATTERNS)) score += 1;
  if (matchesAny(text, PLANNING_PATTERNS)) score += 1;
  if (matchesAny(text, MATH_PATTERNS)) score += 1;

  // Pro if at least one category matches, or the message is very long (>500 chars = complex request)
  if (score >= 1 || text.length > 500) return 'pro';

  return 'flash';
}

/**
 * Check if the active provider is DeepSeek (auto-switch should apply).
 */
export function isDeepSeekProvider(activeProviderId: string | null): boolean {
  return activeProviderId === 'deepseek';
}

/**
 * Get the model ID to use based on detected task type.
 */
export function getModelForTaskType(taskType: TaskType): ModelId {
  return taskType === 'pro' ? 'claude-opus-4-6' : 'claude-sonnet-4-6';
}

/**
 * Human-readable label for the detected task type.
 */
export function getTaskTypeLabel(taskType: TaskType, locale: 'zh' | 'en'): string {
  if (locale === 'zh') {
    return taskType === 'pro' ? 'DeepSeek Pro (复杂任务)' : 'DeepSeek Flash (简单任务)';
  }
  return taskType === 'pro' ? 'DeepSeek Pro (complex task)' : 'DeepSeek Flash (simple task)';
}
