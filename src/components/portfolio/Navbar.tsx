import React, { useState, useEffect } from 'react';
import { Menu, X, Terminal, Shield } from 'lucide-react';
import { NavigationItem } from '../../types/portfolio';

interface NavbarProps {
  navigation: NavigationItem[];
  onOpenAdmin: () => void;
  isAdminLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ navigation, onOpenAdmin, isAdminLoggedIn }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);

      const sections = ['hero', 'about', 'skills', 'projects', 'experience', 'credentials', 'contact'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160 && rect.bottom >= 160) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const enabledNav = navigation.filter((n) => n.enabled).sort((a, b) => a.order - b.order);

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#080808]/90 backdrop-blur-md border-b border-[#1C1C1C] py-3.5'
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo / Terminal Tag */}
        <a
          href="#hero"
          id="navbar-brand-link"
          className="group flex items-center space-x-3 text-white focus:outline-none"
        >
          <div className="w-8 h-8 bg-[#111111] border border-[#2A2A2A] flex items-center justify-center group-hover:border-[#666666] transition-colors">
            <Terminal className="w-4 h-4 text-[#D4D4D4]" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-sm tracking-wider font-semibold text-white">
              SUMIT SHRIVASTAV
            </span>
            <span className="font-mono text-[10px] text-[#888888] tracking-widest hidden sm:inline">
              FULL STACK DEVELOPER
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2" aria-label="Main Navigation">
          {enabledNav.map((item) => {
            const sectionId = item.href.replace('#', '');
            const isActive = activeSection === sectionId;

            return (
              <a
                key={item.id}
                href={item.href}
                id={`nav-link-${sectionId}`}
                className={`px-3 py-1.5 font-mono text-xs tracking-wider transition-colors border ${
                  isActive
                    ? 'border-[#333333] bg-[#141414] text-white'
                    : 'border-transparent text-[#888888] hover:text-[#D4D4D4] hover:border-[#1C1C1C]'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Admin button */}
        <div className="hidden sm:flex items-center">
          <button
            type="button"
            onClick={onOpenAdmin}
            id="nav-admin-cms-btn"
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#111111] hover:bg-[#1C1C1C] border border-[#242424] hover:border-[#333333] text-[11px] font-mono text-[#D4D4D4] transition-colors"
            title="Open Admin CMS Control Panel"
          >
            <Shield className="w-3 h-3 text-[#AAAAAA]" />
            <span>{isAdminLoggedIn ? 'ADMIN [ONLINE]' : 'CMS ACCESS'}</span>
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            type="button"
            onClick={onOpenAdmin}
            id="mobile-admin-btn"
            className="p-2 bg-[#111111] border border-[#242424] text-xs font-mono text-[#AAAAAA]"
            title="Admin CMS"
          >
            <Shield className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            id="mobile-menu-toggle-btn"
            className="p-2 bg-[#111111] border border-[#242424] text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="md:hidden bg-[#0A0A0A] border-b border-[#1C1C1C] px-6 py-5 space-y-3"
        >
          <div className="flex flex-col space-y-1">
            {enabledNav.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 border border-transparent hover:border-[#222222] hover:bg-[#111111] font-mono text-sm tracking-wider text-[#CCCCCC]"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-[#1C1C1C] flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="px-3 py-1.5 bg-[#161616] border border-[#2A2A2A] font-mono text-xs text-white"
            >
              CMS CONTROL
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
