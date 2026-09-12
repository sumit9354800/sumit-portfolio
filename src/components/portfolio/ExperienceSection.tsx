import React from 'react';
import { Experience } from '../../types/portfolio';
import { Briefcase, ArrowUpRight, Check } from 'lucide-react';

interface ExperienceSectionProps {
  experience: Experience[];
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experience }) => {
  const enabledExp = experience.filter((e) => e.enabled).sort((a, b) => a.order - b.order);

  return (
    <section id="experience" className="py-24 border-b border-[#1C1C1C] relative bg-[#060606]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center space-x-3 mb-4">
          <span className="font-mono text-xs text-[#888888] tracking-widest uppercase">04 / EXPERIENCE</span>
          <div className="h-px bg-[#242424] flex-1 max-w-[120px]"></div>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white uppercase leading-tight max-w-3xl mb-16">
          TRACK RECORD &amp; PRODUCTION SHIPPING.
        </h2>

        {/* Technical Timeline Composition */}
        <div className="space-y-12">
          {enabledExp.map((exp) => (
            <div
              key={exp.id}
              className="border border-[#202020] bg-[#0A0A0A] p-6 sm:p-8 relative"
            >
              {/* Timeline Header bar */}
              <div className="flex flex-wrap items-center justify-between pb-4 mb-6 border-b border-[#181818] text-xs font-mono text-[#888888]">
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-4 h-4 text-white" />
                  <span className="text-white font-bold tracking-wider">{exp.startDate} — {exp.endDate}</span>
                  <span className="text-[#444444]">|</span>
                  <span className="text-[#CCCCCC] uppercase">{exp.location}</span>
                </div>
                {exp.companyUrl && (
                  <a
                    href={exp.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-[#AAAAAA] hover:text-white transition-colors"
                  >
                    <span>PORTFOLIO CODEBASE</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Roles & Company title */}
              <div className="mb-4">
                <h3 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
                  {exp.role}
                </h3>
                <div className="font-mono text-sm text-[#AAAAAA] mt-1">
                  @ {exp.company.toUpperCase()}
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#A0A0A0] leading-relaxed mb-6 font-normal max-w-4xl">
                {exp.description}
              </p>

              {/* Responsibilities */}
              {exp.responsibilities && exp.responsibilities.length > 0 && (
                <div className="space-y-2 mb-6">
                  <div className="font-mono text-xs text-[#888888] uppercase tracking-wider mb-2">
                    CORE SHIPMENTS &amp; RESPONSIBILITIES:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {exp.responsibilities.map((resp, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#0F0F0F] border border-[#1C1C1C] flex items-start space-x-2.5 text-xs font-mono text-[#CCCCCC] leading-relaxed"
                      >
                        <Check className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                        <span>{resp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tech Stack */}
              <div>
                <div className="font-mono text-[10px] text-[#666666] uppercase tracking-wider mb-2">
                  PRODUCTION STACK
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {exp.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-[#121212] border border-[#242424] font-mono text-xs text-[#D4D4D4]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
