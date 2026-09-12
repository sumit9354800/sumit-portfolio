import React, { useState, useEffect } from 'react';
import { ArrowRight, Mail, Sparkles, MapPin } from 'lucide-react';
import { HeroContent } from '../../types/portfolio';
import { Hero3D } from '../three/Hero3D';

interface HeroSectionProps {
  hero: HeroContent;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ hero }) => {
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);

  const titles = hero.rotatingTitles && hero.rotatingTitles.length > 0
    ? hero.rotatingTitles
    : [
        'Full Stack Developer',
        'MERN Stack Engineer',
        'Next.js Specialist',
        'Backend & API Architect',
      ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTitleIndex((prev) => (prev + 1) % titles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [titles.length]);

  return (
    <section
      id="hero"
      className="relative min-h-[92vh] flex items-center justify-center border-b border-[#1A1A1A] overflow-hidden bg-[#050505] px-4 sm:px-6 lg:px-8 pt-28 pb-20"
    >
      {/* 3D Model Animation spans the entire Hero background */}
      <Hero3D />

      {/* Subtle radial lighting mask for optimal text contrast and readability */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(circle at 50% 45%, rgba(5,5,5,0.18) 0%, rgba(5,5,5,0.52) 65%, rgba(5,5,5,0.88) 100%)',
        }}
      />

      {/* Clean, Centered Foreground Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center space-y-7">
        {/* Availability Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#111111]/90 border border-[#262626] backdrop-blur-sm text-xs font-mono text-[#D4D4D4]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-wide uppercase font-medium">
            {hero.availability || 'AVAILABLE FOR OPPORTUNITIES'}
          </span>
        </div>

        {/* Main Name Heading */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase font-display leading-[1.02]">
          {hero.name || 'SUMIT SHRIVASTAV'}
        </h1>

        {/* Dynamic Rotating Role Title */}
        <div className="h-10 sm:h-12 flex items-center justify-center">
          <div className="font-mono text-xl sm:text-2xl lg:text-3xl text-[#CCCCCC] flex items-center space-x-2">
            <span className="text-[#666666] select-none">&gt;</span>
            <span className="border-b border-[#444444] pb-0.5 text-white font-medium">
              {titles[currentTitleIndex]}
            </span>
            <span className="inline-block w-2 h-5 bg-white animate-pulse"></span>
          </div>
        </div>

        {/* Clean, readable description */}
        <p className="text-base sm:text-lg text-[#A3A3A3] leading-relaxed max-w-2xl font-normal">
          {hero.description ||
            'Self-taught Full Stack Developer with commercial experience crafting production-ready web applications, performant REST APIs, and scalable user interfaces using the modern MERN stack and Next.js.'}
        </p>

        {/* Primary and Secondary Call to Action Buttons */}
        <div className="pt-2 flex flex-wrap gap-4 items-center justify-center">
          <a
            href={hero.primaryCtaLink || '#projects'}
            id="hero-primary-cta-btn"
            className="group inline-flex items-center space-x-2.5 px-7 py-3.5 bg-white text-black font-mono text-xs uppercase tracking-widest font-bold hover:bg-[#E0E0E0] transition-all duration-200 shadow-lg"
          >
            <span>{hero.primaryCtaText || 'VIEW PROJECTS'}</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            href={hero.secondaryCtaLink || '#contact'}
            id="hero-secondary-cta-btn"
            className="inline-flex items-center space-x-2 px-6 py-3.5 bg-[#121212]/90 border border-[#2E2E2E] hover:border-[#555555] hover:bg-[#1C1C1C] text-white font-mono text-xs uppercase tracking-widest transition-all duration-200"
          >
            <Mail className="w-4 h-4 text-[#AAAAAA]" />
            <span>{hero.secondaryCtaText || 'CONTACT ME'}</span>
          </a>
        </div>

        {/* Clean, minimal highlights bar */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 border-t border-[#1C1C1C] text-xs font-mono text-[#888888]">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-[#CCCCCC]" />
            <span>3 COMMERCIAL CLIENT PROJECTS</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-[#666666] rounded-full"></span>
            <span>MERN &amp; NEXT.JS STACK</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-3.5 h-3.5 text-[#888888]" />
            <span>DELHI, INDIA</span>
          </div>
        </div>
      </div>
    </section>
  );
};
