import React, { useState } from 'react';
import { HeartHandshake, Cake, PartyPopper, Wine, Sparkles, ArrowRight } from 'lucide-react';
import { EventType } from '../../types/event';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface EventTypesShowcaseProps {
  onSelectType: (type: EventType) => void;
}

interface TypeData {
  id: EventType;
  title: string;
  badge: string;
  icon: React.ReactNode;
  tagline: string;
  typicalTimeline: string;
  keyChecklistItems: string[];
  recommendedThemes: string[];
}

export const EventTypesShowcase: React.FC<EventTypesShowcaseProps> = ({ onSelectType }) => {
  const [selected, setSelected] = useState<EventType>('wedding');

  const typesData: Record<EventType, TypeData> = {
    wedding: {
      id: 'wedding',
      title: 'Weddings & Receptions',
      badge: 'High Precision Ceremony & Party',
      icon: <HeartHandshake className="w-5 h-5 text-coral-600" />,
      tagline: 'Multi-stage orchestration from processional vows to cocktail hour and late-night departures.',
      typicalTimeline: '8-12 Months Planning • 12-Hour Day-of Schedule',
      keyChecklistItems: [
        'Ceremony audio & acoustic setup',
        'Bridal suite hospitality & timeline manager',
        'Photographer sunset golden-hour shot list',
        'Course-by-course dietary seat chart',
      ],
      recommendedThemes: ['Quiet Luxury Botanical', 'Tuscan Sunset Terrace', 'Mid-Century Modern Minimal'],
    },
    birthday: {
      id: 'birthday',
      title: 'Milestone Birthdays',
      badge: '30th, 40th, 50th, 80th Celebrations',
      icon: <Cake className="w-5 h-5 text-coral-600" />,
      tagline: 'Vibrant, personalized milestones celebrating life chapters with high-energy dining and entertainment.',
      typicalTimeline: '4-8 Weeks Planning • 5-Hour Evening Flow',
      keyChecklistItems: [
        'Signature birth-year bespoke cocktail',
        'Audio-visual memory montage reel',
        'Custom dessert table & ceremonial cake sparklers',
        'Guest polaroid guestbook station',
      ],
      recommendedThemes: ['Studio 54 Disco Glam', 'Under the Olive Trees', 'Monochrome Speakeasy'],
    },
    anniversary: {
      id: 'anniversary',
      title: 'Milestone Anniversaries',
      badge: 'Silver, Gold & Pearl Milestones',
      icon: <Wine className="w-5 h-5 text-coral-600" />,
      tagline: 'Refined family & friend banquets paying homage to enduring devotion and legacy.',
      typicalTimeline: '6-12 Weeks Planning • 6-Hour Banquet Flow',
      keyChecklistItems: [
        'Original wedding vow renewal or toast order',
        'Live acoustic quartet or jazz trio curation',
        'Sommelier-curated vintage wine pairings',
        'Heritage photo wall & archive presentation',
      ],
      recommendedThemes: ['Vintage Champagne & Candlelight', 'Gilded Ivory Garden', 'Classic Black Tie Elegance'],
    },
    community: {
      id: 'community',
      title: 'Community Events & Galas',
      badge: '100 - 1,000+ Attendees',
      icon: <PartyPopper className="w-5 h-5 text-coral-600" />,
      tagline: 'High-impact civic festivals, charity fundraisers, cultural fairs, and neighborhood street block parties.',
      typicalTimeline: '3-6 Months Planning • Multi-track Event Program',
      keyChecklistItems: [
        'City permit & municipal sound ordinance filings',
        'Crowd egress, first aid, and sanitation logistics',
        'Sponsor banner & stage lighting staging',
        'Multilingual volunteer shift roster',
      ],
      recommendedThemes: ['Harvest Moon Street Market', 'Civic Arts Under the Stars', 'Unity Spring Festival'],
    },
    dinner_party: {
      id: 'dinner_party',
      title: 'Intimate Dinner Parties',
      badge: '12 - 40 Guests',
      icon: <Wine className="w-5 h-5 text-coral-600" />,
      tagline: 'Gastronomic private chef evenings centered on convivial conversation and crafted tablescapes.',
      typicalTimeline: '1-3 Weeks Planning • 4-Hour Course Progression',
      keyChecklistItems: [
        'Personalized handwritten placecards & menus',
        'Seasonal market tasting menu alignment',
        'Atmospheric low-glow taper candles & linen rentals',
        'Curated vinyl or lo-fi jazz playlist pairing',
      ],
      recommendedThemes: ['Farm-to-Table Candlelit Longtable', 'Nordic Hygge Feast', 'Mediterranean Mezze Table'],
    },
    corporate: {
      id: 'corporate',
      title: 'Corporate & Networking',
      badge: 'Team Offsites & Executive Dinners',
      icon: <Sparkles className="w-5 h-5 text-coral-600" />,
      tagline: 'Polished brand retreats, awards banquets, and thought-leadership dinners designed to build lasting bonds.',
      typicalTimeline: '4-10 Weeks Planning • Structured Keynote & Mingling',
      keyChecklistItems: [
        'Hybrid video streaming & keynote mic testing',
        'Executive dietary badges & VIP greeting team',
        'Structured speed networking icebreaker agenda',
        'Branded gift bags & takeaway collaterals',
      ],
      recommendedThemes: ['Warm Architectural Modern', 'Artisanal Innovation Lounge', 'Rooftop Summit Glow'],
    },
  };

  const activeData = typesData[selected];

  return (
    <section className="py-16 md:py-24 bg-ivory-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-coral-600 mb-2">
              Bespoke Event Archetypes
            </h2>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 tracking-tight">
              Tailored blueprints for every milestone.
            </p>
          </div>
          <p className="text-charcoal-600 text-sm max-w-md">
            Select an archetype below to explore its signature logistics, or launch the planner to customize every parameter.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(Object.keys(typesData) as EventType[]).map((type) => {
            const data = typesData[type];
            const isCurrent = selected === type;
            return (
              <button
                key={type}
                onClick={() => setSelected(type)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-charcoal-900 text-white shadow-subtle'
                    : 'bg-white text-charcoal-700 border border-sand-300 hover:border-sand-400 hover:bg-sand-50'
                }`}
              >
                <span>{data.icon}</span>
                <span>{data.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active showcase card */}
        <Card elevated className="p-6 sm:p-8 bg-white border-sand-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="coral">{activeData.badge}</Badge>
                <span className="text-xs text-charcoal-400 font-medium">
                  {activeData.typicalTimeline}
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 mb-3">
                {activeData.title}
              </h3>
              <p className="text-charcoal-600 text-base leading-relaxed mb-6">
                {activeData.tagline}
              </p>

              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                  Critical Architectural Milestones:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeData.keyChecklistItems.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-ivory-50 border border-sand-200 text-xs text-charcoal-800"
                    >
                      <span className="text-coral-500 font-bold shrink-0">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-sand-200 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-400 mr-2">
                  Curated Themes:
                </span>
                {activeData.recommendedThemes.map((theme, i) => (
                  <Badge key={i} variant="sand" size="sm">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between h-full bg-sand-100/60 p-6 rounded-xl border border-sand-200">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-2">
                  Ready to shape this celebration?
                </p>
                <p className="font-serif text-xl font-bold text-charcoal-900 mb-2">
                  Plan your {activeData.title}
                </p>
                <p className="text-xs text-charcoal-600 leading-relaxed mb-6">
                  Click below to open our guided event builder with {activeData.title} pre-selected. Input your guest count, budget, and city to begin.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => onSelectType(selected)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full font-semibold"
              >
                Start {activeData.title} Plan
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
