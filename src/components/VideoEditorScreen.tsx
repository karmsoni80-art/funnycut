import React, { useState, useRef, useEffect } from 'react';
import { GeneratedClip, AspectRatio, ScreenType, TimelineTrack, TimelineElement } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Scissors,
  Copy,
  Trash2,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Volume2,
  VolumeX,
  Subtitles,
  Smile,
  Music,
  Sliders,
  Sparkles,
  Layers,
  ArrowLeft,
  Download,
  Eye,
  Lock,
  Unlock,
  SplitSquareVertical,
  Check,
  Shield,
  Type,
  Flame,
} from 'lucide-react';
import { formatTimecode, calculateFramingTransform } from '../utils/videoEngine';
import { soundEngine } from '../utils/audioSynthesis';

interface VideoEditorScreenProps {
  clip: GeneratedClip;
  sourceVideoUrl: string;
  onSaveClip: (updatedClip: GeneratedClip) => void;
  onExportClip: (clip: GeneratedClip) => void;
  onBack: () => void;
}

export const VideoEditorScreen: React.FC<VideoEditorScreenProps> = ({
  clip: initialClip,
  sourceVideoUrl,
  onSaveClip,
  onExportClip,
  onBack,
}) => {
  const [clip, setClip] = useState<GeneratedClip>(initialClip);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // relative to clip (0 to clip.duration)
  const [activeTab, setActiveTab] = useState<
    'captions' | 'audio' | 'effects' | 'stickers' | 'color' | 'media' | 'text'
  >('captions');
  const [showSafeAreas, setShowSafeAreas] = useState(false);
  const [showOriginalComparison, setShowOriginalComparison] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1); // timeline zoom
  const [history, setHistory] = useState<GeneratedClip[]>([initialClip]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Sync video time with clip relative time
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = clip.startTime + currentTime;
    }
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const relTime = videoRef.current.currentTime - clip.startTime;
      if (relTime >= clip.duration) {
        videoRef.current.pause();
        setIsPlaying(false);
        setCurrentTime(0);
        videoRef.current.currentTime = clip.startTime;
      } else if (relTime < 0) {
        videoRef.current.currentTime = clip.startTime;
        setCurrentTime(0);
      } else {
        setCurrentTime(relTime);
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const stepTime = (delta: number) => {
    if (!videoRef.current) return;
    const nextTime = Math.max(0, Math.min(clip.duration, currentTime + delta));
    videoRef.current.currentTime = clip.startTime + nextTime;
    setCurrentTime(nextTime);
  };

  const seekRelative = (time: number) => {
    if (!videoRef.current) return;
    const clamped = Math.max(0, Math.min(clip.duration, time));
    videoRef.current.currentTime = clip.startTime + clamped;
    setCurrentTime(clamped);
  };

  // Push updates to history for Undo/Redo
  const updateClipState = (updater: (prev: GeneratedClip) => GeneratedClip) => {
    setClip((prev) => {
      const next = updater(prev);
      const newHistory = [...history.slice(0, historyIndex + 1), next];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      onSaveClip(next);
      return next;
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setClip(prev);
      onSaveClip(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setClip(next);
      onSaveClip(next);
    }
  };

  // Timeline Split at playhead
  const handleSplitAtPlayhead = () => {
    updateClipState((prev) => {
      const tracks = prev.timelineTracks.map((tr) => {
        if (tr.type !== 'video') return tr;
        const newElements: TimelineElement[] = [];
        tr.elements.forEach((el) => {
          if (currentTime > el.startTime && currentTime < el.startTime + el.duration) {
            const firstDuration = currentTime - el.startTime;
            const secondDuration = el.duration - firstDuration;
            newElements.push({ ...el, duration: firstDuration });
            newElements.push({
              ...el,
              id: `el-split-${Date.now()}`,
              startTime: currentTime,
              duration: secondDuration,
            });
          } else {
            newElements.push(el);
          }
        });
        return { ...tr, elements: newElements };
      });
      return { ...prev, timelineTracks: tracks };
    });
  };

  // Add sound effect element
  const handleAddSfx = (sfxName: string) => {
    soundEngine.playSfx(sfxName);
    updateClipState((prev) => {
      const tracks = prev.timelineTracks.map((tr) => {
        if (tr.type !== 'sfx') return tr;
        const newEl: TimelineElement = {
          id: `sfx-${Date.now()}`,
          trackId: tr.id,
          type: 'sfx',
          name: sfxName,
          startTime: currentTime,
          duration: 1.5,
          properties: { volume: 0.8 },
        };
        return { ...tr, elements: [...tr.elements, newEl] };
      });
      return { ...prev, timelineTracks: tracks };
    });
  };

  // Add sticker overlay
  const handleAddSticker = (stickerName: string) => {
    updateClipState((prev) => {
      const tracks = prev.timelineTracks.map((tr) => {
        if (tr.type !== 'overlay') return tr;
        const newEl: TimelineElement = {
          id: `sticker-${Date.now()}`,
          trackId: tr.id,
          type: 'sticker',
          name: stickerName,
          startTime: currentTime,
          duration: 3,
          properties: { posX: 50, posY: 20, scale: 1.2 },
        };
        return { ...tr, elements: [...tr.elements, newEl] };
      });
      return { ...prev, timelineTracks: tracks };
    });
  };

  // Active subtitles at playhead
  const captionsTrack = clip.timelineTracks.find((t) => t.type === 'captions');
  const activeSubtitle = captionsTrack?.elements.find(
    (el) => currentTime >= el.startTime && currentTime <= el.startTime + el.duration
  );

  // Active stickers at playhead
  const overlayTrack = clip.timelineTracks.find((t) => t.type === 'overlay');
  const activeStickers = overlayTrack?.elements.filter(
    (el) => currentTime >= el.startTime && currentTime <= el.startTime + el.duration
  );

  // Aspect ratio classes for center player viewport
  const getAspectStyle = () => {
    if (showOriginalComparison) return 'aspect-[16/9] w-full max-w-[500px]';
    switch (clip.aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] h-[480px]';
      case '1:1':
        return 'aspect-square h-[420px]';
      case '4:5':
        return 'aspect-[4/5] h-[450px]';
      case '16:9':
        return 'aspect-[16/9] w-full max-w-[520px]';
    }
  };

  // CSS Filter string from color correction
  const colorFilterStyle = showOriginalComparison
    ? 'none'
    : `brightness(${100 + clip.colorCorrection.brightness}%) contrast(${100 + clip.colorCorrection.contrast}%) saturate(${100 + clip.colorCorrection.saturation}%)`;

  return (
    <div className="flex flex-col h-[calc(100vh-62px)] bg-[#0B0D12] select-none text-white overflow-hidden">
      {/* TOP EDITOR TOOLBAR */}
      <div className="h-12 border-b border-[#2A3040] bg-[#141824] px-4 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Gallery</span>
          </button>
          <span className="text-[#2A3040]">|</span>
          <span className="font-bold text-white max-w-[200px] truncate">{clip.title}</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#191F2D] text-[#8B5CF6] border border-[#2A3040] font-mono">
            {clip.aspectRatio}
          </span>
        </div>

        {/* Center: Undo/Redo & Aspect Ratio */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#191F2D] p-1 rounded-xl border border-[#2A3040]">
            <button
              disabled={historyIndex <= 0}
              onClick={handleUndo}
              className="p-1 text-[#A1A1AA] hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={historyIndex >= history.length - 1}
              onClick={handleRedo}
              className="p-1 text-[#A1A1AA] hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Aspect Ratio Switcher */}
          <div className="flex items-center gap-1 bg-[#191F2D] p-1 rounded-xl border border-[#2A3040]">
            {(['9:16', '1:1', '4:5', '16:9'] as AspectRatio[]).map((ar) => (
              <button
                key={ar}
                onClick={() =>
                  updateClipState((c) => ({
                    ...c,
                    aspectRatio: ar,
                  }))
                }
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  clip.aspectRatio === ar
                    ? 'bg-[#8B5CF6] text-white font-bold'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                {ar}
              </button>
            ))}
          </div>

          {/* Before/After Toggle */}
          <button
            onClick={() => setShowOriginalComparison(!showOriginalComparison)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-colors cursor-pointer ${
              showOriginalComparison
                ? 'bg-[#F59E0B] text-black border-[#F59E0B]'
                : 'bg-[#191F2D] text-[#A1A1AA] border-[#2A3040] hover:text-white'
            }`}
          >
            {showOriginalComparison ? 'Showing Original' : 'Before/After'}
          </button>
        </div>

        {/* Right Action: Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSafeAreas(!showSafeAreas)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] border transition-colors cursor-pointer ${
              showSafeAreas
                ? 'bg-[#06B6D4]/20 border-[#06B6D4] text-[#06B6D4]'
                : 'bg-[#191F2D] border-[#2A3040] text-[#A1A1AA] hover:text-white'
            }`}
            title="Toggle Safe Area Overlay (TikTok / Reels / Shorts)"
          >
            <Shield className="w-3 h-3" />
            <span>Safe Zones</span>
          </button>

          <button
            onClick={() => onExportClip(clip)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] rounded-xl shadow-md shadow-[#8B5CF6]/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Reel</span>
          </button>
        </div>
      </div>

      {/* MIDDLE WORKSPACE (Left Tools, Center Canvas Player, Right Inspector) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT TOOLBAR TABS */}
        <div className="w-60 bg-[#141824] border-r border-[#2A3040] flex flex-col shrink-0">
          {/* Tab Strip */}
          <div className="flex items-center border-b border-[#2A3040] overflow-x-auto text-xs p-1">
            {[
              { id: 'captions', label: 'Captions', icon: Subtitles },
              { id: 'audio', label: 'Audio/SFX', icon: Volume2 },
              { id: 'effects', label: 'Effects', icon: Sparkles },
              { id: 'stickers', label: 'Stickers', icon: Smile },
              { id: 'color', label: 'Color', icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2 px-1 text-[11px] font-semibold flex flex-col items-center gap-1 rounded-lg transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#191F2D] text-[#8B5CF6]'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Left Panel Content */}
          <div className="flex-1 p-3 overflow-y-auto space-y-4 text-xs">
            {/* CAPTIONS TAB */}
            {activeTab === 'captions' && (
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-[#A1A1AA] uppercase block">
                  Caption Presets
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'bold-yellow', label: 'Bold Yellow', color: '#FACC15' },
                    { id: 'karaoke', label: 'Karaoke', color: '#38BDF8' },
                    { id: 'modern-white', label: 'Modern White', color: '#FFFFFF' },
                    { id: 'meme', label: 'Meme Style', color: '#EC4899' },
                  ].map((cp) => (
                    <button
                      key={cp.id}
                      onClick={() =>
                        updateClipState((c) => ({
                          ...c,
                          captionStyle: {
                            ...c.captionStyle,
                            preset: cp.id as any,
                            highlightColor: cp.color,
                          },
                        }))
                      }
                      className={`p-2 rounded-xl border text-center transition-colors cursor-pointer ${
                        clip.captionStyle.preset === cp.id
                          ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 text-white font-bold'
                          : 'border-[#2A3040] bg-[#191F2D] text-[#A1A1AA]'
                      }`}
                    >
                      <span className="text-[11px] block">{cp.label}</span>
                      <span className="text-[9px] font-black" style={{ color: cp.color }}>
                        "SUBTITLE"
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#2A3040] space-y-2">
                  <label className="text-[11px] text-[#A1A1AA] block">Font Size</label>
                  <input
                    type="range"
                    min="18"
                    max="48"
                    value={clip.captionStyle.fontSize}
                    onChange={(e) =>
                      updateClipState((c) => ({
                        ...c,
                        captionStyle: { ...c.captionStyle, fontSize: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-[#8B5CF6]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-[#A1A1AA] block">Position Y (%)</label>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    value={clip.captionStyle.positionY}
                    onChange={(e) =>
                      updateClipState((c) => ({
                        ...c,
                        captionStyle: { ...c.captionStyle, positionY: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-[#8B5CF6]"
                  />
                </div>
              </div>
            )}

            {/* AUDIO & SFX TAB */}
            {activeTab === 'audio' && (
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-[#A1A1AA] uppercase block">
                  Comic Sound Effects
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    'Record Scratch',
                    'Rimshot Laugh',
                    'Dramatic Boom',
                    'Pop & Boing',
                    'Cricket Chirp',
                  ].map((sfx) => (
                    <button
                      key={sfx}
                      onClick={() => handleAddSfx(sfx)}
                      className="p-2.5 rounded-xl bg-[#191F2D] hover:bg-[#8B5CF6]/20 border border-[#2A3040] flex items-center justify-between text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Music className="w-3.5 h-3.5 text-[#8B5CF6]" />
                        <span>{sfx}</span>
                      </div>
                      <span className="text-[10px] text-[#A1A1AA] bg-[#141824] px-1.5 py-0.5 rounded">
                        + Add at {formatTimecode(currentTime)}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#2A3040] space-y-2">
                  <label className="flex items-center justify-between text-[11px]">
                    <span className="text-[#A1A1AA]">Voice Enhancement</span>
                    <input
                      type="checkbox"
                      checked={clip.audioMastering.voiceEnhance}
                      onChange={(e) =>
                        updateClipState((c) => ({
                          ...c,
                          audioMastering: { ...c.audioMastering, voiceEnhance: e.target.checked },
                        }))
                      }
                      className="accent-[#8B5CF6]"
                    />
                  </label>
                  <label className="flex items-center justify-between text-[11px]">
                    <span className="text-[#A1A1AA]">Background Music Ducking</span>
                    <input
                      type="checkbox"
                      checked={clip.audioMastering.musicDucking}
                      onChange={(e) =>
                        updateClipState((c) => ({
                          ...c,
                          audioMastering: { ...c.audioMastering, musicDucking: e.target.checked },
                        }))
                      }
                      className="accent-[#8B5CF6]"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* STICKERS & MEMES TAB */}
            {activeTab === 'stickers' && (
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-[#A1A1AA] uppercase block">
                  Viral Meme Stickers
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    '🔥 VIRAL',
                    '😂 LAUGH',
                    '💀 DEAD',
                    'WAIT FOR IT...',
                    'BRUH',
                    'OMG!',
                    '🍿 DRAMA',
                    '⚡ WOW',
                  ].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleAddSticker(st)}
                      className="p-3 rounded-xl bg-[#191F2D] hover:bg-[#8B5CF6]/20 border border-[#2A3040] text-center font-bold text-white transition-colors cursor-pointer"
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* COLOR TAB */}
            {activeTab === 'color' && (
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-[#A1A1AA] uppercase block">
                  Color Grading
                </span>

                <div>
                  <div className="flex justify-between text-[11px] text-[#A1A1AA] mb-1">
                    <span>Brightness</span>
                    <span>{clip.colorCorrection.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={clip.colorCorrection.brightness}
                    onChange={(e) =>
                      updateClipState((c) => ({
                        ...c,
                        colorCorrection: { ...c.colorCorrection, brightness: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-[#8B5CF6]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-[#A1A1AA] mb-1">
                    <span>Contrast</span>
                    <span>{clip.colorCorrection.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={clip.colorCorrection.contrast}
                    onChange={(e) =>
                      updateClipState((c) => ({
                        ...c,
                        colorCorrection: { ...c.colorCorrection, contrast: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-[#8B5CF6]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-[#A1A1AA] mb-1">
                    <span>Saturation</span>
                    <span>{clip.colorCorrection.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={clip.colorCorrection.saturation}
                    onChange={(e) =>
                      updateClipState((c) => ({
                        ...c,
                        colorCorrection: { ...c.colorCorrection, saturation: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-[#8B5CF6]"
                  />
                </div>
              </div>
            )}

            {/* EFFECTS TAB */}
            {activeTab === 'effects' && (
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-[#A1A1AA] uppercase block">
                  Cinematic AI Effects
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { name: 'Punchline Zoom', desc: 'Auto zoom 1.4x during punchline delivery' },
                    { name: 'Reaction Freeze Frame', desc: '0.8s comedic freeze with B&W tint' },
                    { name: 'Laugh Track Pulse', desc: 'Subtle rhythmic zoom with audience burst' },
                    { name: 'Slow Motion 0.5x', desc: 'Slow motion replay on reaction shock' },
                  ].map((eff) => (
                    <button
                      key={eff.name}
                      onClick={() => handleAddSfx('Dramatic Boom')}
                      className="p-2.5 rounded-xl bg-[#191F2D] hover:bg-[#8B5CF6]/20 border border-[#2A3040] text-left transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-bold text-white block">{eff.name}</span>
                      <span className="text-[10px] text-[#A1A1AA]">{eff.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER PLAYER CANVAS */}
        <div className="flex-1 bg-[#0B0D12] flex flex-col items-center justify-center p-4 relative overflow-hidden">
          {/* Main Video Screen Container */}
          <div
            className={`relative rounded-2xl overflow-hidden bg-black shadow-2xl border border-[#2A3040] transition-all flex items-center justify-center ${getAspectStyle()}`}
          >
            {/* HTML5 Video Surface */}
            <video
              ref={videoRef}
              src={sourceVideoUrl}
              onTimeUpdate={handleTimeUpdate}
              playsInline
              className="w-full h-full object-cover transition-all"
              style={{
                filter: colorFilterStyle,
                transform: `scale(${showOriginalComparison ? 1 : clip.autoReframing.zoom})`,
              }}
            />

            {/* OVERLAY: KINETIC CAPTIONS */}
            {activeSubtitle && !showOriginalComparison && (
              <div
                className="absolute inset-x-4 text-center z-20 pointer-events-none"
                style={{ top: `${clip.captionStyle.positionY}%` }}
              >
                <div
                  className={`inline-block px-3 py-1.5 rounded-xl backdrop-blur-sm shadow-xl ${
                    clip.captionStyle.hasBackground ? 'bg-black/75' : ''
                  }`}
                >
                  <span
                    className={`font-black tracking-wide drop-shadow-md transition-all ${
                      clip.captionStyle.textCase === 'uppercase' ? 'uppercase' : ''
                    }`}
                    style={{
                      fontSize: `${Math.round(clip.captionStyle.fontSize * 0.7)}px`,
                      color: clip.captionStyle.highlightColor || '#FACC15',
                    }}
                  >
                    {activeSubtitle.content}
                  </span>
                </div>
              </div>
            )}

            {/* OVERLAY: ACTIVE STICKERS */}
            {activeStickers &&
              activeStickers.map((st) => (
                <div
                  key={st.id}
                  className="absolute z-20 font-black text-xl text-white drop-shadow-2xl pointer-events-none animate-bounce"
                  style={{
                    left: `${st.properties?.posX || 50}%`,
                    top: `${st.properties?.posY || 20}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {st.name}
                </div>
              ))}

            {/* OVERLAY: SAFE AREA GUIDES (Reels/Shorts UI overlay borders) */}
            {showSafeAreas && (
              <div className="absolute inset-0 pointer-events-none z-30 border-2 border-dashed border-[#06B6D4]/50 flex flex-col justify-between p-4">
                <div className="text-[10px] text-[#06B6D4] font-mono bg-black/60 px-2 py-0.5 rounded w-max">
                  SAFE HEADER ZONE (TikTok/Shorts Title)
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-[10px] text-[#06B6D4] font-mono bg-black/60 px-2 py-0.5 rounded">
                    CAPTION SAFE ZONE
                  </div>
                  <div className="text-[10px] text-[#06B6D4] font-mono bg-black/60 px-2 py-0.5 rounded">
                    RIGHT ICONS MARGIN
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Play Controls Strip */}
          <div className="mt-3 flex items-center gap-4 text-xs">
            <button
              onClick={() => stepTime(-1)}
              className="p-1.5 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              title="-1s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              onClick={() => stepTime(1)}
              className="p-1.5 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              title="+1s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <span className="font-mono text-xs text-[#A1A1AA] tabular-nums">
              {formatTimecode(currentTime)} / {formatTimecode(clip.duration)}
            </span>
          </div>
        </div>

        {/* RIGHT INSPECTOR PANEL */}
        <div className="w-64 bg-[#141824] border-l border-[#2A3040] p-4 flex flex-col overflow-y-auto space-y-5 text-xs shrink-0">
          <div>
            <span className="text-[11px] font-bold text-[#8B5CF6] uppercase block mb-1">
              Reframing & Crop
            </span>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] text-[#A1A1AA] mb-1">
                  <span>Zoom / Scale</span>
                  <span className="font-mono">{clip.autoReframing.zoom.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.05"
                  value={clip.autoReframing.zoom}
                  onChange={(e) =>
                    updateClipState((c) => ({
                      ...c,
                      autoReframing: { ...c.autoReframing, zoom: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-[#8B5CF6]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[#A1A1AA] mb-1">
                  <span>Speaker Focal X</span>
                  <span className="font-mono">{clip.autoReframing.speakerX}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={clip.autoReframing.speakerX}
                  onChange={(e) =>
                    updateClipState((c) => ({
                      ...c,
                      autoReframing: { ...c.autoReframing, speakerX: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-[#8B5CF6]"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#2A3040]">
            <span className="text-[11px] font-bold text-[#A1A1AA] uppercase block mb-2">
              Clip Metadata
            </span>
            <div className="space-y-2 text-[11px] text-[#A1A1AA] font-mono">
              <div className="flex justify-between">
                <span>Start Time:</span>
                <span className="text-white">{formatTimecode(clip.startTime)}</span>
              </div>
              <div className="flex justify-between">
                <span>End Time:</span>
                <span className="text-white">{formatTimecode(clip.endTime)}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="text-white">{clip.duration}s</span>
              </div>
              <div className="flex justify-between">
                <span>Score:</span>
                <span className="text-[#8B5CF6] font-bold">{clip.funnyScore}/100</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#2A3040]">
            <span className="text-[11px] font-bold text-[#A1A1AA] uppercase block mb-2">
              Keyboard Shortcuts
            </span>
            <div className="space-y-1.5 text-[10px] text-[#A1A1AA]">
              <div className="flex justify-between">
                <span>Space</span>
                <span>Play / Pause</span>
              </div>
              <div className="flex justify-between">
                <span>← / →</span>
                <span>Step -1s / +1s</span>
              </div>
              <div className="flex justify-between">
                <span>Ctrl + B</span>
                <span>Split Clip</span>
              </div>
              <div className="flex justify-between">
                <span>Ctrl + Z</span>
                <span>Undo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM MULTITRACK TIMELINE */}
      <div className="h-56 bg-[#141824] border-t border-[#2A3040] flex flex-col shrink-0">
        {/* Timeline Controls Header */}
        <div className="h-10 px-4 border-b border-[#2A3040] flex items-center justify-between text-xs bg-[#191F2D]">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSplitAtPlayhead}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#141824] hover:bg-[#2A3040] border border-[#2A3040] rounded-lg text-white transition-colors cursor-pointer"
              title="Split Track at Playhead (Ctrl+B)"
            >
              <Scissors className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Split at Playhead</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Timeline Zoom */}
            <div className="flex items-center gap-1.5 text-[#A1A1AA]">
              <ZoomOut className="w-3.5 h-3.5" />
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.25"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(Number(e.target.value))}
                className="w-20 accent-[#8B5CF6]"
              />
              <ZoomIn className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Tracks Area */}
        <div
          ref={timelineRef}
          onClick={(e) => {
            const rect = timelineRef.current?.getBoundingClientRect();
            if (rect) {
              const clickX = e.clientX - rect.left - 130; // 130px track header offset
              const trackWidth = rect.width - 130;
              const ratio = Math.max(0, Math.min(1, clickX / trackWidth));
              seekRelative(ratio * clip.duration);
            }
          }}
          className="flex-1 overflow-y-auto p-2 relative space-y-2 select-none"
        >
          {/* SCRUBBER PLAYHEAD VERTICAL LINE */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#8B5CF6] z-30 pointer-events-none"
            style={{
              left: `${130 + (currentTime / clip.duration) * (timelineRef.current ? timelineRef.current.clientWidth - 130 : 500)}px`,
            }}
          >
            <div className="w-3 h-3 bg-[#8B5CF6] rounded-full -ml-[5px] -mt-1 shadow-md" />
          </div>

          {/* TRACK 1: VIDEO */}
          <div className="flex items-center gap-2">
            <div className="w-28 text-[11px] font-bold text-[#A1A1AA] shrink-0 truncate flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-[#8B5CF6]" />
              <span>Video</span>
            </div>
            <div className="flex-1 h-9 rounded-xl bg-[#191F2D] border border-[#8B5CF6]/50 relative overflow-hidden flex items-center px-3 text-[11px] font-medium text-white shadow-inner">
              <span className="truncate">{clip.title}</span>
              {/* Fake waveform bars */}
              <div className="absolute inset-y-1 right-3 flex items-center gap-1 opacity-25 pointer-events-none">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-white rounded-full"
                    style={{ height: `${20 + (i % 5) * 15}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* TRACK 2: KINETIC CAPTIONS */}
          <div className="flex items-center gap-2">
            <div className="w-28 text-[11px] font-bold text-[#A1A1AA] shrink-0 truncate flex items-center gap-1.5">
              <Subtitles className="w-3 h-3 text-[#FACC15]" />
              <span>Captions</span>
            </div>
            <div className="flex-1 h-9 rounded-xl bg-[#191F2D] border border-[#2A3040] relative overflow-hidden flex items-center px-2">
              {captionsTrack?.elements.map((el) => {
                const leftPct = (el.startTime / clip.duration) * 100;
                const widthPct = (el.duration / clip.duration) * 100;
                return (
                  <div
                    key={el.id}
                    className="absolute top-1 bottom-1 rounded bg-[#FACC15]/20 border border-[#FACC15]/50 text-[10px] text-white px-2 flex items-center truncate"
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  >
                    <span className="truncate font-semibold">{el.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 3: OVERLAY / MEMES */}
          <div className="flex items-center gap-2">
            <div className="w-28 text-[11px] font-bold text-[#A1A1AA] shrink-0 truncate flex items-center gap-1.5">
              <Smile className="w-3 h-3 text-[#06B6D4]" />
              <span>Memes & SFX</span>
            </div>
            <div className="flex-1 h-9 rounded-xl bg-[#191F2D] border border-[#2A3040] relative overflow-hidden flex items-center px-2">
              {overlayTrack?.elements.map((el) => {
                const leftPct = (el.startTime / clip.duration) * 100;
                const widthPct = (el.duration / clip.duration) * 100;
                return (
                  <div
                    key={el.id}
                    className="absolute top-1 bottom-1 rounded bg-[#06B6D4]/20 border border-[#06B6D4]/50 text-[10px] text-white px-2 flex items-center truncate"
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  >
                    <span className="truncate font-semibold">{el.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
