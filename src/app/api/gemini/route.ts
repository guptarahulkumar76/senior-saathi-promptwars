import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limiter';
import { runGeminiTask } from '@/lib/gemini';
import { TaskType, Language } from '@/lib/types';

// Maximum allowed character length for user queries
const MAX_INPUT_LENGTH = 2000;

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting based on client IP / forward headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIdentifier = forwardedFor?.split(',')[0].trim() || realIp || 'anonymous_user';

    const rateLimit = checkRateLimit(clientIdentifier, 25, 60000); // 25 requests per minute
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'You have made several requests in a short time. Please wait a minute and try again for your safety.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // 2. Parse & Validate Payload
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request format. Expected JSON.' },
        { status: 400 }
      );
    }

    const { task, input, language } = body || {};

    // Validate Task Type
    const validTasks: TaskType[] = ['simplify', 'scam-check', 'next-step'];
    if (!task || !validTasks.includes(task)) {
      return NextResponse.json(
        { success: false, error: 'Invalid task type. Supported tasks: simplify, scam-check, next-step.' },
        { status: 400 }
      );
    }

    // Validate Input Text
    if (typeof input !== 'string' || input.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please provide a non-empty message or question.' },
        { status: 400 }
      );
    }

    if (input.trim().length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: `Message is too long. Please limit your text to ${MAX_INPUT_LENGTH} characters.`,
        },
        { status: 400 }
      );
    }

    // Validate Language
    const validLanguage: Language = language === 'hi' ? 'hi' : 'en';

    // 3. Process Task via Server-Side Gemini Handler
    // Privacy note: user text is NEVER logged or saved to server disks
    const result = await runGeminiTask(task, input.trim(), validLanguage);

    return NextResponse.json({
      success: true,
      data: result,
      isDemoMode: Boolean((result as { isDemoMode?: boolean }).isDemoMode),
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      {
        success: false,
        error: 'Senior Saathi encountered a temporary hiccup. Please try again in a few moments.',
        details: process.env.NODE_ENV === 'development' ? errorMsg : undefined,
      },
      { status: 500 }
    );
  }
}
