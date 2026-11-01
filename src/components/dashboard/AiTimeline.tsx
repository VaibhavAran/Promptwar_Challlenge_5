/**
 * AI-powered Timeline component.
 * Replaces TimelinePreview.tsx with real Gemini-generated schedule.
 * Supports preparation milestones, week-of countdown, and day-of schedule.
 */

import React, { useState } from 'react';
import { RefreshCw, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import type { EventDraft } from '../../types/event';
import type { GeneratedEventPlan, RegenerableSection, TimelineEntry } from '../../types/generatedPlan';
import { formatDate } from '../../utils/formatters';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface AiTimelineProps {
  draft: EventDraft;
  plan: GeneratedEventPlan | null;
  isGenerating: boolean;
  onRegenerate: (section: RegenerableSection) => void;
  onGenerate?: () => void;
}

type StageKey = 'day_of' | 'week_of' | 'planning';

export const AiTimeline: React.FC<AiTimelineProps> = ({
  draft,
  plan,
  isGenerating,
  onRegenerate,
  onGenerate,
}) => {
  const [activeStage, setActiveStage] = useState<StageKey>('day_of');

  const isAiGenerated = !!plan?.timeline;

  const currentItems: TimelineEntry[] = (() => {
    if (!isAiGenerated || !plan) return [];
    switch (activeStage) {
      case 'day_of':
        return plan.timeline.dayOf ?? [];
      case 'week_of':
        return plan.timeline.weekOf ?? [];
      case 'planning':
        return plan.timeline.preparation ?? [];
    }
  })();

  const stageLabel: Record<StageKey, string> = {
    day_of: 'Day-of Run of Show',
    week_of: 'Final Week Countdown',
    planning: 'Preparation Milestones',
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-sand-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-sand-200 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={isAiGenerated ? 'coral' : 'sand'}>
                {isAiGenerated ? 'AI-Generated Timeline' : 'Awaiting Generation'}
              </Badge>
              {draft?.date && (
                <span className="text-xs text-charcoal-500 font-medium">
                  {formatDate(draft.date)}
                </span>
              )}
            </div>
            <h3 className="font-serif text-xl font-bold text-charcoal-900">
              {isAiGenerated ? 'Personalized Celebration Schedule' : 'Run-of-Show Timeline'}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isAiGenerated && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onRegenerate('timeline')}
                disabled={isGenerating}
                leftIcon={
                  isGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )
                }
              >
                {isGenerating ? 'Regenerating…' : 'Regenerate Timeline'}
              </Button>
            )}

            {/* Stage switcher tabs */}
            <div className="flex rounded-lg bg-sand-200/70 p-1">
              {(['day_of', 'week_of', 'planning'] as StageKey[]).map((stage) => (
                <button
                  key={stage}
                  onClick={() => setActiveStage(stage)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                    activeStage === stage
                      ? 'bg-white text-charcoal-900 shadow-subtle'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  {stageLabel[stage]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Not generated yet empty state */}
        {!isAiGenerated && (
          <div className="py-14 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-coral-50 text-coral-600 mx-auto flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-coral-500" />
            </div>
            <h4 className="font-serif text-lg font-bold text-charcoal-900 mb-2">
              No AI timeline generated yet
            </h4>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed mb-6">
              Gatherly AI will design an hour-by-hour day-of schedule, final week countdown, and multi-month milestone tracker tailored to your {draft.guestCount} guests in {draft.city}.
            </p>
            {onGenerate && (
              <Button
                variant="primary"
                size="md"
                onClick={onGenerate}
                disabled={isGenerating}
                leftIcon={isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              >
                {isGenerating ? 'Generating…' : 'Generate Full Plan'}
              </Button>
            )}
          </div>
        )}

        {/* Timeline list */}
        {isAiGenerated && currentItems.length === 0 && (
          <div className="py-10 text-center text-sm text-charcoal-400">
            No entries found for this milestone stage.
          </div>
        )}

        {isAiGenerated && currentItems.length > 0 && (
          <div className="pt-6 relative">
            {/* Visual timeline vertical ruler */}
            <div className="absolute left-4 sm:left-28 top-6 bottom-6 w-0.5 bg-sand-300 hidden sm:block" />

            <div className="space-y-5">
              {currentItems.map((item, idx) => (
                <div
                  key={idx}
                  className="relative flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-8 group"
                >
                  {/* Time badge */}
                  <div className="sm:w-28 text-left sm:text-right shrink-0">
                    <span
                      className={`inline-block text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
                        item.isCritical
                          ? 'bg-coral-50 border-coral-300 text-coral-800'
                          : 'bg-sand-100 border-sand-300 text-charcoal-800'
                      }`}
                    >
                      {item.time}
                    </span>
                    {item.isCritical && (
                      <span className="block text-[10px] text-coral-600 font-bold mt-1 text-left sm:text-right flex items-center justify-start sm:justify-end gap-1">
                        <AlertCircle className="w-3 h-3" />
                        CRITICAL
                      </span>
                    )}
                  </div>

                  {/* Timeline node icon */}
                  <div
                    className={`hidden sm:flex absolute left-28 -translate-x-[5px] mt-2 w-3 h-3 rounded-full ring-4 ring-white ${
                      item.isCritical ? 'bg-coral-600' : 'bg-coral-400'
                    }`}
                  />

                  {/* Schedule item content card */}
                  <div
                    className={`flex-1 p-4 rounded-xl border transition-colors group-hover:bg-sand-50/60 ${
                      item.isCritical
                        ? 'bg-coral-50/30 border-coral-200'
                        : 'bg-ivory-50 border-sand-200 group-hover:border-sand-300'
                    }`}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1.5">
                      <h4 className="text-sm font-bold text-charcoal-900">{item.title}</h4>
                      <span className="text-[11px] font-semibold text-coral-700 bg-coral-50 px-2 py-0.5 rounded border border-coral-200/60 shrink-0">
                        {item.responsible}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isAiGenerated && (
          <div className="mt-8 pt-4 border-t border-sand-200 flex flex-wrap items-center justify-between text-xs text-charcoal-500 gap-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-coral-500" />
              Generated with Gemini · Tailored for {draft.guestCount} guests in {draft.city}
            </span>
            <span className="font-mono text-[11px] text-charcoal-400">Timeline Module v2.0</span>
          </div>
        )}
      </Card>
    </div>
  );
};
