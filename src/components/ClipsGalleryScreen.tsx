import React, { useState } from 'react';
import { GeneratedClip, ScreenType } from '../types';
import {
  Scissors,
  Download,
  Trash2,
  Copy,
  Play,
  CheckSquare,
  Square,
  Archive,
  Edit3,
  Sparkles,
  Maximize2,
  Clock,
  Smile,
  Subtitles,
  ExternalLink,
} from 'lucide-react';
import { formatTimecode } from '../utils/videoEngine';
import { exportClipsToZip } from '../utils/videoRenderer';

interface ClipsGalleryScreenProps {
  clips: GeneratedClip[];
  onOpenEditor: (clip: GeneratedClip) => void;
  onDownloadClip: (clip: GeneratedClip) => void;
  onDuplicateClip: (clip: GeneratedClip) => void;
  onDeleteClip: (clipId: string) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const ClipsGalleryScreen: React.FC<ClipsGalleryScreenProps> = ({
  clips,
  onOpenEditor,
  onDownloadClip,
  onDuplicateClip,
  onDeleteClip,
  onNavigate,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [previewClip, setPreviewClip] = useState<GeneratedClip | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipStatus, setZipStatus] = useState<string>('');

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === clips.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(clips.map((c) => c.id));
    }
  };

  const handleBatchZip = async () => {
    const targetClips =
      selectedIds.length > 0 ? clips.filter((c) => selectedIds.includes(c.id)) : clips;

    if (targetClips.length === 0) return;

    try {
      setIsZipping(true);
      setZipStatus('Preparing files...');
      const zipBlob = await exportClipsToZip(targetClips, (pct, status) => {
        setZipStatus(`${status} (${pct}%)`);
      });

      const zipUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `funnycut_reels_batch_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(zipUrl);
    } catch (err) {
      console.error('Batch ZIP failed', err);
    } finally {
      setIsZipping(false);
      setZipStatus('');
    }
  };

  const filteredClips = clips.filter(
    (c) => filterCategory === 'all' || c.category === filterCategory
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER & BATCH ACTION BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            Generated Clips Gallery
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1">
            {clips.length} autonomous viral reels ready for publishing or multitrack timeline customization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#141824] hover:bg-[#191F2D] border border-[#2A3040] rounded-xl transition-colors cursor-pointer"
          >
            {selectedIds.length === clips.length ? (
              <CheckSquare className="w-4 h-4 text-[#8B5CF6]" />
            ) : (
              <Square className="w-4 h-4 text-[#A1A1AA]" />
            )}
            <span>Select All</span>
          </button>

          <button
            disabled={isZipping || clips.length === 0}
            onClick={handleBatchZip}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] rounded-xl shadow-lg shadow-[#8B5CF6]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Archive className="w-4 h-4" />
            <span>
              {isZipping
                ? zipStatus || 'Zipping...'
                : selectedIds.length > 0
                ? `Export Selected (${selectedIds.length}) ZIP`
                : 'Batch Download All (ZIP)'}
            </span>
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['all', 'Funny Dialogue', 'Unexpected Reaction', 'Punchline', 'Meme Moment'].map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl capitalize transition-colors whitespace-nowrap cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[#8B5CF6] text-white font-bold'
                  : 'bg-[#141824] text-[#A1A1AA] hover:text-white border border-[#2A3040]'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          )
        )}
      </div>

      {/* CLIPS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredClips.map((clip) => {
          const isSelected = selectedIds.includes(clip.id);

          return (
            <div
              key={clip.id}
              className={`group rounded-2xl bg-[#141824] border transition-all overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-[#8B5CF6] ring-2 ring-[#8B5CF6]/40 shadow-xl shadow-[#8B5CF6]/10'
                  : 'border-[#2A3040] hover:border-[#8B5CF6]/50'
              }`}
            >
              {/* Vertical Card Preview Frame */}
              <div className="relative aspect-[9/16] bg-[#0B0D12] overflow-hidden flex items-center justify-center">
                <img
                  src={clip.thumbnail}
                  alt={clip.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Kinetic Subtitles Mock Preview */}
                <div className="absolute bottom-16 inset-x-3 text-center z-10">
                  <div className="inline-block bg-black/80 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-sm">
                    <span
                      className="text-[11px] font-black tracking-wider uppercase"
                      style={{ color: clip.captionStyle.highlightColor || '#FACC15' }}
                    >
                      {clip.title.substring(0, 24)}...
                    </span>
                  </div>
                </div>

                {/* Top badges: Score & Aspect Ratio */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                  <div className="px-2 py-0.5 rounded-md bg-[#8B5CF6] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Smile className="w-3 h-3 text-[#FACC15]" />
                    <span>{clip.funnyScore}/100</span>
                  </div>

                  <div className="px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-mono border border-white/10">
                    {clip.aspectRatio}
                  </div>
                </div>

                {/* Duration Tag */}
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white z-10 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#A1A1AA]" />
                  <span>{clip.duration}s</span>
                </div>

                {/* Select Checkbox (top right) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(clip.id);
                  }}
                  className="absolute top-3 right-3 z-20 cursor-pointer"
                  aria-label="Select clip"
                >
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-[#8B5CF6] bg-black/60 rounded" />
                  ) : (
                    <Square className="w-5 h-5 text-white/70 hover:text-white bg-black/40 rounded" />
                  )}
                </button>

                {/* Center Hover Action */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 z-20">
                  <button
                    onClick={() => onOpenEditor(clip)}
                    className="p-3 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-xl hover:scale-110 transition-transform cursor-pointer"
                    title="Open in Timeline Editor"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => onDownloadClip(clip)}
                    className="p-3 rounded-full bg-[#191F2D] hover:bg-[#2A3040] text-white border border-[#2A3040] shadow-xl hover:scale-110 transition-transform cursor-pointer"
                    title="Render & Download MP4"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Card Meta & Bottom Controls */}
              <div className="p-3.5 space-y-2 bg-[#141824]">
                <div>
                  <h3 className="text-xs font-bold text-white line-clamp-1">{clip.title}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#A1A1AA] mt-1 font-mono">
                    <span>{clip.resolution}</span>
                    <span>·</span>
                    <span className="capitalize">{clip.editingPreset.replace('-', ' ')}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-[#2A3040]/50 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onOpenEditor(clip)}
                    className="flex items-center gap-1 text-[#8B5CF6] hover:text-[#A855F7] font-semibold transition-colors cursor-pointer"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Edit Clip</span>
                  </button>

                  <div className="flex items-center gap-1 text-[#A1A1AA]">
                    <button
                      onClick={() => onDuplicateClip(clip)}
                      className="p-1.5 hover:text-white hover:bg-[#191F2D] rounded-lg transition-colors cursor-pointer"
                      title="Duplicate Clip"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteClip(clip.id)}
                      className="p-1.5 hover:text-red-400 hover:bg-[#191F2D] rounded-lg transition-colors cursor-pointer"
                      title="Delete Clip"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
