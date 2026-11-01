import React from 'react';
import { Sparkles, ArrowRight, Calendar, Users, DollarSign, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { EventType } from '../../types/event';

interface HeroProps {
  onStartPlanning: (eventType?: EventType) => void;
  onViewWorkspace: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartPlanning, onViewWorkspace }) => {
  const popularTypes: { label: string; type: EventType; icon: string }[] = [
    { label: 'Weddings & Receptions', type: 'wedding', icon: '💍' },
    { label: 'Milestone Birthdays', type: 'birthday', icon: '🎂' },
    { label: 'Silver & Golden Anniversaries', type: 'anniversary', icon: '🥂' },
    { label: 'Community Gatherings', type: 'community', icon: '🎪' },
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Subtle announcement pill */}
          <div className="inline-flex items-center gap-2 mb-6">
            <Badge variant="coral" size="md">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-coral-600 inline" />
              Intelligent Event Architecture
            </Badge>
            <span className="text-xs text-charcoal-400 font-medium hidden sm:inline">
              PromptWars Edition • Challenge 5
            </span>
          </div>

          {/* Editorial Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-charcoal-900 leading-[1.15]">
            Curate unforgettable celebrations with{' '}
            <span className="italic font-serif text-coral-600 underline decoration-coral-300/60 decoration-wavy decoration-1 underline-offset-8">
              intelligent precision
            </span>
            .
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-charcoal-600 leading-relaxed max-w-2xl mx-auto font-normal">
            From intimate anniversary dinners to 500-guest community galas, Gatherly AI structures bespoke schedules, balanced budgets, and vendor checklists tailored to your city and guests.
          </p>

          {/* Action Buttons */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onStartPlanning()}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto text-base font-semibold"
            >
              Plan an Event Now
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={onViewWorkspace}
              className="w-full sm:w-auto text-base"
            >
              View Event Workspace
            </Button>
          </div>

          {/* Trust bullets */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-charcoal-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-coral-500" />
              Dynamic Budget Allocation
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-coral-500" />
              Hour-by-Hour Run of Show
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-coral-500" />
              Dietary & Guest Logistics
            </span>
          </div>

          {/* Quick Start selector */}
          <div className="mt-12 pt-8 border-t border-sand-300">
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 mb-3.5">
              Choose an event to plan instantly:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {popularTypes.map((item) => (
                <button
                  key={item.type}
                  onClick={() => onStartPlanning(item.type)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-sand-300 text-xs sm:text-sm font-medium text-charcoal-700 hover:text-charcoal-900 hover:border-coral-400 hover:bg-sand-50 transition-all shadow-subtle"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Preview / Cards teaser */}
        <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-sand-300 bg-white p-4 sm:p-6 shadow-elevated">
          <div className="flex items-center justify-between pb-4 border-b border-sand-200 text-xs text-charcoal-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sand-300" />
              <span className="w-3 h-3 rounded-full bg-sand-300" />
              <span className="w-3 h-3 rounded-full bg-sand-300" />
              <span className="ml-2 font-mono text-[11px] text-charcoal-400">gatherly-planner.workspace</span>
            </div>
            <span className="bg-coral-50 text-coral-700 px-2 py-0.5 rounded text-[11px] font-semibold">
              Live Interactive Foundation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-sand-100/70 border border-sand-200">
              <div className="w-8 h-8 rounded-lg bg-coral-100 text-coral-700 flex items-center justify-center mb-3">
                <DollarSign className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-charcoal-900 mb-1">Budget Engineering</h2>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Automatic categoric distribution across venue, catering, styling, and contingency reserve.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-sand-100/70 border border-sand-200">
              <div className="w-8 h-8 rounded-lg bg-coral-100 text-coral-700 flex items-center justify-center mb-3">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-charcoal-900 mb-1">Precision Timeline</h2>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Step-by-step master schedule from 8 weeks out down to the hour of celebration arrival.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-sand-100/70 border border-sand-200">
              <div className="w-8 h-8 rounded-lg bg-coral-100 text-coral-700 flex items-center justify-center mb-3">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-charcoal-900 mb-1">Vendor & Guest Checklist</h2>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Actionable milestones for caterers, photographers, florists, and dietary accommodation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
