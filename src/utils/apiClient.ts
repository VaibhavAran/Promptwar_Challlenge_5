/**
 * Gatherly AI — API Client Service
 *
 * All client-side communication with the serverless endpoint (/api/generate-plan)
 * is encapsulated here.
 *
 * Security: The frontend code NEVER imports @google/genai or touches the API key.
 * All generation and AI orchestration executes on the server.
 */

import type {
  GeneratePlanRequest,
  GeneratedEventPlan,
  EventBudgetPlan,
  RegenerableSection,
} from '../types/generatedPlan';
import { computeBudgetPlan, defaultBudgetPlan } from './budgetEngine';
import { validateGeneratedPlan, validateBudgetSplits } from './planValidator';

const API_ENDPOINT = '/api/generate-plan';
// Keep this slightly longer than the server guard so the API can return its
// structured timeout response instead of the browser aborting first.
const CLIENT_TIMEOUT_MS = 34_000;

// ─── Fetch Helper with Timeout ─────────────────────────────────────────────────

async function apiFetch(body: Record<string, unknown>): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Budget Assembly Helper ───────────────────────────────────────────────────

function assembleBudget(
  raw: Record<string, unknown>,
  request: GeneratePlanRequest,
): EventBudgetPlan {
  const splits = validateBudgetSplits(raw.budgetSplits);
  const budget = Number(request.budget);
  const guests = Number(request.guestCount);

  if (splits.length > 0) {
    return computeBudgetPlan(splits, budget, request.currency, guests);
  }
  return defaultBudgetPlan(budget, request.currency, guests);
}

// ─── Full Plan Generation ─────────────────────────────────────────────────────

export async function generateEventPlan(
  request: GeneratePlanRequest,
): Promise<GeneratedEventPlan> {
  let response: Response;

  try {
    response = await apiFetch({ ...request });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('abort') || msg.includes('timeout')) {
      throw new Error(
        'The generation request timed out. Please check your connection and try again.',
        { cause: err },
      );
    }
    throw new Error(
      'Unable to connect to the planning service. Please ensure your server is running.',
      { cause: err },
    );
  }

  const data = (await response.json()) as Record<string, unknown>;

  if (!response.ok || data.success === false) {
    const message =
      typeof data.error === 'string'
        ? data.error
        : 'An error occurred while generating your event plan.';
    const errorObj = new Error(message);
    (errorObj as NodeJS.ErrnoException).code =
      typeof data.code === 'string' ? data.code : 'UNKNOWN';
    throw errorObj;
  }

  // Extract raw model payload and validate runtime structure
  const raw = (data.raw ?? data) as Record<string, unknown>;
  const plan = validateGeneratedPlan(raw, request.eventDraftId);

  // Compute budget purely via application code (never from AI figures)
  plan.budget = assembleBudget(raw, request);

  return plan;
}

// ─── Section Regeneration ─────────────────────────────────────────────────────

export async function regenerateSection(
  section: RegenerableSection,
  request: GeneratePlanRequest,
  existingPlan: GeneratedEventPlan,
): Promise<GeneratedEventPlan> {
  let response: Response;

  try {
    response = await apiFetch({ ...request, section });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('abort') || msg.includes('timeout')) {
      throw new Error(
        `The request to regenerate ${section} timed out. Please try again.`,
        { cause: err },
      );
    }
    throw new Error(
      `Unable to reach planning service to regenerate ${section}.`,
      { cause: err },
    );
  }

  const data = (await response.json()) as Record<string, unknown>;

  if (!response.ok || data.success === false) {
    const message =
      typeof data.error === 'string'
        ? data.error
        : `Failed to regenerate ${section}.`;
    const errorObj = new Error(message);
    (errorObj as NodeJS.ErrnoException).code =
      typeof data.code === 'string' ? data.code : 'UNKNOWN';
    throw errorObj;
  }

  const raw = (data.raw ?? data) as Record<string, unknown>;

  // Merge ONLY the target regenerated section into existing plan;
  // strictly preserve all other existing user data and edits.
  const updated: GeneratedEventPlan = {
    ...existingPlan,
    generatedAt: new Date().toISOString(),
  };

  switch (section) {
    case 'concept': {
      const partial = validateGeneratedPlan(
        { concept: raw.concept },
        request.eventDraftId,
      );
      updated.concept = partial.concept;
      break;
    }
    case 'budget': {
      updated.budget = assembleBudget(raw, request);
      break;
    }
    case 'timeline': {
      const partial = validateGeneratedPlan(
        { timeline: raw.timeline },
        request.eventDraftId,
      );
      updated.timeline = partial.timeline;
      break;
    }
    case 'checklist': {
      const partial = validateGeneratedPlan(
        { checklist: raw.checklist },
        request.eventDraftId,
      );
      // Preserve completed status for any matching task ids
      const existingCompletionMap = new Map(
        existingPlan.checklist.map((t) => [t.id, t.completed]),
      );
      updated.checklist = partial.checklist.map((t) => ({
        ...t,
        completed: existingCompletionMap.get(t.id) ?? false,
      }));
      break;
    }
    case 'vendors': {
      const partial = validateGeneratedPlan(
        { vendors: raw.vendors },
        request.eventDraftId,
      );
      updated.vendors = partial.vendors;
      break;
    }
  }

  return updated;
}
