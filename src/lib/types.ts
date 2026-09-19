export type Language = 'en' | 'hi';

export type FontSize = 'normal' | 'large' | 'xlarge';

export type TaskType = 'simplify' | 'scam-check' | 'next-step';

export type ScamRiskLevel = 'Likely Safe' | 'Be Careful' | 'High Risk';

export interface ScamAnalysisResult {
  riskLevel: ScamRiskLevel;
  confidenceScore: number;
  warningSigns: string[];
  explanation: string;
  recommendedActions: string[];
  hasFinancialDanger: boolean;
  isDemoMode?: boolean;
}

export interface SimplifyResult {
  summary: string;
  keyPoints: string[];
  safeGuidance?: string;
  disclaimer?: string;
  isDemoMode?: boolean;
}

export interface NextStepResult {
  situation: string;
  steps: string[];
  contactToReach?: string;
  emergencyNotice?: string;
  isDemoMode?: boolean;
}

export type ReminderCategory = 'medicine' | 'appointment' | 'bill' | 'custom';
export type ReminderPeriod = 'morning' | 'afternoon' | 'evening' | 'night' | 'custom';

export interface Reminder {
  id: string;
  title: string;
  category: ReminderCategory;
  time: string; // e.g., "08:00"
  period: ReminderPeriod;
  notes?: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string; // YYYY-MM-DD
}

export interface CaregiverContact {
  name: string;
  relation: string;
  phoneNumber: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  isDemoMode?: boolean;
}
