import React from 'react';
import { CheckCircle2, Award, Box, Layers, GitBranch } from 'lucide-react';
import { AboutContent } from '../../types/portfolio';

interface AboutSectionProps {
  about: AboutContent;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ about }) => {
  return (
    <section id="about" className="py-24 border-b border-[#1C1C1C] relative bg-[#060606]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center space-x-3 mb-4">
          <span className="font-mono text-xs text-[#888888] tracking-widest uppercase">01 / ABOUT</span>
          <div className="h-px bg-[#242424] flex-1 max-w-[120px]"></div>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white uppercase max-w-3xl leading-tight mb-16">
          {about.headline || 'BUILDING THE WEB, ONE COMMIT AT A TIME.'}
        </h2>

        {/* Editorial Split: Biography & Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Biography & Highlights */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4 text-[#A8A8A8] text-base sm:text-lg leading-relaxed font-normal">
              {about.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Technical Highlights list */}
            <div className="pt-6 border-t border-[#1C1C1C] space-y-3">
              <h3 className="font-mono text-xs text-[#888888] tracking-widest uppercase">
                ENGINEERING HIGHLIGHTS &amp; PRINCIPLES
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {about.highlights.map((highlight, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#0B0B0B] border border-[#1A1A1A] flex items-start space-x-2.5 text-xs text-[#CCCCCC] font-mono leading-snug"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: High-Contrast Statistics Display */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-[#222222] bg-[#0A0A0A] p-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1C1C1C]">
                <span className="font-mono text-xs text-[#888888] tracking-wider uppercase">
                  METRICS // VERIFIED
                </span>
                <span className="w-2 h-2 bg-white"></span>
              </div>

              {/* Grid of stats without generic cards */}
              <div className="grid grid-cols-2 gap-y-8 gap-x-6">
                {about.stats.map((stat, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-4xl sm:text-5xl font-mono font-bold text-white block tracking-tighter">
                      {stat.value}
                    </span>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#888888] block leading-tight">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Verification Footnote */}
              <div className="mt-8 pt-4 border-t border-[#161616] flex items-center justify-between text-[11px] font-mono text-[#666666]">
                <span className="flex items-center space-x-1">
                  <GitBranch className="w-3 h-3 text-[#888888]" />
                  <span>COMMITS: 1,200+</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Award className="w-3 h-3 text-[#888888]" />
                  <span>DELHI TECH AWARDS</span>
                </span>
              </div>
            </div>

            {/* Architectural Philosophy Box */}
            <div className="p-5 bg-[#090909] border border-[#1C1C1C] text-xs font-mono text-[#888888] space-y-2">
              <div className="flex items-center space-x-2 text-[#D4D4D4]">
                <Layers className="w-4 h-4 text-white" />
                <span className="font-semibold uppercase tracking-wider">FULL STACK OWNERSHIP</span>
              </div>
              <p className="leading-relaxed text-[#999999]">
                I do not treat frontend and backend as isolated islands. Architectural decisions in the database schema directly inform state management in the UI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
