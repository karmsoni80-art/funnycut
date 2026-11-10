import React, { useState } from 'react';
import { Project, ScreenType } from '../types';
import {
  FileVideo,
  Video,
  Scissors,
  Download,
  Plus,
  Upload,
  Link,
  Search,
  Clock,
  Play,
  Film,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { formatTimecode } from '../utils/videoEngine';

interface DashboardProps {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  onOpenProject,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ready' | 'completed' | 'analyzing'>('all');

  // Real statistics aggregated from actual projects
  const totalProjects = projects.length;
  const totalSourceVideos = projects.map((p) => p.sourceVideo.id).filter((v, i, a) => a.indexOf(v) === i).length;
  const totalGeneratedClips = projects.reduce((acc, p) => acc + (p.generatedClips?.length || 0), 0);
  const totalExports = projects.reduce((acc, p) => acc + (p.totalExports || 0), 0);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sourceVideo.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* HEADER & QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            Workspace Dashboard
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Manage your long-form source videos, AI analysis jobs, and viral short reels.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('import')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] rounded-xl shadow-lg shadow-[#8B5CF6]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      </div>

      {/* METRIC KPI CARDS (Real data) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#141824] border border-[#2A3040]">
          <div className="flex items-center justify-between text-[#A1A1AA] mb-3">
            <span className="text-xs font-medium">Total Projects</span>
            <FileVideo className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tabular-nums">
            {totalProjects}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141824] border border-[#2A3040]">
          <div className="flex items-center justify-between text-[#A1A1AA] mb-3">
            <span className="text-xs font-medium">Source Videos</span>
            <Video className="w-4 h-4 text-[#06B6D4]" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tabular-nums">
            {totalSourceVideos}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141824] border border-[#2A3040]">
          <div className="flex items-center justify-between text-[#A1A1AA] mb-3">
            <span className="text-xs font-medium">Viral Reels Generated</span>
            <Scissors className="w-4 h-4 text-[#A855F7]" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tabular-nums">
            {totalGeneratedClips}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141824] border border-[#2A3040]">
          <div className="flex items-center justify-between text-[#A1A1AA] mb-3">
            <span className="text-xs font-medium">Total Video Exports</span>
            <Download className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tabular-nums">
            {totalExports}
          </div>
        </div>
      </div>

      {/* QUICK WORKSPACE ENTRYPOINTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('import')}
          className="p-5 rounded-2xl bg-[#191F2D] hover:bg-[#1f2638] border border-[#2A3040] hover:border-[#8B5CF6]/50 transition-all text-left group flex items-start gap-4 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white group-hover:text-[#8B5CF6] transition-colors">
              Upload Video File
            </h2>
            <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
              Drop MP4, MOV, or WebM video up to 500MB for autonomous AI moment detection.
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('import')}
          className="p-5 rounded-2xl bg-[#191F2D] hover:bg-[#1f2638] border border-[#2A3040] hover:border-[#06B6D4]/50 transition-all text-left group flex items-start gap-4 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/20 text-[#06B6D4] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Link className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white group-hover:text-[#06B6D4] transition-colors">
              Paste Video Link
            </h2>
            <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
              Import YouTube, Vimeo, or direct video streams with verified access permissions.
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('projects')}
          className="p-5 rounded-2xl bg-[#191F2D] hover:bg-[#1f2638] border border-[#2A3040] hover:border-[#A855F7]/50 transition-all text-left group flex items-start gap-4 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#A855F7]/20 text-[#A855F7] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <FileVideo className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white group-hover:text-[#A855F7] transition-colors">
              Open My Projects
            </h2>
            <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
              Browse previously edited timelines, duplicate projects, or trigger batch exports.
            </p>
          </div>
        </button>
      </div>

      {/* RECENT PROJECTS & FILTER BAR */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-[#8B5CF6]" />
            <h2 className="text-lg font-bold text-white">Recent Projects</h2>
            <span className="text-xs text-[#A1A1AA] font-mono">({filteredProjects.length})</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A1A1AA]" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#141824] border border-[#2A3040] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#A1A1AA]/60 focus:outline-none focus:border-[#8B5CF6] transition-colors w-44"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-1 bg-[#141824] border border-[#2A3040] rounded-xl text-xs">
              {(['all', 'ready', 'completed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    filterStatus === st
                      ? 'bg-[#8B5CF6] text-white font-medium shadow-sm'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PROJECTS GRID */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#141824] border border-[#2A3040] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#191F2D] text-[#A1A1AA] flex items-center justify-center mx-auto">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No projects found</h3>
            <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
              {searchQuery
                ? `No projects matching "${searchQuery}". Try clearing search.`
                : 'Get started by creating your first project from a video file or link.'}
            </p>
            <button
              onClick={() => onNavigate('import')}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => onOpenProject(project)}
                className="group rounded-2xl bg-[#141824] border border-[#2A3040] hover:border-[#8B5CF6]/60 transition-all overflow-hidden flex flex-col cursor-pointer hover:shadow-xl hover:shadow-[#8B5CF6]/5"
              >
                {/* Thumbnail Preview */}
                <div className="relative aspect-[16/9] bg-[#0B0D12] overflow-hidden">
                  <img
                    src={project.sourceVideo.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Duration Tag */}
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/80 text-[11px] font-mono text-white flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#A1A1AA]" />
                    <span>{formatTimecode(project.sourceVideo.duration)}</span>
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-md bg-[#191F2D]/90 backdrop-blur-sm border border-[#2A3040] text-[11px] font-medium text-white flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        project.status === 'completed'
                          ? 'bg-[#22C55E]'
                          : project.status === 'ready'
                          ? 'bg-[#8B5CF6]'
                          : 'bg-[#F59E0B]'
                      }`}
                    />
                    <span className="capitalize">{project.status}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#8B5CF6] transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-xs text-[#A1A1AA] mt-1 line-clamp-1">
                      Source: {project.sourceVideo.name}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-[#2A3040]/60 flex items-center justify-between text-xs text-[#A1A1AA]">
                    <div className="flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      <span>{project.generatedClips?.length || 0} Clips</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-medium text-white group-hover:text-[#8B5CF6]">
                      <span>Open Workspace</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
