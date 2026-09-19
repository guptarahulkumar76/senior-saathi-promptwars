'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSenior } from '@/context/SeniorContext';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRightCircle,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import {
  startVoiceRecognition,
  isSpeechRecognitionSupported,
} from '@/lib/speech';
import { SimplifyResult, NextStepResult } from '@/lib/types';
import { requestGemini } from '@/lib/api-client';

export const AskSaathi: React.FC = () => {
  const {
    highContrast,
    language,
    readAloud,
    stopAudio,
    isSpeaking,
  } = useSenior();

  const isHindi = language === 'hi';

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechCancelFn, setSpeechCancelFn] = useState<(() => void) | null>(null);
  const [result, setResult] = useState<SimplifyResult | null>(null);
  const [nextSteps, setNextSteps] = useState<NextStepResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestControllerRef = useRef<AbortController | null>(null);

  const sampleQuestions = isHindi
    ? [
        'क्या मैं अपनी रक्तचाप (BP) की दवा चाय के साथ ले सकता हूँ?',
        'व्हाट्सएप पर बच्चों को फोटो कैसे भेजें?',
        'डिजिलॉकर क्या है और क्या यह सुरक्षित है?',
        'किसी ने बैंक KYC के नाम पर OTP मांगा है, मुझे क्या करना चाहिए?',
      ]
    : [
        'Can I take my blood pressure medicine with morning tea?',
        'How do I make a video call to my grandchildren on WhatsApp?',
        'What is DigiLocker and is it safe to store my Aadhaar card?',
        'Someone called asking for my OTP to update bank KYC, what should I do?',
      ];

  // Stop active voice input if component unmounts
  useEffect(() => {
    return () => {
      if (speechCancelFn) speechCancelFn();
      requestControllerRef.current?.abort();
    };
  }, [speechCancelFn]);

  const handleVoiceToggle = () => {
    if (isListening) {
      if (speechCancelFn) speechCancelFn();
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setErrorMessage(
        isHindi
          ? 'आपके ब्राउज़र में बोलकर लिखने की सुविधा समर्थित नहीं है। कृपया नीचे दिए गए बॉक्स में टाइप करें।'
          : 'Voice input is not supported in this browser. Please type your query in the box below.'
      );
      return;
    }

    setErrorMessage(null);
    const cancel = startVoiceRecognition(language, {
      onStart: () => setIsListening(true),
      onResult: (transcript) => {
        setInputQuery(transcript);
        setIsListening(false);
        // Automatically ask
        handleAsk(transcript);
      },
      onError: (err) => {
        setErrorMessage(err);
        setIsListening(false);
      },
      onEnd: () => setIsListening(false),
    });

    setSpeechCancelFn(() => cancel);
  };

  const handleAsk = async (queryText?: string) => {
    const textToSubmit = queryText || inputQuery;
    if (!textToSubmit.trim()) return;

    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    setIsLoading(true);
    setErrorMessage(null);
    setNextSteps(null);

    try {
      const data = await requestGemini<SimplifyResult>(
        'simplify',
        textToSubmit,
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
          ? 'उत्तर प्राप्त करने में समस्या आई। कृपया पुनः प्रयास करें।'
          : 'Could not get an answer. Please try again.'
      );
    } finally {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
        setIsLoading(false);
      }
    }
  };

  // Button 1: "Explain More Simply"
  const handleExplainMoreSimply = async () => {
    if (!inputQuery.trim() && !result) return;
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    setIsLoading(true);
    setErrorMessage(null);

    const promptText = `Explain this in even simpler words, using very short sentences as if explaining to an elderly friend: ${
      result?.summary || inputQuery
    }`;

    try {
      const data = await requestGemini<SimplifyResult>(
        'simplify',
        promptText,
        language,
        controller.signal
      );
      setResult(data);
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      setErrorMessage(err instanceof Error ? err.message : 'Error simplifying further.');
    } finally {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
        setIsLoading(false);
      }
    }
  };

  // Button 2: "Read Aloud"
  const handleReadAloud = () => {
    if (isSpeaking) {
      stopAudio();
      return;
    }

    if (!result) return;

    let fullSpeech = result.summary + '. ';
    if (result.keyPoints && result.keyPoints.length > 0) {
      fullSpeech += (isHindi ? 'मुख्य बिंदु: ' : 'Key points: ') + result.keyPoints.join('. ') + '. ';
    }
    if (result.disclaimer) {
      fullSpeech += result.disclaimer + '. ';
    }

    readAloud(fullSpeech);
  };

  // Button 3: "What Should I Do Next?"
  const handleWhatNext = async () => {
    const contextText = result ? `${inputQuery}: ${result.summary}` : inputQuery;
    if (!contextText.trim()) return;

    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await requestGemini<NextStepResult>(
        'next-step',
        contextText,
        language,
        controller.signal
      );
      setNextSteps(data);
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      setErrorMessage(err instanceof Error ? err.message : 'Could not fetch next steps.');
    } finally {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title & Introduction */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 mb-1">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {isHindi ? 'साथी से पूछें और सरल बनाएं' : 'Ask Saathi & Simplify'}
        </h2>
        <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-neutral-300 max-w-2xl mx-auto">
          {isHindi
            ? 'किसी भी कठिन बात, तकनीक, या योजना के बारे में पूछें। हम बिना किसी तकनीकी भाषा के सीधा और सरल जवाब देंगे।'
            : 'Ask any question in your own words. We explain difficult topics in short, clear, jargon-free points.'}
        </p>
      </div>

      {/* Input Area */}
      <div
        className={`rounded-3xl p-5 sm:p-7 border-2 shadow-sm transition-all ${
          highContrast
            ? 'bg-neutral-950 border-amber-400'
            : 'bg-white border-amber-200'
        }`}
      >
        <label
          htmlFor="saathi-question"
          className="block font-extrabold text-lg sm:text-xl mb-3"
        >
          {isHindi ? 'आपका सवाल या संदेश:' : 'Your Question or Topic:'}
        </label>

        <div className="relative">
          <textarea
            id="saathi-question"
            rows={3}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              isHindi
                ? 'यहाँ अपना सवाल लिखें या माइक बटन दबाकर बोलें...'
                : 'Type your question here, or tap the microphone to speak...'
            }
            className={`w-full p-4 rounded-2xl border-2 text-base sm:text-lg transition-all resize-none focus:outline-none focus:ring-4 focus:ring-blue-500 ${
              highContrast
                ? 'bg-black border-amber-400 text-amber-200 placeholder:text-neutral-500'
                : 'bg-amber-50/50 border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>

        {/* Action Controls: Voice + Submit */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`min-h-[50px] px-5 rounded-2xl font-bold flex items-center gap-2.5 transition-all shadow-sm focus:ring-4 ${
              isListening
                ? 'bg-red-600 text-white animate-pulse focus:ring-red-400'
                : highContrast
                ? 'bg-amber-400 text-black border-2 border-white hover:bg-amber-300'
                : 'bg-amber-100 text-amber-900 hover:bg-amber-200 focus:ring-amber-300'
            }`}
            aria-label={
              isListening
                ? isHindi
                  ? 'सुनना बंद करें'
                  : 'Stop listening'
                : isHindi
                ? 'माइक द्वारा बोलकर पूछें'
                : 'Speak with voice'
            }
          >
            {isListening ? (
              <>
                <MicOff className="w-6 h-6" />
                <span>{isHindi ? 'सुन रहा हूँ... (टैप कर रोकें)' : 'Listening... (Tap to stop)'}</span>
              </>
            ) : (
              <>
                <Mic className="w-6 h-6 text-amber-700 dark:text-black" />
                <span>{isHindi ? 'बोलकर पूछें' : 'Speak Question'}</span>
              </>
            )}
          </button>

          {/* Submit Button */}
          <button
            type="button"
            onClick={() => handleAsk()}
            disabled={isLoading || !inputQuery.trim()}
            className={`min-h-[50px] px-7 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2 shadow-md transition-all ${
              isLoading || !inputQuery.trim()
                ? 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-600'
                : highContrast
                ? 'bg-amber-400 text-black hover:bg-amber-300 focus:ring-4 focus:ring-amber-200'
                : 'bg-amber-700 hover:bg-amber-800 text-white focus:ring-4 focus:ring-amber-300'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spin" />
                <span>{isHindi ? 'सोच रहा हूँ...' : 'Thinking...'}</span>
              </span>
            ) : (
              <>
                <span>{isHindi ? 'सरल बनाएं' : 'Ask & Simplify'}</span>
                <Send className="w-5 h-5" />
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

        {/* Sample Prompt Chips */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 font-bold text-sm text-slate-600 dark:text-neutral-400 mb-2">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>{isHindi ? 'सुझाए गए प्रश्न (टैप करें):' : 'Suggested questions to try (tap to ask):'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputQuery(q);
                  handleAsk(q);
                }}
                className={`text-left px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all hover:scale-[1.01] active:scale-95 ${
                  highContrast
                    ? 'bg-neutral-900 border-amber-400 text-amber-300 hover:bg-neutral-800'
                    : 'bg-amber-50/70 border-amber-200 text-amber-950 hover:bg-amber-100'
                }`}
              >
                “{q}”
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Answer Output Card */}
      {result && (
        <section
          aria-live="polite"
          className={`rounded-3xl p-6 sm:p-8 border-2 shadow-lg space-y-6 transition-all ${
            highContrast
              ? 'bg-neutral-950 border-amber-400 text-white'
              : 'bg-white border-amber-300 text-slate-900'
          }`}
        >
          {/* Header with Demo Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-extrabold text-xl">
              <Lightbulb className="w-6 h-6" />
              <h3>{isHindi ? 'सरल उत्तर' : 'Simplified Explanation'}</h3>
            </div>
            {result.isDemoMode && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300">
                {isHindi ? 'डेमो मोड उत्तर' : 'Demo Mode AI Result'}
              </span>
            )}
          </div>

          {/* Core Summary */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 dark:bg-neutral-900 border border-amber-200 dark:border-neutral-700">
            <p className="text-lg sm:text-xl font-semibold leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Key Points */}
          {result.keyPoints && result.keyPoints.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-extrabold text-base sm:text-lg text-slate-800 dark:text-neutral-200">
                {isHindi ? 'महत्वपूर्ण बातें:' : 'Key Points to Remember:'}
              </h4>
              <ul className="space-y-2.5">
                {result.keyPoints.map((point, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-base sm:text-lg leading-snug"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Safety Disclaimer (Medical / Financial) */}
          {result.disclaimer && (
            <div
              role="alert"
              className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 font-bold flex items-start gap-3"
            >
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm sm:text-base leading-relaxed">
                {result.disclaimer}
              </div>
            </div>
          )}

          {/* Required Action Buttons:
              1. "Explain More Simply"
              2. "Read Aloud"
              3. "What Should I Do Next?"
          */}
          <div className="pt-4 border-t border-slate-200 dark:border-neutral-800 flex flex-wrap gap-3">
            {/* Read Aloud */}
            <button
              onClick={handleReadAloud}
              className={`min-h-[48px] px-5 rounded-xl font-bold flex items-center gap-2 border-2 transition-all ${
                isSpeaking
                  ? 'bg-red-600 text-white border-red-600 animate-pulse'
                  : highContrast
                  ? 'bg-amber-400 text-black border-white hover:bg-amber-300'
                  : 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200'
              }`}
              aria-label={isSpeaking ? 'Stop reading aloud' : 'Read answer aloud'}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-5 h-5" />
                  <span>{isHindi ? 'पढ़ना रोकें' : 'Stop Reading'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5 text-amber-800 dark:text-black" />
                  <span>{isHindi ? 'जोर से पढ़ें' : 'Read Aloud'}</span>
                </>
              )}
            </button>

            {/* Explain More Simply */}
            <button
              onClick={handleExplainMoreSimply}
              disabled={isLoading}
              className={`min-h-[48px] px-5 rounded-xl font-bold flex items-center gap-2 border-2 transition-all ${
                highContrast
                  ? 'bg-neutral-900 border-amber-400 text-amber-300 hover:bg-neutral-800'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <RotateCcw className="w-5 h-5 text-amber-600" />
              <span>{isHindi ? 'और आसान शब्दों में समझाएं' : 'Explain More Simply'}</span>
            </button>

            {/* What Should I Do Next? */}
            <button
              onClick={handleWhatNext}
              disabled={isLoading}
              className={`min-h-[48px] px-5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all ${
                highContrast
                  ? 'bg-amber-400 text-black font-extrabold hover:bg-amber-300'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              <ArrowRightCircle className="w-5 h-5" />
              <span>{isHindi ? 'आगे क्या करना चाहिए?' : 'What Should I Do Next?'}</span>
            </button>
          </div>

          {/* Sub-Card: Proactive Next Steps */}
          {nextSteps && (
            <div
              className={`p-5 rounded-2xl border-2 space-y-4 animate-in fade-in duration-300 ${
                highContrast
                  ? 'bg-neutral-900 border-emerald-400 text-white'
                  : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
              }`}
            >
              <div className="flex items-center gap-2 font-extrabold text-lg sm:text-xl text-emerald-800 dark:text-emerald-300">
                <ArrowRightCircle className="w-6 h-6" />
                <h4>{isHindi ? 'आपके लिए 3 सुरक्षित अगले कदम:' : 'Your 3 Safe Next Steps:'}</h4>
              </div>

              <div className="space-y-2.5">
                {nextSteps.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white dark:bg-black border border-emerald-200 dark:border-emerald-800 font-semibold text-base sm:text-lg shadow-sm"
                  >
                    {step}
                  </div>
                ))}
              </div>

              {nextSteps.contactToReach && (
                <div className="text-sm font-bold pt-2 text-slate-700 dark:text-neutral-300">
                  📞 {isHindi ? 'संपर्क सुझाव:' : 'Recommended Contact:'}{' '}
                  <span className="underline">{nextSteps.contactToReach}</span>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
