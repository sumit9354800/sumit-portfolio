import React, { useState } from 'react';
import { Experience } from '../../types/portfolio';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface ExperienceManagerProps {
  experience: Experience[];
  onRefresh: () => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const ExperienceManager: React.FC<ExperienceManagerProps> = ({
  experience,
  onRefresh,
  showToast,
}) => {
  const [editing, setEditing] = useState<Partial<Experience> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCreateNew = () => {
    setIsNew(true);
    setEditing({
      title: 'Full Stack Web Developer',
      role: 'Full Stack Web Developer',
      company: '',
      location: 'Delhi, India',
      startDate: '2023',
      endDate: 'Present',
      description: '',
      responsibilities: ['Engineered responsive web applications.'],
      technologies: ['React', 'Node.js', 'Express', 'MongoDB'],
      companyUrl: '',
      order: experience.length + 1,
      enabled: true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.company || !editing?.role) {
      showToast('error', 'Company and Role are required.');
      return;
    }

    setSaving(true);
    try {
      const isCreate = isNew || !editing.id;
      const url = isCreate ? '/api/admin/experience' : `/api/admin/experience/${editing.id}`;
      const method = isCreate ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', 'Experience record saved.');
        setEditing(null);
        onRefresh();
      } else {
        showToast('error', data.error || 'Failed to save experience.');
      }
    } catch {
      showToast('error', 'Network error.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience record?')) return;

    try {
      const res = await fetch(`/api/admin/experience/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', 'Experience deleted.');
        onRefresh();
      } else {
        showToast('error', data.error || 'Failed to delete.');
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
            EXPERIENCE TIMELINE ({experience.length})
          </h2>
          <p className="font-mono text-xs text-[#888888]">
            Manage professional history, freelance deliveries, and engineering roles.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white text-black hover:bg-[#D4D4D4] font-mono text-xs uppercase tracking-wider font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>ADD EXPERIENCE</span>
        </button>
      </div>

      <div className="space-y-4">
        {experience.map((exp) => (
          <div
            key={exp.id}
            className="p-5 border border-[#1E1E1E] bg-[#0A0A0A] flex flex-col md:flex-row justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h3 className="font-display text-lg font-bold text-white">{exp.role}</h3>
                <span className="font-mono text-xs text-[#888888]">@ {exp.company}</span>
              </div>
              <div className="font-mono text-xs text-[#AAAAAA]">
                {exp.startDate} — {exp.endDate} ({exp.location})
              </div>
              <p className="font-mono text-xs text-[#888888] max-w-3xl leading-relaxed">
                {exp.description}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {exp.technologies.map((t, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-[#121212] border border-[#222222] font-mono text-[10px] text-[#CCCCCC]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 self-start">
              <button
                type="button"
                onClick={() => {
                  setIsNew(false);
                  setEditing({ ...exp });
                }}
                className="p-2 bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] text-white"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(exp.id)}
                className="p-2 bg-[#1C0E0E] hover:bg-[#2C1414] border border-[#3B1E1E] text-[#E89D9D]"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0D0D0D] border border-[#2B2B2B] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]">
              <h3 className="font-bold text-white uppercase text-sm">
                {isNew ? 'ADD EXPERIENCE RECORD' : 'EDIT EXPERIENCE'}
              </h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="p-1 text-[#888888] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#AAAAAA] uppercase mb-1">ROLE / TITLE *</label>
                  <input
                    type="text"
                    required
                    value={editing.role || ''}
                    onChange={(e) => setEditing({ ...editing, role: e.target.value, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#AAAAAA] uppercase mb-1">COMPANY / CLIENT ENTITY *</label>
                  <input
                    type="text"
                    required
                    value={editing.company || ''}
                    onChange={(e) => setEditing({ ...editing, company: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#AAAAAA] uppercase mb-1">START DATE</label>
                  <input
                    type="text"
                    value={editing.startDate || ''}
                    onChange={(e) => setEditing({ ...editing, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#AAAAAA] uppercase mb-1">END DATE</label>
                  <input
                    type="text"
                    value={editing.endDate || ''}
                    onChange={(e) => setEditing({ ...editing, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#AAAAAA] uppercase mb-1">LOCATION</label>
                  <input
                    type="text"
                    value={editing.location || ''}
                    onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#AAAAAA] uppercase mb-1">DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
                />
              </div>

              <div>
                <label className="block text-[#AAAAAA] uppercase mb-1">
                  RESPONSIBILITIES (ONE PER LINE)
                </label>
                <textarea
                  rows={3}
                  value={(editing.responsibilities || []).join('\n')}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      responsibilities: e.target.value.split('\n').map((r) => r.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
                />
              </div>

              <div>
                <label className="block text-[#AAAAAA] uppercase mb-1">
                  TECHNOLOGIES (COMMA SEPARATED)
                </label>
                <input
                  type="text"
                  value={(editing.technologies || []).join(', ')}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      technologies: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white"
                />
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.enabled ?? true}
                    onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })}
                    className="accent-white"
                  />
                  <span className="text-white">ENABLED</span>
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-[#888888]">ORDER:</span>
                  <input
                    type="number"
                    value={editing.order ?? 1}
                    onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
                    className="w-14 px-2 py-1 bg-[#121212] border border-[#242424] text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#1C1C1C] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
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
