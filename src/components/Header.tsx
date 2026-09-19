'use client';

import React from 'react';
import { useSenior } from '@/context/SeniorContext';
import { HeartHandshake, Eye, VolumeX, PhoneCall } from 'lucide-react';
import { FontSize } from '@/lib/types';

export const Header: React.FC = () => {
  const {
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    language,
    setLanguage,
    setActiveTab,
    setEmergencyModalOpen,
    isSpeaking,
    stopAudio,
  } = useSenior();

  const isHindi = language === 'hi';

  const fontSizes: { label: string; value: FontSize; aria: string }[] = [
    { label: 'A', value: 'normal', aria: 'Standard font size' },
    { label: 'A+', value: 'large', aria: 'Large font size' },
    { label: 'A++', value: 'xlarge', aria: 'Extra large font size' },
  ];

  return (
    <header
      role="banner"
      className={`sticky top-0 z-30 shadow-md transition-colors border-b ${
        highContrast
          ? 'bg-black border-amber-300'
          : 'bg-white/95 backdrop-blur border-amber-200'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Title */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 text-left focus:ring-4 focus:ring-blue-600 rounded-lg p-1 -m-1"
          aria-label="Senior Saathi Home"
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-sm ${
              highContrast
                ? 'bg-amber-400 text-black border-2 border-white'
                : 'bg-amber-600 text-white'
            }`}
          >
            <HeartHandshake className="w-7 h-7" aria-hidden="true" />
          </div>
          <div>
            <span
              className={`block font-extrabold tracking-tight ${
                highContrast ? 'text-amber-300 text-2xl' : 'text-amber-900 text-2xl'
              }`}
            >
              Senior Saathi
            </span>
            <span
              className={`block text-xs font-semibold ${
                highContrast ? 'text-white' : 'text-amber-700'
              }`}
            >
              {isHindi ? 'आपका सच्चा और सुरक्षित डिजिटल साथी' : 'Your Caring & Safe AI Companion'}
            </span>
          </div>
        </button>

        {/* Global Controls: Audio stop, Font Size, Contrast, Language, SOS */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Active Audio Indicator / Stop Button */}
          {isSpeaking && (
            <button
              onClick={stopAudio}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-red-600 text-white font-bold animate-pulse hover:bg-red-700 focus:ring-4 focus:ring-red-300"
              aria-label={isHindi ? 'आवाज बंद करें' : 'Stop reading aloud'}
              title={isHindi ? 'आवाज बंद करें' : 'Stop reading aloud'}
            >
              <VolumeX className="w-5 h-5" />
              <span className="text-sm font-semibold">{isHindi ? 'रोकें' : 'Stop Voice'}</span>
            </button>
          )}

          {/* Font Size Group */}
          <div
            role="group"
            aria-label="Text size options"
            className={`flex items-center rounded-xl p-1 border ${
              highContrast ? 'border-amber-400 bg-neutral-900' : 'border-slate-300 bg-slate-100'
            }`}
          >
            {fontSizes.map((f) => (
              <button
                key={f.value}
                onClick={() => setFontSize(f.value)}
                className={`min-w-[44px] h-[40px] px-2 rounded-lg font-bold transition-all ${
                  fontSize === f.value
                    ? highContrast
                      ? 'bg-amber-400 text-black shadow-sm'
                      : 'bg-amber-700 text-white shadow-sm'
                    : highContrast
                    ? 'text-amber-200 hover:bg-neutral-800'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
                aria-pressed={fontSize === f.value}
                aria-label={f.aria}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* High Contrast Mode Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`min-h-[44px] px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 border transition-all ${
              highContrast
                ? 'bg-amber-400 text-black border-white'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }`}
            aria-label={
              highContrast
                ? isHindi
                  ? 'सामान्य रंग मोड पर वापस जाएं'
                  : 'Switch to Standard Warm Theme'
                : isHindi
                ? 'हाई-कंट्रास्ट मोड चालू करें'
                : 'Switch to High Contrast Dark Mode'
            }
          >
            <Eye className="w-5 h-5" />
            <span className="text-xs sm:text-sm font-bold">
              {highContrast ? (isHindi ? 'कंट्रास्ट: ऑन' : 'High Contrast') : (isHindi ? 'कंट्रास्ट' : 'Contrast')}
            </span>
          </button>

          {/* Language Toggle */}
          <div
            role="group"
            aria-label="Language selection"
            className={`flex items-center rounded-xl p-1 border ${
              highContrast ? 'border-amber-400 bg-neutral-900' : 'border-slate-300 bg-slate-100'
            }`}
          >
            <button
              onClick={() => setLanguage('en')}
              className={`min-w-[44px] h-[40px] px-2.5 rounded-lg font-bold text-sm transition-all ${
                language === 'en'
                  ? highContrast
                    ? 'bg-amber-400 text-black shadow'
                    : 'bg-amber-700 text-white shadow'
                  : highContrast
                  ? 'text-amber-200 hover:bg-neutral-800'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
              aria-pressed={language === 'en'}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`min-w-[44px] h-[40px] px-2.5 rounded-lg font-bold text-sm transition-all ${
                language === 'hi'
                  ? highContrast
                    ? 'bg-amber-400 text-black shadow'
                    : 'bg-amber-700 text-white shadow'
                  : highContrast
                  ? 'text-amber-200 hover:bg-neutral-800'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
              aria-pressed={language === 'hi'}
            >
              हिंदी
            </button>
          </div>

          {/* Emergency SOS Button */}
          <button
            onClick={() => setEmergencyModalOpen(true)}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold flex items-center gap-2 shadow-md focus:ring-4 focus:ring-red-400 transition-transform active:scale-95"
            aria-label={isHindi ? 'आपातकालीन सहायता (SOS)' : 'Emergency Help (SOS)'}
          >
            <PhoneCall className="w-5 h-5 animate-bounce" />
            <span className="tracking-wide">SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
