import React, { useState } from 'react';
import { Project } from '../../types/portfolio';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Eye, Check, X, Search, ExternalLink } from 'lucide-react';

interface ProjectsManagerProps {
  projects: Project[];
  onRefresh: () => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({ projects, onRefresh, showToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'published' | 'draft' | 'featured'>('all');
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter and sort
  const filtered = projects
    .filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.technologies.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;
      if (filterState === 'published') return p.published;
      if (filterState === 'draft') return !p.published;
      if (filterState === 'featured') return p.featured;
      return true;
    })
    .sort((a, b) => a.order - b.order);

  const handleCreateNew = () => {
    setIsNew(true);
    setEditingProject({
      title: '',
      slug: '',
      category: 'Client Project / Commercial',
      year: String(new Date().getFullYear()),
      role: 'Full Stack Developer',
      description: '',
      technologies: ['React', 'Next.js', 'Node.js', 'MongoDB', 'Tailwind CSS'],
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
      liveUrl: '',
      githubUrl: '',
      challenges: '',
      solution: '',
      features: ['High-performance responsive interface', 'Server-side API integration'],
      featured: false,
      published: true,
      order: projects.length + 1,
    });
  };

  const handleEdit = (proj: Project) => {
    setIsNew(false);
    setEditingProject({ ...proj });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.title || !editingProject?.description) {
      showToast('error', 'Project Title and Description are required.');
      return;
    }

    setSaving(true);
    try {
      const isCreate = isNew || !editingProject.id;
      const url = isCreate ? '/api/admin/projects' : `/api/admin/projects/${editingProject.id}`;
      const method = isCreate ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProject),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', isCreate ? 'Project created successfully!' : 'Project updated successfully!');
        setEditingProject(null);
        onRefresh();
      } else {
        showToast('error', data.error || 'Failed to save project.');
      }
    } catch {
      showToast('error', 'Network error while saving project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', 'Project removed from database.');
        setDeleteConfirmId(null);
        onRefresh();
      } else {
        showToast('error', data.error || 'Failed to delete project.');
      }
    } catch {
      showToast('error', 'Error communicating with server.');
    }
  };

  const handleMoveOrder = async (project: Project, direction: 'up' | 'down') => {
    const sorted = [...projects].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((p) => p.id === project.id);
    if (index < 0) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const targetProj = sorted[targetIndex];
    const newOrder = targetProj.order;
    const currentOrder = project.order;

    await Promise.all([
      fetch(`/api/admin/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...project, order: newOrder }),
      }),
      fetch(`/api/admin/projects/${targetProj.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...targetProj, order: currentOrder }),
      }),
    ]);

    showToast('info', 'Project order updated.');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1C1C1C]">
        <div>
          <h2 className="text-xl font-bold font-display text-white tracking-tight uppercase">
            PROJECTS MANAGER ({projects.length})
          </h2>
          <p className="font-mono text-xs text-[#888888]">
            Manage production shipments, client works, case studies, and drafts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white text-black hover:bg-[#D4D4D4] font-mono text-xs uppercase tracking-wider font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW PROJECT</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, technology, or category..."
            className="w-full pl-9 pr-4 py-2 bg-[#0E0E0E] border border-[#202020] text-white font-mono text-xs focus:outline-none focus:border-white transition-colors"
          />
        </div>

        <div className="flex items-center space-x-1 border border-[#202020] bg-[#0E0E0E] p-1 font-mono text-xs">
          {(['all', 'published', 'draft', 'featured'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterState(tab)}
              className={`px-3 py-1 uppercase tracking-wider transition-colors ${
                filterState === tab ? 'bg-white text-black font-semibold' : 'text-[#888888] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table / Cards List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center border border-[#1A1A1A] bg-[#0A0A0A] font-mono text-xs text-[#666666] space-y-3">
            <p>NO PROJECTS MATCHING ACTIVE FILTER.</p>
            <button
              type="button"
              onClick={handleCreateNew}
              className="px-3 py-1.5 bg-[#161616] border border-[#262626] text-white"
            >
              CREATE FIRST PROJECT
            </button>
          </div>
        ) : (
          filtered.map((project, idx) => (
            <div
              key={project.id}
              className="border border-[#1C1C1C] hover:border-[#2C2C2C] bg-[#0A0A0A] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors"
            >
              <div className="flex items-start sm:items-center space-x-4">
                <div className="w-16 h-12 bg-[#141414] border border-[#242424] overflow-hidden shrink-0 hidden sm:block">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover grayscale"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-[#666666]">#{project.order}</span>
                    <h3 className="font-display text-base font-bold text-white tracking-tight">
                      {project.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1 font-mono text-[11px] text-[#888888]">
                    <span>{project.category}</span>
                    <span>•</span>
                    <span>{project.year}</span>
                    <span>•</span>
                    <span className="text-[#AAAAAA]">{project.role}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.technologies.slice(0, 5).map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 bg-[#121212] border border-[#1E1E1E] text-[10px] font-mono text-[#AAAAAA]"
                      >
                        {t}
                      </span>
                    ))}
                    {project.technologies.length > 5 && (
                      <span className="text-[10px] font-mono text-[#666666] self-center">
                        +{project.technologies.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badges & Controls */}
              <div className="flex items-center space-x-3 self-end md:self-center">
                <div className="flex items-center space-x-2 font-mono text-[10px]">
                  <span
                    className={`px-2 py-0.5 border ${
                      project.published
                        ? 'bg-[#0E1710] border-[#1E3B24] text-[#9DE8AF]'
                        : 'bg-[#1C140E] border-[#3B291E] text-[#E8B89D]'
                    }`}
                  >
                    {project.published ? 'PUBLISHED' : 'DRAFT'}
                  </span>

                  {project.featured && (
                    <span className="px-2 py-0.5 bg-[#141414] border border-[#333333] text-white">
                      FEATURED
                    </span>
                  )}
                </div>

                {/* Ordering */}
                <div className="flex items-center space-x-1 border border-[#222222] bg-[#111111]">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveOrder(project, 'up')}
                    className="p-1.5 text-[#888888] hover:text-white disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === filtered.length - 1}
                    onClick={() => handleMoveOrder(project, 'down')}
                    className="p-1.5 text-[#888888] hover:text-white disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(project)}
                    className="p-2 bg-[#141414] hover:bg-[#1E1E1E] border border-[#242424] text-white transition-colors"
                    title="Edit Project"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(project.id)}
                    className="p-2 bg-[#1A0E0E] hover:bg-[#2A1414] border border-[#3B1E1E] text-[#E89D9D] transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0D0D0D] border border-[#3A1E1E] p-6 shadow-2xl space-y-4">
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              CONFIRM DELETION
            </h3>
            <p className="font-mono text-xs text-[#AAAAAA] leading-relaxed">
              Are you sure you wish to delete this project? This will permanently delete the project from the MongoDB database.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-[#161616] border border-[#2A2A2A] font-mono text-xs text-white"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-[#3B1818] hover:bg-[#4D2020] border border-[#5C2323] font-mono text-xs text-white uppercase font-bold"
              >
                CONFIRM DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Editor Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#0A0A0A] border border-[#2B2B2B] p-6 sm:p-8 max-h-[92vh] overflow-y-auto shadow-2xl my-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
              <div>
                <span className="font-mono text-xs text-[#888888] tracking-widest uppercase">
                  PROJECT SPEC EDITOR
                </span>
                <h3 className="text-xl font-bold font-display text-white mt-1">
                  {isNew ? 'CREATE NEW PROJECT' : `EDIT: ${editingProject.title}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="p-1.5 bg-[#141414] hover:bg-[#202020] border border-[#262626] text-[#AAAAAA] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[#AAAAAA] uppercase tracking-wider mb-1.5">
                    PROJECT TITLE *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProject.title || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white font-mono text-xs focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-[#AAAAAA] uppercase tracking-wider mb-1.5">
                    SLUG
                  </label>
                  <input
                    type="text"
                    value={editingProject.slug || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
                    placeholder="auto-generated-from-title"
                    className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white font-mono text-xs focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[#AAAAAA] uppercase tracking-wider mb-1.5">
                    CATEGORY
                  </label>
                  <input
                    type="text"
                    value={editingProject.category || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                    placeholder="Client Project / Commercial"
                    className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white font-mono text-xs focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-[#AAAAAA] uppercase tracking-wider mb-1.5">
                    YEAR
                  </label>
                  <input
                    type="text"
                    value={editingProject.year || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, year: e.target.value })}
                    placeholder="2024"
                    className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white font-mono text-xs focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-[#AAAAAA] uppercase tracking-wider mb-1.5">
                    ROLE
                  </label>
                  <input
                    type="text"
                    value={editingProject.role || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, role: e.target.value })}
                    placeholder="Full Stack Developer"
                    className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white font-mono text-xs focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-[#AAAAAA] uppercase tracking-wider mb-1.5">
                  DESCRIPTION *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingProject.description || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white font-mono text-xs focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-[#AAAAAA] uppercase tracking-wider mb-1.5">
                  TECHNOLOGIES (COMMA SEPARATED)
                </label>
                <input
                  type="text"
                  value={(editingProject.technologies || []).join(', ')}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      technologies: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white font-mono text-xs focus:border-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[#AAAAAA] uppercase tracking-wider mb-1.5">
                    LIVE URL
                  </label>
                  <input
                    type="url"
                    value={editingProject.liveUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white font-mono text-xs focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-[#AAAAAA] uppercase tracking-wider mb-1.5">
                    GITHUB URL
                  </label>
                  <input
                    type="url"
                    value={editingProject.githubUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white font-mono text-xs focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-[#AAAAAA] uppercase tracking-wider mb-1.5">
                  IMAGE URL
                </label>
                <input
                  type="url"
                  value={editingProject.image || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, image: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white font-mono text-xs focus:border-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[#AAAAAA] uppercase tracking-wider mb-1.5">
                    ENGINEERING CHALLENGE
                  </label>
                  <textarea
                    rows={2}
                    value={editingProject.challenges || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, challenges: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white font-mono text-xs focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-[#AAAAAA] uppercase tracking-wider mb-1.5">
                    ARCHITECTURAL SOLUTION
                  </label>
                  <textarea
                    rows={2}
                    value={editingProject.solution || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, solution: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white font-mono text-xs focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-[#AAAAAA] uppercase tracking-wider mb-1.5">
                  KEY FEATURES (ONE PER LINE)
                </label>
                <textarea
                  rows={3}
                  value={(editingProject.features || []).join('\n')}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      features: e.target.value.split('\n').map((f) => f.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 bg-[#121212] border border-[#242424] text-white font-mono text-xs focus:border-white focus:outline-none"
                />
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-[#1C1C1C] flex flex-wrap items-center gap-6 font-mono text-xs">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProject.published ?? true}
                    onChange={(e) => setEditingProject({ ...editingProject, published: e.target.checked })}
                    className="accent-white w-4 h-4"
                  />
                  <span className="text-white">PUBLISHED (PUBLIC)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProject.featured ?? false}
                    onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                    className="accent-white w-4 h-4"
                  />
                  <span className="text-white">FEATURED HIGHLIGHT</span>
                </label>

                <div className="flex items-center space-x-2">
                  <span className="text-[#AAAAAA]">ORDER:</span>
                  <input
                    type="number"
                    value={editingProject.order ?? 1}
                    onChange={(e) => setEditingProject({ ...editingProject, order: Number(e.target.value) })}
                    className="w-16 px-2 py-1 bg-[#121212] border border-[#242424] text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#1C1C1C] flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] text-[#AAAAAA] hover:text-white font-mono text-xs"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-white hover:bg-[#D4D4D4] disabled:bg-[#555555] text-black font-mono text-xs uppercase font-bold tracking-wider transition-colors"
                >
                  {saving ? 'SAVING...' : 'SAVE PROJECT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
