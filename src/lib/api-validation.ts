import type { Language, TaskType } from './types';

export const MAX_INPUT_LENGTH = 2000;
export const MAX_REQUEST_BYTES = 12_000;
export const VALID_TASKS = ['simplify', 'scam-check', 'next-step'] as const;

export interface ValidatedGeminiRequest {
  task: TaskType;
  input: string;
  language: Language;
}

export type ValidationResult =
  | { ok: true; value: ValidatedGeminiRequest }
  | { ok: false; error: string };

export function validateGeminiRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid request body.' };
  }

  const candidate = body as Record<string, unknown>;
  if (typeof candidate.task !== 'string' || !VALID_TASKS.includes(candidate.task as TaskType)) {
    return { ok: false, error: 'Invalid task type.' };
  }

  if (typeof candidate.input !== 'string' || candidate.input.trim().length === 0) {
    return { ok: false, error: 'Please provide a non-empty message or question.' };
  }

  const input = candidate.input.trim();
  if (input.length > MAX_INPUT_LENGTH) {
    return {
      ok: false,
      error: `Message is too long. Please limit your text to ${MAX_INPUT_LENGTH} characters.`,
    };
  }

  if (candidate.language !== undefined && candidate.language !== 'en' && candidate.language !== 'hi') {
    return { ok: false, error: 'Invalid language.' };
  }

  return {
    ok: true,
    value: {
      task: candidate.task as TaskType,
      input,
      language: candidate.language === 'hi' ? 'hi' : 'en',
    },
  };
}

