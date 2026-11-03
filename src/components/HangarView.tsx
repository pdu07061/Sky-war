import React from 'react';
import { PlayerProfile, CardData } from '../types/game';
import { Shield, Zap, Crosshair, Wrench, Award, ChevronUp, Coins, Sparkles } from 'lucide-react';

interface HangarViewProps {
  profile: PlayerProfile;
  cards: CardData[];
  onUpgradeFortress: (upgradeKey: keyof PlayerProfile['upgrades'], costGold: number, costCrystals: number) => void;
  onUpgradeCard: (cardId: string, costGold: number) => void;
}

export const HangarView: React.FC<HangarViewProps> = ({
  profile,
  cards,
  onUpgradeFortress,
  onUpgradeCard,
}) => {
  const [activeTab, setActiveTab] = React.useState<'fortress' | 'cards' | 'relics'>('fortress');

  // Upgrade costs calculation
  const getFortressUpgradeCost = (key: keyof PlayerProfile['upgrades'], currentLevel: number) => {
    switch (key) {
      case 'fortressHpLevel':
        return { gold: currentLevel * 200, crystals: 0 };
      case 'shieldLevel':
        return { gold: currentLevel * 180, crystals: 0 };
      case 'manaCapLevel':
        return { gold: 0, crystals: currentLevel * 15 };
      case 'manaRegenLevel':
        return { gold: currentLevel * 150, crystals: currentLevel * 8 };
      case 'cannonDamageLevel':
        return { gold: currentLevel * 250, crystals: currentLevel * 10 };
    }
  };

  const getCardUpgradeCost = (currentLevel: number) => {
    return currentLevel * 160;
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-2">
      {/* Hangar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
            <span>천공 격납고</span>
            <span aria-hidden="true">·</span>
            <span>함선 정비 및 마도 공학 연구소</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            전술 함대 연구소
          </h2>
        </div>

        {/* Currency Display */}
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-sm">
            <Coins className="w-4 h-4" />
            <span className="tabular-nums">{profile.gold.toLocaleString()} G</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span className="tabular-nums">{profile.etherCrystals.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900/80 rounded-lg border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('fortress')}
          className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'fortress'
              ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          요새 연구 (방어력/마나)
        </button>
        <button
          onClick={() => setActiveTab('cards')}
          className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'cards'
              ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          함대 카드 강화 (유닛/주문)
        </button>
        <button
          onClick={() => setActiveTab('relics')}
          className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'relics'
              ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          고대 유물함 ({profile.unlockedRelics.length})
        </button>
      </div>

      {/* Fortress Upgrades Section */}
      {activeTab === 'fortress' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* HP */}
          <UpgradeCard
            title="선체 장갑 보강"
            description="요새의 기본 내구도(HP)를 대폭 확장합니다."
            currentLevel={profile.upgrades.fortressHpLevel}
            currentValue={`HP +${(profile.upgrades.fortressHpLevel - 1) * 400}`}
            nextValue={`HP +${profile.upgrades.fortressHpLevel * 400}`}
            icon={<Shield className="w-5 h-5 text-emerald-400" />}
            cost={getFortressUpgradeCost('fortressHpLevel', profile.upgrades.fortressHpLevel)}
            canAfford={profile.gold >= getFortressUpgradeCost('fortressHpLevel', profile.upgrades.fortressHpLevel).gold}
            onUpgrade={() => {
              const cost = getFortressUpgradeCost('fortressHpLevel', profile.upgrades.fortressHpLevel);
              onUpgradeFortress('fortressHpLevel', cost.gold, cost.crystals);
            }}
          />

          {/* Shield */}
          <UpgradeCard
            title="아이기스 방벽 투사기"
            description="요새를 보호하는 에테르 쉴드 용량을 증대시킵니다."
            currentLevel={profile.upgrades.shieldLevel}
            currentValue={`쉴드 +${(profile.upgrades.shieldLevel - 1) * 150}`}
            nextValue={`쉴드 +${profile.upgrades.shieldLevel * 150}`}
            icon={<Shield className="w-5 h-5 text-sky-400" />}
            cost={getFortressUpgradeCost('shieldLevel', profile.upgrades.shieldLevel)}
            canAfford={profile.gold >= getFortressUpgradeCost('shieldLevel', profile.upgrades.shieldLevel).gold}
            onUpgrade={() => {
              const cost = getFortressUpgradeCost('shieldLevel', profile.upgrades.shieldLevel);
              onUpgradeFortress('shieldLevel', cost.gold, cost.crystals);
            }}
          />

          {/* Mana Regen */}
          <UpgradeCard
            title="마나 집광 가속로"
            description="전장에서 에테르 마나가 회복되는 초당 속도를 가속합니다."
            currentLevel={profile.upgrades.manaRegenLevel}
            currentValue={`+${(1.0 + (profile.upgrades.manaRegenLevel - 1) * 0.15).toFixed(2)}/s`}
            nextValue={`+${(1.0 + profile.upgrades.manaRegenLevel * 0.15).toFixed(2)}/s`}
            icon={<Zap className="w-5 h-5 text-amber-400" />}
            cost={getFortressUpgradeCost('manaRegenLevel', profile.upgrades.manaRegenLevel)}
            canAfford={
              profile.gold >= getFortressUpgradeCost('manaRegenLevel', profile.upgrades.manaRegenLevel).gold &&
              profile.etherCrystals >= getFortressUpgradeCost('manaRegenLevel', profile.upgrades.manaRegenLevel).crystals
            }
            onUpgrade={() => {
              const cost = getFortressUpgradeCost('manaRegenLevel', profile.upgrades.manaRegenLevel);
              onUpgradeFortress('manaRegenLevel', cost.gold, cost.crystals);
            }}
          />

          {/* Cannon Damage */}
          <UpgradeCard
            title="천공 하이퍼 빔 증폭기"
            description="요새 주포의 충전 속도와 관통 타격 위력을 증가시킵니다."
            currentLevel={profile.upgrades.cannonDamageLevel}
            currentValue={`위력 +${(profile.upgrades.cannonDamageLevel - 1) * 20}%`}
            nextValue={`위력 +${profile.upgrades.cannonDamageLevel * 20}%`}
            icon={<Crosshair className="w-5 h-5 text-rose-400" />}
            cost={getFortressUpgradeCost('cannonDamageLevel', profile.upgrades.cannonDamageLevel)}
            canAfford={
              profile.gold >= getFortressUpgradeCost('cannonDamageLevel', profile.upgrades.cannonDamageLevel).gold &&
              profile.etherCrystals >= getFortressUpgradeCost('cannonDamageLevel', profile.upgrades.cannonDamageLevel).crystals
            }
            onUpgrade={() => {
              const cost = getFortressUpgradeCost('cannonDamageLevel', profile.upgrades.cannonDamageLevel);
              onUpgradeFortress('cannonDamageLevel', cost.gold, cost.crystals);
            }}
          />
        </div>
      )}

      {/* Cards Upgrades Section */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((card) => {
            const level = profile.cardLevels[card.id] || 1;
            const cost = getCardUpgradeCost(level);
            const canAfford = profile.gold >= cost;

            return (
              <div
                key={card.id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{card.icon}</span>
                    <span className="text-xs font-mono font-bold text-sky-400">
                      LV. {level}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white">{card.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {card.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-col gap-1 text-[11px] text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">마나 소모:</span>
                      <span className="font-mono text-cyan-400">{card.cost}</span>
                    </div>
                    {card.type === 'unit' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-400">내구도:</span>
                          <span className="font-mono text-emerald-400">
                            {Math.round(card.hp * (1 + (level - 1) * 0.12))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">공격력:</span>
                          <span className="font-mono text-amber-400">
                            {Math.round(card.damage * (1 + (level - 1) * 0.1))}
                          </span>
                        </div>
                      </>
                    )}
                    {card.type === 'spell' && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">효과 위력:</span>
                        <span className="font-mono text-amber-400">
                          {Math.round((card.damage || 280) * (1 + (level - 1) * 0.12))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onUpgradeCard(card.id, cost)}
                  disabled={!canAfford}
                  className={`mt-4 w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    canAfford
                      ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>레벨업 ({cost} G)</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Relics Section */}
      {activeTab === 'relics' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-base font-bold text-white mb-2 font-display">
            수집된 천공 유물
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            캠페인 관문을 클리어하여 획득한 고대 천공의 유물들입니다. 모든 유물의 효과는 상시 적용됩니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {profile.unlockedRelics.map((relic, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-slate-950/70 border border-amber-500/30 rounded-lg text-xs text-amber-200"
              >
                <Award className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="font-medium">{relic}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface UpgradeCardProps {
  title: string;
  description: string;
  currentLevel: number;
  currentValue: string;
  nextValue: string;
  icon: React.ReactNode;
  cost: { gold: number; crystals: number };
  canAfford: boolean;
  onUpgrade: () => void;
}

const UpgradeCard: React.FC<UpgradeCardProps> = ({
  title,
  description,
  currentLevel,
  currentValue,
  nextValue,
  icon,
  cost,
  canAfford,
  onUpgrade,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg shrink-0">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-white">{title}</h4>
              <span className="text-xs font-mono font-bold text-sky-400">
                LV. {currentLevel}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{description}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs py-2 px-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
        <span className="text-slate-400">현재 수치: <strong className="text-white">{currentValue}</strong></span>
        <span className="text-sky-400">다음 레벨: <strong className="text-cyan-300">{nextValue}</strong></span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <div className="flex items-center gap-3 text-xs">
          {cost.gold > 0 && (
            <div className="flex items-center gap-1 text-amber-400 font-mono">
              <Coins className="w-3.5 h-3.5" />
              <span>{cost.gold} G</span>
            </div>
          )}
          {cost.crystals > 0 && (
            <div className="flex items-center gap-1 text-cyan-400 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{cost.crystals} 크리스탈</span>
            </div>
          )}
        </div>

        <button
          onClick={onUpgrade}
          disabled={!canAfford}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            canAfford
              ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sm'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>연구 업그레이드</span>
        </button>
      </div>
    </div>
  );
};
