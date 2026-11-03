import { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameMode,
  CardData,
  ActiveUnit,
  Projectile,
  VisualEffect,
  FortressState,
  PlayerProfile,
  CampaignStage,
  RoguePerk,
} from './types/game';
import {
  BASE_CARDS,
  CAMPAIGN_STAGES,
  ROGUE_PERKS,
  INITIAL_PLAYER_PROFILE,
} from './data/gameData';
import { soundEngine } from './utils/audio';
import { Navbar } from './components/Navbar';
import { SkyBattleCanvas } from './components/SkyBattleCanvas';
import { BattleHUD } from './components/BattleHUD';
import { CampaignView } from './components/CampaignView';
import { DefenseView } from './components/DefenseView';
import { HangarView } from './components/HangarView';
import { GuideView } from './components/GuideView';
import { RoguePerkModal } from './components/RoguePerkModal';
import { BattleResultModal } from './components/BattleResultModal';

const PROFILE_STORAGE_KEY = 'skyclash_celestial_profile_v1';

export default function App() {
  // 1. Persistent Player Profile
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PLAYER_PROFILE;
  });

  const saveProfile = useCallback((newProfile: PlayerProfile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
    } catch {}
  }, []);

  // 2. Navigation Mode
  const [currentMode, setCurrentMode] = useState<GameMode>('SKIRMISH');
  const [activeCampaignStage, setActiveCampaignStage] = useState<CampaignStage | null>(null);
  const [isEndlessMode, setIsEndlessMode] = useState<boolean>(false);

  // 3. Audio & Speed Controls
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);
  const [bgmEnabled, setBgmEnabled] = useState<boolean>(false);
  const [gameSpeed, setGameSpeed] = useState<number>(1.0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<number>(0);

  // 4. Battle State
  const [matchTime, setMatchTime] = useState<number>(0);
  const [unitsDefeated, setUnitsDefeated] = useState<number>(0);
  const [currentWave, setCurrentWave] = useState<number>(1);
  const [waveTimer, setWaveTimer] = useState<number>(20);
  const [activePerks, setActivePerks] = useState<RoguePerk[]>([]);
  const [showPerkModal, setShowPerkModal] = useState<boolean>(false);
  const [perkOptions, setPerkOptions] = useState<RoguePerk[]>([]);

  // Fortress States
  const [playerFortress, setPlayerFortress] = useState<FortressState>({
    team: 'player',
    name: '아이기스 천공성',
    title: '연합 총기함 요새',
    hp: 2500,
    maxHp: 2500,
    shield: 600,
    maxShield: 600,
    shieldRegenRate: 15,
    lastHitTime: 0,
    megaCannonCharge: 0,
    megaCannonFiring: false,
    megaCannonTimer: 0,
  });

  const [enemyFortress, setEnemyFortress] = useState<FortressState>({
    team: 'enemy',
    name: '심연의 비공 요새',
    title: '공적 연합 요격 기지',
    hp: 2500,
    maxHp: 2500,
    shield: 600,
    maxShield: 600,
    shieldRegenRate: 12,
    lastHitTime: 0,
    megaCannonCharge: 0,
    megaCannonFiring: false,
    megaCannonTimer: 0,
  });

  // Mana & Cards
  const maxMana = 10 + (profile.upgrades.manaCapLevel - 1);
  const manaRegenRate = 1.0 + (profile.upgrades.manaRegenLevel - 1) * 0.15;
  const [mana, setMana] = useState<number>(5);
  const [enemyMana, setEnemyMana] = useState<number>(5);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [selectedSpell, setSelectedSpell] = useState<CardData | null>(null);

  // Active Battlefield Entities
  const [units, setUnits] = useState<ActiveUnit[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [visualEffects, setVisualEffects] = useState<VisualEffect[]>([]);

  // Result Modal
  const [battleResult, setBattleResult] = useState<{
    isOpen: boolean;
    isVictory: boolean;
    earnedGold: number;
    earnedCrystals: number;
  }>({
    isOpen: false,
    isVictory: false,
    earnedGold: 0,
    earnedCrystals: 0,
  });

  // Reference for game loop tick access
  const stateRef = useRef({
    units,
    projectiles,
    visualEffects,
    playerFortress,
    enemyFortress,
    mana,
    enemyMana,
    cooldowns,
    matchTime,
    isPaused,
    gameSpeed,
    activePerks,
    isEndlessMode,
    currentWave,
    waveTimer,
    unitsDefeated,
    battleResult,
    showPerkModal,
    activeCampaignStage,
    profile,
  });

  useEffect(() => {
    stateRef.current = {
      units,
      projectiles,
      visualEffects,
      playerFortress,
      enemyFortress,
      mana,
      enemyMana,
      cooldowns,
      matchTime,
      isPaused,
      gameSpeed,
      activePerks,
      isEndlessMode,
      currentWave,
      waveTimer,
      unitsDefeated,
      battleResult,
      showPerkModal,
      activeCampaignStage,
      profile,
    };
  });

  // Initialize or Reset Battle
  const initBattle = useCallback(
    (stage?: CampaignStage | null, endless = false) => {
      const hpBoost = (profile.upgrades.fortressHpLevel - 1) * 400;
      const shieldBoost = (profile.upgrades.shieldLevel - 1) * 150;
      const playerBaseHp = 2500 + hpBoost;
      const playerBaseShield = 600 + shieldBoost;

      let enemyName = '심연의 비공 요새';
      let enemyTitle = '공적 연합 요격 기지';
      let enemyHp = 2500;
      let enemyShield = 600;

      if (stage) {
        enemyName = stage.realmName;
        enemyTitle = `${stage.bossName} (${stage.bossTitle})`;
        enemyHp = stage.fortressHp;
        enemyShield = stage.fortressShield;
      } else if (endless) {
        enemyName = '무한 공적 함대 방어선';
        enemyTitle = '끝없는 침략의 성운';
        enemyHp = 3000;
        enemyShield = 800;
      }

      setPlayerFortress({
        team: 'player',
        name: '아이기스 천공성',
        title: '연합 총기함 요새',
        hp: playerBaseHp,
        maxHp: playerBaseHp,
        shield: playerBaseShield,
        maxShield: playerBaseShield,
        shieldRegenRate: 15,
        lastHitTime: 0,
        megaCannonCharge: 0,
        megaCannonFiring: false,
        megaCannonTimer: 0,
      });

      setEnemyFortress({
        team: 'enemy',
        name: enemyName,
        title: enemyTitle,
        hp: enemyHp,
        maxHp: enemyHp,
        shield: enemyShield,
        maxShield: enemyShield,
        shieldRegenRate: 12,
        lastHitTime: 0,
        megaCannonCharge: 0,
        megaCannonFiring: false,
        megaCannonTimer: 0,
      });

      setUnits([]);
      setProjectiles([]);
      setVisualEffects([]);
      setMana(5);
      setEnemyMana(5);
      setCooldowns({});
      setSelectedSpell(null);
      setMatchTime(0);
      setUnitsDefeated(0);
      setCurrentWave(1);
      setWaveTimer(18);
      setActivePerks([]);
      setShowPerkModal(false);
      setIsPaused(false);
      setBattleResult({
        isOpen: false,
        isVictory: false,
        earnedGold: 0,
        earnedCrystals: 0,
      });

      setActiveCampaignStage(stage || null);
      setIsEndlessMode(endless);
      setCurrentMode('SKIRMISH');
    },
    [profile]
  );

  // Deploy Unit
  const deployUnit = useCallback(
    (card: CardData, team: 'player' | 'enemy', customY?: number) => {
      const isPlayer = team === 'player';
      const cardLevel = profile.cardLevels[card.id] || 1;
      const levelMultiplier = 1 + (cardLevel - 1) * 0.1;

      // Check perk buffs
      const hasEngineBuff = isPlayer && activePerks.some((p) => p.id === 'overclock_turbines');
      const hasDmgBuff = isPlayer && activePerks.some((p) => p.id === 'heavy_plasma_cores');

      const speed = card.speed * (hasEngineBuff ? 1.2 : 1.0);
      const damage = Math.round(card.damage * levelMultiplier * (hasDmgBuff ? 1.18 : 1.0));
      const hp = Math.round(card.hp * levelMultiplier);

      const spawnX = isPlayer ? 100 : 900;
      const spawnY = customY || Math.random() * 320 + 100;
      const angle = isPlayer ? 0 : Math.PI;

      const newUnit: ActiveUnit = {
        id: `unit_${Date.now()}_${Math.random()}`,
        cardId: card.id,
        name: card.name,
        team,
        role: card.role,
        x: spawnX,
        y: spawnY,
        vx: isPlayer ? speed : -speed,
        vy: 0,
        hp,
        maxHp: hp,
        damage,
        speed,
        range: card.range,
        attackCooldown: 0.2,
        attackInterval: card.attackRate,
        targetId: null,
        targetType: null,
        size: card.role === 'dreadnought' ? 22 : card.role === 'bomber' ? 18 : 14,
        angle,
      };

      setUnits((prev) => [...prev, newUnit]);
      if (isPlayer) {
        soundEngine.playDeploy();
      }
    },
    [profile, activePerks]
  );

  // Cast Spell
  const executeSpell = useCallback(
    (card: CardData, targetX: number, targetY: number) => {
      if (card.id === 'thunder_strike') {
        soundEngine.playThunder();
        setScreenShake(12);

        // Thunder Visual Effect
        setVisualEffects((prev) => [
          ...prev,
          {
            id: `thunder_${Date.now()}`,
            type: 'thunder_strike',
            x: targetX,
            y: targetY,
            duration: 0.6,
            maxDuration: 0.6,
          },
        ]);

        // Deal Area Damage to all enemies in range
        const radius = card.range || 120;
        const dmg = Math.round(card.damage * (1 + ((profile.cardLevels[card.id] || 1) - 1) * 0.12));

        setUnits((prev) =>
          prev.map((unit) => {
            if (unit.team === 'enemy') {
              const dist = Math.hypot(unit.x - targetX, unit.y - targetY);
              if (dist <= radius) {
                return { ...unit, hp: unit.hp - dmg };
              }
            }
            return unit
          })
        );

        // Damage enemy fortress if within range
        const distToEnemyFortress = Math.hypot(920 - targetX, 281 - targetY);
        if (distToEnemyFortress <= radius + 60) {
          setEnemyFortress((prev) => {
            let s = prev.shield;
            let h = prev.hp;
            if (s > 0) {
              const absorb = Math.min(s, dmg);
              s -= absorb;
              h -= dmg - absorb;
            } else {
              h -= dmg;
            }
            return { ...prev, shield: Math.max(0, s), hp: Math.max(0, h) };
          });
        }
      } else if (card.id === 'celestial_mending') {
        soundEngine.playHeal();

        // Healing Aura Visual Effect
        setVisualEffects((prev) => [
          ...prev,
          {
            id: `heal_${Date.now()}`,
            type: 'heal_aura',
            x: targetX,
            y: targetY,
            duration: 0.8,
            maxDuration: 0.8,
          },
        ]);

        const radius = card.range || 150;
        const healAmt = 280;

        setUnits((prev) =>
          prev.map((unit) => {
            if (unit.team === 'player') {
              const dist = Math.hypot(unit.x - targetX, unit.y - targetY);
              if (dist <= radius) {
                return { ...unit, hp: Math.min(unit.maxHp, unit.hp + healAmt) };
              }
            }
            return unit;
          })
        );

        // Heal player fortress if in range
        const distToPlayerFortress = Math.hypot(80 - targetX, 281 - targetY);
        if (distToPlayerFortress <= radius + 60) {
          setPlayerFortress((prev) => ({
            ...prev,
            hp: Math.min(prev.maxHp, prev.hp + healAmt),
          }));
        }
      }
    },
    [profile]
  );

  // Player clicks a Card in the HUD Deck
  const handleSelectCard = useCallback(
    (card: CardData) => {
      const cd = cooldowns[card.id] || 0;
      if (cd > 0 || mana < card.cost) return;

      if (card.type === 'spell') {
        setSelectedSpell(card);
      } else {
        // Deploy directly to random air lane
        setMana((prev) => Math.max(0, prev - card.cost));
        setCooldowns((prev) => ({ ...prev, [card.id]: card.cooldown }));
        deployUnit(card, 'player');
      }
    },
    [cooldowns, mana, deployUnit]
  );

  // Cast selected spell on target coordinates
  const handleCastSpell = useCallback(
    (x: number, y: number) => {
      if (!selectedSpell) return;
      if (mana < selectedSpell.cost) {
        setSelectedSpell(null);
        return;
      }

      setMana((prev) => Math.max(0, prev - selectedSpell.cost));
      setCooldowns((prev) => ({ ...prev, [selectedSpell.id]: selectedSpell.cooldown }));
      executeSpell(selectedSpell, x, y);
      setSelectedSpell(null);
    },
    [selectedSpell, mana, executeSpell]
  );

  // Fire Mega Hyper Cannon
  const handleFireMegaCannon = useCallback(() => {
    if (playerFortress.megaCannonCharge < 100 || playerFortress.megaCannonFiring) return;

    soundEngine.playHyperBeam();
    setScreenShake(24);

    const dmgMultiplier = 1 + (profile.upgrades.cannonDamageLevel - 1) * 0.2;
    const baseDamage = Math.round(1350 * dmgMultiplier);

    setPlayerFortress((prev) => ({
      ...prev,
      megaCannonFiring: true,
      megaCannonTimer: 1.2,
      megaCannonCharge: 0,
    }));

    // Disintegrate enemy units in horizontal beam line (y between 180 and 380)
    setUnits((prev) =>
      prev.filter((unit) => {
        if (unit.team === 'enemy' && unit.y >= 160 && unit.y <= 400) {
          soundEngine.playExplosion(true);
          return false;
        }
        return true;
      })
    );

    // Blast enemy fortress
    setEnemyFortress((prev) => {
      let s = prev.shield;
      let h = prev.hp;
      if (s > 0) {
        const absorb = Math.min(s, baseDamage);
        s -= absorb;
        h -= baseDamage - absorb;
      } else {
        h -= baseDamage;
      }
      return { ...prev, shield: Math.max(0, s), hp: Math.max(0, h) };
    });
  }, [playerFortress, profile]);

  // Keyboard Shortcuts (1-8 cards, Space for Mega Cannon, P for Pause, Esc to cancel spell)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key >= '1' && e.key <= '8') {
        const idx = parseInt(e.key, 10) - 1;
        if (idx >= 0 && idx < BASE_CARDS.length) {
          handleSelectCard(BASE_CARDS[idx]);
        }
      } else if (e.code === 'Space') {
        e.preventDefault();
        handleFireMegaCannon();
      } else if (e.key === 'p' || e.key === 'P') {
        setIsPaused((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSelectedSpell(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectCard, handleFireMegaCannon]);

  // Enemy AI Logic Tick
  const runEnemyAITick = useCallback(
    (dt: number) => {
      setEnemyMana((prev) => {
        const newMana = Math.min(10, prev + 0.95 * dt);

        // AI Spawning Decision
        if (newMana >= 3.0 && Math.random() < 0.035 * dt * 60) {
          const availableCards = BASE_CARDS.filter((c) => c.cost <= newMana);
          if (availableCards.length > 0) {
            const picked = availableCards[Math.floor(Math.random() * availableCards.length)];

            if (picked.type === 'unit') {
              deployUnit(picked, 'enemy');
              return newMana - picked.cost;
            } else if (picked.id === 'thunder_strike' && Math.random() < 0.4) {
              // Enemy fires thunder at player fleet
              const pUnits = stateRef.current.units.filter((u) => u.team === 'player');
              if (pUnits.length > 0) {
                const targetUnit = pUnits[Math.floor(Math.random() * pUnits.length)];
                executeSpell(picked, targetUnit.x, targetUnit.y);
                return newMana - picked.cost;
              }
            }
          }
        }
        return newMana;
      });

      // AI Mega Cannon charge
      setEnemyFortress((prev) => {
        let charge = prev.megaCannonCharge + 1.2 * dt;
        let isFiring = prev.megaCannonFiring;
        let timer = prev.megaCannonTimer;

        if (timer > 0) {
          timer -= dt;
          if (timer <= 0) isFiring = false;
        }

        if (charge >= 100 && !isFiring) {
          // AI Fires cannon!
          soundEngine.playHyperBeam();
          setScreenShake(18);
          charge = 0;
          isFiring = true;
          timer = 1.2;

          // Damage player fortress
          setPlayerFortress((p) => {
            let s = p.shield;
            let h = p.hp;
            const dmg = 850;
            if (s > 0) {
              const absorb = Math.min(s, dmg);
              s -= absorb;
              h -= dmg - absorb;
            } else {
              h -= dmg;
            }
            return { ...p, shield: Math.max(0, s), hp: Math.max(0, h) };
          });
        }

        return {
          ...prev,
          megaCannonCharge: Math.min(100, charge),
          megaCannonFiring: isFiring,
          megaCannonTimer: timer,
        };
      });
    },
    [deployUnit, executeSpell]
  );

  // Main 60FPS Game Loop
  useEffect(() => {
    let lastTime = performance.now();
    let frameId: number;

    const gameLoop = (now: number) => {
      const rawDt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      const state = stateRef.current;
      if (!state.isPaused && !state.battleResult.isOpen && !state.showPerkModal) {
        const dt = rawDt * state.gameSpeed;

        // 1. Advance Match Time
        setMatchTime((prev) => prev + dt);

        // 2. Shield Regenerations
        setPlayerFortress((prev) => {
          let s = prev.shield;
          if (s < prev.maxShield) {
            s = Math.min(prev.maxShield, s + prev.shieldRegenRate * dt);
          }
          let charge = prev.megaCannonCharge + 1.8 * dt;
          let firing = prev.megaCannonFiring;
          let timer = prev.megaCannonTimer;
          if (timer > 0) {
            timer -= dt;
            if (timer <= 0) firing = false;
          }
          return {
            ...prev,
            shield: s,
            megaCannonCharge: Math.min(100, charge),
            megaCannonFiring: firing,
            megaCannonTimer: timer,
          };
        });

        setEnemyFortress((prev) => {
          let s = prev.shield;
          if (s < prev.maxShield) {
            s = Math.min(prev.maxShield, s + prev.shieldRegenRate * dt);
          }
          return { ...prev, shield: s };
        });

        // 3. Player Mana Regen
        setMana((prev) => Math.min(maxMana, prev + manaRegenRate * dt));

        // 4. Cooldowns Decays
        setCooldowns((prev) => {
          const next: Record<string, number> = {};
          for (const key in prev) {
            if (prev[key] > 0) {
              next[key] = Math.max(0, prev[key] - dt);
            }
          }
          return next;
        });

        // 5. Screen Shake decay
        setScreenShake((prev) => Math.max(0, prev - dt * 25));

        // 6. Run AI
        runEnemyAITick(dt);

        // 7. Endless wave timer
        if (state.isEndlessMode) {
          setWaveTimer((prev) => {
            const next = prev - dt;
            if (next <= 0) {
              // Trigger next wave
              setCurrentWave((w) => {
                const nextW = w + 1;
                // Wave clear check for perks (every 3 waves)
                if (nextW % 3 === 0) {
                  // Show perk modal
                  const shuffled = [...ROGUE_PERKS].sort(() => 0.5 - Math.random());
                  setPerkOptions(shuffled.slice(0, 3));
                  setShowPerkModal(true);
                }
                // Spawn wave ships
                for (let i = 0; i < Math.min(7, 2 + nextW); i++) {
                  setTimeout(() => {
                    const card = BASE_CARDS[Math.floor(Math.random() * BASE_CARDS.length)];
                    if (card.type === 'unit') {
                      deployUnit(card, 'enemy');
                    }
                  }, i * 400);
                }
                return nextW;
              });
              return 22;
            }
            return next;
          });
        }

        // 8. Update Units (Movement, Targeting, Attacks)
        setUnits((currentUnits) => {
          const updatedUnits = currentUnits.map((unit) => {
            let { x, y, hp, attackCooldown, angle } = unit;
            const isPlayer = unit.team === 'player';

            // Find closest opposing target
            let targetX = isPlayer ? 920 : 80;
            let targetY = 281;
            let targetDist = Math.hypot(targetX - x, targetY - y);
            let hasEnemyUnitTarget = false;

            for (const other of currentUnits) {
              if (other.team !== unit.team) {
                const d = Math.hypot(other.x - x, other.y - y);
                if (d < targetDist) {
                  targetDist = d;
                  targetX = other.x;
                  targetY = other.y;
                  hasEnemyUnitTarget = true;
                }
              }
            }

            // Move towards target if out of range
            if (targetDist > unit.range) {
              const dx = targetX - x;
              const dy = targetY - y;
              const moveAngle = Math.atan2(dy, dx);
              angle = moveAngle;
              x += Math.cos(moveAngle) * unit.speed * dt;
              y += Math.sin(moveAngle) * unit.speed * dt;
            } else {
              // Face target
              angle = Math.atan2(targetY - y, targetX - x);
            }

            // Attack logic
            attackCooldown -= dt;
            if (attackCooldown <= 0 && targetDist <= unit.range + 40) {
              attackCooldown = unit.attackInterval;

              // Fire projectile
              const projType =
                unit.role === 'bomber'
                  ? 'bomb'
                  : unit.role === 'dreadnought'
                    ? 'missile'
                    : 'plasma';
              const projSpeed = unit.role === 'bomber' ? 220 : 380;
              const projColor = isPlayer ? '#38bdf8' : '#f43f5e';

              const dx = targetX - x;
              const dy = targetY - y;
              const pAngle = Math.atan2(dy, dx);

              setProjectiles((p) => [
                ...p,
                {
                  id: `p_${Date.now()}_${Math.random()}`,
                  team: unit.team,
                  x,
                  y,
                  targetX,
                  targetY,
                  vx: Math.cos(pAngle) * projSpeed,
                  vy: Math.sin(pAngle) * projSpeed,
                  speed: projSpeed,
                  damage: unit.damage,
                  type: projType,
                  radius: projType === 'missile' ? 5 : 3.5,
                  color: projColor,
                },
              ]);

              // Audio
              if (unit.role === 'dreadnought') soundEngine.playCannon();
              else soundEngine.playLaser();
            }

            return {
              ...unit,
              x,
              y,
              hp,
              attackCooldown,
              angle,
            };
          });

          // Filter out dead units and award player
          const survivingUnits = updatedUnits.filter((u) => {
            if (u.hp <= 0) {
              soundEngine.playExplosion();
              if (u.team === 'enemy') {
                setUnitsDefeated((c) => c + 1);
                setMana((m) => Math.min(maxMana, m + 0.5));
                setPlayerFortress((f) => ({
                  ...f,
                  megaCannonCharge: Math.min(100, f.megaCannonCharge + 8),
                }));
              }
              // Spawn explosion effect
              setVisualEffects((fx) => [
                ...fx,
                {
                  id: `exp_${Date.now()}_${Math.random()}`,
                  type: 'explosion',
                  x: u.x,
                  y: u.y,
                  duration: 0.45,
                  maxDuration: 0.45,
                  size: u.size * 2,
                },
              ]);
              return false;
            }
            return true;
          });

          return survivingUnits;
        });

        // 9. Update Projectiles
        setProjectiles((currentProj) => {
          const survivingProj: Projectile[] = [];

          currentProj.forEach((p) => {
            const nextX = p.x + p.vx * dt;
            const nextY = p.y + p.vy * dt;

            // Check hit against units of opposing team
            let hit = false;
            const targetTeam = p.team === 'player' ? 'enemy' : 'player';

            // Check opposing fortress
            const opposingFortressX = p.team === 'player' ? 920 : 80;
            const fortressDist = Math.hypot(opposingFortressX - nextX, 281 - nextY);

            if (fortressDist <= 75) {
              hit = true;
              soundEngine.playExplosion(false);

              if (p.team === 'player') {
                setEnemyFortress((prev) => {
                  let s = prev.shield;
                  let h = prev.hp;
                  if (s > 0) {
                    const absorb = Math.min(s, p.damage);
                    s -= absorb;
                    h -= p.damage - absorb;
                  } else {
                    h -= p.damage;
                  }
                  return { ...prev, shield: Math.max(0, s), hp: Math.max(0, h) };
                });
              } else {
                setPlayerFortress((prev) => {
                  let s = prev.shield;
                  let h = prev.hp;
                  if (s > 0) {
                    const absorb = Math.min(s, p.damage);
                    s -= absorb;
                    h -= p.damage - absorb;
                  } else {
                    h -= p.damage;
                  }
                  return { ...prev, shield: Math.max(0, s), hp: Math.max(0, h) };
                });
              }
            }

            // Check units
            if (!hit) {
              setUnits((prevUnits) =>
                prevUnits.map((u) => {
                  if (u.team === targetTeam && !hit) {
                    const d = Math.hypot(u.x - nextX, u.y - nextY);
                    if (d <= u.size + p.radius) {
                      hit = true;
                      soundEngine.playShieldHit();
                      return { ...u, hp: u.hp - p.damage };
                    }
                  }
                  return u;
                })
              );
            }

            // Discard if hit or out of bounds
            if (!hit && nextX >= -50 && nextX <= 1050 && nextY >= -50 && nextY <= 650) {
              survivingProj.push({ ...p, x: nextX, y: nextY });
            }
          });

          return survivingProj;
        });

        // 10. Update Visual Effects
        setVisualEffects((currentFx) =>
          currentFx
            .map((fx) => ({ ...fx, duration: fx.duration - dt }))
            .filter((fx) => fx.duration > 0)
        );

        // 11. Check Victory / Defeat Conditions
        if (state.playerFortress.hp <= 0 && !state.battleResult.isOpen) {
          // Defeat
          soundEngine.playDefeat();
          setBattleResult({
            isOpen: true,
            isVictory: false,
            earnedGold: Math.round(state.unitsDefeated * 25),
            earnedCrystals: 5,
          });
          saveProfile({
            ...state.profile,
            gold: state.profile.gold + Math.round(state.unitsDefeated * 25),
            etherCrystals: state.profile.etherCrystals + 5,
            losses: state.profile.losses + 1,
            endlessHighScore: state.isEndlessMode
              ? Math.max(state.profile.endlessHighScore, state.currentWave)
              : state.profile.endlessHighScore,
          });
        } else if (state.enemyFortress.hp <= 0 && !state.battleResult.isOpen) {
          // Victory
          soundEngine.playVictory();
          let bonusGold = 400 + state.unitsDefeated * 35;
          let bonusCrystals = 15;
          let newProgress = state.profile.campaignProgress;

          if (state.activeCampaignStage) {
            bonusGold = state.activeCampaignStage.rewardGold;
            bonusCrystals = state.activeCampaignStage.rewardCrystals;
            if (state.profile.campaignProgress === state.activeCampaignStage.id - 1) {
              newProgress = state.activeCampaignStage.id;
            }
          }

          setBattleResult({
            isOpen: true,
            isVictory: true,
            earnedGold: bonusGold,
            earnedCrystals: bonusCrystals,
          });

          saveProfile({
            ...state.profile,
            gold: state.profile.gold + bonusGold,
            etherCrystals: state.profile.etherCrystals + bonusCrystals,
            wins: state.profile.wins + 1,
            campaignProgress: newProgress,
          });
        }
      }

      frameId = requestAnimationFrame(gameLoop);
    };

    frameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameId);
  }, [maxMana, manaRegenRate, runEnemyAITick, deployUnit, saveProfile]);

  // Audio Toggles
  const handleToggleSfx = () => {
    const next = soundEngine.toggleSfx();
    setSfxEnabled(next);
  };

  const handleToggleBgm = () => {
    const next = soundEngine.toggleBgm();
    setBgmEnabled(next);
  };

  const handleChangeSpeed = () => {
    setGameSpeed((prev) => (prev === 1.0 ? 1.5 : prev === 1.5 ? 2.0 : 1.0));
  };

  // Hangar Upgrades Handlers
  const handleUpgradeFortress = (
    key: keyof PlayerProfile['upgrades'],
    costGold: number,
    costCrystals: number
  ) => {
    if (profile.gold < costGold || profile.etherCrystals < costCrystals) return;
    saveProfile({
      ...profile,
      gold: profile.gold - costGold,
      etherCrystals: profile.etherCrystals - costCrystals,
      upgrades: {
        ...profile.upgrades,
        [key]: profile.upgrades[key] + 1,
      },
    });
  };

  const handleUpgradeCard = (cardId: string, costGold: number) => {
    if (profile.gold < costGold) return;
    const curLevel = profile.cardLevels[cardId] || 1;
    saveProfile({
      ...profile,
      gold: profile.gold - costGold,
      cardLevels: {
        ...profile.cardLevels,
        [cardId]: curLevel + 1,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Universal Top Bar */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        onQuickBattle={() => initBattle(null, false)}
      />

      {/* Main App Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
        {/* SKIRMISH / BATTLE VIEW */}
        {currentMode === 'SKIRMISH' && (
          <div className="flex flex-col gap-3">
            {/* Battlefield Canvas */}
            <SkyBattleCanvas
              playerFortress={playerFortress}
              enemyFortress={enemyFortress}
              units={units}
              projectiles={projectiles}
              visualEffects={visualEffects}
              selectedSpell={
                selectedSpell
                  ? {
                      id: selectedSpell.id,
                      name: selectedSpell.name,
                      range: selectedSpell.range,
                      icon: selectedSpell.icon,
                    }
                  : null
              }
              onCastSpell={handleCastSpell}
              onCancelSpell={() => setSelectedSpell(null)}
              screenShake={screenShake}
            />

            {/* Tactical Control HUD */}
            <BattleHUD
              playerFortress={playerFortress}
              enemyFortress={enemyFortress}
              cards={BASE_CARDS}
              mana={mana}
              maxMana={maxMana}
              manaRegenRate={manaRegenRate}
              cooldowns={cooldowns}
              selectedSpellId={selectedSpell?.id || null}
              onSelectCard={handleSelectCard}
              onFireMegaCannon={handleFireMegaCannon}
              matchTime={matchTime}
              isPaused={isPaused}
              gameSpeed={gameSpeed}
              onTogglePause={() => setIsPaused((prev) => !prev)}
              onChangeSpeed={handleChangeSpeed}
              sfxEnabled={sfxEnabled}
              bgmEnabled={bgmEnabled}
              onToggleSfx={handleToggleSfx}
              onToggleBgm={handleToggleBgm}
            />
          </div>
        )}

        {/* CAMPAIGN VIEW */}
        {currentMode === 'CAMPAIGN' && (
          <CampaignView
            stages={CAMPAIGN_STAGES}
            currentProgress={profile.campaignProgress}
            onSelectStage={(stage) => initBattle(stage, false)}
          />
        )}

        {/* DEFENSE VIEW */}
        {currentMode === 'DEFENSE' && (
          <DefenseView
            profile={profile}
            onStartDefense={() => initBattle(null, true)}
          />
        )}

        {/* HANGAR VIEW */}
        {currentMode === 'HANGAR' && (
          <HangarView
            profile={profile}
            cards={BASE_CARDS}
            onUpgradeFortress={handleUpgradeFortress}
            onUpgradeCard={handleUpgradeCard}
          />
        )}

        {/* GUIDE VIEW */}
        {currentMode === 'GUIDE' && (
          <GuideView
            cards={BASE_CARDS}
            onStartBattle={() => initBattle(null, false)}
          />
        )}
      </main>

      {/* Rogue-lite Perk Modal for Endless Mode */}
      <RoguePerkModal
        isOpen={showPerkModal}
        perks={perkOptions}
        currentWave={currentWave}
        onSelectPerk={(perk) => {
          setActivePerks((prev) => [...prev, perk]);
          setShowPerkModal(false);
        }}
      />

      {/* Battle Victory / Defeat Modal */}
      <BattleResultModal
        isOpen={battleResult.isOpen}
        isVictory={battleResult.isVictory}
        battleMode={
          activeCampaignStage
            ? activeCampaignStage.realmName
            : isEndlessMode
              ? `무한 수호전 WAVE ${currentWave}`
              : '실시간 천공 대전'
        }
        earnedGold={battleResult.earnedGold}
        earnedCrystals={battleResult.earnedCrystals}
        unitsDefeated={unitsDefeated}
        matchTime={matchTime}
        onPlayAgain={() => initBattle(activeCampaignStage, isEndlessMode)}
        onGoToHangar={() => {
          setBattleResult((prev) => ({ ...prev, isOpen: false }));
          setCurrentMode('HANGAR');
        }}
      />
    </div>
  );
}
