import React, { useState } from 'react';
import { Project, ScreenType } from '../types';
import {
  FileVideo,
  Search,
  Plus,
  Clock,
  Scissors,
  Download,
  Copy,
  Trash2,
  ExternalLink,
  Film,
  Sparkles,
} from 'lucide-react';
import { formatTimecode } from '../utils/videoEngine';

interface MyProjectsScreenProps {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onDuplicateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const MyProjectsScreen: React.FC<MyProjectsScreenProps> = ({
  projects,
  onOpenProject,
  onDuplicateProject,
  onDeleteProject,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'clips' | 'duration'>('date');

  const filtered = projects
    .filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.sourceVideo.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'clips') return (b.generatedClips?.length || 0) - (a.generatedClips?.length || 0);
      if (sortBy === 'duration') return b.sourceVideo.duration - a.sourceVideo.duration;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            My Video Projects
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Access your full repository of source footage, analyzed moments, and generated reel batches.
          </p>
        </div>

        <button
          onClick={() => onNavigate('import')}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] rounded-xl shadow-lg shadow-[#8B5CF6]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* SEARCH & SORT TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#141824] p-3 rounded-2xl border border-[#2A3040]">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#191F2D] border border-[#2A3040] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#A1A1AA]/60 focus:outline-none focus:border-[#8B5CF6]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-end">
          <span className="text-[#A1A1AA]">Sort by:</span>
          {(['date', 'clips', 'duration'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                sortBy === s
                  ? 'bg-[#8B5CF6] text-white font-medium'
                  : 'bg-[#191F2D] text-[#A1A1AA] hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* PROJECTS LIST */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-[#141824] border border-[#2A3040] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#191F2D] text-[#A1A1AA] flex items-center justify-center mx-auto">
            <FileVideo className="w-6 h-6 text-[#8B5CF6]" />
          </div>
          <h2 className="text-base font-bold text-white">No projects found</h2>
          <p className="text-xs text-[#A1A1AA]">
            {search ? 'Try clearing your search query.' : 'Create your first project to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((proj) => (
            <div
              key={proj.id}
              className="group rounded-2xl bg-[#141824] border border-[#2A3040] hover:border-[#8B5CF6]/50 transition-all overflow-hidden flex flex-col justify-between hover:shadow-xl hover:shadow-[#8B5CF6]/5"
            >
              {/* Media Thumbnail */}
              <div
                onClick={() => onOpenProject(proj)}
                className="relative aspect-[16/9] bg-[#0B0D12] overflow-hidden cursor-pointer"
              >
                <img
                  src={proj.sourceVideo.thumbnail}
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#A1A1AA]" />
                  <span>{formatTimecode(proj.sourceVideo.duration)}</span>
                </div>

                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-[#191F2D]/90 border border-[#2A3040] text-[10px] font-medium text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  <span className="capitalize">{proj.status}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                <div onClick={() => onOpenProject(proj)} className="cursor-pointer">
                  <h3 className="text-sm font-bold text-white group-hover:text-[#8B5CF6] transition-colors line-clamp-1">
                    {proj.title}
                  </h3>
                  <p className="text-[11px] text-[#A1A1AA] line-clamp-1 mt-0.5">
                    {proj.sourceVideo.name}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-[#A1A1AA] pt-1">
                  <span className="flex items-center gap-1">
                    <Scissors className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    <span>{proj.generatedClips?.length || 0} Reels</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>{proj.totalExports || 0} Exports</span>
                  </span>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-[#2A3040]/50 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onOpenProject(proj)}
                    className="flex items-center gap-1.5 text-white hover:text-[#8B5CF6] font-semibold transition-colors cursor-pointer"
                  >
                    <span>Open Project</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1 text-[#A1A1AA]">
                    <button
                      onClick={() => onDuplicateProject(proj)}
                      className="p-1.5 hover:text-white hover:bg-[#191F2D] rounded-lg transition-colors cursor-pointer"
                      title="Duplicate Project"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProject(proj.id)}
                      className="p-1.5 hover:text-red-400 hover:bg-[#191F2D] rounded-lg transition-colors cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
