import React, { useState } from 'react';
import { ScreenType, SourceVideo } from '../types';
import { SAMPLE_VIDEOS } from '../data/sampleData';
import {
  Sparkles,
  Scissors,
  Play,
  UploadCloud,
  Link as LinkIcon,
  CheckCircle2,
  Sliders,
  Maximize2,
  Subtitles,
  Volume2,
  Smile,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Layers,
} from 'lucide-react';

interface LandingPageProps {
  onStartWithUrl: (url: string) => void;
  onStartWithSample: (sample: SourceVideo) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartWithUrl,
  onStartWithSample,
  onNavigate,
}) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [sliderPos, setSliderPos] = useState(50);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoUrl.trim()) {
      onStartWithUrl(videoUrl.trim());
    } else {
      onStartWithSample(SAMPLE_VIDEOS[0]);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setVideoUrl(text);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 px-6 max-w-7xl mx-auto text-center">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#8B5CF6]/15 via-[#06B6D4]/10 to-[#A855F7]/15 blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141824] border border-[#2A3040] text-xs text-[#8B5CF6] font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>100% Free Video AI Platform · No Subscription Required</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15] mb-6 font-['Plus_Jakarta_Sans']">
          Turn Long Videos Into Multiple{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#06B6D4]">
            Funny Reels
          </span>{' '}
          With AI
        </h1>

        <p className="text-lg md:text-xl text-[#A1A1AA] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Upload your video or paste a supported link. AI finds the funniest moments, edits them professionally and creates multiple ready-to-publish short videos.
        </p>

        {/* HERO INPUT BOX */}
        <div className="max-w-2xl mx-auto bg-[#141824] p-3 rounded-2xl border border-[#2A3040] shadow-2xl shadow-[#8B5CF6]/10 mb-8">
          <form onSubmit={handleUrlSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste YouTube, Vimeo, or MP4 video URL..."
                className="w-full bg-[#191F2D] border border-[#2A3040] rounded-xl pl-10 pr-20 py-3 text-sm text-white placeholder-[#A1A1AA]/60 focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
              <button
                type="button"
                onClick={handlePaste}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs text-[#A1A1AA] hover:text-white bg-[#141824] hover:bg-[#2A3040] rounded-md transition-colors"
              >
                Paste
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onNavigate('import')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold text-white bg-[#191F2D] hover:bg-[#2A3040] border border-[#2A3040] rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-[#8B5CF6]" />
                Upload
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold text-white bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] rounded-xl shadow-lg shadow-[#8B5CF6]/30 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Generate Reels
              </button>
            </div>
          </form>

          {/* Quick sample buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3 mt-2 border-t border-[#2A3040]/50 text-xs text-[#A1A1AA]">
            <span>Or try instantly:</span>
            {SAMPLE_VIDEOS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => onStartWithSample(sample)}
                className="px-2.5 py-1 rounded-lg bg-[#191F2D] hover:bg-[#8B5CF6]/20 hover:text-white border border-[#2A3040] transition-colors flex items-center gap-1"
              >
                <Play className="w-3 h-3 text-[#8B5CF6]" />
                <span className="truncate max-w-[140px]">{sample.name.split('-')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* TRUST TAGS */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#A1A1AA]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            100% Free Forever
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            No Watermark Paywalls
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            Auto 9:16 Active Speaker Reframing
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            Synchronized Kinetic Captions
          </span>
        </div>
      </section>

      {/* BEFORE / AFTER INTERACTIVE COMPARISON */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-wider text-[#8B5CF6] font-bold">
            Autonomous Editing Magic
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 font-['Plus_Jakarta_Sans']">
            See the AI Transformation
          </h2>
          <p className="text-sm text-[#A1A1AA] mt-2">
            Drag the slider to compare raw widescreen footage against AI-generated viral vertical reel.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto aspect-[16/10] bg-[#141824] rounded-2xl overflow-hidden border border-[#2A3040] shadow-2xl select-none">
          {/* AFTER VIEW (Right side / Base) */}
          <div className="absolute inset-0 bg-[#0B0D12] flex items-center justify-center">
            {/* Mock 9:16 vertical short */}
            <div className="relative h-full aspect-[9/16] bg-[#141824] overflow-hidden border-x border-[#2A3040] shadow-2xl flex flex-col items-center justify-end p-6">
              <img
                src={SAMPLE_VIDEOS[0].thumbnail}
                alt="After Reframing"
                className="absolute inset-0 w-full h-full object-cover scale-125 brightness-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              {/* Kinetic Captions */}
              <div className="relative z-10 text-center mb-10 bg-black/75 px-4 py-2.5 rounded-xl border border-white/10 backdrop-blur-sm animate-pulse">
                <span className="text-sm md:text-base font-extrabold text-white tracking-wide uppercase">
                  MY CAT WAS SPEAKING IN{' '}
                  <span className="text-[#FACC15] drop-shadow-md">MORSE CODE!</span>
                </span>
              </div>

              {/* Meme badge */}
              <div className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-md bg-[#8B5CF6] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                <Smile className="w-3 h-3" />
                <span>Score 98/100</span>
              </div>
            </div>
          </div>

          {/* BEFORE VIEW (Left side, clipped by slider) */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden bg-[#191F2D]"
            style={{ width: `${sliderPos}%` }}
          >
            <div className="absolute inset-0 w-[800px] max-w-none flex flex-col justify-center items-center bg-[#141824]">
              <img
                src={SAMPLE_VIDEOS[0].thumbnail}
                alt="Before editing"
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-black/70 text-[#A1A1AA] text-[11px] font-bold uppercase tracking-wider border border-[#2A3040]">
                Raw 16:9 Landscape (No Captions, No Crop)
              </div>
            </div>
          </div>

          {/* DRAGGABLE DIVIDER LINE */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-lg flex items-center justify-center"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center -ml-3.5 font-bold text-xs">
              ‹›
            </div>
          </div>

          {/* Interactive range slider overlay */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-ew-resize z-30 w-full h-full"
            aria-label="Comparison slider"
          />
        </div>
      </section>

      {/* HOW IT WORKS (4 Editorial Steps) */}
      <section className="py-16 px-6 max-w-6xl mx-auto border-t border-[#2A3040]">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-wider text-[#06B6D4] font-bold">
            Simplicity at Scale
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 font-['Plus_Jakarta_Sans']">
            How FUNNYCUT AI Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#141824] border border-[#2A3040] relative">
            <span className="text-3xl font-extrabold text-[#8B5CF6]/30 font-mono mb-3 block">01</span>
            <h3 className="text-lg font-bold text-white mb-2">Import Video</h3>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Upload MP4, MOV, WebM files or paste supported direct video and authorized platform URLs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#141824] border border-[#2A3040] relative">
            <span className="text-3xl font-extrabold text-[#8B5CF6]/30 font-mono mb-3 block">02</span>
            <h3 className="text-lg font-bold text-white mb-2">Multimodal AI Analysis</h3>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Whisper AI transcribes dialogue while computer vision tracks active speakers, laughter, and comedic setups.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#141824] border border-[#2A3040] relative">
            <span className="text-3xl font-extrabold text-[#8B5CF6]/30 font-mono mb-3 block">03</span>
            <h3 className="text-lg font-bold text-white mb-2">Autonomous Reel Generation</h3>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Moments are reframed to 9:16 vertical video with synchronized kinetic subtitles and comedic zooms.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#141824] border border-[#2A3040] relative">
            <span className="text-3xl font-extrabold text-[#8B5CF6]/30 font-mono mb-3 block">04</span>
            <h3 className="text-lg font-bold text-white mb-2">Multitrack Editor & Export</h3>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Fine-tune captions, audio, and stickers in a full multitrack timeline editor, then download MP4 or batch ZIP.
            </p>
          </div>
        </div>
      </section>

      {/* AI CAPABILITIES & PROFESSIONAL EDITOR FEATURES */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-wider text-[#8B5CF6] font-bold">
            Enterprise Grade Engine
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 font-['Plus_Jakarta_Sans']">
            Everything You Need in One Free Platform
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#191F2D] border border-[#2A3040]">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center mb-4">
              <Subtitles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Kinetic Subtitle Styles</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Modern White, Bold Yellow, Karaoke, Podcast, and Meme presets with word-level speech synchronization and punchline highlighting.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#191F2D] border border-[#2A3040]">
            <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/20 text-[#06B6D4] flex items-center justify-center mb-4">
              <Maximize2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Smart Speaker Auto-Framing</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Converts 16:9 landscape footage into 9:16 vertical shorts while dynamically tracking the active speaker inside safe-area margins.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#191F2D] border border-[#2A3040]">
            <div className="w-10 h-10 rounded-xl bg-[#A855F7]/20 text-[#A855F7] flex items-center justify-center mb-4">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Audio Mastering & Ducking</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Automatic background noise reduction, voice enhancement, intelligent music ducking behind dialogue, and comic SFX integration.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#191F2D] border border-[#2A3040]">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Multitrack Video Editor</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Full desktop timeline with separate video, subtitle, overlay/meme, and sound effect tracks with split, trim, duplicate, and undo.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#191F2D] border border-[#2A3040]">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center mb-4">
              <Smile className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Multimodal Comedy Reasoner</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Scores moments from 0 to 100 based on context quality, punchline completeness, reaction surprise, and acoustic energy.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#191F2D] border border-[#2A3040]">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">100% Free & Local Safe</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              No hidden subscriptions, no trial credit traps, no forced watermarks. Transparent capacity limits with client-side render speed.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION */}
      <section className="py-16 px-6 max-w-4xl mx-auto border-t border-[#2A3040]">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold font-['Plus_Jakarta_Sans']">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Is FUNNYCUT AI really completely free?',
              a: 'Yes. FUNNYCUT AI is completely free for all users with zero subscription pages, zero credit gates, and no watermarks. We utilize efficient client-side Canvas and Web Audio rendering along with open-source models.',
            },
            {
              q: 'What video formats and platforms are supported?',
              a: 'We support local uploads in MP4, MOV, WebM, and MKV formats up to 500MB, as well as direct video URLs and authorized YouTube/Vimeo integration links.',
            },
            {
              q: 'How does the AI detect funny moments?',
              a: 'Our engine combines Whisper speech-to-text with multimodal context reasoning: it analyzes setup and punchline timing, audience laughter bursts, vocal pitch inflection, and facial reactions to score comedy virality from 0 to 100.',
            },
            {
              q: 'Can I customize the generated clips before exporting?',
              a: 'Yes! Our built-in multitrack video editor allows you to adjust timestamps, reframe crops, edit words in captions, add stickers and sound effects, and tweak color grading.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-[#141824] border border-[#2A3040] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                className="w-full px-5 py-4 flex items-center justify-between text-left text-sm font-semibold text-white hover:text-[#8B5CF6] transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    faqOpen === idx ? 'rotate-180 text-[#8B5CF6]' : 'text-[#A1A1AA]'
                  }`}
                />
              </button>
              {faqOpen === idx && (
                <div className="px-5 pb-4 text-xs text-[#A1A1AA] leading-relaxed border-t border-[#2A3040]/50 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#2A3040] py-10 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#A1A1AA]">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-[#8B5CF6]" />
          <span className="font-bold text-white">FUNNYCUT AI</span>
          <span>· One Long Video. Multiple Viral Moments.</span>
        </div>
        <div>
          <span>Free Open-Source Video Intelligence · 2026</span>
        </div>
      </footer>
    </div>
  );
};
