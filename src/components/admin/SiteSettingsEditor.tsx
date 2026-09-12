import React, { useState } from 'react';
import { SiteContent, HeroContent, AboutContent, ContactSettings, SocialLinks } from '../../types/portfolio';
import { Globe, User, MessageSquare, Share2, Save } from 'lucide-react';

interface SiteSettingsEditorProps {
  site: SiteContent;
  hero: HeroContent;
  about: AboutContent;
  contact: ContactSettings;
  social: SocialLinks;
  onRefresh: () => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const SiteSettingsEditor: React.FC<SiteSettingsEditorProps> = ({
  site,
  hero,
  about,
  contact,
  social,
  onRefresh,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'site' | 'hero' | 'about' | 'contact' | 'social'>('site');
  const [siteData, setSiteData] = useState<SiteContent>({ ...site });
  const [heroData, setHeroData] = useState<HeroContent>({ ...hero });
  const [aboutData, setAboutData] = useState<AboutContent>({ ...about });
  const [contactData, setContactData] = useState<ContactSettings>({ ...contact });
  const [socialData, setSocialData] = useState<SocialLinks>({ ...social });
  const [saving, setSaving] = useState(false);

  const handleSave = async (section: string, payload: unknown) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `${section.toUpperCase()} updated successfully!`);
        onRefresh();
      } else {
        showToast('error', data.error || `Failed to update ${section}`);
      }
    } catch {
      showToast('error', 'Network error.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1C1C1C]">
        <div>
          <h2 className="text-xl font-bold font-display text-white tracking-tight uppercase">
            SITE CONFIGURATION &amp; METADATA
          </h2>
          <p className="font-mono text-xs text-[#888888]">
            Configure SEO, OpenGraph tags, Hero copywriting, Biography, and Contact routes.
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-1 border-b border-[#1C1C1C] pb-2 font-mono text-xs">
        {[
          { id: 'site', label: 'SITE & SEO', icon: <Globe className="w-3.5 h-3.5" /> },
          { id: 'hero', label: 'HERO SECTION', icon: <User className="w-3.5 h-3.5" /> },
          { id: 'about', label: 'ABOUT & STATS', icon: <User className="w-3.5 h-3.5" /> },
          { id: 'contact', label: 'CONTACT INFO', icon: <MessageSquare className="w-3.5 h-3.5" /> },
          { id: 'social', label: 'SOCIAL CHANNELS', icon: <Share2 className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-3 py-2 flex items-center space-x-2 transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-black font-semibold'
                : 'text-[#888888] hover:text-white bg-[#0E0E0E]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SITE & SEO TAB */}
      {activeTab === 'site' && (
        <div className="p-6 border border-[#1E1E1E] bg-[#0A0A0A] space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#161616]">
            <span className="text-[#AAAAAA] uppercase font-bold">SEO &amp; GLOBAL METADATA</span>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('site', siteData)}
              className="px-4 py-2 bg-white text-black font-bold uppercase flex items-center space-x-1.5 hover:bg-[#D4D4D4]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'SAVING...' : 'SAVE SITE CONFIG'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#888888] uppercase mb-1">PAGE TITLE (DOCUMENT &lt;TITLE&gt;)</label>
              <input
                type="text"
                value={siteData.title}
                onChange={(e) => setSiteData({ ...siteData, title: e.target.value })}
                className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
              />
            </div>
            <div>
              <label className="block text-[#888888] uppercase mb-1">AUTHOR NAME</label>
              <input
                type="text"
                value={siteData.author}
                onChange={(e) => setSiteData({ ...siteData, author: e.target.value })}
                className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#888888] uppercase mb-1">META DESCRIPTION (SEARCH ENGINES)</label>
            <textarea
              rows={2}
              value={siteData.description}
              onChange={(e) => setSiteData({ ...siteData, description: e.target.value })}
              className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#888888] uppercase mb-1">OPENGRAPH TITLE</label>
              <input
                type="text"
                value={siteData.ogTitle}
                onChange={(e) => setSiteData({ ...siteData, ogTitle: e.target.value })}
                className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
              />
            </div>
            <div>
              <label className="block text-[#888888] uppercase mb-1">CANONICAL URL</label>
              <input
                type="text"
                value={siteData.canonicalUrl}
                onChange={(e) => setSiteData({ ...siteData, canonicalUrl: e.target.value })}
                className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* HERO TAB */}
      {activeTab === 'hero' && (
        <div className="p-6 border border-[#1E1E1E] bg-[#0A0A0A] space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#161616]">
            <span className="text-[#AAAAAA] uppercase font-bold">HERO SECTION COPYWRITING</span>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('hero', heroData)}
              className="px-4 py-2 bg-white text-black font-bold uppercase flex items-center space-x-1.5 hover:bg-[#D4D4D4]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'SAVING...' : 'SAVE HERO'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#888888] uppercase mb-1">NAME</label>
              <input
                type="text"
                value={heroData.name}
                onChange={(e) => setHeroData({ ...heroData, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
              />
            </div>
            <div>
              <label className="block text-[#888888] uppercase mb-1">PRIMARY TITLE</label>
              <input
                type="text"
                value={heroData.title}
                onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#888888] uppercase mb-1">
              ROTATING TITLES (ONE PER LINE)
            </label>
            <textarea
              rows={4}
              value={heroData.rotatingTitles.join('\n')}
              onChange={(e) =>
                setHeroData({
                  ...heroData,
                  rotatingTitles: e.target.value.split('\n').map((t) => t.trim()).filter(Boolean),
                })
              }
              className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
            />
          </div>

          <div>
            <label className="block text-[#888888] uppercase mb-1">HERO BIO DESCRIPTION</label>
            <textarea
              rows={3}
              value={heroData.description}
              onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
              className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#888888] uppercase mb-1">PRIMARY CTA TEXT</label>
              <input
                type="text"
                value={heroData.primaryCtaText}
                onChange={(e) => setHeroData({ ...heroData, primaryCtaText: e.target.value })}
                className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
              />
            </div>
            <div>
              <label className="block text-[#888888] uppercase mb-1">SECONDARY CTA TEXT</label>
              <input
                type="text"
                value={heroData.secondaryCtaText}
                onChange={(e) => setHeroData({ ...heroData, secondaryCtaText: e.target.value })}
                className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* ABOUT TAB */}
      {activeTab === 'about' && (
        <div className="p-6 border border-[#1E1E1E] bg-[#0A0A0A] space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#161616]">
            <span className="text-[#AAAAAA] uppercase font-bold">ABOUT &amp; VERIFIED STATS</span>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('about', aboutData)}
              className="px-4 py-2 bg-white text-black font-bold uppercase flex items-center space-x-1.5 hover:bg-[#D4D4D4]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'SAVING...' : 'SAVE ABOUT'}</span>
            </button>
          </div>

          <div>
            <label className="block text-[#888888] uppercase mb-1">SECTION HEADLINE</label>
            <input
              type="text"
              value={aboutData.headline}
              onChange={(e) => setAboutData({ ...aboutData, headline: e.target.value })}
              className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
            />
          </div>

          <div>
            <label className="block text-[#888888] uppercase mb-1">
              PARAGRAPHS (DOUBLE NEWLINE SEPARATED)
            </label>
            <textarea
              rows={6}
              value={aboutData.paragraphs.join('\n\n')}
              onChange={(e) =>
                setAboutData({
                  ...aboutData,
                  paragraphs: e.target.value.split('\n\n').map((p) => p.trim()).filter(Boolean),
                })
              }
              className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
            />
          </div>

          <div>
            <label className="block text-[#888888] uppercase mb-1">
              HIGHLIGHTS &amp; PRINCIPLES (ONE PER LINE)
            </label>
            <textarea
              rows={4}
              value={aboutData.highlights.join('\n')}
              onChange={(e) =>
                setAboutData({
                  ...aboutData,
                  highlights: e.target.value.split('\n').map((h) => h.trim()).filter(Boolean),
                })
              }
              className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
            />
          </div>
        </div>
      )}

      {/* CONTACT TAB */}
      {activeTab === 'contact' && (
        <div className="p-6 border border-[#1E1E1E] bg-[#0A0A0A] space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#161616]">
            <span className="text-[#AAAAAA] uppercase font-bold">CONTACT INFO &amp; AVAILABILITY</span>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('contact', contactData)}
              className="px-4 py-2 bg-white text-black font-bold uppercase flex items-center space-x-1.5 hover:bg-[#D4D4D4]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'SAVING...' : 'SAVE CONTACT'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#888888] uppercase mb-1">PRIMARY EMAIL</label>
              <input
                type="email"
                value={contactData.email}
                onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
              />
            </div>
            <div>
              <label className="block text-[#888888] uppercase mb-1">PHONE NUMBER</label>
              <input
                type="text"
                value={contactData.phone}
                onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#888888] uppercase mb-1">LOCATION</label>
              <input
                type="text"
                value={contactData.location}
                onChange={(e) => setContactData({ ...contactData, location: e.target.value })}
                className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
              />
            </div>
            <div>
              <label className="block text-[#888888] uppercase mb-1">AVAILABILITY BADGE</label>
              <input
                type="text"
                value={contactData.availability}
                onChange={(e) => setContactData({ ...contactData, availability: e.target.value })}
                className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* SOCIAL TAB */}
      {activeTab === 'social' && (
        <div className="p-6 border border-[#1E1E1E] bg-[#0A0A0A] space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#161616]">
            <span className="text-[#AAAAAA] uppercase font-bold">PROFESSIONAL CHANNELS &amp; REPOSITORIES</span>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('social', socialData)}
              className="px-4 py-2 bg-white text-black font-bold uppercase flex items-center space-x-1.5 hover:bg-[#D4D4D4]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'SAVING...' : 'SAVE SOCIAL'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#888888] uppercase mb-1">GITHUB REPO URL</label>
              <input
                type="url"
                value={socialData.github}
                onChange={(e) => setSocialData({ ...socialData, github: e.target.value })}
                className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
              />
            </div>
            <div>
              <label className="block text-[#888888] uppercase mb-1">LINKEDIN PROFILE URL</label>
              <input
                type="url"
                value={socialData.linkedin}
                onChange={(e) => setSocialData({ ...socialData, linkedin: e.target.value })}
                className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
