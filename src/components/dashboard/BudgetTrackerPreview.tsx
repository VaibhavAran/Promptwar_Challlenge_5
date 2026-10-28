import { Sparkles } from 'lucide-react';
import { EventDraft } from '../../types/event';
import { formatCurrency } from '../../utils/formatters';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface BudgetTrackerPreviewProps {
  draft: EventDraft | null;
}

export const BudgetTrackerPreview: React.FC<BudgetTrackerPreviewProps> = ({ draft }) => {
  const totalBudget = draft?.budget ? Number(draft.budget) : 0;
  const currency = draft?.currency || 'USD';

  // Architectural category allocations benchmarked against industry standards
  const categories = [
    {
      name: 'Venue & Facilities',
      share: 0.35,
      color: 'bg-coral-500',
      description: 'Location hire, tables, chairs, AV setup, and cleanup fees.',
    },
    {
      name: 'Catering & Beverages',
      share: 0.30,
      color: 'bg-charcoal-700',
      description: 'Dinner courses, appetizers, bar packages, bar staff, and service tax.',
    },
    {
      name: 'Decor, Florals & Ambiance',
      share: 0.15,
      color: 'bg-amber-600',
      description: 'Centerpieces, lighting rentals, stationery, and thematic accents.',
    },
    {
      name: 'Photography & Entertainment',
      share: 0.12,
      color: 'bg-teal-600',
      description: 'Photographer / videographer package, DJ or live musician ensemble.',
    },
    {
      name: 'Contingency & Incidentals',
      share: 0.08,
      color: 'bg-sand-400',
      description: 'Unplanned permit fees, overtime buffers, and day-of emergency purchases.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-sand-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 mb-1">
            Total Target Budget
          </p>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            {formatCurrency(totalBudget, currency)}
          </p>
          <p className="text-xs text-charcoal-500 mt-1">
            {draft?.guestCount ? `~${formatCurrency(totalBudget / Number(draft.guestCount), currency)} per guest` : 'Specify guests to view per-guest allocation'}
          </p>
        </Card>

        <Card className="p-5 border-sand-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 mb-1">
            Contingency Buffer (8%)
          </p>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-coral-600">
            {formatCurrency(totalBudget * 0.08, currency)}
          </p>
          <p className="text-xs text-charcoal-500 mt-1">
            Reserved for weather or overtime safety
          </p>
        </Card>

        <Card className="p-5 border-sand-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 mb-1">
            Budget Blueprint Status
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="coral">Phase 1 Allocator</Badge>
          </div>
          <p className="text-xs text-charcoal-500 mt-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-coral-500" />
            AI itemized vendor pricing in Phase 2
          </p>
        </Card>
      </div>

      {/* Visual Proportion Bar */}
      <Card className="p-6 border-sand-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-lg font-bold text-charcoal-900">
            Categorical Budget Allocation Model
          </h3>
          <span className="text-xs text-charcoal-400 font-mono">100% Accounted</span>
        </div>

        <div className="w-full h-4 rounded-full overflow-hidden flex bg-sand-200 mb-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className={`${cat.color} h-full transition-all duration-300`}
              style={{ width: `${cat.share * 100}%` }}
              title={`${cat.name}: ${(cat.share * 100).toFixed(0)}%`}
            />
          ))}
        </div>

        <div className="space-y-4">
          {categories.map((cat, idx) => {
            const allocatedAmount = totalBudget * cat.share;
            return (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-ivory-50 border border-sand-200 gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className={`w-3 h-3 rounded-full ${cat.color} mt-1 shrink-0`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-charcoal-900">{cat.name}</span>
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-sand-200 text-charcoal-700">
                        {(cat.share * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-500 mt-0.5">{cat.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-serif text-base font-bold text-charcoal-900">
                    {formatCurrency(allocatedAmount, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
