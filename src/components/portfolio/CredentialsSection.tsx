import React from 'react';
import { Education, Certification } from '../../types/portfolio';
import { GraduationCap, Award, Calendar, BookOpen } from 'lucide-react';

interface CredentialsSectionProps {
  education: Education[];
  certifications: Certification[];
}

export const CredentialsSection: React.FC<CredentialsSectionProps> = ({ education, certifications }) => {
  const enabledEdu = education.filter((e) => e.enabled).sort((a, b) => a.order - b.order);
  const enabledCert = certifications.filter((c) => c.enabled).sort((a, b) => a.order - b.order);

  return (
    <section id="credentials" className="py-24 border-b border-[#1C1C1C] relative bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center space-x-3 mb-4">
          <span className="font-mono text-xs text-[#888888] tracking-widest uppercase">05 / CREDENTIALS</span>
          <div className="h-px bg-[#242424] flex-1 max-w-[120px]"></div>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white uppercase leading-tight max-w-3xl mb-16">
          ACADEMIC FOUNDATION &amp; HONORS.
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Education Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#1A1A1A] font-mono text-xs font-semibold text-white uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-white" />
              <span>EDUCATION</span>
            </div>

            <div className="space-y-6">
              {enabledEdu.map((edu) => (
                <div
                  key={edu.id}
                  className="p-6 border border-[#202020] bg-[#0A0A0A] space-y-4"
                >
                  <div className="flex items-center justify-between font-mono text-xs text-[#888888]">
                    <span className="flex items-center space-x-1.5 text-[#CCCCCC]">
                      <Calendar className="w-3.5 h-3.5 text-[#888888]" />
                      <span>{edu.startYear} — {edu.endYear}</span>
                    </span>
                    <span className="px-2 py-0.5 bg-[#161616] border border-[#2A2A2A] text-[10px] text-white font-mono">
                      {edu.status.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                      {edu.degree}
                    </h3>
                    <div className="font-mono text-xs text-[#AAAAAA] mt-1">
                      {edu.institution}
                    </div>
                    <div className="font-mono text-[11px] text-[#666666] mt-0.5">
                      FIELD: {edu.field}
                    </div>
                  </div>

                  {edu.description && (
                    <p className="text-xs sm:text-sm text-[#999999] leading-relaxed font-normal">
                      {edu.description}
                    </p>
                  )}

                  <div className="pt-3 border-t border-[#161616] flex items-center space-x-2 font-mono text-[11px] text-[#666666]">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>CURRICULUM: CS, ALGORITHMS, OS, DBMS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications & Awards Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#1A1A1A] font-mono text-xs font-semibold text-white uppercase tracking-wider">
              <Award className="w-4 h-4 text-white" />
              <span>HONORS &amp; CERTIFICATIONS</span>
            </div>

            <div className="space-y-4">
              {enabledCert.map((cert) => (
                <div
                  key={cert.id}
                  className="p-6 border border-[#202020] bg-[#0A0A0A] space-y-3"
                >
                  <div className="flex items-center justify-between font-mono text-xs text-[#888888]">
                    <span className="text-[#AAAAAA]">{cert.issuer.toUpperCase()}</span>
                    {cert.year && (
                      <span className="px-2 py-0.5 bg-[#141414] border border-[#262626] text-[10px] text-white">
                        {cert.year}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                    {cert.title}
                  </h3>

                  {cert.description && (
                    <p className="text-xs sm:text-sm text-[#999999] leading-relaxed font-normal">
                      {cert.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-[#161616] flex items-center justify-between font-mono text-[10px] text-[#555555]">
                    <span>STATUS: VERIFIED CREDENTIAL</span>
                    <span>TYPE: PRODUCTION AWARD</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
