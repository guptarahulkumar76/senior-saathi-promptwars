'use client';

import React from 'react';
import { useSenior, ActiveTab } from '@/context/SeniorContext';
import {
  Home,
  MessageSquareText,
  ShieldAlert,
  BellRing,
  PhoneCall,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setEmergencyModalOpen,
    highContrast,
    language,
  } = useSenior();

  const isHindi = language === 'hi';

  const navItems: {
    id: ActiveTab | 'sos';
    label: string;
    hindiLabel: string;
    icon: React.ReactNode;
    isSos?: boolean;
  }[] = [
    {
      id: 'dashboard',
      label: 'Home',
      hindiLabel: 'मुख्य पृष्ठ',
      icon: <Home className="w-6 h-6" />,
    },
    {
      id: 'ask',
      label: 'Ask Saathi',
      hindiLabel: 'पूछें व समझें',
      icon: <MessageSquareText className="w-6 h-6" />,
    },
    {
      id: 'scam',
      label: 'Scam Check',
      hindiLabel: 'संदेश जाँच',
      icon: <ShieldAlert className="w-6 h-6" />,
    },
    {
      id: 'reminders',
      label: 'Reminders',
      hindiLabel: 'याददाश्त',
      icon: <BellRing className="w-6 h-6" />,
    },
    {
      id: 'sos',
      label: 'Emergency',
      hindiLabel: 'आपातकाल',
      icon: <PhoneCall className="w-6 h-6 animate-pulse" />,
      isSos: true,
    },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Main application navigation"
      className={`fixed bottom-0 left-0 right-0 z-20 border-t transition-all shadow-lg ${
        highContrast
          ? 'bg-black border-amber-300'
          : 'bg-white/95 backdrop-blur-md border-amber-200'
      }`}
    >
      <div className="max-w-4xl mx-auto px-2 py-2 flex items-center justify-around gap-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          if (item.isSos) {
            return (
              <button
                key={item.id}
                onClick={() => setEmergencyModalOpen(true)}
                className="flex flex-col items-center justify-center p-2 rounded-2xl min-h-[48px] min-w-[56px] bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold focus:ring-4 focus:ring-red-400 transition-all shadow-md"
                aria-label={isHindi ? item.hindiLabel : item.label}
              >
                {item.icon}
                <span className="text-[11px] sm:text-xs font-black tracking-wide mt-0.5">
                  {isHindi ? item.hindiLabel : item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl min-h-[48px] min-w-[56px] transition-all focus:ring-4 focus:ring-blue-500 ${
                isActive
                  ? highContrast
                    ? 'bg-amber-400 text-black font-extrabold shadow'
                    : 'bg-amber-100/90 text-amber-950 font-extrabold shadow-sm'
                  : highContrast
                  ? 'text-amber-200 hover:bg-neutral-900'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.icon}
              <span className="text-[11px] sm:text-xs font-bold mt-0.5">
                {isHindi ? item.hindiLabel : item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
