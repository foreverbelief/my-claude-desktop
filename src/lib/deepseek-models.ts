export const DEEPSEEK_V4_PRO = 'deepseek-v4-pro';
export const DEEPSEEK_V4_FLASH = 'deepseek-v4-flash';
export const DEEPSEEK_V4_PRO_LABEL = 'DeepseekV4Pro';
export const DEEPSEEK_V4_FLASH_LABEL = 'DeepseekV4Flash';

/** Lower-case, punctuation-stripped form for pattern matching.
 *  e.g. "DeepSeek-V4-Flash-0731" -> "deepseekv4flash0731". */
function compactModel(model: string): string {
  return model.trim().toLowerCase().replace(/[\s_.()[\]-]/g, '');
}

/** True if a model name belongs to the DeepSeek V4 Pro family
 *  (canonical id, or a variant such as a date-suffixed build). */
export function isDeepSeekV4ProFamily(model: string | undefined | null): boolean {
  return compactModel(model ?? '').startsWith('deepseekv4pro');
}

/** True if a model name belongs to the DeepSeek V4 Flash family
 *  (canonical id, or a variant such as a date-suffixed build). */
export function isDeepSeekV4FlashFamily(model: string | undefined | null): boolean {
  return compactModel(model ?? '').startsWith('deepseekv4flash');
}

/** Standard UI tier IDs mapped to the DeepSeek aliases (legacy classification). */
const TIER_ID_TO_ALIAS: Record<string, string> = {
  'claude-opus-4-6': DEEPSEEK_V4_PRO,
  'claude-opus-4-6-1m': DEEPSEEK_V4_PRO,
  'claude-sonnet-4-6': DEEPSEEK_V4_FLASH,
  'claude-haiku-4-5-20251001': DEEPSEEK_V4_FLASH,
  'claude-haiku-4-5': DEEPSEEK_V4_FLASH,
};

/**
 * Normalize a UI tier id / legacy model name to a DeepSeek V4 alias.
 * Used for legacy migration and the no-provider fallback.
 * Concrete model IDs are preserved verbatim.
 */
export function normalizeDeepSeekModelName(model: string | undefined | null): string {
  if (!model) return '';

  const trimmed = model.trim();
  const direct = TIER_ID_TO_ALIAS[trimmed];
  if (direct) return direct;

  const lower = trimmed.toLowerCase();
  const compact = compactModel(trimmed);

  if (compact === 'deepseekv4pro' || compact.startsWith('deepseekv4pro')) return DEEPSEEK_V4_PRO;
  if (compact === 'deepseekv4flash' || compact.startsWith('deepseekv4flash')) return DEEPSEEK_V4_FLASH;

  if (lower.includes('fable') || lower.includes('opus') || compact.includes('claudeopus')) {
    return DEEPSEEK_V4_PRO;
  }

  if (lower.includes('sonnet') || lower.includes('haiku') || compact.includes('claudesonnet') || compact.includes('claudehaiku')) {
    return DEEPSEEK_V4_FLASH;
  }

  return trimmed;
}

/**
 * Normalize a *provider* model ID — PRESERVE THE EXACT STRING.
 * Many relays (e.g. scnet) are case- and suffix-sensitive: `DeepSeek-V4-Pro` works
 * while `deepseek-v4-pro` is rejected, and `DeepSeek-V4-Flash-0731` is the only
 * accepted spelling. Any rewriting here would silently corrupt the model ID, so
 * the provider receives precisely what the user configured (trimmed only).
 */
export function normalizeProviderModelName(model: string | undefined | null): string {
  if (!model) return '';
  return model.trim();
}

/** Friendly label for a UI tier id / model id.
 *  Exact canonical aliases and standard tier IDs get the DeepSeek brand label;
 *  any concrete variant keeps its real, case-accurate name. */
export function displayDeepSeekModelName(model: string | undefined | null): string {
  if (!model) return '';

  const trimmed = model.trim();

  // Exact canonical aliases (case-sensitive) -> brand labels
  if (trimmed === DEEPSEEK_V4_PRO) return DEEPSEEK_V4_PRO_LABEL;
  if (trimmed === DEEPSEEK_V4_FLASH) return DEEPSEEK_V4_FLASH_LABEL;

  // Standard UI tier IDs -> brand labels
  const compact = compactModel(trimmed);
  if (compact === 'claudeopus46' || compact === 'claudeopus461m') return DEEPSEEK_V4_PRO_LABEL;
  if (compact === 'claudesonnet46'
    || compact === 'claudehaiku4520251001' || compact === 'claudehaiku45') {
    return DEEPSEEK_V4_FLASH_LABEL;
  }
  return trimmed;
}

/** Friendly label for a provider model id — always the real, case-accurate name.
 *  Only the exact lowercase canonical aliases (from the built-in DeepSeek preset)
 *  get the brand label. Everything else — including case variants like
 *  "DeepSeek-V4-Pro" or date-suffixed builds like "DeepSeek-V4-Flash-0731" —
 *  is shown verbatim so the UI never hides the actual model ID. */
export function displayProviderModelName(model: string | undefined | null): string {
  if (!model) return '';

  const trimmed = model.trim();
  if (trimmed === DEEPSEEK_V4_PRO) return DEEPSEEK_V4_PRO_LABEL;
  if (trimmed === DEEPSEEK_V4_FLASH) return DEEPSEEK_V4_FLASH_LABEL;
  return trimmed;
}
