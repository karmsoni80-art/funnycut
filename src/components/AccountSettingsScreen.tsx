import React, { useState } from 'react';
import { UserProfile, AspectRatio, VideoResolution } from '../types';
import {
  User,
  Settings,
  HardDrive,
  ShieldCheck,
  Trash2,
  Check,
  Sparkles,
  Maximize2,
  Subtitles,
  Volume2,
  Zap,
} from 'lucide-react';

interface AccountSettingsScreenProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onClearCache: () => void;
  onResetAllData: () => void;
}

export const AccountSettingsScreen: React.FC<AccountSettingsScreenProps> = ({
  profile: initialProfile,
  onUpdateProfile,
  onClearCache,
  onResetAllData,
}) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleClear = () => {
    onClearCache();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2500);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
          Account & Engine Preferences
        </h1>
        <p className="text-sm text-[#A1A1AA] mt-1">
          Customize your default rendering presets, speech recognition defaults, and inspect system capacity.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* USER PROFILE */}
        <div className="p-5 rounded-2xl bg-[#141824] border border-[#2A3040] space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#8B5CF6] uppercase">
            <User className="w-4 h-4" />
            <span>User Profile</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#A1A1AA] block mb-1.5">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-[#191F2D] border border-[#2A3040] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div>
              <label className="text-xs text-[#A1A1AA] block mb-1.5">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-[#191F2D] border border-[#2A3040] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </div>
        </div>

        {/* DEFAULT VIDEO & REEL PREFERENCES */}
        <div className="p-5 rounded-2xl bg-[#141824] border border-[#2A3040] space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#06B6D4] uppercase">
            <Maximize2 className="w-4 h-4" />
            <span>Default Video Preferences</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#A1A1AA] block mb-1.5">Default Aspect Ratio</label>
              <select
                value={profile.defaultAspectRatio}
                onChange={(e) =>
                  setProfile({ ...profile, defaultAspectRatio: e.target.value as AspectRatio })
                }
                className="w-full bg-[#191F2D] border border-[#2A3040] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="9:16">9:16 (TikTok, Reels, Shorts)</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="4:5">4:5 (Portrait Feed)</option>
                <option value="16:9">16:9 (Landscape)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-[#A1A1AA] block mb-1.5">Default Export Resolution</label>
              <select
                value={profile.defaultResolution}
                onChange={(e) =>
                  setProfile({ ...profile, defaultResolution: e.target.value as VideoResolution })
                }
                className="w-full bg-[#191F2D] border border-[#2A3040] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="720p">720p (Fast)</option>
                <option value="1080p">1080p Full HD (Recommended)</option>
                <option value="1440p">1440p 2K Ultra</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-[#A1A1AA] block mb-1.5">Default Caption Style</label>
              <select
                value={profile.defaultCaptionPreset}
                onChange={(e) => setProfile({ ...profile, defaultCaptionPreset: e.target.value })}
                className="w-full bg-[#191F2D] border border-[#2A3040] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="bold-yellow">Bold Yellow Punchline</option>
                <option value="karaoke">Karaoke Wave</option>
                <option value="modern-white">Modern Clean White</option>
                <option value="meme">Meme Style</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-[#A1A1AA] block mb-1.5">Primary Transcription Language</label>
              <select
                value={profile.defaultLanguage}
                onChange={(e) => setProfile({ ...profile, defaultLanguage: e.target.value })}
                className="w-full bg-[#191F2D] border border-[#2A3040] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="Automatic">Automatic Detection</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Hinglish">Hinglish</option>
              </select>
            </div>
          </div>
        </div>

        {/* TECHNICAL INFRASTRUCTURE LIMITS & FREE GUARANTEE */}
        <div className="p-5 rounded-2xl bg-[#141824] border border-[#2A3040] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#22C55E] uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Transparent Service Limits (100% Free)</span>
            </div>
            <span className="text-[11px] text-[#A1A1AA]">No paid tier restrictions</span>
          </div>

          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            FUNNYCUT AI is completely free. We specify technical server and browser capacity thresholds rather than hiding features behind paywalls.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#191F2D] border border-[#2A3040]">
              <span className="text-[10px] text-[#A1A1AA] uppercase block">Max Upload</span>
              <span className="text-white font-bold">500 MB / video</span>
            </div>
            <div className="p-3 rounded-xl bg-[#191F2D] border border-[#2A3040]">
              <span className="text-[10px] text-[#A1A1AA] uppercase block">Max Duration</span>
              <span className="text-white font-bold">60 min / video</span>
            </div>
            <div className="p-3 rounded-xl bg-[#191F2D] border border-[#2A3040]">
              <span className="text-[10px] text-[#A1A1AA] uppercase block">Parallel Jobs</span>
              <span className="text-white font-bold">4 workers</span>
            </div>
            <div className="p-3 rounded-xl bg-[#191F2D] border border-[#2A3040]">
              <span className="text-[10px] text-[#A1A1AA] uppercase block">Browser Cache</span>
              <span className="text-white font-bold">2.0 GB pool</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#A1A1AA]">Local workspace cache</span>
            <button
              type="button"
              onClick={handleClear}
              className="px-3.5 py-1.5 bg-[#191F2D] hover:bg-[#2A3040] border border-[#2A3040] rounded-lg text-xs text-white transition-colors cursor-pointer"
            >
              {cacheCleared ? 'Cache Cleared!' : 'Clear Local Cache'}
            </button>
          </div>
        </div>

        {/* SAVE & RESET ACTIONS */}
        <div className="flex items-center justify-between pt-4 border-t border-[#2A3040]">
          <button
            type="button"
            onClick={onResetAllData}
            className="flex items-center gap-1.5 px-4 py-2 text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] rounded-xl shadow-lg shadow-[#8B5CF6]/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-[#22C55E]" />
                <span>Preferences Saved!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
