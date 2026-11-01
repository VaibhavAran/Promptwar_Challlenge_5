/**
 * GenerationPanel — The central GenAI call-to-action component.
 * Shown in the Overview tab when no plan exists, and as a small toolbar
 * when a plan is already present.
 */

import React from 'react';
import { Sparkles, RefreshCw, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import type { GenerationStatus } from '../../types/generatedPlan';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface GenerationPanelProps {
  status: GenerationStatus;
  error: string | null;
  retryCount: number;
  hasPlan: boolean;
  onGenerate: () => void;
  onDismissError: () => void;
  compact?: boolean; // If true, render a smaller inline bar
}

export const GenerationPanel: React.FC<GenerationPanelProps> = ({
  status,
  error,
  retryCount,
  hasPlan,
  onGenerate,
  onDismissError,
  compact = false,
}) => {
  const isGenerating = status === 'generating';

  // ── Compact mode (toolbar shown when plan already exists) ──────────────────
  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="line-clamp-1">{error}</span>
            <button
              onClick={onDismissError}
              className="ml-1 text-red-500 hover:text-red-700"
              aria-label="Dismiss error"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onGenerate}
          disabled={isGenerating}
          leftIcon={
            isGenerating
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <RefreshCw className="w-3.5 h-3.5" />
          }
        >
          {isGenerating ? 'Regenerating…' : 'Regenerate Full Plan'}
        </Button>
      </div>
    );
  }

  // ── Full mode (shown when no plan exists yet) ─────────────────────────────
  return (
    <Card className={`p-6 border-2 transition-colors ${
      status === 'error'
        ? 'border-red-200 bg-red-50/50'
        : 'border-coral-200 bg-coral-50/40'
    }`}>
      {/* Error state */}
      {status === 'error' && error && (
        <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-red-900 text-sm">Generation Failed</p>
              <p className="text-red-700 text-xs mt-0.5 leading-relaxed">{error}</p>
              {retryCount > 0 && (
                <p className="text-red-500 text-xs mt-1">Attempt {retryCount} failed. You can try again below.</p>
              )}
            </div>
            <button
              onClick={onDismissError}
              className="text-red-400 hover:text-red-700 shrink-0"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main body */}
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          isGenerating ? 'bg-coral-100' : 'bg-coral-500'
        }`}>
          {isGenerating ? (
            <Loader2 className="w-6 h-6 text-coral-600 animate-spin" />
          ) : (
            <Sparkles className="w-6 h-6 text-white" />
          )}
        </div>

        <div className="flex-1">
          {isGenerating ? (
            <>
              <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-1">
                Crafting your personalised event plan…
              </h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Gatherly AI is generating your bespoke concept, budget allocations, run-of-show timeline, vendor checklist, and contingency notes. This usually takes 10–20 seconds.
              </p>
              <div className="mt-4 w-full h-1.5 rounded-full bg-sand-200 overflow-hidden">
                <div className="h-full bg-coral-400 animate-pulse w-3/4 rounded-full" />
              </div>
            </>
          ) : hasPlan ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-serif text-lg font-bold text-charcoal-900">Plan Generated</h3>
              </div>
              <p className="text-sm text-charcoal-600">
                Your event plan has been generated. You can regenerate the full plan or individual sections from the toolbar above each tab.
              </p>
            </>
          ) : (
            <>
              <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-1">
                Ready to generate your event plan?
              </h3>
              <p className="text-sm text-charcoal-600 leading-relaxed mb-4">
                Gatherly AI will generate a personalised event concept, itemised budget breakdown, minute-by-minute run-of-show, vendor checklist, and contingency notes — all tailored to your celebration details.
              </p>
              <ul className="text-xs text-charcoal-600 space-y-1.5 mb-4">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-coral-500 shrink-0" /> Personalised concept & theme ideas</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-coral-500 shrink-0" /> Categorised budget with your exact budget figure</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-coral-500 shrink-0" /> Hour-by-hour run of show for {'{'}guestCount{'}'} guests</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-coral-500 shrink-0" /> Vendor categories, local tips & lead times</li>
              </ul>
            </>
          )}
        </div>
      </div>

      {!isGenerating && (
        <div className="mt-5 pt-4 border-t border-coral-200/60 flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={onGenerate}
            disabled={isGenerating}
            leftIcon={<Sparkles className="w-4 h-4" />}
            className="font-semibold"
          >
            {status === 'error' ? 'Retry Generation' : hasPlan ? 'Regenerate Full Plan' : 'Generate My Event Plan'}
          </Button>
          <p className="text-[11px] text-charcoal-400 leading-relaxed max-w-xs">
            Costs are illustrative guidelines only. Not verified market prices.
          </p>
        </div>
      )}
    </Card>
  );
};
