/**
 * Gatherly AI — Vercel Serverless Function: /api/generate-plan
 *
 * Receives validated event details from the frontend, calls Google Gemini API
 * using the official @google/genai SDK, validates the structured JSON response,
 * and returns it.
 *
 * Security & Reliability guarantees:
 * - GEMINI_API_KEY is read strictly on the server; never exposed in browser
 * - Incoming request validated via Zod schema
 * - Output response mime type configured as application/json
 * - Response size & tokens strictly bounded
 * - Timeouts (30s) and rate limits caught and mapped to standard error codes
 * - Raw Gemini internal errors or stack traces are never leaked
 */

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

// Keep the model configurable because Gemini model lifecycles change over time.
// The previous hard-coded gemini-2.0-flash model was shut down on 2026-06-01.
const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';
const SERVER_TIMEOUT_MS = 30_000;

// Keep the serverless function bounded so a slow request does not occupy a
// worker for a full minute. The fast model and compact prompt should finish
// well within this window.
export const maxDuration = 35;

// ─── Request Schema ────────────────────────────────────────────────────────────

const RequestSchema = z.object({
  eventDraftId: z.string().min(1, 'eventDraftId is required'),
  eventName: z.string().min(3, 'Celebration name must be at least 3 characters').max(100),
  eventType: z.enum([
    'birthday',
    'wedding',
    'anniversary',
    'community',
    'dinner_party',
    'corporate',
  ]),
  date: z.string().min(1, 'date is required'),
  city: z.string().min(2, 'city is required'),
  guestCount: z.number().int().min(1).max(100_000),
  budget: z.number().positive('budget must be positive'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR']),
  foodPreferences: z.array(z.string()).default([]),
  theme: z.string().max(200).default(''),
  specialRequirements: z.string().max(1500).default(''),
  section: z.enum(['concept', 'budget', 'timeline', 'checklist', 'vendors']).optional(),
});

type ValidatedRequest = z.infer<typeof RequestSchema>;

// ─── Prompt Builders ───────────────────────────────────────────────────────────

function buildFullPrompt(b: ValidatedRequest): string {
  const dietaryStr =
    b.foodPreferences && b.foodPreferences.length > 0
      ? b.foodPreferences.join(', ')
      : 'standard / omnivore';

  return `You are an expert celebratory event planner for "Gatherly AI". Generate a comprehensive, highly personalized event plan for the celebration described below.

EVENT SPECIFICATIONS:
- Celebration Name: ${b.eventName}
- Event Type Archetype: ${b.eventType}
- Scheduled Date: ${b.date}
- City / Location: ${b.city}
- Confirmed Guest Count: ${b.guestCount}
- Target Budget: ${b.budget} ${b.currency} (Total budget is fixed by the host. Do NOT suggest a different total amount.)
- Catering Dietary Constraints: ${dietaryStr}
- Aesthetic Theme & Vibe: ${b.theme || 'Refined celebratory elegance'}
- Special Directives & Logistics: ${b.specialRequirements || 'None specified'}

ENGINEERING & FORMAT REQUIREMENTS:
1. Return ONLY a single, valid JSON object that parses cleanly.
2. In the "budgetSplits" array, provide ONLY estimated percentage allocations (numbers that sum to 100). Do NOT provide currency figures — all monetary amounts are calculated strictly in application code.
3. Every recommendation, activity, timeline item, and vendor note must be specifically tailored to "${b.city}", "${b.eventType}", "${b.guestCount} guests", and the specified theme.
4. "timeline.preparation": 3-5 chronological milestones leading up to the event date.
5. "timeline.weekOf": 3 final countdown tasks in the 7 days prior.
6. "timeline.dayOf": 6-8 concise hour-by-hour entries covering setup to guest departure.
7. "checklist": 8-10 prioritized, actionable tasks across categories ('Vendor', 'Logistics', 'Guests', 'Decor', 'Safety').
8. "vendors": 5 concise local service categories relevant to ${b.city} with lead times and insider tips.
9. "risks": 3 real event risks specific to this scale/venue type and practical mitigations.
10. Keep every string concise; return compact JSON with no repeated explanations.

Required JSON Structure:
{
  "concept": {
    "summary": "3-4 sentence personalized event narrative and experience overview",
    "themeIdeas": ["3-5 creative aesthetic interpretations"],
    "decorationConcepts": ["3-5 specific decor, lighting, and tablescape ideas"],
    "recommendedActivities": ["3-5 engaging, curated guest activities"],
    "cateringHighlights": ["3-4 culinary or beverage concepts matching the dietary profile"],
    "ambiance": "2-3 sentences describing the mood, sensory design, and atmosphere"
  },
  "budgetSplits": [
    {
      "name": "Category name (e.g. Venue & Facilities, Catering & Bar, Decor & Ambiance, Photography & Media, Entertainment, Contingency)",
      "description": "What this category covers",
      "percentage": 30,
      "notes": "Contextual planning tip for this category and scale"
    }
  ],
  "timeline": {
    "preparation": [
      { "time": "8 weeks out", "title": "Milestone title", "responsible": "Host / Planner", "description": "Specific details", "isCritical": true }
    ],
    "weekOf": [
      { "time": "Day -3", "title": "Countdown task", "responsible": "Host", "description": "Details", "isCritical": false }
    ],
    "dayOf": [
      { "time": "10:00 AM", "title": "Day-of schedule item", "responsible": "Lead Coordinator", "description": "Details", "isCritical": true }
    ]
  },
  "checklist": [
    { "id": "task-1", "category": "Vendor", "text": "Specific actionable task", "priority": "high", "timing": "6 weeks out" }
  ],
  "vendors": [
    { "category": "Service category", "serviceScope": "Required scope of work", "localTip": "Helpful tip for ${b.city}", "estimatedLeadTime": "e.g. 2-3 months in advance" }
  ],
  "practicalTips": [
    "3-5 expert event execution recommendations"
  ],
  "risks": [
    { "risk": "Specific event risk or challenge", "mitigation": "Proactive prevention or backup strategy" }
  ]
}`;
}

function buildSectionPrompt(b: ValidatedRequest): string {
  const section = b.section!;
  const dietaryStr =
    b.foodPreferences && b.foodPreferences.length > 0
      ? b.foodPreferences.join(', ')
      : 'standard / omnivore';

  const baseInfo = `Event: "${b.eventName}" (${b.eventType}) on ${b.date} in ${b.city}.
Scale: ${b.guestCount} guests. Budget: ${b.budget} ${b.currency}.
Dietary requirements: ${dietaryStr}.
Theme: ${b.theme || 'Elegant'}. Special directives: ${b.specialRequirements || 'None'}.`;

  const instructions: Record<string, string> = {
    concept: `Regenerate ONLY the "concept" section. Return ONLY a JSON object:
{
  "concept": {
    "summary": "3-4 sentence personalized event narrative",
    "themeIdeas": ["string", "string", "string"],
    "decorationConcepts": ["string", "string", "string"],
    "recommendedActivities": ["string", "string", "string"],
    "cateringHighlights": ["string", "string", "string"],
    "ambiance": "2-3 sentences describing the mood"
  }
}`,
    budget: `Regenerate ONLY the "budgetSplits" section. Return ONLY a JSON object:
{
  "budgetSplits": [
    { "name": "Category name", "description": "Scope", "percentage": number, "notes": "Tip" }
  ]
}
Percentages MUST sum to exactly 100. Provide 5-6 realistic categories tailored to ${b.eventType}.`,
    timeline: `Regenerate ONLY the "timeline" section. Return ONLY a JSON object:
{
  "timeline": {
    "preparation": [{ "time": "string", "title": "string", "responsible": "string", "description": "string", "isCritical": boolean }],
    "weekOf": [{ "time": "string", "title": "string", "responsible": "string", "description": "string", "isCritical": boolean }],
    "dayOf": [{ "time": "string", "title": "string", "responsible": "string", "description": "string", "isCritical": boolean }]
  }
}`,
    checklist: `Regenerate ONLY the "checklist" section. Return ONLY a JSON object:
{
  "checklist": [
    { "id": "string", "category": "Vendor|Logistics|Guests|Decor|Safety", "text": "string", "priority": "high|medium|low", "timing": "string" }
  ]
}
Include 10-14 items tailored to ${b.city} and ${b.guestCount} guests.`,
    vendors: `Regenerate ONLY the "vendors" section. Return ONLY a JSON object:
{
  "vendors": [
    { "category": "string", "serviceScope": "string", "localTip": "string", "estimatedLeadTime": "string" }
  ]
}
Include 5-8 vendor categories tailored to ${b.city}.`,
  };

  return `You are an expert celebratory event planner regenerating only the "${section}" section of an event plan.
${baseInfo}

${instructions[section] || ''}

Return ONLY valid JSON with no markdown wrapping or preamble.`;
}

// ─── JSON Extractor ────────────────────────────────────────────────────────────

export function extractJSON(text: string): unknown {
  const trimmed = text.trim();

  // 1. Direct JSON parse
  try {
    return JSON.parse(trimmed);
  } catch {
    /* continue */
  }

  // 2. Strip code fences if present (```json ... ```)
  const stripped = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
  try {
    return JSON.parse(stripped);
  } catch {
    /* continue */
  }

  // 3. Extract outermost balanced {...}
  const firstBrace = stripped.indexOf('{');
  const lastBrace = stripped.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try {
      return JSON.parse(stripped.slice(firstBrace, lastBrace + 1));
    } catch {
      /* continue */
    }
  }

  throw new Error('AI output did not contain parseable JSON');
}

// ─── Serverless Request Handler ────────────────────────────────────────────────

export default async function handler(
  req: import('@vercel/node').VercelRequest,
  res: import('@vercel/node').VercelResponse,
): Promise<void> {
  // Enforce HTTP POST
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
      code: 'UNKNOWN',
      retryable: false,
    });
    return;
  }

  // Check API Key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your-api-key-here') {
    res.status(503).json({
      success: false,
      error:
        'Gemini API key is not configured on the server. Please set GEMINI_API_KEY in your server environment.',
      code: 'MISSING_KEY',
      retryable: false,
    });
    return;
  }

  // Validate incoming request body with Zod
  const bodyParsed = RequestSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    const errorDetails = bodyParsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    res.status(400).json({
      success: false,
      error: `Invalid event configuration: ${errorDetails}`,
      code: 'VALIDATION_ERROR',
      retryable: false,
    });
    return;
  }

  const validatedData = bodyParsed.data;
  const isSection = typeof validatedData.section === 'string';

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = isSection
      ? buildSectionPrompt(validatedData)
      : buildFullPrompt(validatedData);

    // Abort the upstream request as well as the local timer. This prevents a
    // timed-out generation from continuing to consume model capacity.
    const requestController = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('TIMEOUT_EXCEEDED'));
        requestController.abort();
      }, SERVER_TIMEOUT_MS);
    });

    const generatePromise = ai.models.generateContent({
      model: process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        maxOutputTokens: 3072,
        temperature: 0.4,
        automaticContinuation: false,
        abortSignal: requestController.signal,
      },
    });

    let response: Awaited<typeof generatePromise>;
    try {
      response = await Promise.race([generatePromise, timeoutPromise]);
    } finally {
      clearTimeout(timeoutId!);
    }
    const rawText = response.text ?? '';

    if (!rawText || rawText.trim().length < 10) {
      res.status(502).json({
        success: false,
        error: 'The AI model returned an empty response. Please try again.',
        code: 'AI_ERROR',
        retryable: true,
      });
      return;
    }

    // Safely parse JSON
    let parsed: unknown;
    try {
      parsed = extractJSON(rawText);
    } catch {
      res.status(502).json({
        success: false,
        error: 'The AI model response was malformed. Please try again.',
        code: 'PARSE_ERROR',
        retryable: true,
      });
      return;
    }

    res.status(200).json({
      success: true,
      raw: parsed,
      isSection,
      section: validatedData.section,
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);

    if (errMsg === 'TIMEOUT_EXCEEDED' || errMsg.includes('timeout') || errMsg.includes('abort')) {
      res.status(504).json({
        success: false,
        error: 'The AI service timed out while designing your celebration. Please try again.',
        code: 'TIMEOUT',
        retryable: true,
      });
      return;
    }

    if (
      errMsg.includes('429') ||
      errMsg.toLowerCase().includes('quota') ||
      errMsg.toLowerCase().includes('resource_exhausted')
    ) {
      res.status(429).json({
        success: false,
        error: 'Gemini API quota or rate limit reached. Please wait a moment and try again.',
        code: 'RATE_LIMIT',
        retryable: true,
      });
      return;
    }

    // Never leak raw internal errors or keys
    res.status(502).json({
      success: false,
      error: 'The AI service encountered an issue while generating your plan. Please retry.',
      code: 'AI_ERROR',
      retryable: true,
    });
  }
}
