# Senior Saathi

Senior Saathi is an accessible GenAI companion for senior citizens. It helps older adults understand complex information, inspect suspicious messages, manage daily reminders, and reach emergency support.

## Core workflows

- **Ask and Simplify:** Converts complex questions into short, clear guidance.
- **Scam Checker:** Classifies suspicious messages and explains warning signs and safe actions.
- **Daily Reminders:** Stores medicine, appointment, bill, and custom reminders locally.
- **Emergency Help:** Provides clear, confirmed access to emergency and trusted-contact actions.

The interface includes large text, high contrast, keyboard navigation, English and Hindi content, voice input, and read-aloud support.

## Architecture

```text
Browser UI
   │
   ├── localStorage: reminders and preferences
   │
   └── POST /api/gemini
          ├── request-size and schema validation
          ├── per-client rate limiting
          ├── task-specific prompt selection
          ├── Google Gemini
          └── structured response validation
```

Gemini requests execute only on the server. The API key never reaches browser code.

## Efficiency decisions

- The server reuses one Gemini SDK client per warm runtime.
- Client requests have a timeout and cancel obsolete in-flight work.
- Buttons remain disabled during active requests to prevent duplicate calls.
- Request bodies and prompt lengths have strict upper bounds.
- AI responses use JSON mode and receive runtime shape validation.
- The rate limiter performs lazy cleanup instead of keeping a background interval alive.
- Sensitive AI responses use `no-store` and are never cached.

## Security and privacy

- Strict task, language, input, and response allowlists
- Request-body and input-length limits
- Per-client rate limiting with `Retry-After`
- Safe production errors without stack traces or prompt logging
- Plain-text AI rendering
- Secure response headers and disabled framework identification header
- `.env*` files excluded from source control

Users should avoid entering OTPs, PINs, passwords, CVVs, or full bank details. Senior Saathi does not replace medical, financial, or emergency professionals.

## Local setup

Requirements: Node.js 20 or newer and a Gemini API key.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Set the environment variables:

```env
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-2.5-flash
```

Open `http://localhost:3000`.

## Verification

```bash
npm test
npm run lint
npm run build
```

The automated tests cover request validation, rate limiting, structured Gemini responses, scam classification, and safety disclaimers. Tests never make real Gemini API calls.

## Deployment

Deploy the repository to Vercel and configure `GEMINI_API_KEY` as a protected production environment variable. `GEMINI_MODEL` is optional.

## Technology

- Next.js 16 and React 19
- TypeScript and Tailwind CSS
- Google GenAI SDK
- Browser Speech Recognition and Speech Synthesis APIs
