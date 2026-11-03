import React from 'react';
import { CardData, FortressState } from '../types/game';
import { Shield, Zap, Volume2, VolumeX, Music, Pause, Play, FastForward } from 'lucide-react';

interface BattleHUDProps {
  playerFortress: FortressState;
  enemyFortress: FortressState;
  cards: CardData[];
  mana: number;
  maxMana: number;
  manaRegenRate: number;
  cooldowns: Record<string, number>;
  selectedSpellId: string | null;
  onSelectCard: (card: CardData) => void;
  onFireMegaCannon: () => void;
  matchTime: number;
  isPaused: boolean;
  gameSpeed: number;
  onTogglePause: () => void;
  onChangeSpeed: () => void;
  sfxEnabled: boolean;
  bgmEnabled: boolean;
  onToggleSfx: () => void;
  onToggleBgm: () => void;
}

export const BattleHUD: React.FC<BattleHUDProps> = ({
  playerFortress,
  enemyFortress,
  cards,
  mana,
  maxMana,
  manaRegenRate,
  cooldowns,
  selectedSpellId,
  onSelectCard,
  onFireMegaCannon,
  matchTime,
  isPaused,
  gameSpeed,
  onTogglePause,
  onChangeSpeed,
  sfxEnabled,
  bgmEnabled,
  onToggleSfx,
  onToggleBgm,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isMegaReady = playerFortress.megaCannonCharge >= 100 && !playerFortress.megaCannonFiring;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Top Status Bar: Player Fortress vs Enemy Fortress */}
      <div className="grid grid-cols-12 items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 backdrop-blur-md">
        {/* Player Status */}
        <div className="col-span-4 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-sky-400 whitespace-nowrap">
              {playerFortress.name}
            </span>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              HP {Math.ceil(playerFortress.hp)}/{playerFortress.maxHp}
            </span>
          </div>

          {/* Player HP Bar */}
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-150"
              style={{
                width: `${Math.max(0, Math.min(100, (playerFortress.hp / playerFortress.maxHp) * 100))}%`,
              }}
            />
          </div>

          {/* Player Shield Bar */}
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-400 transition-all duration-150"
                style={{
                  width: `${Math.max(0, Math.min(100, (playerFortress.shield / playerFortress.maxShield) * 100))}%`,
                }}
              />
            </div>
            <span className="text-[10px] font-mono text-sky-400 tabular-nums shrink-0">
              {Math.ceil(playerFortress.shield)}
            </span>
          </div>
        </div>

        {/* Center Battle Controls & Clock */}
        <div className="col-span-4 flex flex-col items-center justify-center gap-1.5 border-x border-slate-800/80 px-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold font-mono text-amber-300 tabular-nums">
              {formatTime(matchTime)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onTogglePause}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 transition-colors"
              title={isPaused ? '게임 재개' : '일시정지 (P)'}
              aria-label="Pause or Resume"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onChangeSpeed}
              className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1"
              title="게임 배속 전환"
            >
              <FastForward className="w-3 h-3 text-amber-400" />
              <span>{gameSpeed}x</span>
            </button>

            <button
              onClick={onToggleSfx}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 transition-colors"
              title="효과음 토글"
              aria-label="SFX Toggle"
            >
              {sfxEnabled ? <Volume2 className="w-3.5 h-3.5 text-sky-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            <button
              onClick={onToggleBgm}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 transition-colors"
              title="배경음악 토글"
              aria-label="BGM Toggle"
            >
              <Music className={`w-3.5 h-3.5 ${bgmEnabled ? 'text-amber-400' : 'text-slate-500'}`} />
            </button>
          </div>
        </div>

        {/* Enemy Status */}
        <div className="col-span-4 flex flex-col gap-1.5 text-right">
          <div className="flex items-center justify-between flex-row-reverse">
            <span className="text-sm font-bold text-rose-400 whitespace-nowrap">
              {enemyFortress.name}
            </span>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              HP {Math.ceil(enemyFortress.hp)}/{enemyFortress.maxHp}
            </span>
          </div>

          {/* Enemy HP Bar */}
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex flex-row-reverse">
            <div
              className="h-full bg-rose-500 transition-all duration-150"
              style={{
                width: `${Math.max(0, Math.min(100, (enemyFortress.hp / enemyFortress.maxHp) * 100))}%`,
              }}
            />
          </div>

          {/* Enemy Shield Bar */}
          <div className="flex items-center gap-2 flex-row-reverse">
            <Shield className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex flex-row-reverse">
              <div
                className="h-full bg-rose-400 transition-all duration-150"
                style={{
                  width: `${Math.max(0, Math.min(100, (enemyFortress.shield / enemyFortress.maxShield) * 100))}%`,
                }}
              />
            </div>
            <span className="text-[10px] font-mono text-rose-400 tabular-nums shrink-0">
              {Math.ceil(enemyFortress.shield)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Deck & Mana Control */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 backdrop-blur-md flex flex-col gap-2.5">
        {/* Mana Bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            <span className="text-xs font-bold text-cyan-300">에테르 마나</span>
            <span className="text-xs font-mono font-bold text-white tabular-nums">
              {mana.toFixed(1)} / {maxMana}
            </span>
            <span className="text-[11px] text-cyan-400/80 font-mono">
              (+{manaRegenRate.toFixed(1)}/s)
            </span>
          </div>

          {/* Segmented Mana Bar */}
          <div className="flex-1 flex gap-1 h-3.5 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            {Array.from({ length: maxMana }).map((_, idx) => {
              const fillRatio = Math.max(0, Math.min(1, mana - idx));
              return (
                <div key={idx} className="flex-1 bg-slate-800 rounded-sm overflow-hidden relative">
                  <div
                    className="h-full bg-cyan-400 shadow-sm transition-all duration-75"
                    style={{ width: `${fillRatio * 100}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Mega Hyper-Cannon Button */}
          <button
            onClick={onFireMegaCannon}
            disabled={!isMegaReady}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
              isMegaReady
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/30 hover:brightness-110 animate-pulse'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
            }`}
            title="천공 하이퍼 빔 발사 (단축키: 스페이스바)"
          >
            <span>천공포</span>
            <span className="font-mono tabular-nums">
              {playerFortress.megaCannonCharge.toFixed(0)}%
            </span>
            <kbd className="hidden sm:inline-block px-1 py-0.5 text-[10px] bg-black/40 rounded">
              Space
            </kbd>
          </button>
        </div>

        {/* Card Row */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {cards.map((card, idx) => {
            const hotkey = idx + 1;
            const cd = cooldowns[card.id] || 0;
            const hasMana = mana >= card.cost;
            const isReady = cd <= 0 && hasMana;
            const isSelected = selectedSpellId === card.id;

            return (
              <button
                key={card.id}
                onClick={() => onSelectCard(card)}
                disabled={cd > 0 || !hasMana}
                className={`relative group flex flex-col items-center justify-between p-2 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/10 shadow-md ring-2 ring-amber-400/50'
                    : isReady
                      ? 'border-slate-700 bg-slate-800/80 hover:border-cyan-400 hover:bg-slate-750'
                      : 'border-slate-800 bg-slate-900/60 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Hotkey Tag */}
                <span className="absolute top-1 left-1.5 text-[10px] font-mono font-bold text-slate-400 group-hover:text-cyan-300">
                  {hotkey}
                </span>

                {/* Cost Pill */}
                <div className="absolute top-1 right-1 px-1.5 py-0.2 bg-cyan-950/80 border border-cyan-500/40 rounded text-[10px] font-mono font-bold text-cyan-300 tabular-nums">
                  {card.cost}
                </div>

                {/* Card Icon */}
                <div className="mt-3.5 mb-1 text-2xl select-none">{card.icon}</div>

                {/* Card Name */}
                <span className="text-xs font-semibold text-slate-200 text-center truncate w-full">
                  {card.name}
                </span>

                {/* Cooldown Overlay */}
                {cd > 0 && (
                  <div className="absolute inset-0 bg-slate-950/80 rounded-lg flex items-center justify-center backdrop-blur-xs">
                    <span className="text-xs font-mono font-bold text-amber-300 tabular-nums">
                      {cd.toFixed(1)}s
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
