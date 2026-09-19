import { Reminder, CaregiverContact, FontSize, Language } from './types';

const STORAGE_KEYS = {
  REMINDERS: 'senior_saathi_reminders',
  FONT_SIZE: 'senior_saathi_font_size',
  HIGH_CONTRAST: 'senior_saathi_high_contrast',
  LANGUAGE: 'senior_saathi_language',
  CAREGIVER: 'senior_saathi_caregiver',
};

const DEFAULT_REMINDERS: Reminder[] = [
  {
    id: 'rem-1',
    title: 'Blood Pressure Tablet (Amlodipine 5mg)',
    category: 'medicine',
    time: '08:30',
    period: 'morning',
    notes: 'Take with warm water after light breakfast',
    completed: false,
    createdAt: new Date().toISOString(),
    dueDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'rem-2',
    title: 'Dr. Verma Eye Clinic Visit',
    category: 'appointment',
    time: '14:30',
    period: 'afternoon',
    notes: 'Carry previous prescription & glasses',
    completed: false,
    createdAt: new Date().toISOString(),
    dueDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'rem-3',
    title: 'Electricity Bill Payment Reminder',
    category: 'bill',
    time: '18:00',
    period: 'evening',
    notes: 'Pay online via official electricity portal or ask daughter Priya',
    completed: false,
    createdAt: new Date().toISOString(),
    dueDate: new Date().toISOString().split('T')[0],
  },
];

const DEFAULT_CAREGIVER: CaregiverContact = {
  name: 'Priya (Daughter)',
  relation: 'Daughter / प्राथमिक देखभालकर्ता',
  phoneNumber: '+91 98765 43210',
};

function safeGetItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota or disabled cookies
  }
}

export const StorageService = {
  getReminders(): Reminder[] {
    const stored = safeGetItem<Reminder[] | null>(STORAGE_KEYS.REMINDERS, null);
    if (stored === null) {
      // First visit: initialize with helpful starter reminders
      safeSetItem(STORAGE_KEYS.REMINDERS, DEFAULT_REMINDERS);
      return DEFAULT_REMINDERS;
    }
    return stored;
  },

  saveReminders(reminders: Reminder[]): void {
    safeSetItem(STORAGE_KEYS.REMINDERS, reminders);
  },

  getFontSize(): FontSize {
    return safeGetItem<FontSize>(STORAGE_KEYS.FONT_SIZE, 'normal');
  },

  saveFontSize(size: FontSize): void {
    safeSetItem(STORAGE_KEYS.FONT_SIZE, size);
  },

  getHighContrast(): boolean {
    return safeGetItem<boolean>(STORAGE_KEYS.HIGH_CONTRAST, false);
  },

  saveHighContrast(enabled: boolean): void {
    safeSetItem(STORAGE_KEYS.HIGH_CONTRAST, enabled);
  },

  getLanguage(): Language {
    return safeGetItem<Language>(STORAGE_KEYS.LANGUAGE, 'en');
  },

  saveLanguage(lang: Language): void {
    safeSetItem(STORAGE_KEYS.LANGUAGE, lang);
  },

  getCaregiver(): CaregiverContact {
    return safeGetItem<CaregiverContact>(STORAGE_KEYS.CAREGIVER, DEFAULT_CAREGIVER);
  },

  saveCaregiver(caregiver: CaregiverContact): void {
    safeSetItem(STORAGE_KEYS.CAREGIVER, caregiver);
  },
};
