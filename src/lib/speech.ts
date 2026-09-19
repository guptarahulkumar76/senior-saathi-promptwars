import { Language } from './types';


/**
 * Checks if Speech Synthesis is available in the current browser.
 */
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Reads text aloud using browser SpeechSynthesis with senior-friendly settings.
 */
export function speakText(
  text: string,
  lang: Language = 'en',
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: unknown) => void
): void {
  if (!isSpeechSynthesisSupported()) {
    onError?.(new Error('Speech reading is not supported in this browser.'));
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip Markdown characters for smooth speech
  const cleanText = text
    .replace(/[#*`_~>[\]()]/g, ' ')
    .replace(/\n+/g, '. ')
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Senior-friendly calm pace (0.88x speed)
  utterance.rate = 0.88;
  utterance.pitch = 1.0;
  utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

  // Attempt to select an appropriate voice
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    if (lang === 'hi') {
      const hindiVoice = voices.find(
        (v) => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')
      );
      if (hindiVoice) utterance.voice = hindiVoice;
    } else {
      const enInVoice = voices.find(
        (v) => v.lang === 'en-IN' || v.lang.startsWith('en')
      );
      if (enInVoice) utterance.voice = enInVoice;
    }
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = (e) => {
    onError?.(e);
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Stops any active speech synthesis.
 */
export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Checks if Speech Recognition (Voice Input) is supported.
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export interface SpeechRecognizerHandlers {
  onStart?: () => void;
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

/**
 * Initiates speech recognition session.
 */
export function startVoiceRecognition(
  lang: Language = 'en',
  handlers: SpeechRecognizerHandlers
): () => void {
  if (!isSpeechRecognitionSupported()) {
    handlers.onError?.(
      'Voice input is not supported in this browser. You can type your message in the box below.'
    );
    return () => {};
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
  const recognition = new SpeechRecognitionClass();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any) => {
    const transcript = event.results?.[0]?.[0]?.transcript || '';
    handlers.onResult(transcript);
  };

  recognition.onstart = () => {
    handlers.onStart?.();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onerror = (event: any) => {
    let errorMsg = 'Microphone could not recognize speech. Please try speaking again.';
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      errorMsg = 'Microphone access was denied. Please allow microphone permissions in your browser settings.';
    } else if (event.error === 'no-speech') {
      errorMsg = 'No voice was heard. Please press the mic and speak clearly.';
    }
    handlers.onError?.(errorMsg);
  };

  recognition.onend = () => {
    handlers.onEnd?.();
  };

  try {
    recognition.start();
  } catch (err) {
    handlers.onError?.('Could not start voice recognition: ' + (err instanceof Error ? err.message : ''));
  }

  // Returns cancel / abort function
  return () => {
    try {
      recognition.abort();
    } catch {
      // Ignored
    }
  };
}
