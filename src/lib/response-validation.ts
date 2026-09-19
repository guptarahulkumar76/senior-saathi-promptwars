import type { NextStepResult, ScamAnalysisResult, SimplifyResult, TaskType } from './types';

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string');

export function isScamAnalysisResult(value: unknown): value is ScamAnalysisResult {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<ScamAnalysisResult>;
  return (
    ['Likely Safe', 'Be Careful', 'High Risk'].includes(item.riskLevel || '') &&
    typeof item.confidenceScore === 'number' &&
    item.confidenceScore >= 0 &&
    item.confidenceScore <= 100 &&
    isStringArray(item.warningSigns) &&
    typeof item.explanation === 'string' &&
    isStringArray(item.recommendedActions) &&
    typeof item.hasFinancialDanger === 'boolean'
  );
}

export function isSimplifyResult(value: unknown): value is SimplifyResult {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<SimplifyResult>;
  return (
    typeof item.summary === 'string' &&
    isStringArray(item.keyPoints) &&
    (item.safeGuidance === undefined || typeof item.safeGuidance === 'string') &&
    (item.disclaimer === undefined || typeof item.disclaimer === 'string')
  );
}

export function isNextStepResult(value: unknown): value is NextStepResult {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<NextStepResult>;
  return (
    typeof item.situation === 'string' &&
    isStringArray(item.steps) &&
    (item.contactToReach === undefined || typeof item.contactToReach === 'string') &&
    (item.emergencyNotice === undefined || typeof item.emergencyNotice === 'string')
  );
}

export function isValidTaskResponse(task: TaskType, value: unknown): boolean {
  if (task === 'scam-check') return isScamAnalysisResult(value);
  if (task === 'next-step') return isNextStepResult(value);
  return isSimplifyResult(value);
}

