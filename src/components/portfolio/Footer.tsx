import React from 'react';
import { Terminal, ArrowUp } from 'lucide-react';
import { SocialLinks } from '../../types/portfolio';

interface FooterProps {
  social: SocialLinks;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ social, onOpenAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#1C1C1C] bg-[#050505] text-[#888888] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-[#141414] items-start">
          {/* Brand & Role */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center space-x-2 text-white">
              <Terminal className="w-4 h-4 text-[#CCCCCC]" />
              <span className="font-mono text-sm font-bold tracking-wider uppercase">
                SUMIT SHRIVASTAV
              </span>
            </div>
            <p className="font-mono text-xs text-[#888888] max-w-md">
              FULL STACK DEVELOPER // CREATIVE WEB ENGINEER.
              BUILDING DIGITAL PRODUCTS FROM DATABASE TO DEPLOYMENT.
            </p>
            <div className="font-mono text-[11px] text-[#555555]">
              DELHI, INDIA // IST (UTC+05:30)
            </div>
          </div>

          {/* Direct Social Links */}
          <div className="md:col-span-3 space-y-2">
            <span className="font-mono text-[10px] text-[#666666] uppercase tracking-widest block">
              SYSTEM CHANNELS
            </span>
            <div className="flex flex-col space-y-1.5 font-mono text-xs">
              {social.github && (
                <a
                  href={social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  &gt; GITHUB
                </a>
              )}
              {social.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  &gt; LINKEDIN
                </a>
              )}
              {social.email && (
                <a
                  href={social.email}
                  className="hover:text-white transition-colors"
                >
                  &gt; DIRECT EMAIL
                </a>
              )}
            </div>
          </div>

          {/* Quick Actions / Back to Top */}
          <div className="md:col-span-3 flex flex-col md:items-end space-y-3">
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-[#0E0E0E] hover:bg-[#161616] border border-[#222222] hover:border-[#444444] font-mono text-xs text-[#D4D4D4] transition-colors"
            >
              <span>RETURN TO TOP</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onOpenAdmin}
              className="font-mono text-[11px] text-[#555555] hover:text-[#999999] transition-colors"
            >
              [ CMS CONTROL PANEL ]
            </button>
          </div>
        </div>

        {/* Bottom Technical Status Line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#555555] gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-[#FFFFFF]"></span>
            <span>&copy; {new Date().getFullYear()} SUMIT SHRIVASTAV. ALL RIGHTS RESERVED.</span>
          </div>

          <div className="flex items-center space-x-4">
            <span>ENGINEERED WITH NEXT.JS + THREE.JS + MONGODB</span>
            <span>ZERO GRADIENTS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
