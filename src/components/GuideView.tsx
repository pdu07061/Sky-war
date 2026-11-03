import React from 'react';
import { CardData } from '../types/game';
import { Shield, Zap, Keyboard, HelpCircle, Swords, ArrowRight } from 'lucide-react';

interface GuideViewProps {
  cards: CardData[];
  onStartBattle: () => void;
}

export const GuideView: React.FC<GuideViewProps> = ({ cards, onStartBattle }) => {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
          <span>비행 지침서</span>
          <span aria-hidden="true">·</span>
          <span>전술 사령부 브리핑</span>
        </div>
        <h2 className="text-2xl font-bold text-white font-display">
          천공대전 전술 교본 및 함선 도감
        </h2>
        <p className="text-sm text-slate-400">
          천공대전은 부유하는 천공 요새를 지키면서 상대 요새를 파괴하는 실시간 공중 전략 게임입니다.
        </p>
      </div>

      {/* Quick Core Rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg w-fit">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">1. 에테르 마나 관리</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            시간이 지남에 따라 에테르 마나가 충전됩니다. 경량 요격기로 적을 견제하고 마나를 모아 중장갑 전함이나 급강하 폭격기를 편대 출격시키십시오.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg w-fit">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">2. 상성과 방벽 활용</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            요격기는 폭격기에 강하고, 중포격 드레드노트는 압도적 화력으로 적 요새를 타격합니다. 아이기스 수호정은 아군 편대의 피해를 흡수합니다.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg w-fit">
            <Swords className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">3. 천공 하이퍼 빔</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            전투 중 요새 에너지가 100% 충전되면 [스페이스바]로 일직선 상의 모든 적 함선과 적 요새를 일격에 관통하는 하이퍼 빔을 발사할 수 있습니다.
          </p>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-sky-400" />
          <h3 className="font-bold text-white text-sm">단축키 안내</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 p-2 bg-slate-950/80 rounded-lg border border-slate-800">
            <kbd className="px-2 py-0.5 bg-slate-800 font-mono font-bold text-cyan-300 rounded">1 ~ 8</kbd>
            <span className="text-slate-300">카드 선택 / 출격</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-950/80 rounded-lg border border-slate-800">
            <kbd className="px-2 py-0.5 bg-slate-800 font-mono font-bold text-amber-300 rounded">Space</kbd>
            <span className="text-slate-300">천공 하이퍼포 발사</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-950/80 rounded-lg border border-slate-800">
            <kbd className="px-2 py-0.5 bg-slate-800 font-mono font-bold text-emerald-300 rounded">P</kbd>
            <span className="text-slate-300">일시정지 / 재개</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-950/80 rounded-lg border border-slate-800">
            <kbd className="px-2 py-0.5 bg-slate-800 font-mono font-bold text-rose-300 rounded">우클릭</kbd>
            <span className="text-slate-300">주문 시전 취소</span>
          </div>
        </div>
      </div>

      {/* Unit Roster Reference */}
      <div className="flex flex-col gap-3">
        <h3 className="font-bold text-white text-base font-display">함대 유닛 및 전술 주문 제원표</h3>
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-2.5 px-4 font-semibold">이름</th>
                <th className="py-2.5 px-3 font-semibold">유형</th>
                <th className="py-2.5 px-3 font-semibold">마나 소모</th>
                <th className="py-2.5 px-3 font-semibold">체력</th>
                <th className="py-2.5 px-3 font-semibold">공격력</th>
                <th className="py-2.5 px-4 font-semibold">특징 및 전략적 역할</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40 text-slate-200 font-mono-numbers">
              {cards.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                    <span className="text-lg">{c.icon}</span>
                    <span className="font-sans font-semibold text-white">{c.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-sans">
                    {c.type === 'unit' ? '비행선' : '전술 주문'}
                  </td>
                  <td className="py-2.5 px-3 text-cyan-400 font-bold">{c.cost}</td>
                  <td className="py-2.5 px-3 text-emerald-400">{c.hp > 0 ? c.hp : '-'}</td>
                  <td className="py-2.5 px-3 text-amber-400">{c.damage > 0 ? c.damage : '-'}</td>
                  <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px] leading-relaxed">
                    {c.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Start Battle CTA */}
      <div className="flex justify-center pt-2 pb-6">
        <button
          onClick={onStartBattle}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/20 hover:brightness-110 transition-all flex items-center gap-2"
        >
          <span>지금 바로 천공대전 출격하기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
