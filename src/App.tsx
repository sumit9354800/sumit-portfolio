import React, { useState, useEffect, useCallback } from 'react';
import { PortfolioData } from './types/portfolio';
import { SEED_DATA } from './lib/seed-data';
import { Navbar } from './components/portfolio/Navbar';
import { HeroSection } from './components/portfolio/HeroSection';
import { AboutSection } from './components/portfolio/AboutSection';
import { SkillsSection } from './components/portfolio/SkillsSection';
import { ProjectsSection } from './components/portfolio/ProjectsSection';
import { ExperienceSection } from './components/portfolio/ExperienceSection';
import { CredentialsSection } from './components/portfolio/CredentialsSection';
import { ContactSection } from './components/portfolio/ContactSection';
import { Footer } from './components/portfolio/Footer';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Terminal } from 'lucide-react';

interface AdminUser {
  email: string;
  name: string;
  role: string;
}

export default function App() {
  const [data, setData] = useState<PortfolioData>(SEED_DATA);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  // Fetch all portfolio data from API
  const fetchPortfolio = useCallback(async () => {
    try {
      const res = await fetch('/api/portfolio');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      }
    } catch (err) {
      console.warn('Using embedded dataset due to API unreachable:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if admin is currently authenticated via cookie
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/me');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setAdminUser(json.data);
        } else {
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
      }
    } catch {
      setAdminUser(null);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
    checkAuth();

    // Check hash for #admin routing
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setIsAdminView(true);
      } else {
        setIsAdminView(false);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [fetchPortfolio, checkAuth]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      setAdminUser(null);
      setIsAdminView(false);
      window.location.hash = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="p-8 border border-[#202020] bg-[#0A0A0A] max-w-sm w-full space-y-4 font-mono text-xs">
          <div className="flex items-center space-x-2 text-white">
            <Terminal className="w-4 h-4 animate-pulse" />
            <span className="font-bold tracking-widest uppercase">SYS.BOOTLOADER</span>
          </div>
          <div className="h-1 w-full bg-[#181818] overflow-hidden">
            <div className="h-full bg-white w-1/2 animate-[pulse_1s_infinite]"></div>
          </div>
          <div className="text-[#888888] text-[11px] flex justify-between">
            <span>FETCHING DATABASE...</span>
            <span className="text-white font-bold">200 OK</span>
          </div>
        </div>
      </div>
    );
  }

  // Admin dedicated full-screen view
  if (isAdminView) {
    if (!adminUser) {
      return (
        <AdminLogin
          onSuccess={(admin) => setAdminUser(admin)}
          onCancel={() => {
            setIsAdminView(false);
            window.location.hash = '';
          }}
        />
      );
    }

    return (
      <AdminDashboard
        portfolio={data}
        admin={adminUser}
        onLogout={handleLogout}
        onExit={() => {
          setIsAdminView(false);
          window.location.hash = '';
        }}
        onRefreshData={fetchPortfolio}
      />
    );
  }

  // Main Public Portfolio View
  return (
    <div className="min-h-screen bg-[#050505] text-[#D4D4D4] font-sans selection:bg-[#2A2A2A] selection:text-white">
      {/* Top Navbar */}
      <Navbar
        navigation={data.navigation}
        contact={data.contact}
        onOpenAdmin={() => {
          if (adminUser) {
            setIsAdminView(true);
            window.location.hash = '#admin';
          } else {
            setShowAdminLoginModal(true);
          }
        }}
      />

      {/* Hero Section with Interactive 3D Canvas */}
      <HeroSection hero={data.hero} />

      {/* 01 / About Section */}
      <AboutSection about={data.about} />

      {/* 02 / Stack & Skills Section */}
      <SkillsSection skills={data.skills} />

      {/* 03 / Projects Section */}
      <ProjectsSection projects={data.projects} />

      {/* 04 / Experience Section */}
      <ExperienceSection experience={data.experience} />

      {/* 05 / Credentials Section */}
      <CredentialsSection education={data.education} certifications={data.certifications} />

      {/* 06 / Contact Section */}
      <ContactSection contact={data.contact} social={data.social} />

      {/* Technical Footer */}
      <Footer
        social={data.social}
        onOpenAdmin={() => {
          if (adminUser) {
            setIsAdminView(true);
            window.location.hash = '#admin';
          } else {
            setShowAdminLoginModal(true);
          }
        }}
      />

      {/* Admin Login Modal (Triggered from Navbar or Footer) */}
      {showAdminLoginModal && (
        <AdminLogin
          onSuccess={(admin) => {
            setAdminUser(admin);
            setShowAdminLoginModal(false);
            setIsAdminView(true);
            window.location.hash = '#admin';
          }}
          onCancel={() => setShowAdminLoginModal(false)}
        />
      )}
    </div>
  );
}
