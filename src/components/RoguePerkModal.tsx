import React from 'react';
import { RoguePerk } from '../types/game';
import { Sparkles, ArrowRight } from 'lucide-react';

interface RoguePerkModalProps {
  isOpen: boolean;
  perks: RoguePerk[];
  currentWave: number;
  onSelectPerk: (perk: RoguePerk) => void;
}

export const RoguePerkModal: React.FC<RoguePerkModalProps> = ({
  isOpen,
  perks,
  currentWave,
  onSelectPerk,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 max-w-xl w-full shadow-2xl flex flex-col gap-5">
        <div className="text-center flex flex-col items-center gap-1.5">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-full w-fit">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">
            WAVE {currentWave} 돌파 보상
          </span>
          <h3 className="text-xl font-bold text-white font-display">
            전술 강화 특전 (Perk) 선택
          </h3>
          <p className="text-xs text-slate-400">
            수호전을 지속할 강력한 천공 마도 특전 하나를 수락하십시오.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {perks.map((perk) => (
            <button
              key={perk.id}
              onClick={() => onSelectPerk(perk)}
              className="group p-4 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-400/80 rounded-xl transition-all flex items-center justify-between text-left gap-4"
            >
              <div className="flex items-center gap-3.5">
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {perk.icon}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                    {perk.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {perk.description}
                  </p>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-amber-500 text-slate-400 group-hover:text-slate-950 transition-all shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
