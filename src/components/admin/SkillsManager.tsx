import React, { useState } from 'react';
import { Skill, SkillCategory } from '../../types/portfolio';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface SkillsManagerProps {
  skills: Skill[];
  onRefresh: () => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const SkillsManager: React.FC<SkillsManagerProps> = ({ skills, onRefresh, showToast }) => {
  const [editingSkill, setEditingSkill] = useState<Partial<Skill> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SkillCategory | 'all'>('all');
  const [saving, setSaving] = useState(false);

  const categories: { key: SkillCategory; label: string }[] = [
    { key: 'frontend', label: 'FRONTEND' },
    { key: 'backend', label: 'BACKEND' },
    { key: 'database-tools', label: 'DATABASE & TOOLS' },
  ];

  const handleCreateNew = () => {
    setIsNew(true);
    setEditingSkill({
      name: '',
      category: activeCategory === 'all' ? 'frontend' : activeCategory,
      description: '',
      featured: false,
      enabled: true,
      order: skills.length + 1,
    });
  };

  const handleEdit = (skill: Skill) => {
    setIsNew(false);
    setEditingSkill({ ...skill });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill?.name) {
      showToast('error', 'Skill name is required.');
      return;
    }

    setSaving(true);
    try {
      const isCreate = isNew || !editingSkill.id;
      const url = isCreate ? '/api/admin/skills' : `/api/admin/skills/${editingSkill.id}`;
      const method = isCreate ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSkill),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', isCreate ? 'Skill added.' : 'Skill updated.');
        setEditingSkill(null);
        onRefresh();
      } else {
        showToast('error', data.error || 'Failed to save skill.');
      }
    } catch {
      showToast('error', 'Network error.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      const res = await fetch(`/api/admin/skills/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', 'Skill deleted.');
        onRefresh();
      } else {
        showToast('error', data.error || 'Failed to delete.');
      }
    } catch {
      showToast('error', 'Network error.');
    }
  };

  const displayedSkills = skills.filter((s) => {
    if (activeCategory === 'all') return true;
    return s.category === activeCategory;
  }).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1C1C1C]">
        <div>
          <h2 className="text-xl font-bold font-display text-white tracking-tight uppercase">
            SKILLS &amp; ARCHITECTURAL TOOLS ({skills.length})
          </h2>
          <p className="font-mono text-xs text-[#888888]">
            Manage technical competencies, backend runtimes, libraries, and categorization.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white text-black hover:bg-[#D4D4D4] font-mono text-xs uppercase tracking-wider font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW SKILL</span>
        </button>
      </div>

      {/* Category selector */}
      <div className="flex space-x-1 border border-[#202020] bg-[#0E0E0E] p-1 font-mono text-xs max-w-md">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`flex-1 py-1.5 transition-colors ${
            activeCategory === 'all' ? 'bg-white text-black font-semibold' : 'text-[#888888] hover:text-white'
          }`}
        >
          ALL ({skills.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setActiveCategory(cat.key)}
            className={`flex-1 py-1.5 transition-colors ${
              activeCategory === cat.key ? 'bg-white text-black font-semibold' : 'text-[#888888] hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayedSkills.map((skill) => (
          <div
            key={skill.id}
            className="p-4 border border-[#1E1E1E] bg-[#0A0A0A] flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs text-[#666666]">#{skill.order}</span>
                  <h4 className="font-mono text-sm font-bold text-white tracking-wide">
                    {skill.name}
                  </h4>
                </div>
                <div className="font-mono text-[10px] text-[#888888] uppercase mt-0.5">
                  [{skill.category}]
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => handleEdit(skill)}
                  className="p-1.5 bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] text-white"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(skill.id)}
                  className="p-1.5 bg-[#1C0E0E] hover:bg-[#2C1414] border border-[#3B1E1E] text-[#E89D9D]"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {skill.description && (
              <p className="font-mono text-xs text-[#999999] leading-relaxed">
                {skill.description}
              </p>
            )}

            <div className="pt-2 border-t border-[#141414] flex items-center justify-between font-mono text-[10px]">
              <span className={skill.enabled ? 'text-[#00FF66]' : 'text-[#888888]'}>
                {skill.enabled ? 'ENABLED' : 'DISABLED'}
              </span>
              {skill.featured && (
                <span className="px-1.5 py-0.5 bg-[#161616] border border-[#2B2B2B] text-white">
                  CORE_FEATURED
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0D0D0D] border border-[#2B2B2B] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]">
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                {isNew ? 'ADD NEW SKILL' : 'EDIT SKILL'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingSkill(null)}
                className="p-1 text-[#888888] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[#AAAAAA] uppercase mb-1">SKILL NAME *</label>
                <input
                  type="text"
                  required
                  value={editingSkill.name || ''}
                  onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#AAAAAA] uppercase mb-1">CATEGORY</label>
                <select
                  value={editingSkill.category || 'frontend'}
                  onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value as SkillCategory })}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white focus:border-white focus:outline-none"
                >
                  <option value="frontend">FRONTEND</option>
                  <option value="backend">BACKEND</option>
                  <option value="database-tools">DATABASE &amp; TOOLS</option>
                </select>
              </div>

              <div>
                <label className="block text-[#AAAAAA] uppercase mb-1">TECHNICAL DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={editingSkill.description || ''}
                  onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                  placeholder="Key applications, libraries, architectural role..."
                  className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white focus:border-white focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-4 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSkill.enabled ?? true}
                    onChange={(e) => setEditingSkill({ ...editingSkill, enabled: e.target.checked })}
                    className="accent-white"
                  />
                  <span className="text-white">ENABLED</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSkill.featured ?? false}
                    onChange={(e) => setEditingSkill({ ...editingSkill, featured: e.target.checked })}
                    className="accent-white"
                  />
                  <span className="text-white">FEATURED</span>
                </label>

                <div className="flex items-center space-x-2">
                  <span className="text-[#888888]">ORDER:</span>
                  <input
                    type="number"
                    value={editingSkill.order ?? 1}
                    onChange={(e) => setEditingSkill({ ...editingSkill, order: Number(e.target.value) })}
                    className="w-14 px-2 py-1 bg-[#121212] border border-[#242424] text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#1C1C1C] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingSkill(null)}
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
