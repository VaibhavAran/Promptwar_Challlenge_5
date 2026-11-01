import { z } from 'zod';

/**
 * Generated Event Plan — TypeScript types and runtime Zod schemas.
 * These schemas form the runtime-validated contract between Gemini API responses
 * and the Gatherly AI frontend.
 *
 * All financial calculations are performed in application code, NOT by the AI model.
 */

// ─── Budget Zod Schemas ────────────────────────────────────────────────────────

export const BudgetLineItemSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  percentage: z.number().min(0).max(100),
  estimatedCost: z.number().nonnegative(),
  notes: z.string().optional(),
});
export type BudgetLineItem = z.infer<typeof BudgetLineItemSchema>;

export const EventBudgetPlanSchema = z.object({
  totalBudget: z.number().nonnegative(),
  currency: z.string(),
  perGuestCost: z.number().nonnegative(),
  lineItems: z.array(BudgetLineItemSchema),
  overflowWarning: z.string().optional(),
  disclaimer: z.string(),
});
export type EventBudgetPlan = z.infer<typeof EventBudgetPlanSchema>;

// ─── Timeline Zod Schemas ──────────────────────────────────────────────────────

export const TimelineEntrySchema = z.object({
  time: z.string(),
  title: z.string().min(1),
  responsible: z.string(),
  description: z.string(),
  isCritical: z.boolean(),
});
export type TimelineEntry = z.infer<typeof TimelineEntrySchema>;

export const EventTimelineSchema = z.object({
  preparation: z.array(TimelineEntrySchema),
  weekOf: z.array(TimelineEntrySchema),
  dayOf: z.array(TimelineEntrySchema),
});
export type EventTimeline = z.infer<typeof EventTimelineSchema>;

// ─── Checklist Zod Schemas ─────────────────────────────────────────────────────

export const ChecklistCategorySchema = z.enum([
  'Vendor',
  'Logistics',
  'Guests',
  'Decor',
  'Safety',
]);
export type ChecklistCategory = z.infer<typeof ChecklistCategorySchema>;

export const ChecklistPrioritySchema = z.enum(['high', 'medium', 'low']);
export type ChecklistPriority = z.infer<typeof ChecklistPrioritySchema>;

export const ChecklistEntrySchema = z.object({
  id: z.string(),
  category: ChecklistCategorySchema,
  text: z.string().min(1),
  priority: ChecklistPrioritySchema,
  timing: z.string(),
  completed: z.boolean().default(false),
});
export type ChecklistEntry = z.infer<typeof ChecklistEntrySchema>;

// ─── Concept & Vendors Zod Schemas ─────────────────────────────────────────────

export const VendorRecommendationSchema = z.object({
  category: z.string().min(1),
  serviceScope: z.string(),
  localTip: z.string().optional(),
  estimatedLeadTime: z.string(),
});
export type VendorRecommendation = z.infer<typeof VendorRecommendationSchema>;

export const EventConceptSchema = z.object({
  summary: z.string().min(1),
  themeIdeas: z.array(z.string()),
  decorationConcepts: z.array(z.string()),
  recommendedActivities: z.array(z.string()),
  cateringHighlights: z.array(z.string()),
  ambiance: z.string(),
});
export type EventConcept = z.infer<typeof EventConceptSchema>;

export const RiskItemSchema = z.object({
  risk: z.string().min(1),
  mitigation: z.string().min(1),
});
export type RiskItem = z.infer<typeof RiskItemSchema>;

// ─── Complete Generated Plan Schema ────────────────────────────────────────────

export const GeneratedEventPlanSchema = z.object({
  version: z.string(),
  generatedAt: z.string(),
  eventDraftId: z.string(),
  concept: EventConceptSchema,
  budget: EventBudgetPlanSchema,
  timeline: EventTimelineSchema,
  checklist: z.array(ChecklistEntrySchema),
  vendors: z.array(VendorRecommendationSchema),
  practicalTips: z.array(z.string()),
  risks: z.array(RiskItemSchema),
});
export type GeneratedEventPlan = z.infer<typeof GeneratedEventPlanSchema>;

// ─── Generation Status & State ─────────────────────────────────────────────────

export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

export interface GenerationState {
  status: GenerationStatus;
  plan: GeneratedEventPlan | null;
  error: string | null;
  lastAttemptAt: string | null;
  retryCount: number;
}

// ─── API Request & Response Schemas ────────────────────────────────────────────

export const GeneratePlanRequestSchema = z.object({
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
  date: z.string().min(1, 'Event date is required'),
  city: z.string().min(2, 'City is required'),
  guestCount: z.number().int().min(1, 'Guest count must be at least 1').max(100_000),
  budget: z.number().positive('Budget must be greater than 0'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR']),
  foodPreferences: z.array(z.string()).default([]),
  theme: z.string().max(200).default(''),
  specialRequirements: z.string().max(1500).default(''),
  section: z.enum(['concept', 'budget', 'timeline', 'checklist', 'vendors']).optional(),
});
export type GeneratePlanRequest = z.infer<typeof GeneratePlanRequestSchema>;

export interface GeneratePlanResponse {
  success: true;
  plan?: GeneratedEventPlan;
  raw?: unknown;
  isSection?: boolean;
  section?: string;
}

export interface GeneratePlanErrorResponse {
  success: false;
  error: string;
  code:
    | 'MISSING_KEY'
    | 'VALIDATION_ERROR'
    | 'AI_ERROR'
    | 'PARSE_ERROR'
    | 'RATE_LIMIT'
    | 'TIMEOUT'
    | 'UNKNOWN';
  retryable: boolean;
}

export type ApiResponse = GeneratePlanResponse | GeneratePlanErrorResponse;

// ─── Regenerable Sections ──────────────────────────────────────────────────────

export type RegenerableSection = 'concept' | 'budget' | 'timeline' | 'checklist' | 'vendors';

export interface RegenerateSectionRequest extends GeneratePlanRequest {
  section: RegenerableSection;
}

// ─── Raw Gemini Payload Schema ─────────────────────────────────────────────────

export const RawBudgetSplitSchema = z.object({
  name: z.string(),
  description: z.string().default(''),
  percentage: z.number(),
  notes: z.string().optional(),
});
export type RawBudgetSplit = z.infer<typeof RawBudgetSplitSchema>;
