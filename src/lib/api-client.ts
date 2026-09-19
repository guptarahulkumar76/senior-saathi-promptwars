import type { ApiResponse, Language, TaskType } from './types';

const CLIENT_TIMEOUT_MS = 20_000;

export async function requestGemini<T>(
  task: TaskType,
  input: string,
  language: Language,
  externalSignal?: AbortSignal
): Promise<T> {
  const timeoutController = new AbortController();
  const timeoutId = window.setTimeout(() => timeoutController.abort('timeout'), CLIENT_TIMEOUT_MS);
  const abortFromExternal = () => timeoutController.abort('cancelled');
  externalSignal?.addEventListener('abort', abortFromExternal, { once: true });

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, input: input.trim(), language }),
      signal: timeoutController.signal,
      cache: 'no-store',
    });

    const data = (await response.json()) as ApiResponse<T>;
    if (!response.ok || !data.success || !data.data) {
      throw new Error(data.error || 'The request could not be completed.');
    }
    return data.data;
  } catch (error) {
    if (timeoutController.signal.aborted && !externalSignal?.aborted) {
      throw new Error('The request took too long. Please try again.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
    externalSignal?.removeEventListener('abort', abortFromExternal);
  }
}

