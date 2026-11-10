import React, { useState } from 'react';
import { AspectRatio, DetectedMoment, VideoResolution } from '../types';
import {
  Sparkles,
  Sliders,
  Maximize2,
  Subtitles,
  Volume2,
  Layers,
  ArrowRight,
  Check,
  Zap,
} from 'lucide-react';

interface ConfigureClipsScreenProps {
  selectedMoments: DetectedMoment[];
  onGenerate: (config: {
    clipCount: number;
    aspectRatio: AspectRatio;
    resolution: VideoResolution;
    editingPreset: any;
    captionPreset: any;
    language: string;
    smartTrimming: boolean;
    activeSpeakerTracking: boolean;
    autoDucking: boolean;
  }) => void;
  onBack: () => void;
}

export const ConfigureClipsScreen: React.FC<ConfigureClipsScreenProps> = ({
  selectedMoments,
  onGenerate,
  onBack,
}) => {
  const [clipCount, setClipCount] = useState<number>(Math.min(selectedMoments.length || 3, 5));
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [resolution, setResolution] = useState<VideoResolution>('1080p');
  const [editingPreset, setEditingPreset] = useState<'viral-comedy' | 'podcast-highlight' | 'fast-meme' | 'clean-pro'>('viral-comedy');
  const [captionPreset, setCaptionPreset] = useState<'bold-yellow' | 'modern-white' | 'karaoke' | 'podcast' | 'meme' | 'gradient'>('bold-yellow');
  const [language, setLanguage] = useState<string>('Automatic');
  const [smartTrimming, setSmartTrimming] = useState(true);
  const [activeSpeakerTracking, setActiveSpeakerTracking] = useState(true);
  const [autoDucking, setAutoDucking] = useState(true);

  const handleStartGeneration = () => {
    onGenerate({
      clipCount,
      aspectRatio,
      resolution,
      editingPreset,
      captionPreset,
      language,
      smartTrimming,
      activeSpeakerTracking,
      autoDucking,
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
          Configure & Generate Short Clips
        </h1>
        <p className="text-sm text-[#A1A1AA] mt-1">
          Apply autonomous editing decisions, aspect ratio framing, and caption styles to your {selectedMoments.length} selected moments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT COLUMN: VISUAL & FRAMING */}
        <div className="space-y-6">
          {/* ASPECT RATIO */}
          <div className="p-5 rounded-2xl bg-[#141824] border border-[#2A3040] space-y-3">
            <label className="text-xs font-bold text-white flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-[#8B5CF6]" />
              <span>Target Aspect Ratio</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: '9:16', label: '9:16', desc: 'Reels / Shorts' },
                { id: '1:1', label: '1:1', desc: 'Square' },
                { id: '4:5', label: '4:5', desc: 'Instagram' },
                { id: '16:9', label: '16:9', desc: 'Landscape' },
              ].map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => setAspectRatio(ratio.id as AspectRatio)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    aspectRatio === ratio.id
                      ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white ring-1 ring-[#8B5CF6]'
                      : 'bg-[#191F2D] border-[#2A3040] text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  <span className="text-sm font-bold block">{ratio.label}</span>
                  <span className="text-[10px] opacity-75">{ratio.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* EDITING PRESETS */}
          <div className="p-5 rounded-2xl bg-[#141824] border border-[#2A3040] space-y-3">
            <label className="text-xs font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#06B6D4]" />
              <span>AI Autonomous Editing Preset</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'viral-comedy', label: 'Viral Comedy', desc: 'Dynamic zooms, meme sound effects & punchline highlights' },
                { id: 'podcast-highlight', label: 'Podcast Highlight', desc: 'Balanced reframing, clear subtitles, warm audio mastering' },
                { id: 'fast-meme', label: 'Fast Meme', desc: 'Rapid punch cut, loud laugh track & sticker overlays' },
                { id: 'clean-pro', label: 'Clean Professional', desc: 'Smooth camera panning, subtle color grading, minimal text' },
              ].map((pst) => (
                <button
                  key={pst.id}
                  onClick={() => setEditingPreset(pst.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    editingPreset === pst.id
                      ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white ring-1 ring-[#8B5CF6]'
                      : 'bg-[#191F2D] border-[#2A3040] text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold text-white block mb-1">{pst.label}</span>
                  <span className="text-[10px] leading-tight text-[#A1A1AA]">{pst.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CLIPS QUANTITY */}
          <div className="p-5 rounded-2xl bg-[#141824] border border-[#2A3040] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">Number of Clips to Generate</label>
              <span className="text-xs font-mono font-bold text-[#8B5CF6]">{clipCount} Reels</span>
            </div>
            <div className="flex items-center gap-2">
              {[3, 5, 10, 15].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setClipCount(cnt)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                    clipCount === cnt
                      ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white'
                      : 'bg-[#191F2D] border-[#2A3040] text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  {cnt} Clips
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CAPTIONS, AUDIO & SMART TOGGLES */}
        <div className="space-y-6">
          {/* CAPTION STYLE PRESETS */}
          <div className="p-5 rounded-2xl bg-[#141824] border border-[#2A3040] space-y-3">
            <label className="text-xs font-bold text-white flex items-center gap-2">
              <Subtitles className="w-4 h-4 text-[#FACC15]" />
              <span>Kinetic Caption Style</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'bold-yellow', label: 'Bold Yellow', preview: 'PUNCHLINE', color: '#FACC15' },
                { id: 'karaoke', label: 'Karaoke Wave', preview: 'WORD BY WORD', color: '#38BDF8' },
                { id: 'modern-white', label: 'Modern White', preview: 'MINIMAL CLEAN', color: '#FFFFFF' },
                { id: 'meme', label: 'Meme Style', preview: 'IMPACT POP', color: '#EC4899' },
                { id: 'gradient', label: 'Neon Gradient', preview: 'ELECTRIC', color: '#A855F7' },
                { id: 'podcast', label: 'Podcast Box', preview: 'SUBTITLE BAR', color: '#22C55E' },
              ].map((cap) => (
                <button
                  key={cap.id}
                  onClick={() => setCaptionPreset(cap.id as any)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    captionPreset === cap.id
                      ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white ring-1 ring-[#8B5CF6]'
                      : 'bg-[#191F2D] border-[#2A3040] text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold block mb-1">{cap.label}</span>
                  <span
                    className="text-[11px] font-black uppercase tracking-wider block"
                    style={{ color: cap.color }}
                  >
                    "{cap.preview}"
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* AUDIO & SPEECH LANGUAGE */}
          <div className="p-5 rounded-2xl bg-[#141824] border border-[#2A3040] space-y-3">
            <label className="text-xs font-bold text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#22C55E]" />
              <span>Language & Speech Translation</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Automatic', 'English', 'Hindi', 'Gujarati', 'Hinglish'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`py-2 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
                    language === lang
                      ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white font-bold'
                      : 'bg-[#191F2D] border-[#2A3040] text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* SMART AUTONOMOUS TOGGLES */}
          <div className="p-5 rounded-2xl bg-[#141824] border border-[#2A3040] space-y-3">
            <span className="text-xs font-bold text-white block">Smart Automation Engine</span>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="text-[#A1A1AA]">Active Speaker Auto-Tracking</span>
                <input
                  type="checkbox"
                  checked={activeSpeakerTracking}
                  onChange={(e) => setActiveSpeakerTracking(e.target.checked)}
                  className="accent-[#8B5CF6] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="text-[#A1A1AA]">Smart Silence Trimming (Removes Pauses)</span>
                <input
                  type="checkbox"
                  checked={smartTrimming}
                  onChange={(e) => setSmartTrimming(e.target.checked)}
                  className="accent-[#8B5CF6] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="text-[#A1A1AA]">Intelligent Music Ducking Behind Dialogue</span>
                <input
                  type="checkbox"
                  checked={autoDucking}
                  onChange={(e) => setAutoDucking(e.target.checked)}
                  className="accent-[#8B5CF6] w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-between pt-4 border-t border-[#2A3040]">
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs text-[#A1A1AA] hover:text-white transition-colors"
        >
          Back to Moments
        </button>

        <button
          onClick={handleStartGeneration}
          className="flex items-center gap-2 px-8 py-3 text-xs font-bold text-white bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] rounded-xl shadow-xl shadow-[#8B5CF6]/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          <span>Generate {clipCount} Short Videos</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
