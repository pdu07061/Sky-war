export type GameMode = 'SKIRMISH' | 'CAMPAIGN' | 'DEFENSE' | 'HANGAR' | 'GUIDE';

export type UnitRole =
  | 'interceptor'
  | 'valkyrie'
  | 'dreadnought'
  | 'bomber'
  | 'guardian'
  | 'storm_frigate'
  | 'direct_strike'
  | 'buff'
  | 'heal';

export interface CardData {
  id: string;
  name: string;
  cost: number;
  type: 'unit' | 'spell';
  role: UnitRole;
  description: string;
  cooldown: number; // in seconds
  hp: number;
  damage: number;
  speed: number;
  range: number;
  attackRate: number; // attack interval in seconds
  icon: string;
  tier: number;
}

export interface ActiveUnit {
  id: string;
  cardId: string;
  name: string;
  team: 'player' | 'enemy';
  role: UnitRole;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  range: number;
  attackCooldown: number; // current timer
  attackInterval: number;
  targetId: string | null;
  targetType: 'unit' | 'fortress' | null;
  size: number;
  angle: number;
  shield?: number;
  maxShield?: number;
  buffTimer?: number;
}

export interface Projectile {
  id: string;
  team: 'player' | 'enemy';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  targetId?: string | null;
  targetType?: 'unit' | 'fortress' | null;
  vx: number;
  vy: number;
  speed: number;
  damage: number;
  type: 'plasma' | 'laser' | 'missile' | 'bomb' | 'lightning' | 'hyper_beam';
  radius: number;
  color: string;
  homing?: boolean;
}

export interface VisualEffect {
  id: string;
  type: 'explosion' | 'shield_hit' | 'heal_aura' | 'thunder_strike' | 'damage_text' | 'smoke';
  x: number;
  y: number;
  duration: number;
  maxDuration: number;
  size?: number;
  color?: string;
  text?: string;
}

export interface FortressState {
  team: 'player' | 'enemy';
  name: string;
  title: string;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  shieldRegenRate: number; // per sec
  lastHitTime: number;
  megaCannonCharge: number; // 0 to 100
  megaCannonFiring: boolean;
  megaCannonTimer: number;
}

export interface PlayerProfile {
  gold: number;
  etherCrystals: number;
  campaignProgress: number; // 0: stage 1 unlocked, 1: stage 2 unlocked, etc.
  endlessHighScore: number;
  wins: number;
  losses: number;
  upgrades: {
    fortressHpLevel: number;
    shieldLevel: number;
    manaCapLevel: number;
    manaRegenLevel: number;
    cannonDamageLevel: number;
  };
  cardLevels: Record<string, number>;
  unlockedRelics: string[];
}

export interface CampaignStage {
  id: number;
  title: string;
  realmName: string;
  description: string;
  bossName: string;
  bossTitle: string;
  bossAvatarDesc: string;
  fortressHp: number;
  fortressShield: number;
  difficulty: '보통' | '어려움' | '지옥';
  enemyUnits: string[];
  rewardGold: number;
  rewardCrystals: number;
  relicDrop?: string;
}

export interface RoguePerk {
  id: string;
  name: string;
  description: string;
  icon: string;
}
