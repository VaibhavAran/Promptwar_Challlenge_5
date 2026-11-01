/**
 * Budget calculation utilities.
 * ALL financial calculations happen here in application code.
 * The AI only returns percentage splits and descriptions.
 * Actual currency amounts are always computed from the user-provided budget.
 */

import type {
  BudgetLineItem,
  EventBudgetPlan,
  RawBudgetSplit,
} from '../types/generatedPlan';

/**
 * Accepts AI-suggested percentage splits and user's locked budget.
 * Normalises percentages to sum to exactly 100, then computes amounts.
 * Guarantees that the sum of line items strictly matches totalBudget.
 * Never over-spends the user's budget.
 */
export function computeBudgetPlan(
  rawSplits: RawBudgetSplit[],
  totalBudget: number,
  currency: string,
  guestCount: number,
): EventBudgetPlan {
  const safeTotalBudget = Math.max(0, Number(totalBudget) || 0);
  const safeGuestCount = Math.max(0, Number(guestCount) || 0);

  if (!rawSplits || !rawSplits.length) {
    return defaultBudgetPlan(safeTotalBudget, currency, safeGuestCount);
  }

  // 1. Normalise percentages so they always sum to exactly 100
  const totalPct = rawSplits.reduce((sum, s) => sum + s.percentage, 0);
  const normalised: RawBudgetSplit[] = rawSplits.map((s) => ({
    ...s,
    percentage: totalPct > 0 ? Math.round((s.percentage / totalPct) * 100) : 0,
  }));

  // 2. Fix rounding drift — distribute remainder to the largest category
  const normalisedTotal = normalised.reduce((sum, s) => sum + s.percentage, 0);
  if (normalisedTotal !== 100 && normalised.length > 0) {
    const maxIdx = normalised.reduce(
      (maxI, s, i) => (s.percentage > normalised[maxI].percentage ? i : maxI),
      0,
    );
    normalised[maxIdx].percentage += 100 - normalisedTotal;
  }

  // 3. Compute currency amounts from the normalised percentages
  const lineItems: BudgetLineItem[] = normalised.map((s) => ({
    name: s.name,
    description: s.description,
    percentage: s.percentage,
    estimatedCost: Math.round((s.percentage / 100) * safeTotalBudget),
    notes: s.notes,
  }));

  // 4. Cent-level reconciliation: ensure sum(lineItems) strictly equals safeTotalBudget
  const computedTotal = lineItems.reduce((sum, li) => sum + li.estimatedCost, 0);
  const diff = safeTotalBudget - computedTotal;
  if (diff !== 0 && lineItems.length > 0) {
    lineItems[0].estimatedCost += diff;
  }

  // 5. Overflow detection: flag if any single category exceeds 50% of budget
  let overflowWarning: string | undefined;
  const maxItem = lineItems.reduce(
    (m, li) => (li.estimatedCost > m.estimatedCost ? li : m),
    lineItems[0],
  );
  if (maxItem && safeTotalBudget > 0 && maxItem.estimatedCost > safeTotalBudget * 0.5) {
    overflowWarning = `"${maxItem.name}" accounts for ${maxItem.percentage}% of the total budget — consider redistributing to preserve balanced guest experience.`;
  }

  return {
    totalBudget: safeTotalBudget,
    currency,
    perGuestCost: safeGuestCount > 0 ? Math.round(safeTotalBudget / safeGuestCount) : 0,
    lineItems,
    overflowWarning,
    disclaimer:
      'All cost estimates are illustrative planning guidelines based on your stated budget. They do not represent verified market prices or guaranteed vendor quotes.',
  };
}

/**
 * Dynamically re-adjusts an existing budget plan to a newly edited user budget or guest count
 * while preserving the existing percentage allocations and categories.
 */
export function adjustBudgetToNewTotal(
  existingPlan: EventBudgetPlan,
  newTotalBudget: number,
  newGuestCount: number,
): EventBudgetPlan {
  const safeNewTotal = Math.max(0, Number(newTotalBudget) || 0);
  const safeGuestCount = Math.max(0, Number(newGuestCount) || 0);

  const rawSplits: RawBudgetSplit[] = existingPlan.lineItems.map((li) => ({
    name: li.name,
    description: li.description,
    percentage: li.percentage,
    notes: li.notes,
  }));

  return computeBudgetPlan(
    rawSplits,
    safeNewTotal,
    existingPlan.currency,
    safeGuestCount,
  );
}

/**
 * Default static budget plan (used as fallback when AI doesn't return splits).
 */
export function defaultBudgetPlan(
  totalBudget: number,
  currency: string,
  guestCount: number,
): EventBudgetPlan {
  const splits: RawBudgetSplit[] = [
    {
      name: 'Venue & Facilities',
      description: 'Location hire, AV setup, tables, chairs, and site cleanup.',
      percentage: 35,
    },
    {
      name: 'Catering & Beverages',
      description: 'Multi-course catering, bar service, glassware, and staff.',
      percentage: 30,
    },
    {
      name: 'Decor, Florals & Ambiance',
      description: 'Centrepieces, lighting accents, linens, and signage.',
      percentage: 15,
    },
    {
      name: 'Photography & Entertainment',
      description: 'Photographer/videographer and musical entertainment.',
      percentage: 12,
    },
    {
      name: 'Contingency & Incidentals',
      description: 'Permits, overtime buffers, and unexpected day-of expenses.',
      percentage: 8,
    },
  ];
  return computeBudgetPlan(splits, totalBudget, currency, guestCount);
}

/**
 * Reconciles total: verifies that the sum of line items strictly matches totalBudget.
 * Returns true if perfectly reconciled or within $1 rounding boundary.
 */
export function reconcileBudget(plan: EventBudgetPlan): boolean {
  if (!plan || !Array.isArray(plan.lineItems)) return false;
  if (plan.lineItems.length === 0) return plan.totalBudget === 0;

  const sum = plan.lineItems.reduce((t, li) => t + li.estimatedCost, 0);
  return Math.abs(sum - plan.totalBudget) <= 1;
}
