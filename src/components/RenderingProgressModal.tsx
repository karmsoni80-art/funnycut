import React, { useState, useEffect, useRef } from 'react';
import { GeneratedClip } from '../types';
import {
  Loader2,
  CheckCircle2,
  Download,
  AlertCircle,
  Film,
  Sparkles,
  ArrowRight,
  HardDrive,
} from 'lucide-react';
import { renderClipToBlob } from '../utils/videoRenderer';

interface RenderingProgressModalProps {
  clip: GeneratedClip;
  sourceVideoUrl: string;
  onFinished: (downloadUrl: string, filename: string) => void;
  onClose: () => void;
}

export const RenderingProgressModal: React.FC<RenderingProgressModalProps> = ({
  clip,
  sourceVideoUrl,
  onFinished,
  onClose,
}) => {
  const [progress, setProgress] = useState(5);
  const [statusText, setStatusText] = useState('Initializing canvas pipeline...');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const startActualRender = async () => {
      try {
        const vid = document.createElement('video');
        vid.src = sourceVideoUrl;
        vid.crossOrigin = 'anonymous';
        vid.preload = 'auto';
        videoElementRef.current = vid;

        // Wait for video to load metadata or proceed immediately with synthetic canvas
        await new Promise((resolve) => {
          vid.onloadedmetadata = () => resolve(true);
          vid.onerror = () => resolve(false);
          setTimeout(() => resolve(true), 400); // quick fallback
        });

        if (isCancelled) return;

        const result = await renderClipToBlob(clip, vid, (pct, status) => {
          if (!isCancelled) {
            setProgress(pct);
            setStatusText(status);
          }
        });

        if (!isCancelled) {
          setDownloadUrl(result.url);
          setFilename(result.filename);
          setProgress(100);
          setStatusText('Video successfully encoded and ready to download!');
          onFinished(result.url, result.filename);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Render error:', err);
          setError(err.message || 'Render failed during video frame encoding');
        }
      }
    };

    startActualRender();

    return () => {
      isCancelled = true;
      if (videoElementRef.current) {
        videoElementRef.current.pause();
        videoElementRef.current.src = '';
      }
    };
  }, [clip]);

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename || `${clip.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#141824] border border-[#2A3040] shadow-2xl p-6 space-y-6">
        {/* HEADER */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center mx-auto mb-2">
            {downloadUrl ? (
              <CheckCircle2 className="w-6 h-6 text-[#22C55E]" />
            ) : (
              <Loader2 className="w-6 h-6 animate-spin" />
            )}
          </div>
          <h2 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
            {downloadUrl ? 'Rendering Completed!' : 'Rendering Reel in Progress'}
          </h2>
          <p className="text-xs text-[#A1A1AA] line-clamp-1">{clip.title}</p>
        </div>

        {/* PROGRESS BAR */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#A1A1AA] truncate max-w-[280px]">{statusText}</span>
            <span className="text-white font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#191F2D] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#06B6D4] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STAGES BREAKDOWN */}
        <div className="p-4 rounded-xl bg-[#0B0D12] border border-[#2A3040] space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[#A1A1AA]">Reframing Crop & Zoom:</span>
            <span className={progress >= 20 ? 'text-[#22C55E]' : 'text-[#A1A1AA]'}>
              {progress >= 20 ? '✓ Applied' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#A1A1AA]">Kinetic Subtitle Compositing:</span>
            <span className={progress >= 50 ? 'text-[#22C55E]' : 'text-[#A1A1AA]'}>
              {progress >= 50 ? '✓ Rendered' : 'Processing'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#A1A1AA]">Audio Mastering & Ducking:</span>
            <span className={progress >= 80 ? 'text-[#22C55E]' : 'text-[#A1A1AA]'}>
              {progress >= 80 ? '✓ Mixed' : 'Processing'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#A1A1AA]">MP4 Video Container Encode:</span>
            <span className={progress >= 100 ? 'text-[#22C55E]' : 'text-[#A1A1AA]'}>
              {progress >= 100 ? '✓ Ready' : 'Encoding'}
            </span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#2A3040]/60">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
          >
            {downloadUrl ? 'Close' : 'Cancel'}
          </button>

          {downloadUrl ? (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:from-[#16A34A] hover:to-[#15803D] rounded-xl shadow-lg shadow-[#22C55E]/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download MP4 File</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-[#A1A1AA] font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8B5CF6]" />
              <span>Encoding...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
