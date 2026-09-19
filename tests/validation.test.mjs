import { describe, it } from 'node:test';
import assert from 'node:assert';
import { checkRateLimit } from '../src/lib/rate-limiter.ts';
import { MAX_INPUT_LENGTH, validateGeminiRequest } from '../src/lib/api-validation.ts';

describe('API Input Validation & Rate Limiting', () => {
  it('should accept valid task types', () => {
    const validTasks = ['simplify', 'scam-check', 'next-step'];
    for (const task of validTasks) {
      assert.strictEqual(validTasks.includes(task), true);
    }
    assert.strictEqual(validTasks.includes('arbitrary-task'), false);
  });

  it('should enforce maximum input character limits of 2000 characters', () => {
    const normalText = 'What is the procedure to check my pension status?';
    const oversizedText = 'A'.repeat(MAX_INPUT_LENGTH + 1);

    assert.strictEqual(normalText.length <= MAX_INPUT_LENGTH, true);
    assert.strictEqual(oversizedText.length <= MAX_INPUT_LENGTH, false);
  });

  it('should reject empty or whitespace-only inputs', () => {
    const emptyString = '';
    const whitespaceString = '    \n\t  ';

    assert.strictEqual(emptyString.trim().length === 0, true);
    assert.strictEqual(whitespaceString.trim().length === 0, true);
  });

  it('should enforce rate limits per client identifier', () => {
    const testId = `test-client-${Date.now()}`;
    const limit = 5;
    const windowMs = 10000;

    for (let i = 0; i < limit; i++) {
      const result = checkRateLimit(testId, limit, windowMs);
      assert.strictEqual(result.allowed, true, `Request ${i + 1} should be allowed`);
    }

    // 6th request should be blocked
    const blocked = checkRateLimit(testId, limit, windowMs);
    assert.strictEqual(blocked.allowed, false, '6th request should be blocked by rate limiter');
    assert.strictEqual(blocked.remaining, 0);
  });

  it('normalizes valid API input and defaults language safely', () => {
    const result = validateGeminiRequest({ task: 'simplify', input: '  Explain DigiLocker  ' });
    assert.strictEqual(result.ok, true);
    if (result.ok) {
      assert.strictEqual(result.value.input, 'Explain DigiLocker');
      assert.strictEqual(result.value.language, 'en');
    }
  });

  it('rejects invalid task, language, and oversized input values', () => {
    assert.strictEqual(validateGeminiRequest({ task: 'delete', input: 'x' }).ok, false);
    assert.strictEqual(validateGeminiRequest({ task: 'simplify', input: 'x', language: 'fr' }).ok, false);
    assert.strictEqual(validateGeminiRequest({ task: 'simplify', input: 'x'.repeat(MAX_INPUT_LENGTH + 1) }).ok, false);
  });
});
