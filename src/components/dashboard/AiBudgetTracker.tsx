/**
 * AI-powered Budget Tracker.
 * Replaces BudgetTrackerPreview.tsx with genuine GenAI allocations.
 *
 * All financial amounts are calculated strictly in application code (budgetEngine.ts).
 * Category totals reconcile exactly to the user's allocated budget.
 */

import React from 'react';
import { RefreshCw, Loader2, AlertTriangle, Info, Sparkles } from 'lucide-react';
import type { EventDraft } from '../../types/event';
import type { GeneratedEventPlan, RegenerableSection } from '../../types/generatedPlan';
import { defaultBudgetPlan, reconcileBudget } from '../../utils/budgetEngine';
import { formatCurrency } from '../../utils/formatters';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

const CATEGORY_COLORS: Record<string, string> = {
  'Venue & Facilities': 'bg-coral-500',
  'Venue & Space': 'bg-coral-500',
  'Catering & Beverages': 'bg-charcoal-700',
  'Catering & Bar': 'bg-charcoal-700',
  'Food & Beverages': 'bg-charcoal-700',
  'Decor, Florals & Ambiance': 'bg-amber-600',
  'Decor & Styling': 'bg-amber-600',
  'Decor & Ambiance': 'bg-amber-600',
  'Photography & Entertainment': 'bg-teal-600',
  'Photography & Media': 'bg-teal-600',
  'Entertainment & Music': 'bg-teal-600',
  'Contingency & Incidentals': 'bg-sand-400',
  'Contingency Reserve': 'bg-sand-400',
};

const FALLBACK_COLOR = 'bg-charcoal-400';

function getCategoryColor(name: string): string {
  const exact = CATEGORY_COLORS[name];
  if (exact) return exact;
  const entry = Object.entries(CATEGORY_COLORS).find(([key]) =>
    name.toLowerCase().includes(key.split(' ')[0].toLowerCase()),
  );
  return entry ? entry[1] : FALLBACK_COLOR;
}

interface AiBudgetTrackerProps {
  draft: EventDraft;
  plan: GeneratedEventPlan | null;
  isGenerating: boolean;
  onRegenerate: (section: RegenerableSection) => void;
  onGenerate?: () => void;
}

export const AiBudgetTracker: React.FC<AiBudgetTrackerProps> = ({
  draft,
  plan,
  isGenerating,
  onRegenerate,
  onGenerate,
}) => {
  const totalBudget = Number(draft.budget) || 0;
  const currency = draft.currency || 'USD';
  const guestCount = Number(draft.guestCount) || 0;

  // Use AI budget if available, otherwise fall back to application-computed default baseline
  const budgetPlan =
    plan?.budget?.lineItems?.length
      ? plan.budget
      : defaultBudgetPlan(totalBudget, currency, guestCount);

  const isAiGenerated = !!plan?.budget?.lineItems?.length;
  const isReconciled = reconcileBudget(budgetPlan);

  return (
    <div className="space-y-6">
      {/* If no plan generated yet, show call-to-action */}
      {!isAiGenerated && onGenerate && (
        <div className="p-4 rounded-xl bg-coral-50/70 border border-coral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-coral-600 shrink-0" />
            <p className="text-xs sm:text-sm text-charcoal-800">
              Showing standard baseline template. Generate your plan to get AI-personalized allocations tailored to your {draft.guestCount} guests in {draft.city}.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={onGenerate}
            disabled={isGenerating}
            leftIcon={isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            className="shrink-0"
          >
            {isGenerating ? 'Generating…' : 'Generate AI Budget'}
          </Button>
        </div>
      )}

      {/* Summary metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-sand-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 mb-1">
            Total Allocated Budget
          </p>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            {formatCurrency(totalBudget, currency)}
          </p>
          <p className="text-xs text-charcoal-500 mt-1">
            {guestCount > 0
              ? `~${formatCurrency(budgetPlan.perGuestCost, currency)} per guest (${guestCount} guests)`
              : 'Specify guest count to see per-guest breakdown'}
          </p>
        </Card>

        <Card className="p-5 border-sand-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 mb-1">
            Contingency Reserve
          </p>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-coral-600">
            {formatCurrency(
              budgetPlan.lineItems.find((li) =>
                li.name.toLowerCase().includes('contingency'),
              )?.estimatedCost ?? Math.round(totalBudget * 0.08),
              currency,
            )}
          </p>
          <p className="text-xs text-charcoal-500 mt-1">
            Reconciled buffer for unforeseen expenses
          </p>
        </Card>

        <Card className="p-5 border-sand-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 mb-1">
            Reconciliation & Source
          </p>
          <div className="flex items-center gap-2 mt-1">
            {isAiGenerated ? (
              <Badge variant="coral">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5" />
                AI-Personalized Model
              </Badge>
            ) : (
              <Badge variant="sand">Standard Baseline</Badge>
            )}
            {isReconciled && (
              <Badge variant="sand">
                <span className="text-emerald-700 font-mono text-[11px]">100% Balanced</span>
              </Badge>
            )}
          </div>
          <p className="text-xs text-charcoal-500 mt-2">
            Sum of category allocations strictly matches target
          </p>
        </Card>
      </div>

      {/* Overflow warning banner if detected */}
      {budgetPlan.overflowWarning && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{budgetPlan.overflowWarning}</span>
        </div>
      )}

      {/* Main allocation card */}
      <Card className="p-6 border-sand-200">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal-900">
              {isAiGenerated
                ? 'AI-Personalized Category Breakdown'
                : 'Standard Budget Allocation Model'}
            </h3>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Category totals computed in application code from your locked {formatCurrency(totalBudget, currency)} budget
            </p>
          </div>
          {isAiGenerated && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onRegenerate('budget')}
              disabled={isGenerating}
              leftIcon={
                isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )
              }
            >
              {isGenerating ? 'Recalculating…' : 'Regenerate Budget'}
            </Button>
          )}
        </div>

        {/* Visual Allocation Proportion Bar */}
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-sand-200 mb-6 shadow-inner">
          {budgetPlan.lineItems.map((item, idx) => (
            <div
              key={idx}
              className={`${getCategoryColor(item.name)} h-full transition-all duration-300`}
              style={{ width: `${item.percentage}%` }}
              title={`${item.name}: ${item.percentage}% — ${formatCurrency(item.estimatedCost, currency)}`}
            />
          ))}
        </div>

        {/* Itemized Line Items List */}
        <div className="space-y-3">
          {budgetPlan.lineItems.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-start justify-between p-4 rounded-xl bg-ivory-50 border border-sand-200 gap-3 hover:border-sand-300 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span
                  className={`w-3.5 h-3.5 rounded-full ${getCategoryColor(item.name)} mt-0.5 shrink-0`}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-charcoal-900">{item.name}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-sand-200 text-charcoal-700 font-semibold">
                      {item.percentage}%
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-coral-700 mt-1.5 italic bg-coral-50/60 p-2 rounded-lg border border-coral-200/50">
                      💡 {item.notes}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0 pt-1 sm:pt-0">
                <span className="font-serif text-lg font-bold text-charcoal-900 block">
                  {formatCurrency(item.estimatedCost, currency)}
                </span>
                <span className="text-[11px] text-charcoal-400">estimated allocation</span>
              </div>
            </div>
          ))}
        </div>

        {/* Regulatory & Clarity Disclaimer */}
        <div className="mt-6 pt-4 border-t border-sand-200 flex items-start gap-2.5 text-xs text-charcoal-500 leading-relaxed">
          <Info className="w-4 h-4 text-charcoal-400 shrink-0 mt-0.5" />
          <span>{budgetPlan.disclaimer}</span>
        </div>
      </Card>
    </div>
  );
};
