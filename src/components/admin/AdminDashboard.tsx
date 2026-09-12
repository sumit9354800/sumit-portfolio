import React, { useState, useEffect } from 'react';
import { PortfolioData } from '../../types/portfolio';
import { ProjectsManager } from './ProjectsManager';
import { SkillsManager } from './SkillsManager';
import { ExperienceManager } from './ExperienceManager';
import { CredentialsManager } from './CredentialsManager';
import { SiteSettingsEditor } from './SiteSettingsEditor';
import { Toast, ToastMessage } from './Toast';
import {
  LayoutDashboard,
  FolderGit2,
  Cpu,
  Briefcase,
  GraduationCap,
  Settings,
  LogOut,
  ExternalLink,
  Database,
  RefreshCw,
  Server,
  Mail,
} from 'lucide-react';

interface AdminDashboardProps {
  portfolio: PortfolioData;
  admin: { email: string; name: string; role: string };
  onLogout: () => void;
  onExit: () => void;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  portfolio,
  admin,
  onLogout,
  onExit,
  onRefreshData,
}) => {
  const [currentTab, setCurrentTab] = useState<
    'overview' | 'projects' | 'skills' | 'experience' | 'credentials' | 'settings'
  >('overview');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; storage: string }>({
    connected: false,
    storage: 'Local Durable File System',
  });

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, text }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    // Check server database health
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.database) {
          setDbStatus({
            connected: data.database.connected,
            storage: data.database.storage,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSyncToMongo = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/sync-to-mongo', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', data.message || 'Database synchronized with MongoDB Atlas!');
        onRefreshData();
      } else {
        showToast('error', data.error || 'Sync requires active MONGODB_URI in settings.');
      }
    } catch {
      showToast('error', 'Network error while attempting synchronization.');
    } finally {
      setSyncing(false);
    }
  };

  const navItems = [
    { id: 'overview', label: 'DASHBOARD OVERVIEW', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'projects', label: `PROJECTS (${portfolio.projects.length})`, icon: <FolderGit2 className="w-4 h-4" /> },
    { id: 'skills', label: `SKILLS (${portfolio.skills.length})`, icon: <Cpu className="w-4 h-4" /> },
    { id: 'experience', label: `EXPERIENCE (${portfolio.experience.length})`, icon: <Briefcase className="w-4 h-4" /> },
    {
      id: 'credentials',
      label: `CREDENTIALS (${portfolio.education.length + portfolio.certifications.length})`,
      icon: <GraduationCap className="w-4 h-4" />,
    },
    { id: 'settings', label: 'SITE & SEO SETTINGS', icon: <Settings className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col font-sans">
      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Top Telemetry & Control Bar */}
      <header className="border-b border-[#1C1C1C] bg-[#0A0A0A] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 bg-white"></span>
            <div className="font-mono text-xs sm:text-sm font-bold tracking-wider uppercase">
              SUMIT SHRIVASTAV // CMS CONTROL PANEL
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Database status indicator */}
            <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 bg-[#111111] border border-[#222222] font-mono text-[11px]">
              <Database className="w-3.5 h-3.5 text-[#888888]" />
              <span className="text-[#888888]">DB:</span>
              <span className={dbStatus.connected ? 'text-[#00FF66]' : 'text-[#CCCCCC]'}>
                {dbStatus.connected ? 'MONGODB ATLAS' : 'LOCAL STORE'}
              </span>
            </div>

            {/* Sync button */}
            <button
              type="button"
              onClick={handleSyncToMongo}
              disabled={syncing}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#141414] hover:bg-[#1E1E1E] border border-[#282828] font-mono text-xs text-[#D4D4D4] transition-colors"
              title="Synchronize Local Store with MongoDB Atlas"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'SYNCING...' : 'SYNC TO ATLAS'}</span>
            </button>

            {/* View Live Portfolio */}
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white text-black hover:bg-[#D4D4D4] font-mono text-xs uppercase font-semibold transition-colors"
            >
              <span>VIEW PORTFOLIO</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 text-[#888888] hover:text-white transition-colors"
              title="Logout session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="border border-[#1E1E1E] bg-[#0A0A0A] p-4 space-y-1">
            <div className="font-mono text-[10px] text-[#666666] uppercase tracking-wider px-3 pb-2 border-b border-[#161616] mb-2">
              NAVIGATION MODULES
            </div>

            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 font-mono text-xs transition-colors border ${
                  currentTab === item.id
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-transparent border-transparent text-[#999999] hover:text-white hover:bg-[#121212]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* User badge */}
          <div className="border border-[#1A1A1A] bg-[#080808] p-4 font-mono text-xs space-y-1">
            <div className="text-[10px] text-[#666666] uppercase">ACTIVE OPERATOR</div>
            <div className="text-white font-bold truncate">{admin.email}</div>
            <div className="text-[10px] text-[#888888]">ROLE: {admin.role.toUpperCase()}</div>
          </div>
        </aside>

        {/* Right Dynamic View Area */}
        <main className="lg:col-span-9">
          {currentTab === 'overview' && (
            <div className="space-y-6">
              <div className="border border-[#1E1E1E] bg-[#0A0A0A] p-6 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#161616]">
                  <span className="font-mono text-xs text-[#888888] uppercase">SYSTEM SUMMARY</span>
                  <span className="font-mono text-[10px] text-[#00FF66]">ALL SERVICES OPERATIONAL</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                  WELCOME BACK, {admin.name || 'SUMIT'}.
                </h2>
                <p className="font-mono text-xs text-[#999999] leading-relaxed max-w-2xl">
                  You are managing the production portfolio system. All edits are saved directly to durable storage and instantly reflect on the live portfolio.
                </p>
              </div>

              {/* High-Contrast Telemetry Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 border border-[#1E1E1E] bg-[#0A0A0A] space-y-1">
                  <span className="font-mono text-3xl font-bold text-white block">
                    {portfolio.projects.length}
                  </span>
                  <span className="font-mono text-xs text-[#888888] uppercase">
                    PROJECTS ({portfolio.projects.filter((p) => p.published).length} LIVE)
                  </span>
                </div>

                <div className="p-5 border border-[#1E1E1E] bg-[#0A0A0A] space-y-1">
                  <span className="font-mono text-3xl font-bold text-white block">
                    {portfolio.skills.length}
                  </span>
                  <span className="font-mono text-xs text-[#888888] uppercase">
                    TECH MODULES
                  </span>
                </div>

                <div className="p-5 border border-[#1E1E1E] bg-[#0A0A0A] space-y-1">
                  <span className="font-mono text-3xl font-bold text-white block">
                    {portfolio.experience.length}
                  </span>
                  <span className="font-mono text-xs text-[#888888] uppercase">
                    EXP TIMELINES
                  </span>
                </div>

                <div className="p-5 border border-[#1E1E1E] bg-[#0A0A0A] space-y-1">
                  <span className="font-mono text-3xl font-bold text-white block">
                    {portfolio.certifications.length}
                  </span>
                  <span className="font-mono text-xs text-[#888888] uppercase">
                    AWARDS &amp; HONORS
                  </span>
                </div>
              </div>

              {/* Storage & Environment Telemetry */}
              <div className="border border-[#1E1E1E] bg-[#0A0A0A] p-6 space-y-4 font-mono text-xs">
                <div className="flex items-center space-x-2 text-white font-bold pb-3 border-b border-[#161616]">
                  <Server className="w-4 h-4" />
                  <span>ARCHITECTURE &amp; ENVIRONMENT TELEMETRY</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#0F0F0F] border border-[#1E1E1E] space-y-2">
                    <div className="text-[#AAAAAA] font-bold flex items-center space-x-2">
                      <Database className="w-3.5 h-3.5" />
                      <span>MONGODB ATLAS CONNECTION</span>
                    </div>
                    <p className="text-[#777777] text-[11px] leading-relaxed">
                      Primary cloud persistence layer. If MONGODB_URI is provided in container secrets, all operations read &amp; write to MongoDB Atlas collections.
                    </p>
                    <div className="pt-2 flex items-center justify-between text-[11px]">
                      <span className="text-[#888888]">STATUS:</span>
                      <span className={dbStatus.connected ? 'text-[#00FF66] font-bold' : 'text-[#CCCCCC]'}>
                        {dbStatus.connected ? 'ATLAS CLOUD CONNECTED' : 'LOCAL DURABLE STORE ACTIVE'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0F0F0F] border border-[#1E1E1E] space-y-2">
                    <div className="text-[#AAAAAA] font-bold flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5" />
                      <span>RESEND EMAIL INTEGRATION</span>
                    </div>
                    <p className="text-[#777777] text-[11px] leading-relaxed">
                      Dispatches visitor inquiry submissions directly to {portfolio.contact.email} with anti-spam honeypot and rate-limiting safeguards.
                    </p>
                    <div className="pt-2 flex items-center justify-between text-[11px]">
                      <span className="text-[#888888]">SERVICE:</span>
                      <span className="text-white">RESEND API (LAZY-LOADED)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="border border-[#1A1A1A] bg-[#080808] p-5 font-mono text-xs space-y-3">
                <div className="text-[#888888] uppercase font-bold text-[11px]">
                  RAPID MANAGEMENT SHORTCUTS
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentTab('projects')}
                    className="px-3.5 py-2 bg-[#121212] hover:bg-[#1E1E1E] border border-[#242424] text-white transition-colors"
                  >
                    + ADD OR EDIT PROJECTS
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('skills')}
                    className="px-3.5 py-2 bg-[#121212] hover:bg-[#1E1E1E] border border-[#242424] text-white transition-colors"
                  >
                    + ADD OR EDIT SKILLS
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('settings')}
                    className="px-3.5 py-2 bg-[#121212] hover:bg-[#1E1E1E] border border-[#242424] text-white transition-colors"
                  >
                    EDIT SITE &amp; HERO COPY
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'projects' && (
            <ProjectsManager
              projects={portfolio.projects}
              onRefresh={onRefreshData}
              showToast={showToast}
            />
          )}

          {currentTab === 'skills' && (
            <SkillsManager
              skills={portfolio.skills}
              onRefresh={onRefreshData}
              showToast={showToast}
            />
          )}

          {currentTab === 'experience' && (
            <ExperienceManager
              experience={portfolio.experience}
              onRefresh={onRefreshData}
              showToast={showToast}
            />
          )}

          {currentTab === 'credentials' && (
            <CredentialsManager
              education={portfolio.education}
              certifications={portfolio.certifications}
              onRefresh={onRefreshData}
              showToast={showToast}
            />
          )}

          {currentTab === 'settings' && (
            <SiteSettingsEditor
              site={portfolio.site}
              hero={portfolio.hero}
              about={portfolio.about}
              contact={portfolio.contact}
              social={portfolio.social}
              onRefresh={onRefreshData}
              showToast={showToast}
            />
          )}
        </main>
      </div>
    </div>
  );
};
