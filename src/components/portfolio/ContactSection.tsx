import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { ContactSettings, SocialLinks } from '../../types/portfolio';

interface ContactSectionProps {
  contact: ContactSettings;
  social: SocialLinks;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ contact, social }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '', // anti-spam bot trap
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    // Client-side quick checks
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setStatusMessage({ type: 'error', text: 'All required fields must be populated.' });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: data.message || 'Message sent successfully! I will respond within 24 hours.',
        });
        setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' });
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to dispatch inquiry. Please check fields and retry.',
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Network connection failed. Please contact directly via email or phone.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 border-b border-[#1C1C1C] relative bg-[#070707]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center space-x-3 mb-4">
          <span className="font-mono text-xs text-[#888888] tracking-widest uppercase">06 / CONTACT</span>
          <div className="h-px bg-[#242424] flex-1 max-w-[120px]"></div>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white uppercase leading-tight max-w-3xl mb-4">
          GET IN TOUCH.
        </h2>

        <p className="text-base sm:text-lg text-[#A0A0A0] max-w-2xl font-normal mb-16">
          {contact.description ||
            'Open for full-time roles, contract projects, and ambitious collaborations. Drop a message — I respond within 24 hours.'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Direct Communication Specs */}
          <div className="lg:col-span-5 space-y-8">
            <div className="border border-[#202020] bg-[#0A0A0A] p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#181818] font-mono text-xs text-[#888888] uppercase">
                <span>COMMUNICATION CHANNELS</span>
                <span className="w-2 h-2 bg-white"></span>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-[#666666] uppercase tracking-wider block">
                  PRIMARY EMAIL
                </span>
                <a
                  href={`mailto:${contact.email}`}
                  className="font-mono text-sm sm:text-base text-white hover:text-[#D4D4D4] flex items-center space-x-2.5 transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#888888]" />
                  <span>{contact.email}</span>
                </a>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-[#666666] uppercase tracking-wider block">
                  PHONE // WHATSAPP
                </span>
                <a
                  href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                  className="font-mono text-sm sm:text-base text-white hover:text-[#D4D4D4] flex items-center space-x-2.5 transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#888888]" />
                  <span>{contact.phone}</span>
                </a>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-[#666666] uppercase tracking-wider block">
                  BASE LOCATION
                </span>
                <div className="font-mono text-sm text-white flex items-center space-x-2.5">
                  <MapPin className="w-4 h-4 text-[#888888]" />
                  <span>{contact.location}</span>
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-1 pt-2 border-t border-[#161616]">
                <span className="font-mono text-[10px] text-[#666666] uppercase tracking-wider block">
                  AVAILABILITY STATUS
                </span>
                <div className="font-mono text-xs text-[#00FF66] flex items-center space-x-2">
                  <span className="w-2 h-2 bg-[#00FF66] animate-pulse"></span>
                  <span>{contact.availability || 'AVAILABLE FOR OPPORTUNITIES'}</span>
                </div>
              </div>
            </div>

            {/* Direct Social Links */}
            <div className="border border-[#1A1A1A] bg-[#090909] p-5 font-mono text-xs space-y-3">
              <span className="text-[10px] text-[#777777] uppercase tracking-wider block">
                PROFESSIONAL NETWORKS
              </span>
              <div className="flex flex-wrap gap-2">
                {social.github && (
                  <a
                    href={social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-[#121212] hover:bg-[#1A1A1A] border border-[#262626] text-white transition-colors"
                  >
                    GITHUB :: @sumit9354800
                  </a>
                )}
                {social.linkedin && (
                  <a
                    href={social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-[#121212] hover:bg-[#1A1A1A] border border-[#262626] text-white transition-colors"
                  >
                    LINKEDIN // SUMIT SHRIVASTAV
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="border border-[#222222] bg-[#0A0A0A] p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#181818] font-mono text-xs text-[#888888]">
                <span>TRANSMIT INQUIRY DIRECTLY</span>
                <span className="flex items-center space-x-1.5 text-[#666666]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>SLA: &lt; 24H</span>
                </span>
              </div>

              {statusMessage && (
                <div
                  className={`p-4 mb-6 font-mono text-xs border flex items-start space-x-2.5 ${
                    statusMessage.type === 'success'
                      ? 'bg-[#0E1A11] border-[#1D3B23] text-[#A6E3B5]'
                      : 'bg-[#1F1010] border-[#3B1D1D] text-[#F3A5A5]'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Honeypot field (hidden for bots) */}
                <input
                  type="text"
                  name="honeypot"
                  value={formData.honeypot}
                  onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-mono text-xs text-[#AAAAAA] uppercase tracking-wider mb-2">
                      NAME *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-4 py-3 bg-[#111111] border border-[#222222] focus:border-white text-white font-mono text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-[#AAAAAA] uppercase tracking-wider mb-2">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex@company.com"
                      className="w-full px-4 py-3 bg-[#111111] border border-[#222222] focus:border-white text-white font-mono text-sm focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs text-[#AAAAAA] uppercase tracking-wider mb-2">
                    SUBJECT // PURPOSE *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Full-stack opportunity / Project inquiry"
                    className="w-full px-4 py-3 bg-[#111111] border border-[#222222] focus:border-white text-white font-mono text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-[#AAAAAA] uppercase tracking-wider mb-2">
                    MESSAGE CONTENT *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide project details, requirements, timeline, or scope..."
                    className="w-full px-4 py-3 bg-[#111111] border border-[#222222] focus:border-white text-white font-mono text-sm focus:outline-none transition-colors resize-y"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3.5 bg-white hover:bg-[#D4D4D4] disabled:bg-[#444444] text-black font-mono text-xs uppercase tracking-widest font-semibold transition-all duration-200 flex items-center space-x-2"
                  >
                    <span>{loading ? 'DISPATCHING...' : 'SEND INQUIRY'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>

                  <span className="font-mono text-[10px] text-[#666666]">
                    PROTECTED BY RATE LIMIT &amp; SPAM TRAP
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
