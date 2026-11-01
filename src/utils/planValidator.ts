/**
 * Runtime validation for the AI-generated JSON payload.
 *
 * Uses Zod schemas and safe sanitization to validate and transform
 * untyped AI responses into strict, type-safe structures before
 * they ever reach application state.
 */

import { z } from 'zod';
import {
  GeneratedEventPlan,
  EventConcept,
  EventTimeline,
  ChecklistEntry,
  VendorRecommendation,
  RiskItem,
  TimelineEntry,
  EventConceptSchema,
  TimelineEntrySchema,
  EventTimelineSchema,
  ChecklistEntrySchema,
  VendorRecommendationSchema,
  RiskItemSchema,
  RawBudgetSplit,
  RawBudgetSplitSchema,
} from '../types/generatedPlan';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// ─── Section Parsers ───────────────────────────────────────────────────────────

export function validateConcept(raw: unknown): EventConcept {
  if (!isObject(raw)) {
    return {
      summary: 'A bespoke celebration tailored to your guests and venue.',
      themeIdeas: ['Atmospheric lighting and customized accents'],
      decorationConcepts: ['Warm ambient florals and tablescapes'],
      recommendedActivities: ['Welcoming cocktail hour and music'],
      cateringHighlights: ['Seasonally inspired dishes'],
      ambiance: 'Warm, welcoming, and memorable.',
    };
  }

  const result = EventConceptSchema.safeParse({
    summary: typeof raw.summary === 'string' && raw.summary.trim() ? raw.summary : 'A bespoke celebration tailored to your vision.',
    themeIdeas: Array.isArray(raw.themeIdeas) ? raw.themeIdeas.filter((s): s is string => typeof s === 'string') : [],
    decorationConcepts: Array.isArray(raw.decorationConcepts) ? raw.decorationConcepts.filter((s): s is string => typeof s === 'string') : [],
    recommendedActivities: Array.isArray(raw.recommendedActivities) ? raw.recommendedActivities.filter((s): s is string => typeof s === 'string') : [],
    cateringHighlights: Array.isArray(raw.cateringHighlights) ? raw.cateringHighlights.filter((s): s is string => typeof s === 'string') : [],
    ambiance: typeof raw.ambiance === 'string' ? raw.ambiance : '',
  });

  if (result.success) return result.data;

  return {
    summary: String(raw.summary || 'A bespoke celebration.'),
    themeIdeas: [],
    decorationConcepts: [],
    recommendedActivities: [],
    cateringHighlights: [],
    ambiance: '',
  };
}

export function validateTimelineEntries(raw: unknown): TimelineEntry[] {
  if (!Array.isArray(raw)) return [];
  const entries: TimelineEntry[] = [];

  for (const item of raw) {
    if (!isObject(item)) continue;
    const candidate = {
      time: typeof item.time === 'string' ? item.time : 'TBD',
      title: typeof item.title === 'string' ? item.title : '',
      responsible: typeof item.responsible === 'string' ? item.responsible : 'Host',
      description: typeof item.description === 'string' ? item.description : '',
      isCritical: typeof item.isCritical === 'boolean' ? item.isCritical : false,
    };
    const parsed = TimelineEntrySchema.safeParse(candidate);
    if (parsed.success && parsed.data.title.trim().length > 0) {
      entries.push(parsed.data);
    }
  }

  return entries;
}

export function validateTimeline(raw: unknown): EventTimeline {
  if (!isObject(raw)) {
    return { preparation: [], weekOf: [], dayOf: [] };
  }

  const candidate = {
    preparation: validateTimelineEntries(raw.preparation),
    weekOf: validateTimelineEntries(raw.weekOf),
    dayOf: validateTimelineEntries(raw.dayOf),
  };

  const parsed = EventTimelineSchema.safeParse(candidate);
  return parsed.success ? parsed.data : { preparation: [], weekOf: [], dayOf: [] };
}

const VALID_CATEGORIES = new Set(['Vendor', 'Logistics', 'Guests', 'Decor', 'Safety']);
const VALID_PRIORITIES = new Set(['high', 'medium', 'low']);

export function validateChecklist(raw: unknown): ChecklistEntry[] {
  if (!Array.isArray(raw)) return [];
  const entries: ChecklistEntry[] = [];

  for (let idx = 0; idx < raw.length; idx++) {
    const item = raw[idx];
    if (!isObject(item)) continue;
    const text = typeof item.text === 'string' ? item.text.trim() : '';
    if (!text) continue;

    const candidate = {
      id: typeof item.id === 'string' && item.id.trim() ? item.id : `task-${idx}-${Date.now()}`,
      category: VALID_CATEGORIES.has(item.category as string) ? item.category : 'Logistics',
      text,
      priority: VALID_PRIORITIES.has(item.priority as string) ? item.priority : 'medium',
      timing: typeof item.timing === 'string' ? item.timing : '',
      completed: false,
    };

    const parsed = ChecklistEntrySchema.safeParse(candidate);
    if (parsed.success) {
      entries.push(parsed.data);
    }
  }

  return entries;
}

export function validateVendors(raw: unknown): VendorRecommendation[] {
  if (!Array.isArray(raw)) return [];
  const entries: VendorRecommendation[] = [];

  for (const item of raw) {
    if (!isObject(item)) continue;
    const category = typeof item.category === 'string' ? item.category.trim() : 'Vendor';
    const serviceScope = typeof item.serviceScope === 'string' ? item.serviceScope.trim() : '';
    if (!category || !serviceScope) continue;

    const candidate = {
      category,
      serviceScope,
      localTip: typeof item.localTip === 'string' ? item.localTip : undefined,
      estimatedLeadTime: typeof item.estimatedLeadTime === 'string' ? item.estimatedLeadTime : 'Inquire early',
    };

    const parsed = VendorRecommendationSchema.safeParse(candidate);
    if (parsed.success) {
      entries.push(parsed.data);
    }
  }

  return entries;
}

export function validateRisks(raw: unknown): RiskItem[] {
  if (!Array.isArray(raw)) return [];
  const entries: RiskItem[] = [];

  for (const item of raw) {
    if (!isObject(item)) continue;
    const risk = typeof item.risk === 'string' ? item.risk.trim() : '';
    const mitigation = typeof item.mitigation === 'string' ? item.mitigation.trim() : '';
    if (!risk || !mitigation) continue;

    const parsed = RiskItemSchema.safeParse({ risk, mitigation });
    if (parsed.success) {
      entries.push(parsed.data);
    }
  }

  return entries;
}

export function validateBudgetSplits(raw: unknown): RawBudgetSplit[] {
  if (!Array.isArray(raw)) return [];
  const splits: RawBudgetSplit[] = [];

  for (const item of raw) {
    if (!isObject(item)) continue;
    const name = typeof item.name === 'string' ? item.name.trim() : 'Category';
    const percentage = typeof item.percentage === 'number' ? Math.abs(item.percentage) : 0;
    if (percentage <= 0) continue;

    const candidate = {
      name,
      description: typeof item.description === 'string' ? item.description : '',
      percentage,
      notes: typeof item.notes === 'string' ? item.notes : undefined,
    };

    const parsed = RawBudgetSplitSchema.safeParse(candidate);
    if (parsed.success) {
      splits.push(parsed.data);
    }
  }

  return splits;
}

// ─── Top-level Plan Validation ────────────────────────────────────────────────

export function validateGeneratedPlan(
  raw: unknown,
  eventDraftId: string,
): GeneratedEventPlan {
  if (!isObject(raw)) {
    throw new Error('AI response must be a valid JSON object');
  }

  const practicalTips = Array.isArray(raw.practicalTips)
    ? raw.practicalTips.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
    : [];

  return {
    version: '2.0.0',
    generatedAt: new Date().toISOString(),
    eventDraftId,
    concept: validateConcept(raw.concept),
    budget: {
      totalBudget: 0,
      currency: 'USD',
      perGuestCost: 0,
      lineItems: [],
      disclaimer: '',
    },
    timeline: validateTimeline(raw.timeline),
    checklist: validateChecklist(raw.checklist),
    vendors: validateVendors(raw.vendors),
    practicalTips,
    risks: validateRisks(raw.risks),
  };
}

// Export raw validator schema for tests
export const RuntimeEventPlanValidator = z.object({
  concept: z.unknown(),
  budgetSplits: z.array(z.unknown()).optional(),
  timeline: z.unknown().optional(),
  checklist: z.array(z.unknown()).optional(),
  vendors: z.array(z.unknown()).optional(),
  practicalTips: z.array(z.string()).optional(),
  risks: z.array(z.unknown()).optional(),
});
