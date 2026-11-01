/**
 * AI-generated event concept panel (overview tab).
 */

import React from 'react';
import { RefreshCw, Loader2, Sparkles, Palette, Activity, Utensils, AlertTriangle } from 'lucide-react';
import type { GeneratedEventPlan, RegenerableSection } from '../../types/generatedPlan';
import type { EventDraft } from '../../types/event';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface AiEventConceptProps {
  draft: EventDraft;
  plan: GeneratedEventPlan | null;
  isGenerating: boolean;
  onRegenerate: (section: RegenerableSection) => void;
}

export const AiEventConcept: React.FC<AiEventConceptProps> = ({
  draft,
  plan,
  isGenerating,
  onRegenerate,
}) => {
  if (!plan?.concept) return null;
  const { concept, vendors, practicalTips, risks } = plan;

  return (
    <div className="space-y-5">
      {/* Main concept summary */}
      <Card className="p-6 border-coral-200 bg-coral-50/20">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-coral-600" />
            <h3 className="font-serif text-xl font-bold text-charcoal-900">Your Event Concept</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRegenerate('concept')}
            disabled={isGenerating}
            leftIcon={
              isGenerating
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <RefreshCw className="w-3.5 h-3.5" />
            }
          >
            Regenerate
          </Button>
        </div>

        <p className="text-sm text-charcoal-800 leading-relaxed mb-5">{concept.summary}</p>

        {concept.ambiance && (
          <p className="text-sm text-charcoal-600 italic border-l-2 border-coral-300 pl-4 mb-4">
            {concept.ambiance}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Theme ideas */}
          <div className="p-4 rounded-xl bg-white border border-sand-200">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-2.5">
              <Palette className="w-3.5 h-3.5 text-coral-500" />
              Theme Ideas
            </div>
            <ul className="space-y-1.5">
              {concept.themeIdeas.slice(0, 4).map((idea, i) => (
                <li key={i} className="text-xs text-charcoal-700 flex items-start gap-1.5">
                  <span className="text-coral-400 mt-0.5">•</span>
                  <span>{idea}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Activities */}
          <div className="p-4 rounded-xl bg-white border border-sand-200">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-2.5">
              <Activity className="w-3.5 h-3.5 text-coral-500" />
              Activities
            </div>
            <ul className="space-y-1.5">
              {concept.recommendedActivities.slice(0, 4).map((act, i) => (
                <li key={i} className="text-xs text-charcoal-700 flex items-start gap-1.5">
                  <span className="text-coral-400 mt-0.5">•</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Catering */}
          <div className="p-4 rounded-xl bg-white border border-sand-200">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-2.5">
              <Utensils className="w-3.5 h-3.5 text-coral-500" />
              Catering Highlights
            </div>
            <ul className="space-y-1.5">
              {concept.cateringHighlights.slice(0, 4).map((item, i) => (
                <li key={i} className="text-xs text-charcoal-700 flex items-start gap-1.5">
                  <span className="text-coral-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Practical tips */}
      {practicalTips.length > 0 && (
        <Card className="p-6 border-sand-200">
          <h3 className="font-serif text-base font-bold text-charcoal-900 mb-3">
            Practical Planning Tips
          </h3>
          <ul className="space-y-2">
            {practicalTips.map((tip, i) => (
              <li key={i} className="text-xs text-charcoal-700 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-coral-100 text-coral-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Risks */}
      {risks.length > 0 && (
        <Card className="p-6 border-amber-200 bg-amber-50/20">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="font-serif text-base font-bold text-charcoal-900">Risks & Contingencies</h3>
          </div>
          <div className="space-y-3">
            {risks.map((r, i) => (
              <div key={i} className="p-3 rounded-lg bg-white border border-amber-100">
                <p className="text-xs font-semibold text-amber-800 mb-1">⚠ {r.risk}</p>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  <span className="font-semibold text-charcoal-700">Mitigation: </span>
                  {r.mitigation}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Vendors */}
      {vendors.length > 0 && (
        <Card className="p-6 border-sand-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-base font-bold text-charcoal-900">
              Recommended Vendor Categories
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRegenerate('vendors')}
              disabled={isGenerating}
              leftIcon={isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            >
              Refresh
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vendors.map((v, i) => (
              <div key={i} className="p-3.5 rounded-lg bg-ivory-50 border border-sand-200">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="sand" size="sm">{v.category}</Badge>
                  <span className="text-[11px] text-charcoal-400">{v.estimatedLeadTime}</span>
                </div>
                <p className="text-xs text-charcoal-700 leading-relaxed">{v.serviceScope}</p>
                {v.localTip && (
                  <p className="text-[11px] text-coral-700 mt-1 italic">💡 {v.localTip}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Special requirements pass-through */}
      {draft.specialRequirements && (
        <Card className="p-6 border-sand-200">
          <h3 className="font-serif text-base font-bold text-charcoal-900 mb-2">
            Special Requirements & Directives
          </h3>
          <p className="text-sm text-charcoal-700 leading-relaxed p-4 rounded-lg bg-ivory-50 border border-sand-200">
            {draft.specialRequirements}
          </p>
        </Card>
      )}
    </div>
  );
};
