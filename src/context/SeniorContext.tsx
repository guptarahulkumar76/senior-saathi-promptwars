'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  FontSize,
  Language,
  Reminder,
  CaregiverContact,
} from '@/lib/types';
import { StorageService } from '@/lib/storage';
import { speakText, stopSpeaking } from '@/lib/speech';

export type ActiveTab = 'dashboard' | 'ask' | 'scam' | 'reminders' | 'emergency';

interface SeniorContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  emergencyModalOpen: boolean;
  setEmergencyModalOpen: (open: boolean) => void;
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  caregiver: CaregiverContact;
  updateCaregiver: (caregiver: CaregiverContact) => void;
  isSpeaking: boolean;
  readAloud: (text: string) => void;
  stopAudio: () => void;
  proactiveSuggestion: {
    title: string;
    description: string;
    actionTab?: ActiveTab;
    targetReminderId?: string;
  };
}

const SeniorContext = createContext<SeniorContextType | undefined>(undefined);

export const SeniorProvider = ({ children }: { children: ReactNode }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>('normal');
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [language, setLanguageState] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [emergencyModalOpen, setEmergencyModalOpen] = useState<boolean>(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [caregiver, setCaregiverState] = useState<CaregiverContact>({
    name: 'Priya (Daughter)',
    relation: 'Daughter / प्राथमिक देखभालकर्ता',
    phoneNumber: '+91 98765 43210',
  });
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize from LocalStorage after hydration
  useEffect(() => {
    const loadedSize = StorageService.getFontSize();
    const loadedContrast = StorageService.getHighContrast();
    const loadedLang = StorageService.getLanguage();
    const loadedReminders = StorageService.getReminders();
    const loadedCaregiver = StorageService.getCaregiver();

    React.startTransition(() => {
      setFontSizeState(loadedSize);
      setHighContrastState(loadedContrast);
      setLanguageState(loadedLang);
      setReminders(loadedReminders);
      setCaregiverState(loadedCaregiver);
      setIsInitialized(true);
    });
  }, []);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    StorageService.saveFontSize(size);
  };

  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
    StorageService.saveHighContrast(enabled);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    StorageService.saveLanguage(lang);
  };

  const updateCaregiver = (contact: CaregiverContact) => {
    setCaregiverState(contact);
    StorageService.saveCaregiver(contact);
  };

  const addReminder = (rem: Omit<Reminder, 'id' | 'createdAt'>) => {
    const newReminder: Reminder = {
      ...rem,
      id: `rem-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newReminder, ...reminders];
    setReminders(updated);
    StorageService.saveReminders(updated);
  };

  const toggleReminder = (id: string) => {
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, completed: !r.completed } : r
    );
    setReminders(updated);
    StorageService.saveReminders(updated);
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    StorageService.saveReminders(updated);
  };

  const readAloud = (text: string) => {
    setIsSpeaking(true);
    speakText(
      text,
      language,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  const stopAudio = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  // Determine proactive suggestion based on current time and incomplete reminders
  const proactiveSuggestion = useMemo(() => {
    const isHindi = language === 'hi';
    const now = new Date();
    const hour = now.getHours();

    let currentPeriod: 'morning' | 'afternoon' | 'evening' | 'night' = 'morning';
    if (hour >= 12 && hour < 17) currentPeriod = 'afternoon';
    else if (hour >= 17 && hour < 21) currentPeriod = 'evening';
    else if (hour >= 21 || hour < 5) currentPeriod = 'night';

    // Find incomplete medicine or appointment reminder for current or upcoming period
    const pendingMedicine = reminders.find(
      (r) => !r.completed && r.category === 'medicine' && (r.period === currentPeriod || r.period === 'morning')
    );

    if (pendingMedicine) {
      return {
        title: isHindi
          ? `दवा की याद: ${pendingMedicine.title}`
          : `Medicine Reminder: ${pendingMedicine.title}`,
        description: isHindi
          ? `आपके ${currentPeriod === 'morning' ? 'सुबह' : currentPeriod === 'afternoon' ? 'दोपहर' : 'शाम'} की दवा का समय हो गया है। क्या आपने इसे ले लिया है?`
          : `You have a medicine scheduled for this ${currentPeriod}. Would you like to review and mark it complete?`,
        actionTab: 'reminders' as ActiveTab,
        targetReminderId: pendingMedicine.id,
      };
    }

    const pendingBillOrAppt = reminders.find((r) => !r.completed && r.category !== 'custom');
    if (pendingBillOrAppt) {
      return {
        title: isHindi
          ? `आगामी कार्य: ${pendingBillOrAppt.title}`
          : `Upcoming Task: ${pendingBillOrAppt.title}`,
        description: isHindi
          ? `आपके पास आज का एक कार्य शेष है। समीक्षा करने के लिए यहाँ टैप करें।`
          : `You have an active reminder scheduled for today. Tap here to review details.`,
        actionTab: 'reminders' as ActiveTab,
        targetReminderId: pendingBillOrAppt.id,
      };
    }

    return {
      title: isHindi ? 'संदेश सुरक्षा जांच' : 'Digital Safety Tip',
      description: isHindi
        ? 'क्या आपको बिजली बिल या लॉटरी का कोई संदिग्ध संदेश मिला है? "संदेश की जाँच" पर टैप करके पुष्टि करें।'
        : 'Received an unfamiliar message or bill payment threat? Tap "Check a Message" to safely analyze it.',
      actionTab: 'scam' as ActiveTab,
    };
  }, [reminders, language]);

  return (
    <SeniorContext.Provider
      value={{
        fontSize,
        setFontSize,
        highContrast,
        setHighContrast,
        language,
        setLanguage,
        activeTab,
        setActiveTab,
        emergencyModalOpen,
        setEmergencyModalOpen,
        reminders,
        addReminder,
        toggleReminder,
        deleteReminder,
        caregiver,
        updateCaregiver,
        isSpeaking,
        readAloud,
        stopAudio,
        proactiveSuggestion,
      }}
    >
      <div
        className={`min-h-screen transition-colors duration-200 ${
          highContrast ? 'high-contrast bg-black text-amber-300' : 'bg-amber-50/40 text-slate-900'
        } ${
          fontSize === 'xlarge'
            ? 'text-xl md:text-2xl font-size-xl'
            : fontSize === 'large'
            ? 'text-lg md:text-xl font-size-lg'
            : 'text-base md:text-lg font-size-normal'
        }`}
        data-initialized={isInitialized}
      >
        {children}
      </div>
    </SeniorContext.Provider>
  );
};

export const useSenior = () => {
  const context = useContext(SeniorContext);
  if (!context) {
    throw new Error('useSenior must be used within a SeniorProvider');
  }
  return context;
};
