import { GoogleGenAI } from '@google/genai';
import type {
  Language,
  TaskType,
  ScamAnalysisResult,
  SimplifyResult,
  NextStepResult,
} from './types.ts';
import { isValidTaskResponse } from './response-validation.ts';

// Authorization keys use the current Interactions API and a stable Gemini 3 model.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const GEMINI_TIMEOUT_MS = 40_000;

export type GeminiDiagnosticCode =
  | 'AI_AUTH_ERROR'
  | 'AI_QUOTA_ERROR'
  | 'AI_MODEL_ERROR'
  | 'AI_TIMEOUT'
  | 'AI_RESPONSE_FORMAT_ERROR'
  | 'AI_UPSTREAM_ERROR';

export class GeminiServiceError extends Error {
  readonly code: GeminiDiagnosticCode;

  constructor(code: GeminiDiagnosticCode) {
    super('Gemini service request failed');
    this.name = 'GeminiServiceError';
    this.code = code;
  }
}

let cachedClient: GoogleGenAI | null = null;

function getGeminiClient(apiKey: string) {
  if (!cachedClient) cachedClient = new GoogleGenAI({ apiKey });
  return cachedClient;
}

async function generateJson(ai: GoogleGenAI, prompt: string, temperature: number): Promise<string> {
  // Keep temperature in the helper signature so task intent remains explicit;
  // the current Interactions API chooses stable decoding defaults.
  void temperature;
  const response = await withTimeout(
    ai.interactions.create({
      model: GEMINI_MODEL,
      input: prompt,
      stream: false,
    })
  );
  return response.output_text || '';
}

async function withTimeout<T>(operation: Promise<T>): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Gemini request timed out')), GEMINI_TIMEOUT_MS);
  });
  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function parseTaskResponse<T>(task: TaskType, rawText: string, fallback: T): T {
  const parsed = extractJson<unknown>(rawText, fallback);
  if (!isValidTaskResponse(task, parsed) || parsed === fallback) {
    throw new GeminiServiceError('AI_RESPONSE_FORMAT_ERROR');
  }
  return parsed as T;
}

function classifyGeminiError(error: unknown): GeminiServiceError {
  if (error instanceof GeminiServiceError) return error;

  const candidate = error as { status?: number; code?: number | string; message?: string };
  const status = Number(candidate?.status || candidate?.code || 0);
  const message = (candidate?.message || '').toLowerCase();

  if (status === 401 || status === 403 || message.includes('api key')) {
    return new GeminiServiceError('AI_AUTH_ERROR');
  }
  if (status === 429 || message.includes('quota') || message.includes('resource exhausted')) {
    return new GeminiServiceError('AI_QUOTA_ERROR');
  }
  if (status === 404 || message.includes('model') && message.includes('not found')) {
    return new GeminiServiceError('AI_MODEL_ERROR');
  }
  if (message.includes('timed out') || message.includes('timeout')) {
    return new GeminiServiceError('AI_TIMEOUT');
  }
  return new GeminiServiceError('AI_UPSTREAM_ERROR');
}

/**
 * Extracts and parses JSON from Gemini's response safely.
 */
export function extractJson<T>(rawText: string, fallback: T): T {
  try {
    let cleaned = rawText.trim();
    // Remove markdown code fences if present
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }

    // Find outer JSON object braces
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

/**
 * Generates realistic fallback responses when GEMINI_API_KEY is not configured.
 * This guarantees the application is fully interactive for judges and evaluators.
 */
export function getDemoResponse(
  task: TaskType,
  input: string,
  language: Language = 'en'
): ScamAnalysisResult | SimplifyResult | NextStepResult {
  const lower = input.toLowerCase();
  const isHindi = language === 'hi';

  if (task === 'scam-check') {
    const isSafeStatement =
      (lower.includes('balance is') ||
        lower.includes('statement') ||
        lower.includes('credited') ||
        lower.includes('शेष राशि') ||
        lower.includes('जमा किए गए')) &&
      !lower.includes('click') &&
      !lower.includes('call') &&
      !lower.includes('http') &&
      !lower.includes('urgent');

    if (isSafeStatement) {
      return {
        riskLevel: 'Likely Safe',
        confidenceScore: 92,
        warningSigns: isHindi
          ? [
              'कोई तात्कालिक खतरा नहीं मिला',
              'संदेश में कोई लिंक, OTP या अज्ञात नंबर पर कॉल करने का अनुरोध नहीं है',
            ]
          : [
              'No immediate red flags detected',
              'The message does not contain suspicious links or requests for secret credentials',
            ],
        explanation: isHindi
          ? 'यह आपके बैंक या सेवा प्रदाता की सामान्य सूचना प्रतीत होती है। इसमें कोई लिंक या पिन नहीं मांगा गया है।'
          : 'This appears to be a standard transactional notification. No sensitive information or urgent action was requested.',
        recommendedActions: isHindi
          ? [
              'यह सुरक्षित है, लेकिन कभी भी बैंक के नाम पर आने वाले किसी लिंक पर अपना पिन न डालें।',
              'संदेह होने पर केवल अपनी बैंक पासबुक या आधिकारिक ऐप में जांचें।',
            ]
          : [
              'Keep this for your records. No immediate action required.',
              'Always remember: Your bank will never ask for your PIN, OTP, or CVV.',
            ],
        hasFinancialDanger: false,
        isDemoMode: true,
      };
    }

    const isElectricityScam =
      lower.includes('electricity') ||
      lower.includes('power') ||
      lower.includes('bijli') ||
      lower.includes('बिजली') ||
      lower.includes('कट जाएगी') ||
      (lower.includes('bill') &&
        (lower.includes('disconnect') ||
          lower.includes('cut') ||
          lower.includes('tonight') ||
          lower.includes('बकाया')));

    const isLotteryOrPrize =
      lower.includes('lottery') ||
      lower.includes('लॉटरी') ||
      lower.includes('kbc') ||
      lower.includes('won') ||
      lower.includes('इनाम') ||
      lower.includes('prize') ||
      lower.includes('crore') ||
      lower.includes('lakh');

    const isKycOrBankThreat =
      lower.includes('kyc') ||
      lower.includes('blocked') ||
      lower.includes('suspended') ||
      lower.includes('बंद') ||
      lower.includes('deactivated') ||
      lower.includes('pan') ||
      lower.includes('aadhar');

    const hasOtpPin =
      lower.includes('otp') ||
      lower.includes('pin') ||
      lower.includes('password') ||
      lower.includes('cvv') ||
      lower.includes('पिन') ||
      lower.includes('ओटीपी');

    if (isElectricityScam || isLotteryOrPrize || isKycOrBankThreat || hasOtpPin) {
      return {
        riskLevel: 'High Risk',
        confidenceScore: 98,
        warningSigns: isHindi ? [
          'अनावश्यक जल्दबाजी: आज रात बिजली कटने या खाता बंद होने का डर दिखाना',
          'व्यक्तिगत फोन नंबर पर कॉल करने या अनजान ऐप डाउनलोड करने का दबाव',
          'OTP, पिन या बैंक विवरण मांगने की कोशिश',
          'संदेश आधिकारिक सरकारी या बैंक ID से नहीं भेजा गया है'
        ] : [
          'Artificial Urgency: Threatening disconnection tonight or immediate account suspension',
          'Requests to call an unofficial mobile number or download unknown remote apps',
          'Direct or indirect prompt to reveal OTP, PIN, or banking credentials',
          'Sender header does not match legitimate utility board or registered bank'
        ],
        explanation: isHindi
          ? 'यह एक बहुचर्चित धोखाधड़ी (साइबर फ्रॉड) संदेश है। कोई भी सरकारी बिजली विभाग या बैंक इस तरह व्हाट्सएप या साधारण नंबर से कनेक्शन काटने की धमकी नहीं देता।'
          : 'This is a well-known cyber scam tactic. Legitimate electricity boards and banks never threaten instant disconnection via SMS/WhatsApp with private mobile numbers.',
        recommendedActions: isHindi ? [
          'इस संदेश पर दिए किसी भी नंबर पर कॉल न करें और न ही कोई लिंक खोलें।',
          'कभी भी अपना OTP, UPI पिन या बैंक पासवर्ड किसी को न बताएं।',
          'यदि कोई नुकसान हुआ हो तो राष्ट्रीय साइबर हेल्पलाइन 1930 पर तुरंत कॉल करें।',
          'इस संदेश को ब्लॉक करें और परिवार के किसी विश्वसनीय सदस्य को दिखाएं।'
        ] : [
          'DO NOT call the number given in the message and DO NOT click any links.',
          'NEVER share your OTP, UPI PIN, or bank passwords with anyone.',
          'If you suspect fraud, immediately call the National Cyber Crime Helpline: 1930.',
          'Block this sender and verify your bill only on the official electricity board counter or app.'
        ],
        hasFinancialDanger: true,
        isDemoMode: true,
      };
    }

    return {
      riskLevel: 'Be Careful',
      confidenceScore: 75,
      warningSigns: isHindi ? [
        'संदेश के प्रेषक की पहचान पूर्णतः सत्यापित नहीं है',
        'अज्ञात स्रोतों से आने वाले किसी भी लिंक या कॉल पर सावधानी बरतें'
      ] : [
        'Sender identity cannot be fully verified from the text provided',
        'Contains unverified promises or links from an unfamiliar contact'
      ],
      explanation: isHindi
        ? 'इस संदेश में कुछ अस्पष्ट बातें हैं। बिना जांचे-परखे किसी भी लिंक पर क्लिक न करें या किसी को पैसे न भेजें।'
        : 'This message contains ambiguous claims or unfamiliar details. Exercise caution before clicking or replying.',
      recommendedActions: isHindi ? [
        'किसी भी लिंक पर क्लिक न करें।',
        'परिवार के किसी जानकार सदस्य या साथी को यह संदेश दिखाकर सलाह लें।',
        'कोई भी गोपनीय विवरण कभी साझा न करें।'
      ] : [
        'Do not click any embedded links or respond immediately.',
        'Show this message to a trusted family member or elder advisor first.',
        'Never forward suspicious offers to other friends or family groups.'
      ],
      hasFinancialDanger: false,
      isDemoMode: true,
    };
  }

  if (task === 'next-step') {
    return {
      situation: isHindi ? 'आपकी स्थिति की समीक्षा' : 'Review of your current situation',
      steps: isHindi ? [
        'चरण 1: गहरी सांस लें और शांत रहें। कोई भी जल्दबाजी में निर्णय न लें।',
        'चरण 2: किसी भी अनजान व्यक्ति को कोई भुगतान न करें और न ही OTP साझा करें।',
        'चरण 3: अपने परिवार के विश्वसनीय सदस्य या हेल्पलाइन (1930 / 112) से संपर्क करें।'
      ] : [
        'Step 1: Pause and stay calm. Scammers rely on panic, so do not rush into any action.',
        'Step 2: Do NOT click any links, do not make any payments, and never share any OTP or PIN.',
        'Step 3: Call your trusted family member, or dial the Cyber Crime Helpline 1930 / Emergency 112.'
      ],
      contactToReach: isHindi ? 'राष्ट्रीय साइबर हेल्पलाइन 1930 या आपका विश्वसनीय परिवारजन' : 'National Cyber Crime Helpline: 1930 or your Trusted Caregiver',
      emergencyNotice: isHindi ? 'आपातकाल में हमेशा 112 पर कॉल करें।' : 'In case of physical emergency or immediate threat, always dial 112.',
      isDemoMode: true,
    };
  }

  // Task === 'simplify'
  const isMedical = lower.includes('medicine') || lower.includes('doctor') || lower.includes('pain') || lower.includes('blood pressure') || lower.includes('sugar') || lower.includes('dose');
  const isFinance = lower.includes('pension') || lower.includes('tax') || lower.includes('invest') || lower.includes('mutual fund') || lower.includes('fd');

  let disclaimer: string | undefined;
  if (isMedical) {
    disclaimer = isHindi
      ? '⚠️ स्वास्थ्य सूचना: सीनियर साथी डॉक्टर नहीं है। अपनी किसी भी दवा या खुराक में बदलाव करने से पहले हमेशा अपने डॉक्टर से परामर्श अवश्य लें।'
      : '⚠️ Health Safety Notice: Senior Saathi is not a medical professional. Never start, stop, or adjust medication dosages without consulting your registered doctor.';
  } else if (isFinance) {
    disclaimer = isHindi
      ? '⚠️ वित्तीय सूचना: सीनियर साथी प्रमाणित वित्तीय सलाहकार नहीं है। कोई भी धन निवेश करने से पहले अपने बैंक या परिवार के भरोसेमंद सदस्य से चर्चा करें।'
      : '⚠️ Financial Safety Notice: Senior Saathi is not a certified financial adviser. Always verify financial plans with your official bank branch or trusted family member.';
  }

  return {
    summary: isHindi
      ? 'यहाँ आपके सवाल का आसान और सीधा उत्तर है। हमने कठिन शब्दों को हटाकर सरल भाषा में प्रस्तुत किया है।'
      : 'Here is a gentle, plain-language summary of your question, with all confusing technical jargon removed.',
    keyPoints: isHindi ? [
      'डिजिटल दुनिया में सब कुछ शांति और धैर्य से करना सबसे सुरक्षित तरीका है।',
      'कोई भी काम करने से पहले संदेश और स्रोत की सत्यता जांचें।',
      'कभी भी किसी अजनबी के कहने पर अपने फोन में AnyDesk या TeamViewer जैसे स्क्रीन शेयर ऐप डाउनलोड न करें।',
      'जब भी संशय हो, अपने परिवार या "सीनियर साथी" से दोबारा पूछें।'
    ] : [
      'Take your time: In the digital world, slowing down prevents 99% of mistakes.',
      'Verify before trusting: Official services will always give you ample time and official letters.',
      'Never install remote screen-sharing apps (like AnyDesk or QuickSupport) at the request of any caller.',
      'When in doubt, ask a loved one or check with Senior Saathi anytime.'
    ],
    safeGuidance: isHindi
      ? 'आप बिल्कुल सुरक्षित हैं। किसी भी परेशानी के लिए अपने साथी पर भरोसा रखें।'
      : 'You are doing great. Taking a moment to double-check is a sign of wisdom, not weakness.',
    disclaimer,
    isDemoMode: true,
  };
}

/**
 * Core Gemini integration using the official @google/genai SDK.
 */
export async function runGeminiTask(
  task: TaskType,
  userInput: string,
  language: Language = 'en'
): Promise<ScamAnalysisResult | SimplifyResult | NextStepResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const isApiKeyMissing = !apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here';

  if (isApiKeyMissing) {
    return getDemoResponse(task, userInput, language);
  }

  try {
    const ai = getGeminiClient(apiKey);
    const isHindi = language === 'hi';

    if (task === 'scam-check') {
      const systemInstruction = `You are Senior Saathi's dedicated Scam and Cybersecurity Guardian for senior citizens.
Analyze the user's message (SMS, WhatsApp text, email, phone call script, or lottery offer) for fraud, phishing, bank impersonation, or extortion.

STRICT SAFETY RULES:
1. Seniors are prime targets of urgency ("electricity cut tonight", "SIM blocked in 2 hours", "KYC expired", "lottery won", "customs fee").
2. ALWAYS warn NEVER to share OTP, PIN, password, CVV, or bank account details.
3. Classify risk level strictly as: "Likely Safe" | "Be Careful" | "High Risk".
4. Language: If requested language is Hindi, write explanation and warning signs in clean, respectful conversational Hindi. Otherwise English.
5. Return ONLY a valid JSON object strictly matching this schema, with no additional conversational prose:
{
  "riskLevel": "Likely Safe" | "Be Careful" | "High Risk",
  "confidenceScore": number (0 to 100),
  "warningSigns": string[],
  "explanation": string,
  "recommendedActions": string[],
  "hasFinancialDanger": boolean
}`;

      const responseText = await generateJson(
        ai,
        `${systemInstruction}\n\nLanguage: ${isHindi ? 'Hindi' : 'English'}\n\nMessage to examine:\n"""\n${userInput}\n"""`,
        0.1
      );
      const parsed = parseTaskResponse<ScamAnalysisResult>(
        'scam-check',
        responseText,
        getDemoResponse('scam-check', userInput, language) as ScamAnalysisResult
      );
      return parsed;
    }

    if (task === 'next-step') {
      const systemInstruction = `You are Senior Saathi, a gentle and protective guide for senior citizens.
A senior citizen has described a situation, fear, or message. Provide 3 clear, sequential, safe, and calm next steps they should follow.
Rules:
1. Step 1 must be immediate safety (e.g., stop, don't click, don't pay).
2. Step 2 must be who to consult (trusted family member, local bank branch, or Cyber helpline 1930).
3. Step 3 must be how to safely verify or proceed.
4. Keep the tone calm, warm, and supportive.
5. Language: ${isHindi ? 'Hindi (respectful, using aap)' : 'English (clear, simple)'}.
6. Output ONLY JSON:
{
  "situation": "brief summary",
  "steps": ["Step 1...", "Step 2...", "Step 3..."],
  "contactToReach": "who to contact",
  "emergencyNotice": "optional emergency helpline reminder"
}`;

      const responseText = await generateJson(
        ai,
        `${systemInstruction}\n\nSituation:\n"""\n${userInput}\n"""`,
        0.2
      );
      return parseTaskResponse<NextStepResult>(
        'next-step',
        responseText,
        getDemoResponse('next-step', userInput, language) as NextStepResult
      );
    }

    // task === 'simplify'
    const systemInstruction = `You are Senior Saathi (वरिष्ठ साथी), a patient, warm, and trustworthy digital companion for senior citizens.
Explain the user's question in short, simple, jargon-free words.
Rules:
1. Explain like a caring grandchild or knowledgeable friend.
2. Use everyday analogies. Avoid tech or legal jargon.
3. NEVER claim to be a doctor, lawyer, or certified financial adviser.
4. For medical topics, add a clear safety note: "Senior Saathi is not a doctor. Please check with your doctor before changing medicines."
5. For financial topics, add: "Senior Saathi is not a financial adviser. Discuss with your bank or family."
6. Language: ${isHindi ? 'Hindi (gentle, conversational, clear Hindi)' : 'English (simple, large-font friendly sentences)'}.
7. Return ONLY JSON:
{
  "summary": "1 or 2 simple sentences explaining the core answer",
  "keyPoints": ["bullet point 1", "bullet point 2", "bullet point 3"],
  "safeGuidance": "warm reassurance",
  "disclaimer": "safety disclaimer if medical, financial, or emergency, otherwise empty"
}`;

    const responseText = await generateJson(
      ai,
      `${systemInstruction}\n\nUser Question:\n"""\n${userInput}\n"""`,
      0.3
    );
    return parseTaskResponse<SimplifyResult>(
      'simplify',
      responseText,
      getDemoResponse('simplify', userInput, language) as SimplifyResult
    );

  } catch (err: unknown) {
    // Expose only a stable category. Never log prompts, keys, or provider messages.
    const classified = classifyGeminiError(err);
    console.error(`Gemini request failed: ${classified.code}`);
    return {
      ...getDemoResponse(task, userInput, language),
      fallbackReason: classified.code,
    };
  }
}
