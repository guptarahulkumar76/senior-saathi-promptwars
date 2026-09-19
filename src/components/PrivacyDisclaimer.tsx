'use client';

import React from 'react';
import { useSenior } from '@/context/SeniorContext';
import { ShieldCheck, Lock, AlertTriangle } from 'lucide-react';

export const PrivacyDisclaimer: React.FC = () => {
  const { highContrast, language } = useSenior();
  const isHindi = language === 'hi';

  return (
    <div
      role="region"
      aria-label={isHindi ? 'सुरक्षा और गोपनीयता सूचना' : 'Security and Privacy Notice'}
      className={`rounded-2xl p-4 sm:p-5 border transition-all my-6 ${
        highContrast
          ? 'bg-neutral-900 border-amber-400 text-amber-200'
          : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`p-2.5 rounded-xl shrink-0 ${
            highContrast
              ? 'bg-amber-400 text-black'
              : 'bg-emerald-600 text-white'
          }`}
        >
          <ShieldCheck className="w-6 h-6" aria-hidden="true" />
        </div>

        <div className="space-y-1.5 flex-1">
          <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
            <Lock className="w-4 h-4" />
            {isHindi ? 'आपकी सुरक्षा और गोपनीयता सर्वोपरि है' : 'Your Privacy & Safety Are Protected'}
          </h3>
          <p className="text-sm sm:text-base leading-relaxed">
            {isHindi ? (
              <>
                सीनियर साथी आपकी निजी बातचीत को कभी भी रिकॉर्ड या स्टोर नहीं करता।{' '}
                <strong className="underline">कृपया कभी भी अपना बैंक पासवर्ड, OTP, UPI पिन, या CVV यहाँ या किसी भी अज्ञात व्यक्ति को न बताएं।</strong>{' '}
                असली बैंक अधिकारी भी कभी गुप्त पिन या पासवर्ड नहीं मांगते।
              </>
            ) : (
              <>
                Senior Saathi does not store or share your personal queries.{' '}
                <strong className="underline">Please never enter or share your Bank Passwords, OTP, UPI PIN, or Card CVV here or with any caller.</strong>{' '}
                Genuine bank staff or government officers will NEVER ask for your secret PIN or OTP.
              </>
            )}
          </p>

          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold mt-1 ${
              highContrast
                ? 'bg-black text-amber-300 border border-amber-400'
                : 'bg-emerald-100/90 text-emerald-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              {isHindi
                ? 'सीनियर साथी केवल सहायक जानकारी देता है, यह डॉक्टर या बैंक सलाहकार का विकल्प नहीं है।'
                : 'Senior Saathi provides informational support and does not replace medical or financial professionals.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
