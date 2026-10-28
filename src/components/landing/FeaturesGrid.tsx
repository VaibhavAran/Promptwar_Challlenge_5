import React from 'react';
import { Sparkles, Utensils, Clock, Wallet, ShieldAlert, Award } from 'lucide-react';
import { Card } from '../common/Card';

export const FeaturesGrid: React.FC = () => {
  const features = [
    {
      icon: <Wallet className="w-5 h-5 text-coral-600" />,
      title: 'Contextual Budget Modeling',
      desc: 'Smart tier allocations calibrated for your city, guest volume, and chosen ambiance without surprise hidden fees.',
    },
    {
      icon: <Clock className="w-5 h-5 text-coral-600" />,
      title: 'Flawless Run-of-Show Timelines',
      desc: 'Seamless schedules keeping hosts, MCs, photographers, and vendors in synchronized harmony from setup to farewell.',
    },
    {
      icon: <Utensils className="w-5 h-5 text-coral-600" />,
      title: 'Dietary & Menu Harmony',
      desc: 'Effortlessly track vegetarian, vegan, halal, and allergen-safe catering options tailored to your guest list proportions.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-coral-600" />,
      title: 'Theme & Aesthetic Curation',
      desc: 'Color palettes, decor prompts, floral motifs, and invitation styling suggestions that reflect your celebration tone.',
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-coral-600" />,
      title: 'Contingency & Weather Guards',
      desc: 'Proactive planning buffers for sound ordinances, outdoor weather backups, and last-minute vendor delays.',
    },
    {
      icon: <Award className="w-5 h-5 text-coral-600" />,
      title: 'Milestone Vendor Checklists',
      desc: 'Phased checklist for contract signing, tastings, equipment rentals, deposit deadlines, and day-of emergency kits.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white border-y border-sand-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-coral-600 mb-2">
            Engineered For Celebrations
          </h2>
          <p className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 tracking-tight">
            Everything your celebration needs, structured in minutes.
          </p>
          <p className="mt-3.5 text-charcoal-600 text-sm sm:text-base">
            No chaotic spreadsheets or fragmented message threads. Gatherly AI coordinates all logistical moving parts in one serene interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, index) => (
            <Card
              key={index}
              className="p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card bg-ivory-50/50 border-sand-200"
            >
              <div className="w-10 h-10 rounded-lg bg-coral-50 border border-coral-100 flex items-center justify-center mb-4">
                {feat.icon}
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-2">
                {feat.title}
              </h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                {feat.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
