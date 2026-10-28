import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { EventDraft } from '../../types/event';
import { formatDate } from '../../utils/formatters';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface TimelinePreviewProps {
  draft: EventDraft | null;
}

export const TimelinePreview: React.FC<TimelinePreviewProps> = ({ draft }) => {
  const [activeStage, setActiveStage] = useState<'day_of' | 'week_of' | 'planning'>('day_of');

  const dayOfSchedule = [
    { time: '11:00 AM', title: 'Vendor Load-In & Site Access', role: 'Event Coordinator & Rental Team', desc: 'Sound, lighting staging, tables and catering prep setup.' },
    { time: '02:30 PM', title: 'Florals & Tablescapes Complete', role: 'Florist & Decorator', desc: 'Candles placed, placecards set, room temperature stabilized.' },
    { time: '04:00 PM', title: 'Audio & Microphone Soundcheck', role: 'AV Technician / Musician', desc: 'Speech microphones tested, acoustic balance checked.' },
    { time: '05:00 PM', title: 'Guest Arrival & Welcome Refreshments', role: 'Hospitality Staff', desc: 'Passed hors d’oeuvres, signature arrival spritz, coat check.' },
    { time: '06:00 PM', title: 'Ceremonial Welcome & Keynote Toast', role: 'Host / MC', desc: 'Opening remarks, milestone acknowledgment, welcome toast.' },
    { time: '06:45 PM', title: 'Dinner Service & Course Progression', role: 'Catering Lead', desc: 'Multi-course seated dining with tailored dietary options served.' },
    { time: '08:30 PM', title: 'Celebration Toast & Dessert Cut', role: 'Hosts & Guests', desc: 'Ceremonial cutting, champagne pouring, dessert buffet opened.' },
    { time: '09:00 PM', title: 'Music & Evening Revelry', role: 'DJ / Band', desc: 'Open dance floor, evening cocktails, photobooth activation.' },
    { time: '11:30 PM', title: 'Grand Farewell & Departure', role: 'Coordinator', desc: 'Guest send-off with sparklers/favors; quiet vendor load-out commences.' },
  ];

  const weekOfSchedule = [
    { time: 'Day -5', title: 'Final Headcount & Dietary Roster Lockdown', role: 'Host', desc: 'Deliver immutable guest counts and seating chart to catering.' },
    { time: 'Day -3', title: 'Vendor Logistics Confirmation Call', role: 'Coordinator', desc: 'Re-verify arrival windows, load-in parking permits, and contact numbers.' },
    { time: 'Day -1', title: 'Rehearsal & Setup Staging Walkthrough', role: 'Key Participants', desc: 'Pacing check, ceremony walk, equipment drop-off.' },
  ];

  const planningSchedule = [
    { time: 'Month -3', title: 'Venue Contract & Date Reservation', role: 'Host', desc: 'Execute binding venue rental and insurance certificate filing.' },
    { time: 'Month -2', title: 'Catering Tasting & Menu Selection', role: 'Host & Caterer', desc: 'Sample course options, finalize signature beverage recipes.' },
    { time: 'Month -1', title: 'Invitations & RSVP Tracking System', role: 'Host', desc: 'Dispatch formal invites with digital dietary collection forms.' },
  ];

  const currentItems =
    activeStage === 'day_of'
      ? dayOfSchedule
      : activeStage === 'week_of'
      ? weekOfSchedule
      : planningSchedule;

  return (
    <div className="space-y-6">
      <Card className="p-6 border-sand-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-sand-200 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="coral">Run-of-Show Timeline</Badge>
              {draft?.date && (
                <span className="text-xs text-charcoal-500 font-medium">
                  Target: {formatDate(draft.date)}
                </span>
              )}
            </div>
            <h3 className="font-serif text-xl font-bold text-charcoal-900">
              Celebration Schedule Framework
            </h3>
          </div>

          {/* Stage switcher */}
          <div className="flex rounded-lg bg-sand-200/70 p-1">
            <button
              onClick={() => setActiveStage('day_of')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeStage === 'day_of'
                  ? 'bg-white text-charcoal-900 shadow-subtle'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Day-of Run (Detailed)
            </button>
            <button
              onClick={() => setActiveStage('week_of')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeStage === 'week_of'
                  ? 'bg-white text-charcoal-900 shadow-subtle'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Week-of Countdown
            </button>
            <button
              onClick={() => setActiveStage('planning')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeStage === 'planning'
                  ? 'bg-white text-charcoal-900 shadow-subtle'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Preparation Milestones
            </button>
          </div>
        </div>

        {/* Timeline List */}
        <div className="pt-6 relative">
          <div className="absolute left-4 sm:left-24 top-6 bottom-6 w-0.5 bg-sand-300 hidden sm:block" />

          <div className="space-y-5">
            {currentItems.map((item, idx) => (
              <div
                key={idx}
                className="relative flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-8 group"
              >
                {/* Time Badge */}
                <div className="sm:w-28 text-left sm:text-right shrink-0">
                  <span className="inline-block text-xs font-mono font-bold text-charcoal-800 px-2 py-1 rounded bg-sand-100 border border-sand-300">
                    {item.time}
                  </span>
                </div>

                {/* Node dot on line */}
                <div className="hidden sm:flex absolute left-24 -translate-x-[5px] mt-1.5 w-3 h-3 rounded-full bg-coral-500 ring-4 ring-white" />

                {/* Event detail card */}
                <div className="flex-1 p-4 rounded-xl bg-ivory-50 border border-sand-200 group-hover:border-sand-300 group-hover:bg-sand-50 transition-colors">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-charcoal-900">{item.title}</h4>
                    <span className="text-[11px] font-semibold text-coral-700 bg-coral-50 px-2 py-0.5 rounded border border-coral-200/60">
                      {item.role}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-sand-200 flex items-center justify-between text-xs text-charcoal-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-coral-500" />
            GenAI Dynamic Run-of-Show generation scheduled for Phase 2
          </span>
          <span className="font-mono text-[11px]">Timeline Model v1.0</span>
        </div>
      </Card>
    </div>
  );
};
