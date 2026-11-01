import { describe, it, expect } from 'vitest';
import {
  computeBudgetPlan,
  defaultBudgetPlan,
  reconcileBudget,
  adjustBudgetToNewTotal,
} from '../utils/budgetEngine';
import type { RawBudgetSplit } from '../types/generatedPlan';

describe('Budget Engine (Pure Application Code Financial Calculation)', () => {
  const sampleSplits: RawBudgetSplit[] = [
    { name: 'Venue & Facilities', description: 'Space rental & cleanup', percentage: 35 },
    { name: 'Catering & Beverages', description: 'Dinner, bar, and staff', percentage: 30 },
    { name: 'Decor & Styling', description: 'Florals and lighting', percentage: 15 },
    { name: 'Photography & Music', description: 'Photo & DJ', percentage: 12 },
    { name: 'Contingency Reserve', description: 'Unplanned expenses', percentage: 8 },
  ];

  it('normalizes splits and ensures line items strictly sum to the total budget', () => {
    const totalBudget = 35000;
    const plan = computeBudgetPlan(sampleSplits, totalBudget, 'USD', 100);

    const calculatedSum = plan.lineItems.reduce((acc, li) => acc + li.estimatedCost, 0);
    expect(calculatedSum).toBe(totalBudget);
    expect(reconcileBudget(plan)).toBe(true);
  });

  it('handles arbitrary budgets with odd numbers and resolves rounding drift', () => {
    // 33,333 is notorious for 1/3 cent drift
    const totalBudget = 33333;
    const plan = computeBudgetPlan(sampleSplits, totalBudget, 'USD', 77);

    const calculatedSum = plan.lineItems.reduce((acc, li) => acc + li.estimatedCost, 0);
    expect(calculatedSum).toBe(totalBudget);
    expect(reconcileBudget(plan)).toBe(true);
  });

  it('calculates correct perGuestCost based on user-provided guest count', () => {
    const totalBudget = 25000;
    const guestCount = 50;
    const plan = computeBudgetPlan(sampleSplits, totalBudget, 'USD', guestCount);

    expect(plan.perGuestCost).toBe(500);
  });

  it('handles zero or negative guest count safely without NaN or division by zero', () => {
    const plan = computeBudgetPlan(sampleSplits, 10000, 'USD', 0);
    expect(plan.perGuestCost).toBe(0);
    expect(Number.isFinite(plan.perGuestCost)).toBe(true);
  });

  it('flags overflow warning if any category accounts for >50% of the budget', () => {
    const unbalancedSplits: RawBudgetSplit[] = [
      { name: 'Luxury Venue', description: 'High-end castle', percentage: 65 },
      { name: 'Catering', description: 'Basic finger foods', percentage: 20 },
      { name: 'Others', description: 'Miscellaneous', percentage: 15 },
    ];

    const plan = computeBudgetPlan(unbalancedSplits, 50000, 'EUR', 100);
    expect(plan.overflowWarning).toBeDefined();
    expect(plan.overflowWarning).toContain('Luxury Venue');
    expect(plan.overflowWarning).toContain('65%');
  });

  it('does NOT flag overflow warning when budget is well balanced', () => {
    const plan = computeBudgetPlan(sampleSplits, 40000, 'USD', 120);
    expect(plan.overflowWarning).toBeUndefined();
  });

  it('always includes explicit disclaimer stating costs are illustrative guidelines', () => {
    const plan = computeBudgetPlan(sampleSplits, 20000, 'USD', 50);
    expect(plan.disclaimer).toBeDefined();
    expect(plan.disclaimer).toContain('illustrative planning guidelines');
    expect(plan.disclaimer).toContain('do not represent verified market prices');
  });

  it('falls back to defaultBudgetPlan if AI returns empty or missing splits', () => {
    const plan = defaultBudgetPlan(15000, 'GBP', 30);
    expect(plan.lineItems.length).toBeGreaterThanOrEqual(4);
    expect(reconcileBudget(plan)).toBe(true);
  });

  it('dynamically adjusts budget when user edits target budget without altering percentage ratios', () => {
    const originalPlan = computeBudgetPlan(sampleSplits, 30000, 'USD', 100);
    expect(originalPlan.totalBudget).toBe(30000);

    // User updates budget to 45,000 and guest count to 150
    const updatedPlan = adjustBudgetToNewTotal(originalPlan, 45000, 150);
    expect(updatedPlan.totalBudget).toBe(45000);
    expect(updatedPlan.perGuestCost).toBe(300);

    const calculatedSum = updatedPlan.lineItems.reduce((acc, li) => acc + li.estimatedCost, 0);
    expect(calculatedSum).toBe(45000);
    expect(reconcileBudget(updatedPlan)).toBe(true);

    // Venue category remains at 35%
    const venueItem = updatedPlan.lineItems.find((li) => li.name.includes('Venue'));
    expect(venueItem?.percentage).toBe(35);
    expect(venueItem?.estimatedCost).toBe(Math.round(0.35 * 45000));
  });
});
