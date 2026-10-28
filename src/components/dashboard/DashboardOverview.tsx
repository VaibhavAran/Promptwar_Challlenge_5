import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Utensils,
  Sparkles,
  Edit3,
  FileText,
  Clock,
  ListTodo,
  PieChart,
  RotateCcw,
} from 'lucide-react';
import { EventDraft, DashboardTab } from '../../types/event';
import { formatCurrency, formatDate, formatEventType } from '../../utils/formatters';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { BudgetTrackerPreview } from './BudgetTrackerPreview';
import { TimelinePreview } from './TimelinePreview';
import { ChecklistPreview } from './ChecklistPreview';

interface DashboardOverviewProps {
  draft: EventDraft | null;
  onEditEvent: () => void;
  onLoadSample: () => void;
  onClearWorkspace: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  draft,
  onEditEvent,
  onLoadSample,
  onClearWorkspace,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  if (!draft) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Card elevated className="p-8 sm:p-12 bg-white border-sand-300">
          <div className="w-14 h-14 rounded-2xl bg-sand-200/80 text-charcoal-700 mx-auto flex items-center justify-center mb-4">
            <Calendar className="w-7 h-7 text-coral-600" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 mb-2">
            No Event Configured Yet
          </h2>
          <p className="text-charcoal-600 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
            Your event workspace is currently clean. Start by filling out the event planning form or load a sample celebration to inspect the workspace modules.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={onEditEvent}
              leftIcon={<Edit3 className="w-4 h-4" />}
            >
              Configure Celebration
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={onLoadSample}
              leftIcon={<FileText className="w-4 h-4 text-coral-600" />}
            >
              Load Sample Celebration
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      {/* Event Header Banner */}
      <div className="bg-white rounded-2xl border border-sand-300 p-6 sm:p-8 shadow-card mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-sand-200">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="coral">{formatEventType(draft.eventType)}</Badge>
              <Badge variant="sand">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 inline-block" />
                Draft Configured
              </Badge>
              <span className="text-xs text-charcoal-400 font-mono">
                ID: {draft.id.slice(0, 14)}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal-900 tracking-tight">
              {draft.eventName}
            </h1>

            {draft.theme && (
              <p className="text-xs sm:text-sm text-charcoal-600 mt-1 font-medium">
                Theme: <span className="text-charcoal-900 font-semibold">{draft.theme}</span>
              </p>
            )}
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={onEditEvent}
              leftIcon={<Edit3 className="w-3.5 h-3.5 text-coral-600" />}
            >
              Edit Parameters
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearWorkspace}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* 4 Metric Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 rounded-xl bg-ivory-50 border border-sand-200">
            <div className="flex items-center gap-1.5 text-xs text-charcoal-500 mb-1">
              <Calendar className="w-3.5 h-3.5 text-coral-500" />
              <span>Event Date</span>
            </div>
            <p className="font-serif text-base font-bold text-charcoal-900">
              {formatDate(draft.date)}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-ivory-50 border border-sand-200">
            <div className="flex items-center gap-1.5 text-xs text-charcoal-500 mb-1">
              <MapPin className="w-3.5 h-3.5 text-coral-500" />
              <span>Location</span>
            </div>
            <p className="font-serif text-base font-bold text-charcoal-900 truncate">
              {draft.city || 'Unspecified'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-ivory-50 border border-sand-200">
            <div className="flex items-center gap-1.5 text-xs text-charcoal-500 mb-1">
              <Users className="w-3.5 h-3.5 text-coral-500" />
              <span>Guest Count</span>
            </div>
            <p className="font-serif text-base font-bold text-charcoal-900">
              {draft.guestCount ? `${draft.guestCount} Guests` : '—'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-ivory-50 border border-sand-200">
            <div className="flex items-center gap-1.5 text-xs text-charcoal-500 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-coral-500" />
              <span>Target Budget</span>
            </div>
            <p className="font-serif text-base font-bold text-charcoal-900">
              {formatCurrency(draft.budget ? Number(draft.budget) : '', draft.currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-sand-300 mb-8 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-coral-500 text-coral-700 bg-sand-100/50 rounded-t-lg'
              : 'border-transparent text-charcoal-600 hover:text-charcoal-900 hover:border-sand-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Event Brief & Scope</span>
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'budget'
              ? 'border-coral-500 text-coral-700 bg-sand-100/50 rounded-t-lg'
              : 'border-transparent text-charcoal-600 hover:text-charcoal-900 hover:border-sand-400'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Budget Allocator</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'border-coral-500 text-coral-700 bg-sand-100/50 rounded-t-lg'
              : 'border-transparent text-charcoal-600 hover:text-charcoal-900 hover:border-sand-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Run-of-Show Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'checklist'
              ? 'border-coral-500 text-coral-700 bg-sand-100/50 rounded-t-lg'
              : 'border-transparent text-charcoal-600 hover:text-charcoal-900 hover:border-sand-400'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Vendor & Task Checklist</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* GenAI Readiness Panel */}
            <Card className="p-6 border-coral-200 bg-coral-50/40">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-coral-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-1">
                    GenAI Architecture Blueprint (Phase 2 Readiness)
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed mb-3">
                    Your parameters are fully validated and registered in the application state. In Phase 2, our GenAI pipeline will transform these parameters into:
                  </p>
                  <ul className="text-xs text-charcoal-600 space-y-1.5 list-disc list-inside">
                    <li>Hyper-local vendor matching & quotes based on <strong>{draft.city || 'your city'}</strong></li>
                    <li>Minute-by-minute day-of schedules tailored to <strong>{draft.guestCount || 'your'} guests</strong></li>
                    <li>Automated dietary meal distribution matching your catering constraints</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Special notes & requirements card */}
            <Card className="p-6 border-sand-200">
              <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-2">
                Special Requirements & Directives
              </h3>
              {draft.specialRequirements ? (
                <p className="text-sm text-charcoal-700 leading-relaxed p-4 rounded-lg bg-ivory-50 border border-sand-200">
                  {draft.specialRequirements}
                </p>
              ) : (
                <p className="text-xs text-charcoal-400 italic">
                  No special accessibility or music directives specified yet.
                </p>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            {/* Dining & Dietaries Card */}
            <Card className="p-6 border-sand-200">
              <div className="flex items-center gap-2 mb-3">
                <Utensils className="w-4 h-4 text-coral-600" />
                <h3 className="font-serif text-base font-bold text-charcoal-900">
                  Catering Dietary Roster
                </h3>
              </div>
              {draft.foodPreferences && draft.foodPreferences.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {draft.foodPreferences.map((pref, i) => (
                    <Badge key={i} variant="sand">
                      {pref.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-charcoal-400">Standard menu profile</p>
              )}
            </Card>

            {/* Quick Actions Card */}
            <Card className="p-6 border-sand-200 bg-sand-100/50">
              <h3 className="font-serif text-base font-bold text-charcoal-900 mb-2">
                Workspace Tools
              </h3>
              <p className="text-xs text-charcoal-600 mb-4">
                Explore the modular planner engines:
              </p>
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab('budget')}
                  className="w-full justify-start text-xs"
                >
                  → View Category Budget Model
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab('timeline')}
                  className="w-full justify-start text-xs"
                >
                  → View Day-of Timeline
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab('checklist')}
                  className="w-full justify-start text-xs"
                >
                  → Open Task & Vendor Board
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'budget' && <BudgetTrackerPreview draft={draft} />}
      {activeTab === 'timeline' && <TimelinePreview draft={draft} />}
      {activeTab === 'checklist' && <ChecklistPreview draft={draft} />}
    </div>
  );
};
