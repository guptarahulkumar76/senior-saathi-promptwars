'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSenior } from '@/context/SeniorContext';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Clipboard,
  Search,
  Volume2,
  VolumeX,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ScamAnalysisResult, ScamRiskLevel } from '@/lib/types';
import { requestGemini } from '@/lib/api-client';

export const ScamChecker: React.FC = () => {
  const {
    highContrast,
    language,
    readAloud,
    stopAudio,
    isSpeaking,
  } = useSenior();

  const isHindi = language === 'hi';

  const [messageText, setMessageText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScamAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestControllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => requestControllerRef.current?.abort(), []);

  // Pre-configured realistic test cases
  const sampleMessages = isHindi
    ? [
        {
          label: '🔴 बिजली बिल कटने का फर्जी SMS',
          riskExpected: 'High Risk',
          text: 'प्रिय ग्राहक, आपका बिजली बिल बकाया है। आज रात 9:30 बजे बिजली काट दी जाएगी। तुरंत अधिकारी से 9876543210 पर संपर्क करें या ऐप लिंक खोलें।',
        },
        {
          label: '🟡 KBC / व्हाट्सएप लॉटरी संदेश',
          riskExpected: 'Be Careful',
          text: 'बधाई हो! आपके व्हाट्सएप नंबर ने KBC लकी ड्रा में 25 लाख जीते हैं। अपना इनाम पाने के लिए मैनेजर को कॉल करें और 1,000 रुपये रजिस्ट्रेशन शुल्क भेजें।',
        },
        {
          label: '🟢 बैंक बैलेंस का सुरक्षित SMS',
          riskExpected: 'Likely Safe',
          text: 'आपके SBI खाते में आज रुपये 15,000 जमा किए गए हैं। वर्तमान शेष राशि 42,300 रुपये है। भारतीय स्टेट बैंक।',
        },
      ]
    : [
        {
          label: '🔴 Urgent Electricity Cutoff Scam SMS',
          riskExpected: 'High Risk',
          text: 'Dear consumer, your electricity power will be disconnected tonight at 9.30 PM because your previous month bill was not updated. Please immediately contact our power officer at 9876543210 or install the verification app.',
        },
        {
          label: '🟡 WhatsApp Prize / KBC Lottery Alert',
          riskExpected: 'Be Careful',
          text: 'Congratulations! Your mobile number won 25,00,000 INR in KBC All India WhatsApp Lucky Draw. To claim your lottery cash in bank account, contact officer on WhatsApp and pay refundable processing fee of 999 INR.',
        },
        {
          label: '🟢 Genuine Bank Balance Statement SMS',
          riskExpected: 'Likely Safe',
          text: 'Your State Bank of India account XX1234 has been credited with Rs 15,000 on 19-Sep. Available balance is Rs 42,300. Never share your OTP with anyone. - SBI',
        },
      ];

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) setMessageText(text);
      }
    } catch {
      // Clipboard permissions denied
    }
  };

  const handleAnalyze = async (textToSubmit?: string) => {
    const text = textToSubmit || messageText;
    if (!text.trim()) return;

    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const data = await requestGemini<ScamAnalysisResult>(
        'scam-check',
        text,
        language,
        controller.signal
      );
      setResult(data);
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      setErrorMessage(
        err instanceof Error
          ? err.message
          : isHindi
          ? 'जाँच में त्रुटि हुई। कृपया दोबारा प्रयास करें।'
          : 'Failed to inspect message. Please try again.'
      );
    } finally {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
        setIsAnalyzing(false);
      }
    }
  };

  const handleReadAloud = () => {
    if (isSpeaking) {
      stopAudio();
      return;
    }

    if (!result) return;

    let fullSpeech = `${isHindi ? 'जोखिम स्तर:' : 'Risk Level:'} ${result.riskLevel}. `;
    fullSpeech += `${result.explanation}. `;
    if (result.warningSigns.length > 0) {
      fullSpeech += `${isHindi ? 'चेतावनी के संकेत:' : 'Warning signs:'} ${result.warningSigns.join('. ')}. `;
    }
    if (result.recommendedActions.length > 0) {
      fullSpeech += `${isHindi ? 'सुरक्षित कदम:' : 'Recommended safe steps:'} ${result.recommendedActions.join('. ')}. `;
    }
    fullSpeech += isHindi
      ? 'याद रखें: कभी भी किसी को OTP, पिन या बैंक पासवर्ड न बताएं।'
      : 'Always remember: Never share your OTP, PIN, or password with anyone.';

    readAloud(fullSpeech);
  };

  // Visual cues based on risk level (WCAG AAA compliant: shape + icon + label + color)
  const getRiskBadge = (level: ScamRiskLevel) => {
    switch (level) {
      case 'High Risk':
        return {
          title: isHindi ? '⚠️ गंभीर खतरा (High Risk) - सावधान!' : '⚠️ HIGH RISK - DANGEROUS SCAM',
          badgeClass: highContrast
            ? 'hc-badge-danger bg-red-950 border-4 border-red-500 text-red-200'
            : 'bg-red-100 border-4 border-red-600 text-red-900',
          icon: <AlertOctagon className="w-9 h-9 text-red-600 shrink-0 animate-pulse" />,
          bgColor: 'bg-red-50/70 border-red-300',
        };
      case 'Be Careful':
        return {
          title: isHindi ? '🟡 सावधानी बरतें (Be Careful) - संदिग्ध' : '🟡 BE CAREFUL - SUSPICIOUS MESSAGE',
          badgeClass: highContrast
            ? 'hc-badge-warning bg-amber-950 border-4 border-amber-400 text-amber-200'
            : 'bg-amber-100 border-4 border-amber-600 text-amber-950',
          icon: <AlertTriangle className="w-9 h-9 text-amber-600 shrink-0" />,
          bgColor: 'bg-amber-50/70 border-amber-300',
        };
      case 'Likely Safe':
      default:
        return {
          title: isHindi ? '🟢 सुरक्षित प्रतीत होता है (Likely Safe)' : '🟢 LIKELY SAFE - NORMAL NOTIFICATION',
          badgeClass: highContrast
            ? 'hc-badge-safe bg-emerald-950 border-4 border-emerald-400 text-emerald-200'
            : 'bg-emerald-100 border-4 border-emerald-600 text-emerald-950',
          icon: <ShieldCheck className="w-9 h-9 text-emerald-600 shrink-0" />,
          bgColor: 'bg-emerald-50/70 border-emerald-300',
        };
    }
  };

  const badge = result ? getRiskBadge(result.riskLevel) : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 mb-1">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {isHindi ? 'संदेश व कॉल की जाँच (Scam Checker)' : 'Scam & Message Checker'}
        </h2>
        <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-neutral-300 max-w-2xl mx-auto">
          {isHindi
            ? 'क्या आपको बिजली बिल, लॉटरी, या बैंक का कोई संदिग्ध संदेश मिला है? यहाँ चिपकाकर जांचें कि क्या यह सुरक्षित है।'
            : 'Paste any SMS, WhatsApp text, email, or offer. Gemini checks for cyber fraud and tells you how to stay safe.'}
        </p>
      </div>

      {/* Main Input Box */}
      <div
        className={`rounded-3xl p-5 sm:p-7 border-2 shadow-sm transition-all ${
          highContrast ? 'bg-neutral-950 border-amber-400' : 'bg-white border-amber-200'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <label htmlFor="scam-text-input" className="block font-extrabold text-lg sm:text-xl">
            {isHindi ? 'संदेश का पाठ यहाँ चिपकाएं:' : 'Paste Message or SMS Text Here:'}
          </label>
          <button
            type="button"
            onClick={handlePasteClipboard}
            className="min-h-[44px] px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-neutral-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-neutral-800"
          >
            <Clipboard className="w-4 h-4 text-amber-700 dark:text-amber-300" />
            <span>{isHindi ? 'क्लिपबोर्ड से चिपकाएं' : 'Paste from Clipboard'}</span>
          </button>
        </div>

        <textarea
          id="scam-text-input"
          rows={4}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder={
            isHindi
              ? 'यहाँ SMS, व्हाट्सएप संदेश या ईमेल लिखें या चिपकाएं...'
              : 'Paste SMS, WhatsApp text, or suspicious email here...'
          }
          className={`w-full p-4 rounded-2xl border-2 text-base sm:text-lg transition-all resize-none focus:outline-none focus:ring-4 focus:ring-blue-500 ${
            highContrast
              ? 'bg-black border-amber-400 text-amber-200 placeholder:text-neutral-500'
              : 'bg-amber-50/50 border-slate-300 text-slate-900 placeholder:text-slate-400'
          }`}
        />

        {/* Submit Button */}
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={() => handleAnalyze()}
            disabled={isAnalyzing || !messageText.trim()}
            className={`min-h-[50px] px-7 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2 shadow-md transition-all ${
              isAnalyzing || !messageText.trim()
                ? 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-600'
                : highContrast
                ? 'bg-amber-400 text-black hover:bg-amber-300 focus:ring-4 focus:ring-amber-200'
                : 'bg-red-600 hover:bg-red-700 text-white focus:ring-4 focus:ring-red-300'
            }`}
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spin" />
                <span>{isHindi ? 'जांच हो रही है...' : 'Analyzing Security...'}</span>
              </span>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>{isHindi ? 'सुरक्षा जाँच करें' : 'Check for Scam'}</span>
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div
            role="alert"
            className="mt-4 p-4 rounded-xl bg-red-100 border-2 border-red-400 text-red-800 font-semibold flex items-center gap-2 text-sm sm:text-base"
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* One-Tap Sample Messages */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 font-bold text-sm text-slate-600 dark:text-neutral-400 mb-2.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{isHindi ? 'जाँचने के लिए वास्तविक उदाहरण (टैप करें):' : 'Click to test real-world message examples:'}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {sampleMessages.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setMessageText(sample.text);
                  handleAnalyze(sample.text);
                }}
                className={`p-3 rounded-2xl text-left border transition-all hover:scale-[1.02] active:scale-95 flex flex-col justify-between gap-2 ${
                  highContrast
                    ? 'bg-neutral-900 border-amber-400 text-amber-300 hover:bg-neutral-800'
                    : 'bg-slate-50 border-slate-200 hover:bg-amber-50 text-slate-900'
                }`}
              >
                <div className="font-extrabold text-sm">{sample.label}</div>
                <div className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2">
                  {sample.text}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Results Display */}
      {result && badge && (
        <section
          aria-live="polite"
          className={`rounded-3xl p-6 sm:p-8 border-2 shadow-xl space-y-6 transition-all ${
            highContrast
              ? 'bg-neutral-950 border-amber-400 text-white'
              : `bg-white ${badge.bgColor}`
          }`}
        >
          {/* Risk Level Banner */}
          <div
            className={`p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4 flex-wrap ${badge.badgeClass}`}
          >
            <div className="flex items-center gap-3">
              {badge.icon}
              <div>
                <h3 className="font-extrabold text-xl sm:text-2xl tracking-tight">
                  {badge.title}
                </h3>
                <p className="text-xs sm:text-sm font-semibold opacity-90">
                  {isHindi
                    ? `विश्वसनीयता स्कोर: ${result.confidenceScore}%`
                    : `Confidence Assessment: ${result.confidenceScore}%`}
                </p>
              </div>
            </div>

            {/* Read Aloud Button */}
            <button
              onClick={handleReadAloud}
              className={`min-h-[48px] px-4 rounded-xl font-bold flex items-center gap-2 border transition-all ${
                isSpeaking
                  ? 'bg-red-600 text-white border-white animate-pulse'
                  : 'bg-white text-slate-900 border-slate-400 hover:bg-slate-100 shadow-sm'
              }`}
              aria-label="Read safety report aloud"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-5 h-5" />
                  <span>{isHindi ? 'रोकें' : 'Stop'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5" />
                  <span>{isHindi ? 'रिपोर्ट सुनें' : 'Listen'}</span>
                </>
              )}
            </button>
          </div>

          {/* Simple Explanation */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-lg sm:text-xl text-slate-800 dark:text-neutral-200">
              {isHindi ? 'आसान शब्दों में समझें:' : 'Why is this flagged?'}:
            </h4>
            <p className="text-lg leading-relaxed p-4 rounded-2xl bg-amber-50/80 dark:bg-neutral-900 border border-amber-200 dark:border-neutral-700 font-medium">
              {result.explanation}
            </p>
          </div>

          {/* Warning Signs */}
          {result.warningSigns && result.warningSigns.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-extrabold text-lg sm:text-xl text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>{isHindi ? 'संदेश में खतरे के संकेत (Warning Signs):' : 'Key Red Flags Detected:'}</span>
              </h4>
              <ul className="space-y-2.5">
                {result.warningSigns.map((sign, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl bg-red-50/90 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-base sm:text-lg font-semibold"
                  >
                    <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Next Steps */}
          {result.recommendedActions && result.recommendedActions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-extrabold text-lg sm:text-xl text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6" />
                <span>{isHindi ? 'अब आपको क्या करना चाहिए (Recommended Steps):' : 'What You Should Do Now:'}</span>
              </h4>
              <ul className="space-y-2.5">
                {result.recommendedActions.map((action, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-base sm:text-lg font-semibold"
                  >
                    <ArrowRight className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mandatory Critical Anti-OTP Warning Card */}
          <div
            role="alert"
            className="p-5 rounded-2xl bg-red-600 text-white font-extrabold shadow-lg space-y-2"
          >
            <div className="flex items-center gap-2 text-xl">
              <Lock className="w-6 h-6 animate-pulse" />
              <span>{isHindi ? 'गोल्डन रूल: कभी भी OTP या पिन न बताएं!' : 'GOLDEN RULE: NEVER SHARE OTP OR PIN!'}</span>
            </div>
            <p className="text-base sm:text-lg font-medium opacity-95">
              {isHindi
                ? 'चाहे फोन करने वाला खुद को बैंक मैनेजर, पुलिस, या बिजली अधिकारी बताए, कभी भी अपना 4 या 6 अंकों का OTP, एटीएम पिन, या पासवर्ड किसी को न दें।'
                : 'Even if the caller claims to be your Bank Manager, Police Officer, or Electricity Department, NEVER share your OTP, ATM PIN, UPI PIN, or CVV.'}
            </p>
          </div>
        </section>
      )}
    </div>
  );
};
