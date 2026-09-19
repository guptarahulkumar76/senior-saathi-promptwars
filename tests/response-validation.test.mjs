import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isNextStepResult, isScamAnalysisResult, isSimplifyResult } from '../src/lib/response-validation.ts';

describe('Structured Gemini response validation', () => {
  it('accepts a complete scam analysis', () => {
    assert.strictEqual(isScamAnalysisResult({
      riskLevel: 'High Risk', confidenceScore: 96,
      warningSigns: ['Requests an OTP'], explanation: 'This message is suspicious.',
      recommendedActions: ['Do not reply.'], hasFinancialDanger: true,
    }), true);
  });

  it('rejects unsafe or incomplete scam output', () => {
    assert.strictEqual(isScamAnalysisResult({ riskLevel: 'Unknown', confidenceScore: 140, warningSigns: [] }), false);
  });

  it('validates simplify and next-step response shapes', () => {
    assert.strictEqual(isSimplifyResult({ summary: 'Simple answer', keyPoints: ['One'] }), true);
    assert.strictEqual(isSimplifyResult({ summary: 'Missing points' }), false);
    assert.strictEqual(isNextStepResult({ situation: 'Scam', steps: ['Stop', 'Verify'] }), true);
    assert.strictEqual(isNextStepResult({ situation: 'Scam', steps: [] }), false);
  });
});
