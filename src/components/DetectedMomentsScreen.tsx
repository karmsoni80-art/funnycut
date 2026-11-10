import React, { useState } from 'react';
import { DetectedMoment, ScreenType, SourceVideo } from '../types';
import {
  Sparkles,
  CheckSquare,
  Square,
  Clock,
  Play,
  Pause,
  Sliders,
  Smile,
  ArrowRight,
  Info,
  ChevronRight,
  Edit2,
  Check,
} from 'lucide-react';
import { formatTimecode, clampClipTime } from '../utils/videoEngine';

interface DetectedMomentsScreenProps {
  moments: DetectedMoment[];
  sourceVideo: SourceVideo;
  onUpdateMoments: (moments: DetectedMoment[]) => void;
  onProceedToConfigure: () => void;
  onBack: () => void;
}

export const DetectedMomentsScreen: React.FC<DetectedMomentsScreenProps> = ({
  moments,
  sourceVideo,
  onUpdateMoments,
  onProceedToConfigure,
  onBack,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    moments.filter((m) => m.selected).map((m) => m.id)
  );
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [editingTranscriptId, setEditingTranscriptId] = useState<string | null>(null);
  const [transcriptDraft, setTranscriptDraft] = useState('');

  const toggleSelect = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((item) => item !== id)
      : [...selectedIds, id];
    setSelectedIds(next);

    onUpdateMoments(
      moments.map((m) => ({
        ...m,
        selected: next.includes(m.id),
      }))
    );
  };

  const handleSelectAll = (select: boolean) => {
    const next = select ? moments.map((m) => m.id) : [];
    setSelectedIds(next);
    onUpdateMoments(
      moments.map((m) => ({
        ...m,
        selected: select,
      }))
    );
  };

  const adjustTiming = (id: string, deltaStart: number, deltaEnd: number) => {
    onUpdateMoments(
      moments.map((m) => {
        if (m.id !== id) return m;
        const clamped = clampClipTime(
          m.startTime + deltaStart,
          m.endTime + deltaEnd,
          sourceVideo.duration,
          5,
          60
        );
        return {
          ...m,
          startTime: clamped.start,
          endTime: clamped.end,
          duration: clamped.duration,
        };
      })
    );
  };

  const startEditTranscript = (moment: DetectedMoment) => {
    setEditingTranscriptId(moment.id);
    setTranscriptDraft(moment.transcript);
  };

  const saveEditTranscript = (id: string) => {
    onUpdateMoments(
      moments.map((m) =>
        m.id === id ? { ...m, transcript: transcriptDraft.trim() || m.transcript } : m
      )
    );
    setEditingTranscriptId(null);
  };

  const selectedCount = selectedIds.length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* HEADER & ACTIONS BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            Detected Funny Moments
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1">
            AI analyzed {sourceVideo.name} and found {moments.length} viral comedy sequences. Select your preferred clips.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleSelectAll(selectedCount < moments.length)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#141824] hover:bg-[#191F2D] border border-[#2A3040] rounded-xl transition-colors cursor-pointer"
          >
            {selectedCount === moments.length ? 'Deselect All' : 'Select All'}
          </button>

          <button
            disabled={selectedCount === 0}
            onClick={onProceedToConfigure}
            className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all shadow-lg ${
              selectedCount > 0
                ? 'bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white shadow-[#8B5CF6]/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                : 'bg-[#191F2D] text-[#A1A1AA] cursor-not-allowed opacity-50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Configure ({selectedCount}) Clips</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MOMENTS LIST */}
      <div className="space-y-4">
        {moments.map((moment) => {
          const isSelected = selectedIds.includes(moment.id);
          const isEditing = editingTranscriptId === moment.id;

          return (
            <div
              key={moment.id}
              className={`p-5 rounded-2xl bg-[#141824] border transition-all ${
                isSelected
                  ? 'border-[#8B5CF6] ring-1 ring-[#8B5CF6]/30 shadow-lg shadow-[#8B5CF6]/5'
                  : 'border-[#2A3040] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex flex-col lg:flex-row gap-5 items-start">
                {/* Checkbox & Thumbnail */}
                <div className="flex items-start gap-3 w-full lg:w-auto">
                  <button
                    onClick={() => toggleSelect(moment.id)}
                    className="mt-1 text-[#8B5CF6] hover:text-white transition-colors cursor-pointer"
                    aria-label={`Select ${moment.title}`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-[#8B5CF6]" />
                    ) : (
                      <Square className="w-5 h-5 text-[#A1A1AA]" />
                    )}
                  </button>

                  <div className="relative w-36 h-24 rounded-xl overflow-hidden bg-black shrink-0 border border-[#2A3040]">
                    <img
                      src={moment.thumbnail || sourceVideo.thumbnail}
                      alt={moment.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setPreviewingId(previewingId === moment.id ? null : moment.id)}
                        className="w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shadow-lg"
                      >
                        {previewingId === moment.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>
                    </div>

                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                      {moment.duration}s
                    </div>
                  </div>
                </div>

                {/* Content Details */}
                <div className="flex-1 space-y-2.5 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-['Plus_Jakarta_Sans']">
                        {moment.title}
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#191F2D] text-[#8B5CF6] border border-[#2A3040] font-medium">
                        {moment.category}
                      </span>
                    </div>

                    {/* Viral Score Badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-[#8B5CF6]/20 to-[#06B6D4]/20 border border-[#8B5CF6]/40 text-xs font-mono font-bold text-white">
                      <Smile className="w-3.5 h-3.5 text-[#FACC15]" />
                      <span>{moment.aiScore}/100 VIRAL SCORE</span>
                    </div>
                  </div>

                  {/* Why AI Chose This */}
                  <div className="p-3 rounded-xl bg-[#191F2D] border border-[#2A3040]/70 flex items-start gap-2 text-xs text-[#A1A1AA]">
                    <Info className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white mr-1.5">Why AI chose this:</span>
                      <span>{moment.reason}</span>
                    </div>
                  </div>

                  {/* Transcript */}
                  <div className="text-xs text-white leading-relaxed bg-[#0B0D12] p-3 rounded-xl border border-[#2A3040]">
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={transcriptDraft}
                          onChange={(e) => setTranscriptDraft(e.target.value)}
                          className="w-full bg-[#141824] border border-[#8B5CF6] rounded-lg p-2 text-xs text-white focus:outline-none"
                          rows={2}
                        />
                        <button
                          onClick={() => saveEditTranscript(moment.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#8B5CF6] text-white text-[11px] font-bold rounded-md"
                        >
                          <Check className="w-3 h-3" /> Save Transcript
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <p className="italic text-[#E2E8F0]">"{moment.transcript}"</p>
                        <button
                          onClick={() => startEditTranscript(moment)}
                          className="text-[#A1A1AA] hover:text-[#8B5CF6] transition-colors shrink-0"
                          title="Edit transcript"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Time Trim Handles */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs font-mono text-[#A1A1AA]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      <span>
                        {formatTimecode(moment.startTime)} - {formatTimecode(moment.endTime)}
                      </span>
                      <span>({moment.duration}s)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#A1A1AA] uppercase mr-1">Trim Start:</span>
                      <button
                        onClick={() => adjustTiming(moment.id, -1, 0)}
                        className="px-2 py-0.5 bg-[#191F2D] hover:bg-[#2A3040] rounded text-[11px] border border-[#2A3040]"
                      >
                        -1s
                      </button>
                      <button
                        onClick={() => adjustTiming(moment.id, 1, 0)}
                        className="px-2 py-0.5 bg-[#191F2D] hover:bg-[#2A3040] rounded text-[11px] border border-[#2A3040]"
                      >
                        +1s
                      </button>

                      <span className="text-[10px] text-[#A1A1AA] uppercase mx-1">End:</span>
                      <button
                        onClick={() => adjustTiming(moment.id, 0, -1)}
                        className="px-2 py-0.5 bg-[#191F2D] hover:bg-[#2A3040] rounded text-[11px] border border-[#2A3040]"
                      >
                        -1s
                      </button>
                      <button
                        onClick={() => adjustTiming(moment.id, 0, 1)}
                        className="px-2 py-0.5 bg-[#191F2D] hover:bg-[#2A3040] rounded text-[11px] border border-[#2A3040]"
                      >
                        +1s
                      </button>
                    </div>
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
