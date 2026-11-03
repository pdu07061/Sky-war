import React from 'react';
import { GameMode } from '../types/game';
import { Swords } from 'lucide-react';

interface NavbarProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onQuickBattle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  onQuickBattle,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Brand Wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelectMode('SKIRMISH');
        }}
        className="text-lg font-bold tracking-tight text-white font-display whitespace-nowrap shrink-0 hover:text-sky-400 transition-colors flex items-center gap-2"
      >
        <span className="text-xl">⚔️</span>
        <span>천공대전: 발할라의 날개</span>
      </a>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => onSelectMode('SKIRMISH')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentMode === 'SKIRMISH' ? 'text-sky-400 font-semibold' : ''
          }`}
        >
          실시간 대전
        </button>
        <button
          onClick={() => onSelectMode('CAMPAIGN')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentMode === 'CAMPAIGN' ? 'text-sky-400 font-semibold' : ''
          }`}
        >
          전역 원정
        </button>
        <button
          onClick={() => onSelectMode('DEFENSE')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentMode === 'DEFENSE' ? 'text-sky-400 font-semibold' : ''
          }`}
        >
          무한 수호전
        </button>
        <button
          onClick={() => onSelectMode('HANGAR')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentMode === 'HANGAR' ? 'text-sky-400 font-semibold' : ''
          }`}
        >
          천공 격납고
        </button>
        <button
          onClick={() => onSelectMode('GUIDE')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentMode === 'GUIDE' ? 'text-sky-400 font-semibold' : ''
          }`}
        >
          전술 지침
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onQuickBattle}
          className="px-4 py-2 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg shadow-sm hover:shadow-sky-400/20 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <Swords className="w-3.5 h-3.5" />
          <span>즉시 출격</span>
        </button>
      </div>
    </header>
  );
};
