import React from 'react';
import { ScreenType } from '../types';
import {
  Scissors,
  LayoutDashboard,
  FileVideo,
  Settings,
  PlusCircle,
  Film,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  activeProjectTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  activeProjectTitle,
}) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 py-3.5 bg-[#0B0D12]/95 backdrop-blur-md border-b border-[#2A3040]">
      {/* Zone 1: Single element brand wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 text-left group transition-transform hover:scale-[1.02]"
          aria-label="FUNNYCUT AI Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B5CF6] via-[#A855F7] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/20">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
              FUNNYCUT<span className="text-[#8B5CF6]">AI</span>
            </span>
          </div>
        </button>

        {activeProjectTitle && currentScreen !== 'landing' && (
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-[#2A3040] text-xs text-[#A1A1AA]">
            <Film className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span className="max-w-[220px] truncate text-slate-300 font-medium">
              {activeProjectTitle}
            </span>
          </div>
        )}
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#A1A1AA]">
        <button
          onClick={() => onNavigate('landing')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentScreen === 'landing' ? 'text-[#8B5CF6] font-semibold' : ''
          }`}
        >
          Home
        </button>

        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentScreen === 'dashboard' ? 'text-[#8B5CF6] font-semibold' : ''
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>

        <button
          onClick={() => onNavigate('projects')}
          className={`flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentScreen === 'projects' ? 'text-[#8B5CF6] font-semibold' : ''
          }`}
        >
          <FileVideo className="w-4 h-4" />
          My Projects
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className={`flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentScreen === 'settings' ? 'text-[#8B5CF6] font-semibold' : ''
          }`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onNavigate('import')}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] rounded-xl shadow-md shadow-[#8B5CF6]/20 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Project</span>
        </button>

        {/* User avatar indicator */}
        <button
          onClick={() => onNavigate('settings')}
          className="w-8 h-8 rounded-full bg-[#191F2D] border border-[#2A3040] flex items-center justify-center text-xs font-bold text-[#8B5CF6] hover:border-[#8B5CF6] transition-colors"
          title="Account Settings"
          aria-label="Account Settings"
        >
          FC
        </button>
      </div>
    </header>
  );
};
