import React from 'react';
import { CalendarHeart, Sparkles, LayoutDashboard, PlusCircle, Compass } from 'lucide-react';
import { ActiveView, EventDraft } from '../../types/event';
import { Button } from '../common/Button';

interface NavbarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  draft: EventDraft | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  draft,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-ivory-100/90 backdrop-blur-md border-b border-sand-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 rounded-lg p-1"
            aria-label="Gatherly AI Home"
          >
            <div className="w-10 h-10 rounded-xl bg-coral-500 text-white flex items-center justify-center shadow-subtle group-hover:bg-coral-600 transition-colors">
              <CalendarHeart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900">
                  Gatherly
                </span>
                <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-coral-100 text-coral-800 tracking-wider uppercase">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-charcoal-400 -mt-1 hidden sm:block tracking-wide">
                Celebration & Event Planner
              </p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onNavigate('landing')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeView === 'landing'
                  ? 'bg-sand-200/80 text-charcoal-900 font-semibold'
                  : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore</span>
            </button>

            <button
              onClick={() => onNavigate('planner')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeView === 'planner'
                  ? 'bg-sand-200/80 text-charcoal-900 font-semibold'
                  : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Event Planner</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors relative ${
                activeView === 'dashboard'
                  ? 'bg-sand-200/80 text-charcoal-900 font-semibold'
                  : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Workspace</span>
              {draft && (
                <span className="w-2 h-2 rounded-full bg-coral-500 absolute -top-0.5 right-1 animate-pulse" />
              )}
            </button>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-2">
            {activeView !== 'planner' ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigate('planner')}
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                <span className="hidden sm:inline">Plan an Event</span>
                <span className="sm:hidden">Plan</span>
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigate('dashboard')}
                leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}
              >
                Workspace
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
