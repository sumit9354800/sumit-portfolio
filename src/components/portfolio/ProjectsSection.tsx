import React, { useState } from 'react';
import { ExternalLink, Github, ArrowUpRight, X, Terminal, CheckCircle } from 'lucide-react';
import { Project } from '../../types/portfolio';

interface ProjectsSectionProps {
  projects: Project[];
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filter only published projects and sort by display order
  const publishedProjects = projects
    .filter((p) => p.published)
    .sort((a, b) => a.order - b.order);

  return (
    <section id="projects" className="py-24 border-b border-[#1A1A1A] relative bg-[#070707]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center space-x-3 mb-3">
          <span className="font-mono text-xs text-[#888888] tracking-widest uppercase">03 / PROJECTS</span>
          <div className="h-px bg-[#222222] flex-1 max-w-[100px]"></div>
        </div>

        <div className="mb-14">
          <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white uppercase leading-tight">
            SELECTED WORK &amp; PRODUCTION BUILDS.
          </h2>
          <p className="text-sm sm:text-base text-[#888888] mt-2 max-w-2xl font-sans">
            Commercial client applications, full-stack systems, and engineering projects built for performance and scale.
          </p>
        </div>

        {/* 3 Columns per Row Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {publishedProjects.map((project) => (
            <article
              key={project.id}
              className="group border border-[#202020] hover:border-[#383838] bg-[#0C0C0C] flex flex-col justify-between transition-all duration-300 overflow-hidden"
            >
              <div>
                {/* Project Image: Original vivid color preserved, zero grayscale, zero black darkening */}
                <div className="relative w-full h-52 sm:h-56 overflow-hidden bg-[#141414] border-b border-[#1C1C1C]">
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  {project.featured && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/80 border border-[#333333] font-mono text-[10px] text-white font-semibold tracking-wider">
                      FEATURED
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/75 backdrop-blur-sm border border-[#282828] font-mono text-[10px] text-[#D4D4D4]">
                    {project.category}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-[#AAAAAA]">
                    <span>{project.role}</span>
                  </div>

                  <h3 className="text-xl font-bold font-display text-white tracking-tight group-hover:text-white transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-sm text-[#999999] leading-relaxed line-clamp-3">
                    {project.description}
                  </p>

                  {/* Tech Stack Chips */}
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 5).map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 bg-[#141414] border border-[#242424] font-mono text-[11px] text-[#CCCCCC]"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 5 && (
                      <span className="px-1.5 py-0.5 font-mono text-[10px] text-[#777777]">
                        +{project.technologies.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 sm:p-6 pt-0 border-t border-[#161616] mt-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  className="inline-flex items-center space-x-1.5 text-xs font-mono text-white hover:text-[#D4D4D4] py-2 transition-colors font-medium"
                >
                  <span>DETAILS</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center space-x-2">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] hover:border-[#444444] text-white transition-colors"
                      title="Open Live Website"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] hover:border-[#444444] text-white transition-colors"
                      title="View GitHub Repository"
                    >
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-2xl bg-[#0D0D0D] border border-[#303030] max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#222222] pb-4">
              <div>
                <span className="font-mono text-xs text-[#888888] tracking-widest uppercase">
                  {selectedProject.category}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
                  {selectedProject.title}
                </h3>
                <div className="font-mono text-xs text-[#AAAAAA] mt-1">
                  ROLE: {selectedProject.role}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="p-2 bg-[#141414] hover:bg-[#222222] border border-[#262626] text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="w-full h-64 overflow-hidden border border-[#222222]">
              <img
                src={selectedProject.image}
                alt={selectedProject.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Modal Body */}
            <div className="space-y-6">
              <div>
                <h4 className="font-mono text-xs text-[#888888] uppercase tracking-wider mb-1.5">
                  OVERVIEW
                </h4>
                <p className="text-sm text-[#CCCCCC] leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              {/* Challenges and Solutions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#121212] border border-[#222222] space-y-2">
                  <div className="flex items-center space-x-2 text-white font-mono text-xs font-semibold">
                    <Terminal className="w-3.5 h-3.5 text-[#888888]" />
                    <span>CHALLENGE</span>
                  </div>
                  <p className="text-xs text-[#A8A8A8] leading-relaxed">
                    {selectedProject.challenges || 'Ensuring high availability, mobile speed, and performant state synchronization.'}
                  </p>
                </div>

                <div className="p-4 bg-[#121212] border border-[#222222] space-y-2">
                  <div className="flex items-center space-x-2 text-white font-mono text-xs font-semibold">
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                    <span>SOLUTION</span>
                  </div>
                  <p className="text-xs text-[#A8A8A8] leading-relaxed">
                    {selectedProject.solution || 'Modular component architecture, responsive layouts, and optimized data fetching.'}
                  </p>
                </div>
              </div>

              {/* Key Features */}
              {selectedProject.features && selectedProject.features.length > 0 && (
                <div>
                  <h4 className="font-mono text-xs text-[#888888] uppercase tracking-wider mb-2">
                    KEY CAPABILITIES
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedProject.features.map((feat, fIdx) => (
                      <div
                        key={fIdx}
                        className="px-3 py-2 bg-[#121212] border border-[#1E1E1E] text-xs font-mono text-[#D4D4D4] flex items-center space-x-2"
                      >
                        <span className="w-1.5 h-1.5 bg-white shrink-0"></span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies Applied */}
              <div>
                <h4 className="font-mono text-xs text-[#888888] uppercase tracking-wider mb-2">
                  TECHNOLOGY STACK
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.technologies.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-1 bg-[#141414] border border-[#282828] font-mono text-xs text-[#CCCCCC]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-[#222222] flex flex-wrap items-center justify-between gap-3">
              <div className="flex space-x-3">
                {selectedProject.liveUrl && (
                  <a
                    href={selectedProject.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white text-black font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#D4D4D4] transition-colors flex items-center space-x-1.5"
                  >
                    <span>OPEN LIVE SITE</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {selectedProject.githubUrl && (
                  <a
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#161616] hover:bg-[#202020] border border-[#2E2E2E] text-white font-mono text-xs uppercase tracking-wider transition-colors flex items-center space-x-1.5"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GITHUB REPO</span>
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 bg-[#121212] hover:bg-[#1C1C1C] border border-[#242424] text-[#AAAAAA] font-mono text-xs transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
