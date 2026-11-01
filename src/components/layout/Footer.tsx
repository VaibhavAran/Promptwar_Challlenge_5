import React from 'react';
import { CalendarHeart, Sparkles, ShieldCheck } from 'lucide-react';
import { ActiveView } from '../../types/event';

interface FooterProps {
  onNavigate: (view: ActiveView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-auto border-t border-sand-300 bg-sand-100/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-charcoal-600">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-coral-500 text-white flex items-center justify-center">
            <CalendarHeart className="w-4 h-4" />
          </div>
          <div>
            <p className="font-serif font-bold text-charcoal-900">Gatherly AI</p>
            <p className="text-xs text-charcoal-400">
              Celebrations, Weddings & Milestone Events Planner
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm">
          <button
            onClick={() => onNavigate('landing')}
            className="hover:text-charcoal-900 transition-colors"
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('planner')}
            className="hover:text-charcoal-900 transition-colors"
          >
            Event Planner
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="hover:text-charcoal-900 transition-colors"
          >
            Workspace & Dashboard
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-charcoal-500 bg-white px-3 py-1.5 rounded-full border border-sand-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Production-ready workspace</span>
          <span className="text-sand-300">•</span>
          <span className="flex items-center gap-1 text-coral-600 font-medium">
            <Sparkles className="w-3 h-3" /> Gemini planning live
          </span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-sand-200 text-center text-xs text-charcoal-400">
        PromptWars Challenge 5 • Clean Modular React + Vite + Tailwind CSS Architecture
      </div>
    </footer>
  );
};
