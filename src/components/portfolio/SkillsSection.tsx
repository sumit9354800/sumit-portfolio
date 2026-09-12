import React, { useState } from 'react';
import { Skill, SkillCategory } from '../../types/portfolio';
import { Layers, Server, Database, Info } from 'lucide-react';

interface SkillsSectionProps {
  skills: Skill[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  const [activeSkill, setActiveSkill] = useState<Skill | null>(skills[0] || null);

  const categories: { key: SkillCategory; title: string; icon: React.ReactNode }[] = [
    { key: 'frontend', title: 'FRONTEND ENGINEERING', icon: <Layers className="w-4 h-4 text-white" /> },
    { key: 'backend', title: 'BACKEND & APIS', icon: <Server className="w-4 h-4 text-white" /> },
    { key: 'database-tools', title: 'DATABASE & TOOLS', icon: <Database className="w-4 h-4 text-white" /> },
  ];

  return (
    <section id="skills" className="py-24 border-b border-[#1C1C1C] relative bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center space-x-3 mb-4">
          <span className="font-mono text-xs text-[#888888] tracking-widest uppercase">02 / STACK</span>
          <div className="h-px bg-[#242424] flex-1 max-w-[120px]"></div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white uppercase leading-tight max-w-2xl">
            TECHNICAL ARSENAL &amp; PRODUCTION STACK.
          </h2>
          <p className="text-sm text-[#888888] font-sans max-w-md">
            Core technologies, libraries, and architectural frameworks used across production builds.
          </p>
        </div>

        {/* 3 Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {categories.map((cat) => {
            const catSkills = skills
              .filter((s) => s.category === cat.key && s.enabled)
              .sort((a, b) => a.order - b.order);

            return (
              <div
                key={cat.key}
                className="border border-[#1E1E1E] bg-[#0A0A0A] p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#161616]">
                    <div className="flex items-center space-x-2">
                      {cat.icon}
                      <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
                        {cat.title}
                      </h3>
                    </div>
                    <span className="font-mono text-[10px] text-[#666666]">
                      {catSkills.length} MODULES
                    </span>
                  </div>

                  {/* Skills List with Monospace Numbers */}
                  <div className="space-y-1">
                    {catSkills.map((skill, index) => {
                      const isSelected = activeSkill?.id === skill.id;
                      const formattedIndex = String(index + 1).padStart(2, '0');

                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => setActiveSkill(skill)}
                          onMouseEnter={() => setActiveSkill(skill)}
                          className={`w-full text-left px-3 py-2.5 flex items-center justify-between transition-colors border ${
                            isSelected
                              ? 'bg-[#161616] border-[#333333] text-white'
                              : 'bg-transparent border-transparent text-[#999999] hover:text-white hover:bg-[#111111]'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="font-mono text-[11px] text-[#555555]">
                              {formattedIndex}
                            </span>
                            <span className="font-mono text-xs font-medium tracking-wide">
                              {skill.name.toUpperCase()}
                            </span>
                          </div>

                          {skill.featured && (
                            <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#1C1C1C] border border-[#2B2B2B] text-[#CCCCCC]">
                              CORE
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Skill Telemetry Inspector */}
        {activeSkill && (
          <div className="border border-[#262626] bg-[#0C0C0C] p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-[#161616] border border-[#333333] flex items-center justify-center font-mono text-xs font-bold text-white">
                {activeSkill.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                    {activeSkill.name}
                  </h4>
                  <span className="font-mono text-[10px] text-[#888888]">
                    [{activeSkill.category.toUpperCase()}]
                  </span>
                </div>
                <p className="font-mono text-xs text-[#AAAAAA] mt-0.5">
                  {activeSkill.description || 'Production engineering module utilized in commercial full-stack builds.'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 font-mono text-[11px] text-[#888888]">
              <Info className="w-3.5 h-3.5 text-[#666666]" />
              <span>ACTIVE IN PRODUCTION COMMITS</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
