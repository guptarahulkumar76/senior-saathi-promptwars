'use client';

import React from 'react';
import { useSenior } from '@/context/SeniorContext';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { AskSaathi } from '@/components/AskSaathi';
import { ScamChecker } from '@/components/ScamChecker';
import { Reminders } from '@/components/Reminders';
import { EmergencyModal } from '@/components/EmergencyModal';
import { Navigation } from '@/components/Navigation';
import { Heart, ShieldCheck } from 'lucide-react';

export default function Home() {
  const { activeTab, highContrast, language } = useSenior();
  const isHindi = language === 'hi';

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'ask':
        return <AskSaathi />;
      case 'scam':
        return <ScamChecker />;
      case 'reminders':
        return <Reminders />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:p-3 focus:bg-blue-600 focus:text-white focus:rounded-xl focus:font-extrabold"
      >
        {isHindi ? 'सीधे मुख्य सामग्री पर जाएं' : 'Skip to main content'}
      </a>

      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 pb-28 outline-none"
      >
        {renderActiveTab()}
      </main>

      {/* Emergency Modal Component */}
      <EmergencyModal />

      {/* Bottom Sticky Navigation */}
      <Navigation />

      {/* Accessible Footer */}
      <footer
        role="contentinfo"
        className={`pb-20 pt-6 border-t text-center text-xs sm:text-sm font-medium transition-colors ${
          highContrast
            ? 'bg-black border-amber-300 text-amber-200'
            : 'bg-white/80 border-amber-200 text-slate-500'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-1.5 font-bold text-slate-700 dark:text-neutral-300">
            <span>Senior Saathi (वरिष्ठ साथी)</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              {isHindi ? 'वरिष्ठ नागरिकों के लिए प्रेमपूर्वक निर्मित' : 'Built with care for seniors'}
              <Heart className="w-4 h-4 text-red-500 fill-red-500 inline" />
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            {isHindi
              ? 'आपातकाल में तुरंत 112 डायल करें। साइबर धोखाधड़ी होने पर तुरंत 1930 पर कॉल करें।'
              : 'In immediate life danger, dial 112 directly. To report cyber financial fraud, dial 1930.'}
          </p>
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PromptWars Warm-up Challenge: AI for Senior Citizens</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
