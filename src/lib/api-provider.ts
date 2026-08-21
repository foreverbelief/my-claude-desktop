import { useProviderStore } from '../stores/providerStore';
import type { ModelId } from '../stores/settingsStore';
import {
  DEEPSEEK_V4_FLASH,
  isDeepSeekV4FlashFamily,
  isDeepSeekV4ProFamily,
  normalizeDeepSeekModelName,
  normalizeProviderModelName,
} from './deepseek-models';

const TIER_MAP: Record<string, 'opus' | 'sonnet' | 'haiku'> = {
  'claude-opus-4-6': 'opus',
  'claude-opus-4-6-1m': 'opus',
  'claude-sonnet-4-6': 'sonnet',
  'claude-haiku-4-5-20251001': 'haiku',
};

/**
 * Result of model resolution — either a mapped model name or an error.
 */
export type ModelResolution =
  | { ok: true; model: string }
  | { ok: false; reason: 'no_mapping'; tier: string; providerName: string };

/**
 * Resolve the UI-selected model ID to the provider's actual model name,
 * returning an error if the provider has no mapping for the selected tier.
 */
export function resolveModelOrError(selectedModel: string): ModelResolution {
  const provider = useProviderStore.getState().getActive();
  if (!provider) {
    const normalized = normalizeDeepSeekModelName(selectedModel);
    return {
      ok: true,
      model: normalized === selectedModel ? DEEPSEEK_V4_FLASH : normalized,
    };
  }

  // 1. Check direct model ID mapping first (e.g. 'claude-opus-4-6-1m' → 'glm-5-1m')
  const directMapping = provider.modelMappings.find(
    (m) => m.tier === selectedModel && m.providerModel,
  );
  if (directMapping?.providerModel) {
    return { ok: true, model: normalizeProviderModelName(directMapping.providerModel) };
  }

  // 2. Fall back to tier mapping
  const tier = TIER_MAP[selectedModel];
  if (tier) {
    const mapping = provider.modelMappings.find(
      (m) => m.tier === tier && m.providerModel,
    );
    if (mapping?.providerModel) {
      return { ok: true, model: normalizeProviderModelName(mapping.providerModel) };
    }
  }

  // NOTE: intentionally NO "any-mapping" fallback here. Previously a fallback
  // that grabbed the first configured model (e.g. an extra mapping like
  // `deepseek-v4-flash`) silently rewrote a selected Claude tier (e.g.
  // claude-sonnet-4-6) into an unrelated provider model, causing confusing
  // "422 Model Not Exist: <unexpected-name>" API errors. Strict resolution:
  // if the selected model's tier has no mapping, surface no_mapping so the UI
  // shows a clear "provider has no mapping for this model" message instead of
  // sending the wrong model name.

  return { ok: false, reason: 'no_mapping', tier: selectedModel, providerName: provider.name };
}

/**
 * Resolve the UI-selected model ID to the provider's actual model name.
 * When a provider is active, looks up the model mapping for the selected tier.
 * Returns the original model ID if no mapping is configured (silent fallback).
 */
/** Map internal model IDs to CLI-expected format */
const CLI_MODEL_MAP: Partial<Record<ModelId, string>> = {
  'claude-opus-4-6-1m': 'claude-opus-4-6[1m]',
};

export function resolveModelForProvider(selectedModel: string): string {
  const r = resolveModelOrError(selectedModel);
  const model = r.ok ? r.model : selectedModel;
  return CLI_MODEL_MAP[model as ModelId] ?? model;
}

export function supportsDeepSeekThinking(model: string): boolean {
  // Family detection: also matches concrete variants like "DeepSeek-V4-Flash-0731".
  return isDeepSeekV4ProFamily(model) || isDeepSeekV4FlashFamily(model);
}

export function resolveThinkingLevelForProvider(selectedModel: string, requestedLevel: string): string {
  if (requestedLevel === 'off') return 'off';
  const resolvedModel = resolveModelForProvider(selectedModel);
  return supportsDeepSeekThinking(resolvedModel) ? requestedLevel : 'off';
}

/**
 * Stable fingerprint of the current API provider config.
 * Any provider config change invalidates the pre-warmed session.
 */
export function envFingerprint(): string {
  const { activeProviderId, providers } = useProviderStore.getState();
  const provider = providers.find((p) => p.id === activeProviderId);
  return JSON.stringify({
    activeProviderId,
    updatedAt: provider?.updatedAt ?? 0,
  });
}
