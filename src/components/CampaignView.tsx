import React from 'react';
import { CampaignStage } from '../types/game';
import { Swords, Lock, CheckCircle2, Award, ShieldAlert, Coins, Sparkles } from 'lucide-react';

interface CampaignViewProps {
  stages: CampaignStage[];
  currentProgress: number;
  onSelectStage: (stage: CampaignStage) => void;
}

export const CampaignView: React.FC<CampaignViewProps> = ({
  stages,
  currentProgress,
  onSelectStage,
}) => {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-2">
      {/* Campaign Header */}
      <div className="flex flex-col gap-1 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
          <span>원정 캠페인</span>
          <span aria-hidden="true">·</span>
          <span>천공 제도 해방전</span>
          <span aria-hidden="true">·</span>
          <span>진행도 {currentProgress} / {stages.length} 클리어</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-100 font-display">
          천공의 5대 성역 탈환 작전
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl">
          암운에 침식된 5개의 부유 군도를 수복하고 공허의 군주를 토벌하십시오. 각 관문을 돌파할 때마다
          고대 유물과 에테르 크리스탈이 수여됩니다.
        </p>
      </div>

      {/* Stage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stages.map((stage, idx) => {
          const isUnlocked = idx <= currentProgress;
          const isCompleted = idx < currentProgress;
          const isCurrent = idx === currentProgress;

          return (
            <div
              key={stage.id}
              className={`relative flex flex-col justify-between p-5 rounded-xl border transition-all ${
                isCompleted
                  ? 'bg-slate-900/60 border-emerald-500/30'
                  : isCurrent
                    ? 'bg-slate-900/90 border-amber-500/60 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-60'
              }`}
            >
              {/* Header Status */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-slate-400">
                    STAGE {stage.id.toString().padStart(2, '0')}
                  </span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-xs font-semibold text-slate-300">
                    난이도: {stage.difficulty}
                  </span>
                </div>

                {isCompleted ? (
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>정복 완료</span>
                  </div>
                ) : isCurrent ? (
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-medium">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>진입 가능</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                    <Lock className="w-3.5 h-3.5" />
                    <span>잠김</span>
                  </div>
                )}
              </div>

              {/* Title & Realm */}
              <div className="flex flex-col gap-1 mb-3">
                <h3 className="text-lg font-bold text-white font-display">
                  {stage.realmName}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {stage.description}
                </p>
              </div>

              {/* Boss Information */}
              <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/60 mb-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">지휘관</span>
                  <span className="font-semibold text-rose-300">{stage.bossName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">적 요새 전력</span>
                  <span className="font-mono text-slate-200">
                    HP {stage.fortressHp} / 쉴드 {stage.fortressShield}
                  </span>
                </div>
                {stage.relicDrop && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 pt-1 border-t border-slate-800">
                    <Award className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{stage.relicDrop}</span>
                  </div>
                )}
              </div>

              {/* Rewards & Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 text-amber-400 font-mono">
                    <Coins className="w-3.5 h-3.5" />
                    <span>+{stage.rewardGold}</span>
                  </div>
                  <div className="flex items-center gap-1 text-cyan-400 font-mono">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+{stage.rewardCrystals}</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectStage(stage)}
                  disabled={!isUnlocked}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isUnlocked
                      ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-md hover:shadow-sky-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>{isCompleted ? '재도전' : '출격하기'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
