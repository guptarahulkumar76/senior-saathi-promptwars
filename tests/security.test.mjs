import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import nextConfig from '../next.config.ts';
import { MAX_REQUEST_BYTES, validateGeminiRequest } from '../src/lib/api-validation.ts';

describe('Security configuration', () => {
  it('ships browser hardening headers', async () => {
    const rules = await nextConfig.headers();
    const headers = new Map(rules[0].headers.map(({ key, value }) => [key, value]));

    assert.match(headers.get('Content-Security-Policy'), /default-src 'self'/);
    assert.match(headers.get('Content-Security-Policy'), /frame-ancestors 'none'/);
    assert.match(headers.get('Strict-Transport-Security'), /max-age=63072000/);
    assert.equal(headers.get('X-Frame-Options'), 'DENY');
    assert.equal(headers.get('X-Content-Type-Options'), 'nosniff');
  });

  it('rejects malformed request bodies and unsupported languages', () => {
    for (const body of [null, [], 'text', 42]) {
      assert.equal(validateGeminiRequest(body).ok, false);
    }
    assert.equal(validateGeminiRequest({ task: 'simplify', input: 'hello', language: 'fr' }).ok, false);
  });

  it('keeps the byte limit above the supported text limit', () => {
    assert.ok(MAX_REQUEST_BYTES > 2_000);
  });
});
