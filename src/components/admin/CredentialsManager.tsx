import React, { useState } from 'react';
import { Education, Certification } from '../../types/portfolio';
import { Plus, Edit2, Trash2, X, GraduationCap, Award } from 'lucide-react';

interface CredentialsManagerProps {
  education: Education[];
  certifications: Certification[];
  onRefresh: () => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const CredentialsManager: React.FC<CredentialsManagerProps> = ({
  education,
  certifications,
  onRefresh,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'education' | 'certifications'>('education');
  const [editingEdu, setEditingEdu] = useState<Partial<Education> | null>(null);
  const [editingCert, setEditingCert] = useState<Partial<Certification> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // Education handlers
  const handleSaveEdu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEdu?.institution || !editingEdu?.degree) {
      showToast('error', 'Institution and Degree are required.');
      return;
    }
    setSaving(true);
    try {
      const isCreate = isNew || !editingEdu.id;
      const url = isCreate ? '/api/admin/education' : `/api/admin/education/${editingEdu.id}`;
      const method = isCreate ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEdu),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', 'Education record saved.');
        setEditingEdu(null);
        onRefresh();
      } else {
        showToast('error', data.error || 'Failed to save.');
      }
    } catch {
      showToast('error', 'Network error.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEdu = async (id: string) => {
    if (!confirm('Delete education record?')) return;
    try {
      const res = await fetch(`/api/admin/education/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', 'Education deleted.');
        onRefresh();
      }
    } catch {
      showToast('error', 'Network error.');
    }
  };

  // Certification handlers
  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert?.title || !editingCert?.issuer) {
      showToast('error', 'Title and Issuer are required.');
      return;
    }
    setSaving(true);
    try {
      const isCreate = isNew || !editingCert.id;
      const url = isCreate ? '/api/admin/certifications' : `/api/admin/certifications/${editingCert.id}`;
      const method = isCreate ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCert),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', 'Certification saved.');
        setEditingCert(null);
        onRefresh();
      } else {
        showToast('error', data.error || 'Failed to save.');
      }
    } catch {
      showToast('error', 'Network error.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (!confirm('Delete certification?')) return;
    try {
      const res = await fetch(`/api/admin/certifications/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', 'Certification deleted.');
        onRefresh();
      }
    } catch {
      showToast('error', 'Network error.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1C1C1C]">
        <div>
          <h2 className="text-xl font-bold font-display text-white tracking-tight uppercase">
            CREDENTIALS &amp; HONORS
          </h2>
          <p className="font-mono text-xs text-[#888888]">
            Manage academic degrees, certifications, and development awards.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsNew(true);
            if (activeTab === 'education') {
              setEditingEdu({
                institution: '',
                degree: '',
                field: 'Computer Science',
                startYear: '2024',
                endYear: '2027',
                status: 'In Progress',
                description: '',
                order: education.length + 1,
                enabled: true,
              });
            } else {
              setEditingCert({
                title: '',
                issuer: '',
                issueDate: '2024',
                year: '2024',
                credentialUrl: '',
                description: '',
                order: certifications.length + 1,
                enabled: true,
              });
            }
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white text-black hover:bg-[#D4D4D4] font-mono text-xs uppercase tracking-wider font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>ADD {activeTab === 'education' ? 'EDUCATION' : 'CERTIFICATE / AWARD'}</span>
        </button>
      </div>

      {/* Tab switch */}
      <div className="flex space-x-2 border-b border-[#1C1C1C]">
        <button
          type="button"
          onClick={() => setActiveTab('education')}
          className={`pb-3 px-4 font-mono text-xs uppercase tracking-wider border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === 'education'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-[#888888] hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>EDUCATION ({education.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('certifications')}
          className={`pb-3 px-4 font-mono text-xs uppercase tracking-wider border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === 'certifications'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-[#888888] hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>HONORS &amp; CERTIFICATIONS ({certifications.length})</span>
        </button>
      </div>

      {/* Education List */}
      {activeTab === 'education' && (
        <div className="space-y-3">
          {education.map((edu) => (
            <div
              key={edu.id}
              className="p-5 border border-[#1E1E1E] bg-[#0A0A0A] flex items-start justify-between gap-4"
            >
              <div>
                <div className="flex items-center space-x-2 font-mono text-xs text-[#888888]">
                  <span>{edu.startYear} — {edu.endYear}</span>
                  <span>•</span>
                  <span className="text-white">[{edu.status}]</span>
                </div>
                <h3 className="font-display text-base font-bold text-white mt-1">{edu.degree}</h3>
                <div className="font-mono text-xs text-[#AAAAAA]">{edu.institution} — {edu.field}</div>
                {edu.description && (
                  <p className="font-mono text-xs text-[#888888] mt-2">{edu.description}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsNew(false);
                    setEditingEdu({ ...edu });
                  }}
                  className="p-2 bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] text-white"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteEdu(edu.id)}
                  className="p-2 bg-[#1C0E0E] hover:bg-[#2C1414] border border-[#3B1E1E] text-[#E89D9D]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certifications List */}
      {activeTab === 'certifications' && (
        <div className="space-y-3">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="p-5 border border-[#1E1E1E] bg-[#0A0A0A] flex items-start justify-between gap-4"
            >
              <div>
                <div className="font-mono text-xs text-[#888888]">
                  {cert.issuer} {cert.year ? `(${cert.year})` : ''}
                </div>
                <h3 className="font-display text-base font-bold text-white mt-1">{cert.title}</h3>
                {cert.description && (
                  <p className="font-mono text-xs text-[#888888] mt-2">{cert.description}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsNew(false);
                    setEditingCert({ ...cert });
                  }}
                  className="p-2 bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] text-white"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCert(cert.id)}
                  className="p-2 bg-[#1C0E0E] hover:bg-[#2C1414] border border-[#3B1E1E] text-[#E89D9D]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Education Modal */}
      {editingEdu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0D0D0D] border border-[#2B2B2B] p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]">
              <h3 className="font-bold text-white uppercase text-sm">
                {isNew ? 'ADD EDUCATION' : 'EDIT EDUCATION'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingEdu(null)}
                className="p-1 text-[#888888] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdu} className="space-y-3">
              <div>
                <label className="block text-[#AAAAAA] uppercase mb-1">INSTITUTION *</label>
                <input
                  type="text"
                  required
                  value={editingEdu.institution || ''}
                  onChange={(e) => setEditingEdu({ ...editingEdu, institution: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
                />
              </div>

              <div>
                <label className="block text-[#AAAAAA] uppercase mb-1">DEGREE / PROGRAM *</label>
                <input
                  type="text"
                  required
                  value={editingEdu.degree || ''}
                  onChange={(e) => setEditingEdu({ ...editingEdu, degree: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
                />
              </div>

              <div>
                <label className="block text-[#AAAAAA] uppercase mb-1">FIELD OF STUDY</label>
                <input
                  type="text"
                  value={editingEdu.field || ''}
                  onChange={(e) => setEditingEdu({ ...editingEdu, field: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#AAAAAA] uppercase mb-1">START YEAR</label>
                  <input
                    type="text"
                    value={editingEdu.startYear || ''}
                    onChange={(e) => setEditingEdu({ ...editingEdu, startYear: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#AAAAAA] uppercase mb-1">END YEAR</label>
                  <input
                    type="text"
                    value={editingEdu.endYear || ''}
                    onChange={(e) => setEditingEdu({ ...editingEdu, endYear: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#AAAAAA] uppercase mb-1">STATUS</label>
                <input
                  type="text"
                  value={editingEdu.status || ''}
                  onChange={(e) => setEditingEdu({ ...editingEdu, status: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
                />
              </div>

              <div className="pt-4 border-t border-[#1C1C1C] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingEdu(null)}
                  className="px-4 py-2 bg-[#141414] border border-[#242424] text-[#AAAAAA]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-white text-black font-bold uppercase"
                >
                  {saving ? 'SAVING...' : 'SAVE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certification Modal */}
      {editingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0D0D0D] border border-[#2B2B2B] p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]">
              <h3 className="font-bold text-white uppercase text-sm">
                {isNew ? 'ADD CERTIFICATION' : 'EDIT CERTIFICATION'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingCert(null)}
                className="p-1 text-[#888888] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCert} className="space-y-3">
              <div>
                <label className="block text-[#AAAAAA] uppercase mb-1">AWARD / TITLE *</label>
                <input
                  type="text"
                  required
                  value={editingCert.title || ''}
                  onChange={(e) => setEditingCert({ ...editingCert, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
                />
              </div>

              <div>
                <label className="block text-[#AAAAAA] uppercase mb-1">ISSUER *</label>
                <input
                  type="text"
                  required
                  value={editingCert.issuer || ''}
                  onChange={(e) => setEditingCert({ ...editingCert, issuer: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
                />
              </div>

              <div>
                <label className="block text-[#AAAAAA] uppercase mb-1">YEAR</label>
                <input
                  type="text"
                  value={editingCert.year || ''}
                  onChange={(e) => setEditingCert({ ...editingCert, year: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
                />
              </div>

              <div>
                <label className="block text-[#AAAAAA] uppercase mb-1">DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={editingCert.description || ''}
                  onChange={(e) => setEditingCert({ ...editingCert, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
                />
              </div>

              <div className="pt-4 border-t border-[#1C1C1C] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingCert(null)}
                  className="px-4 py-2 bg-[#141414] border border-[#242424] text-[#AAAAAA]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-white text-black font-bold uppercase"
                >
                  {saving ? 'SAVING...' : 'SAVE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
