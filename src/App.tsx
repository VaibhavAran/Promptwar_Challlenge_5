import React, { useState, useEffect } from 'react';
import { ActiveView, EventDraft, EventType } from './types/event';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/landing/Hero';
import { FeaturesGrid } from './components/landing/FeaturesGrid';
import { EventTypesShowcase } from './components/landing/EventTypesShowcase';
import { HowItWorks } from './components/landing/HowItWorks';
import { EventPlannerForm } from './components/planner/EventPlannerForm';
import { DashboardOverview } from './components/dashboard/DashboardOverview';

const STORAGE_KEY = 'gatherly_event_draft_v1';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('landing');
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [selectedTypeForPlanner, setSelectedTypeForPlanner] = useState<EventType | undefined>(undefined);

  // Restore draft from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setDraft(JSON.parse(stored));
      }
    } catch {
      // ignore storage failure
    }
  }, []);

  const handleSaveDraft = (newDraft: EventDraft) => {
    setDraft(newDraft);
    setSelectedTypeForPlanner(undefined);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newDraft));
    } catch {
      // ignore
    }
    setActiveView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearWorkspace = () => {
    setDraft(null);
    setSelectedTypeForPlanner(undefined);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setActiveView('planner');
  };

  const handleStartPlanning = (eventType?: EventType) => {
    setSelectedTypeForPlanner(eventType);
    setActiveView('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadSample = () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 2);

    const sample: EventDraft = {
      id: `evt-sample-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'ready_for_ai',
      eventName: "Eleanor & Liam's Autumn Vineyard Celebration",
      eventType: 'wedding',
      date: nextMonth.toISOString().split('T')[0],
      city: 'Sonoma Valley, CA',
      guestCount: 120,
      budget: 38000,
      currency: 'USD',
      foodPreferences: ['omnivore', 'vegetarian', 'gluten_free'],
      theme: 'Warm Olive, Linen & Candlelit Rustic Elegance',
      specialRequirements: 'Acoustic quartet for ceremony, outdoor heaters on standby, wheelchair accessibility ramp for garden arbor.',
    };

    handleSaveDraft(sample);
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory-100 text-charcoal-900 selection:bg-coral-100 selection:text-coral-900">
      {/* Top Application Navbar */}
      <Navbar
        activeView={activeView}
        onNavigate={(view) => {
          // A direct planner navigation should not override an existing draft
          // with a stale event type selected from the landing-page showcase.
          if (view === 'planner') setSelectedTypeForPlanner(undefined);
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        draft={draft}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'landing' && (
          <>
            <Hero
              onStartPlanning={handleStartPlanning}
              onViewWorkspace={() => {
                setActiveView('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <FeaturesGrid />
            <EventTypesShowcase onSelectType={handleStartPlanning} />
            <HowItWorks />
          </>
        )}

        {activeView === 'planner' && (
          <EventPlannerForm
            initialData={
              selectedTypeForPlanner
                ? { eventType: selectedTypeForPlanner }
                : draft || undefined
            }
            onSaveDraft={handleSaveDraft}
            onNavigateToDashboard={() => {
              setActiveView('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeView === 'dashboard' && (
          <DashboardOverview
            draft={draft}
            onEditEvent={() => {
              setSelectedTypeForPlanner(undefined);
              setActiveView('planner');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onLoadSample={handleLoadSample}
            onClearWorkspace={handleClearWorkspace}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
};
