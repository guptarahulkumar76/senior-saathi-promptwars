import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limiter';
import { runGeminiTask } from '@/lib/gemini';
import { MAX_REQUEST_BYTES, validateGeminiRequest } from '@/lib/api-validation';

export const runtime = 'nodejs';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
};

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting based on client IP / forward headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIdentifier = forwardedFor?.split(',')[0].trim() || realIp || 'anonymous_user';

    const rateLimit = checkRateLimit(clientIdentifier, 20, 60000);
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
            ...NO_STORE_HEADERS,
          },
        }
      );
    }

    // 2. Parse & Validate Payload
    const contentLength = Number(req.headers.get('content-length') || 0);
    if (contentLength > MAX_REQUEST_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Request is too large.' },
        { status: 413, headers: NO_STORE_HEADERS }
      );
    }

    let body: unknown;
    try {
      const rawBody = await req.text();
      if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
        return NextResponse.json(
          { success: false, error: 'Request is too large.' },
          { status: 413, headers: NO_STORE_HEADERS }
        );
      }
      body = JSON.parse(rawBody) as unknown;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request format. Expected JSON.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const validation = validateGeminiRequest(body);
    if (!validation.ok) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const { task, input, language } = validation.value;

    // 3. Process Task via Server-Side Gemini Handler
    // Privacy note: user text is NEVER logged or saved to server disks
    const result = await runGeminiTask(task, input, language);

    return NextResponse.json({
      success: true,
      data: result,
      isDemoMode: Boolean((result as { isDemoMode?: boolean }).isDemoMode),
    }, { headers: { ...NO_STORE_HEADERS, 'X-RateLimit-Remaining': String(rateLimit.remaining) } });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      {
        success: false,
        error: 'Senior Saathi encountered a temporary hiccup. Please try again in a few moments.',
        details: process.env.NODE_ENV === 'development' ? errorMsg : undefined,
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
