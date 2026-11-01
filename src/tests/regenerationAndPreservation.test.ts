import { describe, it, expect, vi, beforeEach } from 'vitest';
import { regenerateSection } from '../utils/apiClient';
import type { GeneratedEventPlan, GeneratePlanRequest } from '../types/generatedPlan';

const sampleExistingPlan: GeneratedEventPlan = {
  version: '2.0.0',
  generatedAt: '2026-10-31T12:00:00.000Z',
  eventDraftId: 'evt-test-999',
  concept: {
    summary: 'Original concept summary',
    themeIdeas: ['Original Theme 1'],
    decorationConcepts: ['Original Decor 1'],
    recommendedActivities: ['Original Activity 1'],
    cateringHighlights: ['Original Catering 1'],
    ambiance: 'Original cozy ambiance',
  },
  budget: {
    totalBudget: 40000,
    currency: 'USD',
    perGuestCost: 400,
    lineItems: [
      { name: 'Venue', description: 'Original venue', percentage: 40, estimatedCost: 16000 },
      { name: 'Catering', description: 'Original catering', percentage: 40, estimatedCost: 16000 },
      { name: 'Contingency', description: 'Original buffer', percentage: 20, estimatedCost: 8000 },
    ],
    disclaimer: 'Original disclaimer',
  },
  timeline: {
    preparation: [{ time: '8w', title: 'Original Prep', responsible: 'Host', description: '', isCritical: false }],
    weekOf: [{ time: 'Day -3', title: 'Original WeekOf', responsible: 'Host', description: '', isCritical: false }],
    dayOf: [{ time: '12:00', title: 'Original DayOf', responsible: 'Host', description: '', isCritical: true }],
  },
  checklist: [
    { id: 'task-1', category: 'Vendor', text: 'Book florist', priority: 'high', timing: '4w', completed: true },
    { id: 'task-2', category: 'Logistics', text: 'Arrange transit', priority: 'medium', timing: '2w', completed: false },
  ],
  vendors: [
    { category: 'Florist', serviceScope: 'Arbor and centerpieces', estimatedLeadTime: '2 months' },
  ],
  practicalTips: ['Original Tip 1'],
  risks: [{ risk: 'Original Risk', mitigation: 'Original Mitigation' }],
};

const mockRequest: GeneratePlanRequest = {
  eventDraftId: 'evt-test-999',
  eventName: 'Anniversary Dinner Party',
  eventType: 'anniversary',
  date: '2027-04-10',
  city: 'Chicago, IL',
  guestCount: 100,
  budget: 40000,
  currency: 'USD',
  foodPreferences: ['omnivore'],
  theme: 'Velvet Midnight',
  specialRequirements: 'Live saxophonist',
};

describe('Dynamic Regeneration & User Data Preservation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('regenerating concept updates only concept and strictly preserves budget, timeline, and checklist', async () => {
    // Mock global fetch for section = 'concept'
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        raw: {
          concept: {
            summary: 'Brand new regenerated concept narrative!',
            themeIdeas: ['New Theme Concept A'],
            decorationConcepts: ['New Decor Concept B'],
            recommendedActivities: ['New Activity C'],
            cateringHighlights: ['New Catering D'],
            ambiance: 'Brand new ambiance',
          },
        },
      }),
    });

    const updatedPlan = await regenerateSection('concept', mockRequest, sampleExistingPlan);

    // Concept is updated
    expect(updatedPlan.concept.summary).toBe('Brand new regenerated concept narrative!');
    expect(updatedPlan.concept.themeIdeas[0]).toBe('New Theme Concept A');

    // Budget is strictly preserved from previous state
    expect(updatedPlan.budget.totalBudget).toBe(sampleExistingPlan.budget.totalBudget);
    expect(updatedPlan.budget.lineItems).toEqual(sampleExistingPlan.budget.lineItems);

    // Timeline and checklist are strictly preserved
    expect(updatedPlan.timeline).toEqual(sampleExistingPlan.timeline);
    expect(updatedPlan.checklist).toEqual(sampleExistingPlan.checklist);
    expect(updatedPlan.vendors).toEqual(sampleExistingPlan.vendors);
  });

  it('regenerating checklist preserves the completion status of existing tasks', async () => {
    // task-1 was completed=true in sampleExistingPlan
    // AI returns new checklist that includes task-1 and task-3
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        raw: {
          checklist: [
            { id: 'task-1', category: 'Vendor', text: 'Book florist with updated scope', priority: 'high', timing: '3w' },
            { id: 'task-3', category: 'Decor', text: 'Pick up bespoke candles', priority: 'medium', timing: '1w' },
          ],
        },
      }),
    });

    const updatedPlan = await regenerateSection('checklist', mockRequest, sampleExistingPlan);

    expect(updatedPlan.checklist).toHaveLength(2);
    // task-1 should still have completed = true!
    const task1 = updatedPlan.checklist.find((t) => t.id === 'task-1');
    expect(task1?.completed).toBe(true);

    // task-3 should have completed = false
    const task3 = updatedPlan.checklist.find((t) => t.id === 'task-3');
    expect(task3?.completed).toBe(false);

    // Concept and budget preserved
    expect(updatedPlan.concept.summary).toBe(sampleExistingPlan.concept.summary);
  });

  it('regenerating budget recalculates category totals strictly in application code matching requested budget', async () => {
    const requestWithNewBudget: GeneratePlanRequest = {
      ...mockRequest,
      budget: 60000,
      guestCount: 150,
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        raw: {
          budgetSplits: [
            { name: 'Venue & Grounds', description: 'Estate hire', percentage: 50 },
            { name: 'Catering & Cocktails', description: 'Full course service', percentage: 35 },
            { name: 'Contingency', description: 'Overtime buffer', percentage: 15 },
          ],
        },
      }),
    });

    const updatedPlan = await regenerateSection('budget', requestWithNewBudget, sampleExistingPlan);

    expect(updatedPlan.budget.totalBudget).toBe(60000);
    expect(updatedPlan.budget.perGuestCost).toBe(400);

    const sum = updatedPlan.budget.lineItems.reduce((acc, li) => acc + li.estimatedCost, 0);
    expect(sum).toBe(60000);

    // Timeline and concept preserved
    expect(updatedPlan.timeline).toEqual(sampleExistingPlan.timeline);
    expect(updatedPlan.concept).toEqual(sampleExistingPlan.concept);
  });
});

