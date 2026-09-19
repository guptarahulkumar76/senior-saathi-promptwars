import { describe, it } from 'node:test';
import assert from 'node:assert';
import { extractJson, getDemoResponse } from '../src/lib/gemini.ts';

describe('Gemini Response Extraction & Scam Risk Engine', () => {
  it('should extract JSON from pure JSON string', () => {
    const raw = '{"riskLevel": "High Risk", "confidenceScore": 95}';
    const fallback = { riskLevel: 'Likely Safe', confidenceScore: 0 };
    const parsed = extractJson(raw, fallback);
    assert.strictEqual(parsed.riskLevel, 'High Risk');
    assert.strictEqual(parsed.confidenceScore, 95);
  });

  it('should extract JSON wrapped in markdown code blocks', () => {
    const raw = '```json\n{"riskLevel": "Be Careful", "confidenceScore": 80}\n```';
    const fallback = { riskLevel: 'Likely Safe', confidenceScore: 0 };
    const parsed = extractJson(raw, fallback);
    assert.strictEqual(parsed.riskLevel, 'Be Careful');
    assert.strictEqual(parsed.confidenceScore, 80);
  });

  it('should extract JSON with surrounding conversational text', () => {
    const raw = 'Here is the analysis:\n{"riskLevel": "Likely Safe", "confidenceScore": 99}\nHope this helps you!';
    const fallback = { riskLevel: 'High Risk', confidenceScore: 0 };
    const parsed = extractJson(raw, fallback);
    assert.strictEqual(parsed.riskLevel, 'Likely Safe');
    assert.strictEqual(parsed.confidenceScore, 99);
  });

  it('should return fallback if input contains invalid JSON syntax', () => {
    const raw = 'This is not json at all, just broken text { oops ';
    const fallback = { riskLevel: 'High Risk', confidenceScore: 0 };
    const parsed = extractJson(raw, fallback);
    assert.strictEqual(parsed.riskLevel, 'High Risk');
  });

  it('should detect high risk for electricity cutoff threats', () => {
    const electricityMsg = 'Electricity power cut tonight at 9.30 PM. Call officer at 9876543210 or share OTP.';
    const result = getDemoResponse('scam-check', electricityMsg, 'en');
    assert.strictEqual(result.riskLevel, 'High Risk');
    assert.strictEqual(result.hasFinancialDanger, true);
    assert.strictEqual(result.warningSigns.length > 0, true);
    assert.strictEqual(
      result.recommendedActions.some((a) => a.includes('1930') || a.includes('OTP')),
      true
    );
  });

  it('should identify legitimate account statements as Likely Safe', () => {
    const bankMsg = 'Your bank account balance is Rs 12,450. Thank you for banking with us.';
    const result = getDemoResponse('scam-check', bankMsg, 'en');
    assert.strictEqual(result.riskLevel, 'Likely Safe');
    assert.strictEqual(result.hasFinancialDanger, false);
  });

  it('should attach medical disclaimer for medicine dosage queries', () => {
    const medQuery = 'Should I double my blood pressure medicine dose?';
    const result = getDemoResponse('simplify', medQuery, 'en');
    assert.strictEqual(Boolean(result.disclaimer), true);
    assert.strictEqual(result.disclaimer.includes('doctor'), true);
  });

  it('should return Hindi responses when language is hi', () => {
    const electricityMsg = 'आज रात बिजली कट जाएगी, तुरंत फोन करें';
    const result = getDemoResponse('scam-check', electricityMsg, 'hi');
    assert.strictEqual(result.riskLevel, 'High Risk');
    assert.strictEqual(result.explanation.includes('बिजली'), true);
  });
});
