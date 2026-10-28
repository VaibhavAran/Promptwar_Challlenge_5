import React from 'react';
import { Sliders, Cpu, CheckSquare } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      icon: <Sliders className="w-5 h-5 text-coral-600" />,
      title: 'Specify Parameters & Vision',
      desc: 'Tell Gatherly your celebration type, date, host city, expected attendance, estimated budget, dietary limits, and aesthetic mood.',
    },
    {
      num: '02',
      icon: <Cpu className="w-5 h-5 text-coral-600" />,
      title: 'Intelligent Plan Synthesis',
      desc: 'Our GenAI architecture parses your specific parameters to formulate realistic budget envelopes, run-of-show timestamps, and vendor checklists.',
    },
    {
      num: '03',
      icon: <CheckSquare className="w-5 h-5 text-coral-600" />,
      title: 'Refine, Coordinate & Execute',
      desc: 'Track payments, check off vendor contracts, export the timeline to suppliers, and host an effortless, memorable celebration.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white border-t border-sand-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-coral-600 mb-2">
            The Workflow
          </h2>
          <p className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 tracking-tight">
            How Gatherly AI orchestrates your event
          </p>
          <p className="mt-3.5 text-charcoal-600 text-sm sm:text-base">
            From initial brainstorm to day-of coordination, every phase is logically structured.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="relative p-6 rounded-xl bg-ivory-50 border border-sand-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-coral-100 flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="font-serif text-3xl font-bold text-sand-400">
                  {step.num}
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
