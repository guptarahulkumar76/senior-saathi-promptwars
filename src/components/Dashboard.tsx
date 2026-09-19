'use client';

import React from 'react';
import { useSenior } from '@/context/SeniorContext';
import {
  MessageSquareText,
  ShieldAlert,
  BellRing,
  PhoneCall,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { PrivacyDisclaimer } from './PrivacyDisclaimer';

export const Dashboard: React.FC = () => {
  const {
    highContrast,
    language,
    setActiveTab,
    setEmergencyModalOpen,
    reminders,
    toggleReminder,
    proactiveSuggestion,
  } = useSenior();

  const isHindi = language === 'hi';

  // Format today's date in senior friendly style
  const today = new Date();
  const dateFormatted = today.toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const todayReminders = reminders.filter((r) => !r.completed).slice(0, 3);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Warm Namaste Greeting Hero */}
      <section
        aria-labelledby="dashboard-greeting"
        className={`rounded-3xl p-6 sm:p-9 border-2 shadow-sm transition-all text-center sm:text-left ${
          highContrast
            ? 'bg-neutral-950 border-amber-400 text-white'
            : 'bg-gradient-to-br from-amber-100/70 via-orange-50/50 to-amber-50 border-amber-300'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base font-bold text-amber-800 dark:text-amber-300">
              <Calendar className="w-5 h-5" />
              <span>{dateFormatted}</span>
            </div>
            <h1
              id="dashboard-greeting"
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-amber-950 dark:text-white"
            >
              {isHindi ? 'नमस्ते! आज मैं आपकी क्या मदद कर सकता हूँ?' : 'Namaste! How can I help you today?'}
            </h1>
            <p className="text-lg sm:text-xl font-medium text-slate-700 dark:text-neutral-200">
              {isHindi
                ? 'सीनियर साथी आपका सुरक्षित साथी है। कोई भी सवाल पूछें, संदिग्ध संदेश जांचें, या दवा याद रखें।'
                : 'Your patient and trustworthy AI companion for safe digital life, reminders, and help.'}
            </p>
          </div>

          <div className="shrink-0 flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-amber-600 text-white shadow-lg text-4xl">
            🙏
          </div>
        </div>
      </section>

      {/* Proactive Smart Suggestion Banner */}
      {proactiveSuggestion && (
        <section
          role="region"
          aria-label={isHindi ? 'स्मार्ट सुझाव' : 'Helpful Suggestion'}
          className={`rounded-2xl p-5 sm:p-6 border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
            highContrast
              ? 'bg-neutral-900 border-amber-300 text-amber-200'
              : 'bg-amber-100/80 border-amber-400 text-amber-950'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-amber-600 text-white rounded-2xl shrink-0 shadow">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-0.5">
                {isHindi ? 'साथी का सक्रिय सुझाव' : 'Saathi Suggestion'}
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold">{proactiveSuggestion.title}</h3>
              <p className="text-base font-medium opacity-90 mt-0.5">
                {proactiveSuggestion.description}
              </p>
            </div>
          </div>

          {proactiveSuggestion.actionTab && (
            <button
              onClick={() => setActiveTab(proactiveSuggestion.actionTab!)}
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-base flex items-center gap-2 shrink-0 shadow-md focus:ring-4 focus:ring-amber-300 transition-transform active:scale-95"
            >
              <span>{isHindi ? 'समीक्षा करें' : 'Review Now'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </section>
      )}

      {/* The Four Core Large Action Cards */}
      <section aria-label="Core Features">
        <h2 className="sr-only">Main Options</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {/* Card 1: Ask Saathi */}
          <button
            onClick={() => setActiveTab('ask')}
            className={`p-6 sm:p-7 rounded-3xl border-2 text-left transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md focus:ring-4 focus:ring-amber-400 flex flex-col justify-between gap-5 ${
              highContrast
                ? 'bg-neutral-950 border-amber-400 text-white hover:bg-neutral-900'
                : 'bg-white border-amber-200 hover:border-amber-400 hover:shadow-lg'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="p-4 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-2xl">
                <MessageSquareText className="w-9 h-9" />
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-amber-100 dark:bg-neutral-800 text-amber-900 dark:text-amber-300 rounded-full">
                {isHindi ? 'आवाज और सवाल' : 'Voice & Text'}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-amber-950 dark:text-white">
                {isHindi ? 'साथी से पूछें' : 'Ask Saathi'}
              </h3>
              <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-neutral-300 mt-1">
                {isHindi
                  ? 'बोलकर या लिखकर सवाल पूछें। कठिन बातों का सरल और साफ जवाब पाएं।'
                  : 'Speak or type any question. Get short, clear, jargon-free answers.'}
              </p>
            </div>
            <div className="flex items-center gap-2 font-extrabold text-base text-amber-700 dark:text-amber-400 pt-2 border-t border-slate-100 dark:border-neutral-800">
              <span>{isHindi ? 'बातचीत शुरू करें' : 'Open Ask & Simplify'}</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>

          {/* Card 2: Check a Message */}
          <button
            onClick={() => setActiveTab('scam')}
            className={`p-6 sm:p-7 rounded-3xl border-2 text-left transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md focus:ring-4 focus:ring-red-400 flex flex-col justify-between gap-5 ${
              highContrast
                ? 'bg-neutral-950 border-amber-400 text-white hover:bg-neutral-900'
                : 'bg-white border-red-200 hover:border-red-400 hover:shadow-lg'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="p-4 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-2xl">
                <ShieldAlert className="w-9 h-9" />
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-red-100 dark:bg-neutral-800 text-red-800 dark:text-red-300 rounded-full">
                {isHindi ? 'धोखाधड़ी से बचाव' : 'Scam Defense'}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-red-900 dark:text-white">
                {isHindi ? 'संदेश की जाँच करें' : 'Check a Message'}
              </h3>
              <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-neutral-300 mt-1">
                {isHindi
                  ? 'बिजली बिल, लॉटरी, या बैंक का SMS चिपकाकर तुरंत सुरक्षा स्तर जांचें।'
                  : 'Paste suspicious SMS, WhatsApp offers, or emails to detect scams.'}
              </p>
            </div>
            <div className="flex items-center gap-2 font-extrabold text-base text-red-700 dark:text-red-400 pt-2 border-t border-slate-100 dark:border-neutral-800">
              <span>{isHindi ? 'संदेश जांचें' : 'Scan Message Now'}</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>

          {/* Card 3: My Reminders */}
          <button
            onClick={() => setActiveTab('reminders')}
            className={`p-6 sm:p-7 rounded-3xl border-2 text-left transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md focus:ring-4 focus:ring-blue-400 flex flex-col justify-between gap-5 ${
              highContrast
                ? 'bg-neutral-950 border-amber-400 text-white hover:bg-neutral-900'
                : 'bg-white border-blue-200 hover:border-blue-400 hover:shadow-lg'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="p-4 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-2xl">
                <BellRing className="w-9 h-9" />
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-blue-100 dark:bg-neutral-800 text-blue-800 dark:text-blue-300 rounded-full">
                {isHindi ? 'दवा व बिल' : 'Meds & Bills'}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-blue-950 dark:text-white">
                {isHindi ? 'मेरी याददाश्त' : 'My Reminders'}
              </h3>
              <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-neutral-300 mt-1">
                {isHindi
                  ? 'दवाइयों के समय, डॉक्टर मुलाकात, और बिल भुगतान को कभी न भूलें।'
                  : 'Track daily medicines, doctor appointments, and utility bills.'}
              </p>
            </div>
            <div className="flex items-center gap-2 font-extrabold text-base text-blue-700 dark:text-blue-400 pt-2 border-t border-slate-100 dark:border-neutral-800">
              <span>{isHindi ? 'रिमाइंडर देखें' : 'View Reminders'}</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>

          {/* Card 4: Emergency Help */}
          <button
            onClick={() => setEmergencyModalOpen(true)}
            className={`p-6 sm:p-7 rounded-3xl border-2 text-left transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md focus:ring-4 focus:ring-red-400 flex flex-col justify-between gap-5 ${
              highContrast
                ? 'bg-neutral-950 border-red-500 text-white hover:bg-neutral-900'
                : 'bg-red-50/70 border-red-300 hover:border-red-500 hover:shadow-lg'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="p-4 bg-red-600 text-white rounded-2xl shadow">
                <PhoneCall className="w-9 h-9 animate-bounce" />
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-red-600 text-white rounded-full">
                {isHindi ? 'आपातकाल' : 'Urgent SOS'}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-red-700 dark:text-red-400">
                {isHindi ? 'आपातकालीन सहायता' : 'Emergency Help'}
              </h3>
              <p className="text-base sm:text-lg font-medium text-slate-700 dark:text-neutral-200 mt-1">
                {isHindi
                  ? '112, एम्बुलेंस, वरिष्ठ नागरिक हेल्पलाइन और परिवार को एक क्लिक में कॉल करें।'
                  : 'One-tap direct access to 112, Ambulance, Elder Helpline, and Caregiver.'}
              </p>
            </div>
            <div className="flex items-center gap-2 font-extrabold text-base text-red-700 dark:text-red-400 pt-2 border-t border-red-200 dark:border-neutral-800">
              <span>{isHindi ? 'आपातकालीन डायल खोलें' : 'Open Emergency Helplines'}</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>
        </div>
      </section>

      {/* Today's Reminders Quick Section */}
      {todayReminders.length > 0 && (
        <section
          aria-labelledby="today-reminders-title"
          className={`rounded-3xl p-6 border-2 transition-all shadow-sm ${
            highContrast ? 'bg-neutral-950 border-amber-400 text-white' : 'bg-white border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-neutral-800 mb-4">
            <div className="flex items-center gap-2 text-xl font-extrabold">
              <Clock className="w-6 h-6 text-amber-600" />
              <h3 id="today-reminders-title">
                {isHindi ? 'आज के बाकी काम' : "Today's Pending Reminders"}
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('reminders')}
              className="text-sm font-bold text-amber-700 dark:text-amber-300 hover:underline p-1 min-h-[44px]"
            >
              {isHindi ? 'सभी देखें' : 'View All'} →
            </button>
          </div>

          <div className="space-y-3">
            {todayReminders.map((rem) => (
              <div
                key={rem.id}
                className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-neutral-800 flex items-center justify-between gap-3 bg-amber-50/40 dark:bg-neutral-900"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleReminder(rem.id)}
                    className="p-1 rounded-lg focus:ring-4 focus:ring-blue-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={`Mark ${rem.title} completed`}
                  >
                    <CheckCircle2 className="w-7 h-7 text-slate-400 hover:text-emerald-600" />
                  </button>
                  <div>
                    <h4 className="font-extrabold text-base sm:text-lg">{rem.title}</h4>
                    <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-neutral-400">
                      ⏰ {rem.time} • {rem.period}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Privacy & Safety Disclaimer */}
      <PrivacyDisclaimer />
    </div>
  );
};
