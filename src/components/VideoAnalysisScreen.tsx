import React, { useState, useEffect } from 'react';
import { SourceVideo, DetectedMoment } from '../types';
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  Terminal,
  Activity,
  Smile,
  Mic,
  Eye,
  Sliders,
  ArrowRight,
} from 'lucide-react';

interface VideoAnalysisScreenProps {
  sourceVideo: SourceVideo;
  projectTitle: string;
  onAnalysisComplete: (moments: DetectedMoment[]) => void;
  mockMoments: DetectedMoment[];
}

interface StepItem {
  id: string;
  label: string;
  icon: any;
  status: 'pending' | 'active' | 'completed';
  detail: string;
}

export const VideoAnalysisScreen: React.FC<VideoAnalysisScreenProps> = ({
  sourceVideo,
  projectTitle,
  onAnalysisComplete,
  mockMoments,
}) => {
  const [progress, setProgress] = useState(12);
  const [logs, setLogs] = useState<string[]>([
    `[INFO] Initializing video analysis pipeline for: "${sourceVideo.name}"`,
    `[INFO] Container verified: ${sourceVideo.width}x${sourceVideo.height} @ ${sourceVideo.fps}fps (${sourceVideo.duration}s)`,
    `[FFmpeg] Demuxing audio stream (48kHz, stereo, 16-bit PCM)...`,
  ]);

  const [steps, setSteps] = useState<StepItem[]>([
    {
      id: 'step-audio',
      label: 'Audio Extraction & Whisper Speech-to-Text',
      icon: Mic,
      status: 'active',
      detail: 'Transcribing speech with millisecond word timestamps...',
    },
    {
      id: 'step-vision',
      label: 'Computer Vision & Active Speaker Tracking',
      icon: Eye,
      status: 'pending',
      detail: 'Detecting faces, speaker changes, and camera angles...',
    },
    {
      id: 'step-acoustic',
      label: 'Laughter & Acoustic Pitch Event Analysis',
      icon: Smile,
      status: 'pending',
      detail: 'Identifying applause, burst laughter, and punchline spikes...',
    },
    {
      id: 'step-context',
      label: 'Multimodal AI Comedy Reasoner',
      icon: Sparkles,
      status: 'pending',
      detail: 'Analyzing setup-to-punchline rhythm and conversational irony...',
    },
    {
      id: 'step-scoring',
      label: 'Viral Ranking & Overlap Management',
      icon: Sliders,
      status: 'pending',
      detail: 'Calculating 0-100 comedy potential scores and deduplication...',
    },
  ]);

  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Real progression sequence
    const timer1 = setTimeout(() => {
      setProgress(35);
      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === 0 ? { ...s, status: 'completed' } : idx === 1 ? { ...s, status: 'active' } : s
        )
      );
      setLogs((l) => [
        ...l,
        `[Whisper] Transcription completed: 1,480 words decoded with 99.4% confidence`,
        `[OpenCV] Tracking active speakers across ${sourceVideo.duration * 30} video frames...`,
      ]);
    }, 1200);

    const timer2 = setTimeout(() => {
      setProgress(60);
      setSteps((prev) =>
        prev.map((s, idx) =>
          idx <= 1 ? { ...s, status: 'completed' } : idx === 2 ? { ...s, status: 'active' } : s
        )
      );
      setLogs((l) => [
        ...l,
        `[Vision] Detected 2 primary speakers (Host X:52%, Guest X:46%)`,
        `[Acoustic] 4 laughter peaks and 2 high-energy applause events detected`,
      ]);
    }, 2400);

    const timer3 = setTimeout(() => {
      setProgress(85);
      setSteps((prev) =>
        prev.map((s, idx) =>
          idx <= 2 ? { ...s, status: 'completed' } : idx === 3 ? { ...s, status: 'active' } : s
        )
      );
      setLogs((l) => [
        ...l,
        `[Gemini AI] Evaluating comedic irony: Found "cat speaking Morse code" absurd dialogue sequence`,
        `[Gemini AI] Found relationship advice zoom punchline with 94/100 viral score`,
      ]);
    }, 3600);

    const timer4 = setTimeout(() => {
      setProgress(100);
      setSteps((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
      setLogs((l) => [
        ...l,
        `[Scoring] Moment ranking completed: ${mockMoments.length} viral highlights selected`,
        `[SUCCESS] AI Video Analysis pipeline finished successfully!`,
      ]);
      setIsDone(true);
    }, 4800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141824] border border-[#2A3040] text-xs text-[#8B5CF6] font-medium">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>Autonomous AI Pipeline In Progress</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
          Analyzing "{projectTitle}"
        </h1>
        <p className="text-xs text-[#A1A1AA] max-w-lg mx-auto">
          Whisper AI, computer vision tracking, and multimodal comedy reasoning are analyzing every frame and audio frequency.
        </p>
      </div>

      {/* OVERALL PROGRESS BAR */}
      <div className="p-5 rounded-2xl bg-[#141824] border border-[#2A3040] space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#A1A1AA]">Total Processing Progress</span>
          <span className="text-white font-bold">{progress}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-[#191F2D] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#06B6D4] transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* PIPELINE STAGES */}
      <div className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                step.status === 'completed'
                  ? 'bg-[#141824] border-[#22C55E]/40'
                  : step.status === 'active'
                  ? 'bg-[#191F2D] border-[#8B5CF6] ring-1 ring-[#8B5CF6]/30'
                  : 'bg-[#141824]/50 border-[#2A3040] opacity-60'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    step.status === 'completed'
                      ? 'bg-[#22C55E]/20 text-[#22C55E]'
                      : step.status === 'active'
                      ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]'
                      : 'bg-[#191F2D] text-[#A1A1AA]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white">{step.label}</h2>
                  <p className="text-[11px] text-[#A1A1AA] mt-0.5">{step.detail}</p>
                </div>
              </div>

              <div>
                {step.status === 'completed' && (
                  <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                )}
                {step.status === 'active' && (
                  <Loader2 className="w-5 h-5 text-[#8B5CF6] animate-spin" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* LIVE ENGINE LOGS TERMINAL */}
      <div className="rounded-2xl bg-[#0B0D12] border border-[#2A3040] overflow-hidden font-mono text-[11px]">
        <div className="px-4 py-2 bg-[#141824] border-b border-[#2A3040] flex items-center justify-between text-[#A1A1AA]">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>AI Execution Stream</span>
          </div>
          <span className="text-[10px] text-[#22C55E]">Real-Time Feed</span>
        </div>
        <div className="p-4 space-y-1.5 max-h-40 overflow-y-auto text-[#A1A1AA]">
          {logs.map((log, idx) => (
            <div key={idx} className="leading-relaxed">
              <span className="text-[#8B5CF6] mr-2">›</span>
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM ACTION */}
      {isDone && (
        <div className="pt-2 flex justify-center animate-fade-in">
          <button
            onClick={() => onAnalysisComplete(mockMoments)}
            className="flex items-center gap-2 px-8 py-3.5 text-xs font-bold text-white bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] rounded-xl shadow-xl shadow-[#8B5CF6]/30 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Review {mockMoments.length} Detected Moments</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
