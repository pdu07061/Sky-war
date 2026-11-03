import React from 'react';
import { Trophy, Skull, Coins, Sparkles, RotateCcw, ArrowRight } from 'lucide-react';

interface BattleResultModalProps {
  isOpen: boolean;
  isVictory: boolean;
  battleMode: string;
  earnedGold: number;
  earnedCrystals: number;
  unitsDefeated: number;
  matchTime: number;
  onPlayAgain: () => void;
  onGoToHangar: () => void;
}

export const BattleResultModal: React.FC<BattleResultModalProps> = ({
  isOpen,
  isVictory,
  battleMode,
  earnedGold,
  earnedCrystals,
  unitsDefeated,
  matchTime,
  onPlayAgain,
  onGoToHangar,
}) => {
  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}분 ${secs}초`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div
        className={`bg-slate-900 border rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center gap-5 text-center ${
          isVictory ? 'border-amber-500/50 shadow-amber-500/10' : 'border-rose-500/50 shadow-rose-500/10'
        }`}
      >
        {/* Icon Header */}
        <div
          className={`p-4 rounded-full ${
            isVictory ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
          }`}
        >
          {isVictory ? <Trophy className="w-10 h-10 animate-bounce" /> : <Skull className="w-10 h-10" />}
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-mono font-bold text-slate-400">
            {battleMode} 전투 종료
          </span>
          <h3 className="text-2xl font-black text-white font-display">
            {isVictory ? '천공 대승리!' : '요새 방벽 함락'}
          </h3>
          <p className="text-xs text-slate-400">
            {isVictory
              ? '창공의 패권을 거머쥐었습니다! 적 함선단이 궤멸되었습니다.'
              : '요새의 에테르 코어가 파괴되었습니다. 함대를 정비하고 다시 도전하십시오.'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5 bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-slate-500">격추한 적 함선</span>
            <span className="font-mono font-bold text-base text-white tabular-nums">
              {unitsDefeated} 척
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-slate-500">전투 소요 시간</span>
            <span className="font-mono font-bold text-base text-white tabular-nums">
              {formatTime(matchTime)}
            </span>
          </div>

          <div className="col-span-2 pt-2 border-t border-slate-800/80 flex items-center justify-around">
            <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold">
              <Coins className="w-4 h-4" />
              <span>+{earnedGold} G</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold">
              <Sparkles className="w-4 h-4" />
              <span>+{earnedCrystals} 크리스탈</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-2">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>재도전하기</span>
          </button>
          <button
            onClick={onGoToHangar}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <span>격납고 정비</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
