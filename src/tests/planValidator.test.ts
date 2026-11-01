import { describe, it, expect } from 'vitest';
import {
  validateGeneratedPlan,
  validateConcept,
  validateTimeline,
  validateChecklist,
  validateVendors,
  validateRisks,
  validateBudgetSplits,
} from '../utils/planValidator';
import {
  GeneratedEventPlanSchema,
  GeneratePlanRequestSchema,
} from '../types/generatedPlan';

describe('Plan Runtime Validator & Schemas', () => {
  const sampleRawPlan = {
    concept: {
      summary: 'A vibrant milestone birthday party with live funk band.',
      themeIdeas: ['Retro Neon Disco', 'Velvet Lounge'],
      decorationConcepts: ['Mirror balls', 'Custom neon signs'],
      recommendedActivities: ['Cocktail masterclass', 'Vinyl DJ set'],
      cateringHighlights: ['Late night slider station', 'Signature smoked old fashioneds'],
      ambiance: 'Electric and high-energy.',
    },
    timeline: {
      preparation: [
        { time: '6 weeks out', title: 'DJ booking', responsible: 'Host', description: 'Confirm setlist', isCritical: true },
      ],
      weekOf: [
        { time: 'Day -1', title: 'AV test', responsible: 'Sound lead', description: 'Check microphones', isCritical: false },
      ],
      dayOf: [
        { time: '7:00 PM', title: 'Doors open & cocktail service', responsible: 'Host', description: 'Welcome drinks', isCritical: true },
      ],
    },
    checklist: [
      { id: 'task-1', category: 'Vendor', text: 'Confirm cake delivery window', priority: 'high', timing: '3 days before' },
      { id: 'task-2', category: 'Logistics', text: 'Pick up wristbands', priority: 'medium', timing: 'Day before' },
    ],
    vendors: [
      { category: 'Lighting & Sound', serviceScope: 'PA system and party lights', localTip: 'Book sound tech early', estimatedLeadTime: '1 month' },
    ],
    practicalTips: [
      'Set up a coat check station near the entryway to keep lounge clear.',
    ],
    risks: [
      { risk: 'Sound ordinance complaints after 10 PM', mitigation: 'Switch to acoustic or indoor lounge speakers at 10 PM sharp.' },
    ],
  };

  it('validates and shapes a complete raw AI plan into a typed structure', () => {
    const plan = validateGeneratedPlan(sampleRawPlan, 'evt-draft-test');

    expect(plan.eventDraftId).toBe('evt-draft-test');
    expect(plan.version).toBe('2.0.0');
    expect(plan.concept.summary).toContain('milestone birthday');
    expect(plan.timeline.preparation).toHaveLength(1);
    expect(plan.timeline.dayOf).toHaveLength(1);
    expect(plan.checklist).toHaveLength(2);
    expect(plan.vendors).toHaveLength(1);
    expect(plan.risks).toHaveLength(1);
    expect(GeneratedEventPlanSchema.safeParse(plan).success).toBe(true);
  });

  it('throws descriptive error if raw payload is not an object', () => {
    expect(() => validateGeneratedPlan('not an object', 'evt-123')).toThrow(
      'AI response must be a valid JSON object',
    );
  });

  it('validateConcept safely sanitizes missing or corrupt fields with defaults', () => {
    const concept = validateConcept(null);
    expect(concept.summary).toBeDefined();
    expect(concept.themeIdeas).toBeInstanceOf(Array);
    expect(concept.themeIdeas.length).toBeGreaterThan(0);
  });

  it('validateTimeline filters out entries with missing titles or invalid structure', () => {
    const messyTimeline = {
      dayOf: [
        { time: '1:00 PM', title: 'Valid Entry', responsible: 'Lead', description: 'OK', isCritical: true },
        { time: '2:00 PM', title: '', responsible: 'Nobody' }, // Missing title
        'Not even an object',
      ],
    };

    const timeline = validateTimeline(messyTimeline);
    expect(timeline.dayOf).toHaveLength(1);
    expect(timeline.dayOf[0].title).toBe('Valid Entry');
    expect(timeline.preparation).toEqual([]);
  });

  it('validateChecklist normalizes categories, sets completed to false, and filters empty items', () => {
    const rawChecklist = [
      { id: 'c1', category: 'UnknownCategory', text: 'Task 1', priority: 'invalidPriority', timing: 'ASAP' },
      { text: 'Task 2 with no ID' },
      { text: '' }, // Should be excluded
    ];

    const tasks = validateChecklist(rawChecklist);
    expect(tasks).toHaveLength(2);
    expect(tasks[0].category).toBe('Logistics'); // Defaulted
    expect(tasks[0].priority).toBe('medium'); // Defaulted
    expect(tasks[0].completed).toBe(false);
    expect(tasks[1].id).toBeDefined();
  });

  it('validateVendors and validateRisks parse valid entries and drop empty entries', () => {
    const vendors = validateVendors([
      { category: 'Photographer', serviceScope: 'Documentary coverage', estimatedLeadTime: '3m' },
      { category: '', serviceScope: '' },
    ]);
    expect(vendors).toHaveLength(1);
    expect(vendors[0].category).toBe('Photographer');

    const risks = validateRisks([
      { risk: 'Rain', mitigation: 'Rent tent' },
      { risk: '', mitigation: '' },
    ]);
    expect(risks).toHaveLength(1);
    expect(risks[0].risk).toBe('Rain');
  });

  it('validateBudgetSplits discards negative, zero, or NaN percentages', () => {
    const rawSplits = [
      { name: 'Catering', description: 'Food', percentage: 30 },
      { name: 'Bogus', description: '', percentage: -10 },
      { name: 'Zero', description: '', percentage: 0 },
      { name: 'StringVal', description: '', percentage: 'forty' },
    ];

    const splits = validateBudgetSplits(rawSplits);
    expect(splits).toHaveLength(2); // Catering + Bogus normalized (Math.abs)
    expect(splits[0].percentage).toBe(30);
  });

  it('GeneratePlanRequestSchema strictly validates frontend requests', () => {
    const valid = {
      eventDraftId: 'evt-1',
      eventName: 'Grand Gala 2027',
      eventType: 'community',
      date: '2027-11-20',
      city: 'Chicago, IL',
      guestCount: 250,
      budget: 60000,
      currency: 'USD',
      foodPreferences: ['vegetarian'],
      theme: 'Emerald & Gold Formal',
      specialRequirements: 'Stage ramp required',
    };

    const parsed = GeneratePlanRequestSchema.safeParse(valid);
    expect(parsed.success).toBe(true);

    const invalid = { ...valid, eventType: 'unknown-party-type' };
    const failedParse = GeneratePlanRequestSchema.safeParse(invalid);
    expect(failedParse.success).toBe(false);
  });
});
