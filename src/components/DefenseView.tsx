import React from 'react';
import { PlayerProfile } from '../types/game';
import { Shield, Flame, Award, ArrowRight, Sparkles } from 'lucide-react';

interface DefenseViewProps {
  profile: PlayerProfile;
  onStartDefense: () => void;
}

export const DefenseView: React.FC<DefenseViewProps> = ({ profile, onStartDefense }) => {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
          <span>무한 생존전</span>
          <span aria-hidden="true">·</span>
          <span>천공 요새 방위선 사수</span>
        </div>
        <h2 className="text-2xl font-bold text-white font-display">
          무한 수호전: 최후의 방벽
        </h2>
        <p className="text-sm text-slate-400">
          끊임없이 밀려오는 적 공적 연합과 마도 골렘 비행 선단을 상대로 요새를 지켜내십시오. 웨이브를 격퇴할 때마다
          강력한 로그라이트 특전(Perk)을 획득하여 함대를 강화할 수 있습니다.
        </p>
      </div>

      {/* Record Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">최고 돌파 웨이브</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-amber-400 font-mono tabular-nums">
              WAVE {profile.endlessHighScore}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            최고 기록을 경신하면 대량의 에테르 크리스탈이 지급됩니다.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">특전 누적 시스템</span>
          <div className="flex items-center gap-2 mt-2 text-sky-400 font-bold text-sm">
            <Sparkles className="w-5 h-5 text-sky-400 shrink-0" />
            <span>매 3웨이브마다 특전 선택</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            함포 위력 증가, 터빈 과급, 나노 수리봇 등 다채로운 빌드를 완성하세요.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">전투 보상 비율</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              x{(1 + profile.endlessHighScore * 0.1).toFixed(1)} 배율
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            웨이브가 높아질수록 격추당 골드와 크리스탈 획득량이 증폭됩니다.
          </p>
        </div>
      </div>

      {/* Mode Features */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
        <h3 className="font-bold text-white text-sm font-display flex items-center gap-2">
          <Shield className="w-4 h-4 text-sky-400" />
          <span>수호전 교전 규칙</span>
        </h3>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <li className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
            <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>웨이브가 진행될수록 적 비공정의 체력과 공격력이 점진적으로 강해집니다.</span>
          </li>
          <li className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
            <Award className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>보스급 드레드노트가 5웨이브마다 등장하며, 격퇴 시 즉시 대량의 마나가 완충됩니다.</span>
          </li>
        </ul>
      </div>

      {/* Launch CTA */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onStartDefense}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-sky-500 text-white font-bold text-sm shadow-xl shadow-rose-500/20 hover:brightness-110 transition-all flex items-center gap-2"
        >
          <span>무한 수호전 출격하기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
