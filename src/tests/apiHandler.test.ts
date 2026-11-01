/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import handler, { extractJSON } from '../../api/generate-plan';

// Mock @google/genai
const mockGenerateContent = vi.fn();
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: mockGenerateContent,
      };
    },
  };
});

function createMockReqRes(body: unknown, method = 'POST') {
  const req = {
    method,
    body,
  } as unknown as import('@vercel/node').VercelRequest;

  let statusCode = 200;
  let responseData: Record<string, unknown> | null = null;

  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: Record<string, unknown>) {
      responseData = data;
      return res;
    },
    getStatusCode: () => statusCode,
    getData: () => responseData as Record<string, any>,
  } as unknown as import('@vercel/node').VercelResponse & {
    getStatusCode: () => number;
    getData: () => Record<string, any>;
  };

  return { req, res };
}

const validEventRequest = {
  eventDraftId: 'evt-test-123',
  eventName: 'Sophia & Ethan Wedding Celebration',
  eventType: 'wedding',
  date: '2027-06-15',
  city: 'Sonoma Valley, CA',
  guestCount: 120,
  budget: 45000,
  currency: 'USD',
  foodPreferences: ['omnivore', 'vegetarian', 'gluten_free'],
  theme: 'Warm Tuscan Rustic Vineyard',
  specialRequirements: 'Acoustic quartet for ceremony, step-free access for grandparents.',
};

describe('API Serverless Handler (/api/generate-plan)', () => {
  const originalEnv = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-gemini-key-12345';
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalEnv;
  });

  it('rejects non-POST HTTP methods with 405', async () => {
    const { req, res } = createMockReqRes(validEventRequest, 'GET');
    await handler(req, res);

    expect(res.getStatusCode()).toBe(405);
    expect(res.getData().success).toBe(false);
    expect(res.getData().error).toContain('Method not allowed');
  });

  it('returns 503 MISSING_KEY when GEMINI_API_KEY is not set', async () => {
    delete process.env.GEMINI_API_KEY;
    const { req, res } = createMockReqRes(validEventRequest);
    await handler(req, res);

    expect(res.getStatusCode()).toBe(503);
    expect(res.getData().success).toBe(false);
    expect(res.getData().code).toBe('MISSING_KEY');
    expect(res.getData().error).toContain('Gemini API key is not configured');
  });

  it('returns 400 VALIDATION_ERROR when eventName is too short', async () => {
    const invalidRequest = { ...validEventRequest, eventName: 'ab' };
    const { req, res } = createMockReqRes(invalidRequest);
    await handler(req, res);

    expect(res.getStatusCode()).toBe(400);
    expect(res.getData().success).toBe(false);
    expect(res.getData().code).toBe('VALIDATION_ERROR');
    expect(res.getData().error).toContain('Celebration name must be at least 3 characters');
  });

  it('returns 400 VALIDATION_ERROR when guestCount is non-positive or not integer', async () => {
    const invalidRequest = { ...validEventRequest, guestCount: 0 };
    const { req, res } = createMockReqRes(invalidRequest);
    await handler(req, res);

    expect(res.getStatusCode()).toBe(400);
    expect(res.getData().code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 VALIDATION_ERROR when currency is invalid', async () => {
    const invalidRequest = { ...validEventRequest, currency: 'BTC' };
    const { req, res } = createMockReqRes(invalidRequest);
    await handler(req, res);

    expect(res.getStatusCode()).toBe(400);
    expect(res.getData().code).toBe('VALIDATION_ERROR');
  });

  it('successfully generates plan on valid request with Gemini response', async () => {
    const mockAIOutput = {
      concept: {
        summary: 'A sunlit vineyard gathering overlooking rolling Sonoma hills.',
        themeIdeas: ['Olive branch garlands', 'Linen table runners', 'Terracotta pottery accents'],
        decorationConcepts: ['Candlelit arbor', 'Rustic wine barrel cocktail tables'],
        recommendedActivities: ['Sunset wine tasting', 'Acoustic lawn set', 'Gelato cart'],
        cateringHighlights: ['Artisanal antipasti', 'Handmade gnocchi', 'Gluten-free focaccia'],
        ambiance: 'Warm, relaxed, and intimately joyful under string lights.',
      },
      budgetSplits: [
        { name: 'Venue & Facilities', description: 'Vineyard hire & tent setup', percentage: 35, notes: 'Includes ceremony lawn' },
        { name: 'Catering & Bar', description: 'Wine pairing dinner & service', percentage: 30, notes: 'Local sourcing' },
        { name: 'Decor & Styling', description: 'Florals, linen & lighting', percentage: 15 },
        { name: 'Photography & Music', description: 'Quartet & documentary photographer', percentage: 12 },
        { name: 'Contingency', description: 'Permits & buffers', percentage: 8 },
      ],
      timeline: {
        preparation: [
          { time: '12 weeks out', title: 'Vineyard walkthrough', responsible: 'Host', description: 'Verify setup layout', isCritical: true },
        ],
        weekOf: [
          { time: 'Day -2', title: 'Final guest count delivery', responsible: 'Planner', description: 'Confirm dietary counts', isCritical: true },
        ],
        dayOf: [
          { time: '3:00 PM', title: 'Guest Arrival & Welcome Spritz', responsible: 'Hospitality lead', description: 'Serve chilled prosecco', isCritical: false },
        ],
      },
      checklist: [
        { id: 'task-1', category: 'Vendor', text: 'Confirm acoustic quartet power needs', priority: 'high', timing: '4 weeks out' },
      ],
      vendors: [
        { category: 'Caterer', serviceScope: 'Plated dinner & bar service', localTip: 'Sonoma farm-to-table partners', estimatedLeadTime: '4 months' },
      ],
      practicalTips: ['Book guest shuttles early due to limited vineyard parking.'],
      risks: [
        { risk: 'Evening temperature drop in autumn', mitigation: 'Keep propane heaters on standby near lawn.' },
      ],
    };

    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(mockAIOutput),
    });

    const { req, res } = createMockReqRes(validEventRequest);
    await handler(req, res);

    expect(res.getStatusCode()).toBe(200);
    expect(res.getData().success).toBe(true);
    expect(res.getData().raw.concept.summary).toContain('Sonoma hills');
    expect(res.getData().raw.budgetSplits).toHaveLength(5);
  });

  it('handles markdown-wrapped JSON code fences from AI model cleanly', async () => {
    const rawWithFences = '```json\n{"concept":{"summary":"Test summary"}}\n```';
    mockGenerateContent.mockResolvedValueOnce({
      text: rawWithFences,
    });

    const { req, res } = createMockReqRes(validEventRequest);
    await handler(req, res);

    expect(res.getStatusCode()).toBe(200);
    expect(res.getData().success).toBe(true);
    expect(res.getData().raw.concept.summary).toBe('Test summary');
  });

  it('returns 502 PARSE_ERROR when AI returns corrupt non-JSON output', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: 'Sorry, I cannot help with that event plan due to content policies.',
    });

    const { req, res } = createMockReqRes(validEventRequest);
    await handler(req, res);

    expect(res.getStatusCode()).toBe(502);
    expect(res.getData().success).toBe(false);
    expect(res.getData().code).toBe('PARSE_ERROR');
    expect(res.getData().retryable).toBe(true);
  });

  it('returns 504 TIMEOUT when Gemini call times out', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('TIMEOUT_EXCEEDED'));

    const { req, res } = createMockReqRes(validEventRequest);
    await handler(req, res);

    expect(res.getStatusCode()).toBe(504);
    expect(res.getData().success).toBe(false);
    expect(res.getData().code).toBe('TIMEOUT');
    expect(res.getData().retryable).toBe(true);
  });

  it('returns 429 RATE_LIMIT when Gemini quotas are exceeded', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Quota exceeded for quota metric RESOURCE_EXHAUSTED 429'));

    const { req, res } = createMockReqRes(validEventRequest);
    await handler(req, res);

    expect(res.getStatusCode()).toBe(429);
    expect(res.getData().success).toBe(false);
    expect(res.getData().code).toBe('RATE_LIMIT');
    expect(res.getData().retryable).toBe(true);
  });

  it('extractJSON handles edge cases without throwing unhandled exceptions', () => {
    expect(extractJSON('{"hello":"world"}')).toEqual({ hello: 'world' });
    expect(extractJSON('Prefix text before ```json\n{"val":42}\n``` and suffix')).toEqual({ val: 42 });
    expect(() => extractJSON('random non-json garbage')).toThrow('AI output did not contain parseable JSON');
  });
});
