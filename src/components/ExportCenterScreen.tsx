import React, { useState } from 'react';
import { GeneratedClip, ExportQuality, FrameRate, VideoResolution } from '../types';
import {
  Download,
  Film,
  Sparkles,
  Sliders,
  CheckCircle2,
  Subtitles,
  Volume2,
  ShieldCheck,
  Archive,
  ArrowRight,
  HardDrive,
} from 'lucide-react';
import { exportClipsToZip } from '../utils/videoRenderer';

interface ExportCenterScreenProps {
  clip: GeneratedClip;
  allClips: GeneratedClip[];
  onStartRender: (config: {
    clip: GeneratedClip;
    format: 'MP4 (H.264)' | 'WebM';
    resolution: VideoResolution;
    fps: FrameRate;
    quality: ExportQuality;
    burnCaptions: boolean;
    audioMastering: boolean;
  }) => void;
  onBack: () => void;
}

export const ExportCenterScreen: React.FC<ExportCenterScreenProps> = ({
  clip,
  allClips,
  onStartRender,
  onBack,
}) => {
  const [format, setFormat] = useState<'MP4 (H.264)' | 'WebM'>('MP4 (H.264)');
  const [resolution, setResolution] = useState<VideoResolution>(clip.resolution || '1080p');
  const [fps, setFps] = useState<FrameRate>(30);
  const [quality, setQuality] = useState<ExportQuality>('High');
  const [burnCaptions, setBurnCaptions] = useState(true);
  const [audioMastering, setAudioMastering] = useState(true);
  const [watermark, setWatermark] = useState(false); // 100% Free - No watermark!
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState('');

  // Estimate file size based on resolution and duration
  const bitrates: Record<VideoResolution, number> = {
    '720p': 3.5,
    '1080p': 6.0,
    '1440p': 12.0,
  };
  const estimatedMb = Number(((bitrates[resolution] * clip.duration) / 8).toFixed(1));

  const handleExportBatchZip = async () => {
    try {
      setIsZipping(true);
      const zipBlob = await exportClipsToZip(allClips, (pct, status) => {
        setZipProgress(`${status} (${pct}%)`);
      });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `funnycut_all_reels_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
      setZipProgress('');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
          Export Center
        </h1>
        <p className="text-sm text-[#A1A1AA] mt-1">
          Configure video encoding parameters for "{clip.title}". 100% Free with zero watermark restrictions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT: ENCODING SETTINGS */}
        <div className="space-y-6">
          {/* FORMAT */}
          <div className="p-5 rounded-2xl bg-[#141824] border border-[#2A3040] space-y-3">
            <label className="text-xs font-bold text-white block">Video Container Format</label>
            <div className="grid grid-cols-2 gap-2">
              {(['MP4 (H.264)', 'WebM'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                    format === fmt
                      ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white ring-1 ring-[#8B5CF6]'
                      : 'bg-[#191F2D] border-[#2A3040] text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold block">{fmt}</span>
                  <span className="text-[10px] text-[#A1A1AA]">
                    {fmt.includes('MP4') ? 'Universal playback' : 'Open web stream'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* RESOLUTION */}
          <div className="p-5 rounded-2xl bg-[#141824] border border-[#2A3040] space-y-3">
            <label className="text-xs font-bold text-white block">Resolution</label>
            <div className="grid grid-cols-3 gap-2">
              {(['720p', '1080p', '1440p'] as VideoResolution[]).map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                    resolution === res
                      ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white ring-1 ring-[#8B5CF6]'
                      : 'bg-[#191F2D] border-[#2A3040] text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold block">{res}</span>
                  <span className="text-[10px] text-[#A1A1AA]">
                    {res === '1080p' ? 'Full HD (Best)' : res === '720p' ? 'Fast Render' : '2K Ultra'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* FRAME RATE */}
          <div className="p-5 rounded-2xl bg-[#141824] border border-[#2A3040] space-y-3">
            <label className="text-xs font-bold text-white block">Frame Rate (FPS)</label>
            <div className="grid grid-cols-4 gap-2">
              {([24, 25, 30, 60] as FrameRate[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFps(f)}
                  className={`py-2 rounded-xl border text-center font-mono text-xs transition-colors cursor-pointer ${
                    fps === f
                      ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white font-bold'
                      : 'bg-[#191F2D] border-[#2A3040] text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  {f} FPS
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: COMPOSITING TOGGLES & BATCH EXPORT */}
        <div className="space-y-6">
          {/* COMPOSITING TOGGLES */}
          <div className="p-5 rounded-2xl bg-[#141824] border border-[#2A3040] space-y-4">
            <span className="text-xs font-bold text-white block">Compositing & Audio Options</span>

            <div className="space-y-3">
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <div>
                  <span className="text-white font-medium block">Burned-In Kinetic Captions</span>
                  <span className="text-[11px] text-[#A1A1AA]">
                    Overlay animated subtitles directly into video frames
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={burnCaptions}
                  onChange={(e) => setBurnCaptions(e.target.checked)}
                  className="accent-[#8B5CF6] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <div>
                  <span className="text-white font-medium block">Mastered Audio & Ducking</span>
                  <span className="text-[11px] text-[#A1A1AA]">
                    Include noise reduction, voice boost, and sound effects
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={audioMastering}
                  onChange={(e) => setAudioMastering(e.target.checked)}
                  className="accent-[#8B5CF6] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <div>
                  <span className="text-white font-medium block">Brand Watermark</span>
                  <span className="text-[11px] text-[#22C55E]">
                    Optional · Disabled by default (100% Free Forever)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={watermark}
                  onChange={(e) => setWatermark(e.target.checked)}
                  className="accent-[#8B5CF6] w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* RENDER SPECS ESTIMATION */}
          <div className="p-5 rounded-2xl bg-[#191F2D] border border-[#2A3040] space-y-2.5 font-mono text-xs">
            <div className="flex justify-between text-[#A1A1AA]">
              <span>Estimated File Size:</span>
              <span className="text-white font-bold">~{estimatedMb} MB</span>
            </div>
            <div className="flex justify-between text-[#A1A1AA]">
              <span>Aspect Ratio:</span>
              <span className="text-white font-bold">{clip.aspectRatio}</span>
            </div>
            <div className="flex justify-between text-[#A1A1AA]">
              <span>Output Duration:</span>
              <span className="text-white font-bold">{clip.duration}s</span>
            </div>
          </div>

          {/* BATCH EXPORT OPTION */}
          <div className="p-5 rounded-2xl bg-[#141824] border border-[#2A3040] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Batch Export All Clips</span>
              <span className="text-[11px] text-[#A1A1AA]">
                Package all {allClips.length} clips and .SRT subtitle files into a ZIP
              </span>
            </div>
            <button
              disabled={isZipping}
              onClick={handleExportBatchZip}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#191F2D] hover:bg-[#2A3040] border border-[#2A3040] rounded-xl text-xs text-white transition-colors cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>{isZipping ? zipProgress || 'Zipping...' : 'Download ZIP'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-between pt-4 border-t border-[#2A3040]">
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
        >
          Back to Editor
        </button>

        <button
          onClick={() =>
            onStartRender({
              clip,
              format,
              resolution,
              fps,
              quality,
              burnCaptions,
              audioMastering,
            })
          }
          className="flex items-center gap-2 px-8 py-3 text-xs font-bold text-white bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] rounded-xl shadow-xl shadow-[#8B5CF6]/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Start Rendering Video</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
