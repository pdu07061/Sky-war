import React, { useRef, useEffect, useCallback } from 'react';
import { ActiveUnit, Projectile, VisualEffect, FortressState } from '../types/game';

interface SkyBattleCanvasProps {
  playerFortress: FortressState;
  enemyFortress: FortressState;
  units: ActiveUnit[];
  projectiles: Projectile[];
  visualEffects: VisualEffect[];
  selectedSpell: { id: string; name: string; range: number; icon: string } | null;
  onCastSpell: (x: number, y: number) => void;
  onCancelSpell: () => void;
  screenShake: number;
}

export const SkyBattleCanvas: React.FC<SkyBattleCanvasProps> = ({
  playerFortress,
  enemyFortress,
  units,
  projectiles,
  visualEffects,
  selectedSpell,
  onCastSpell,
  onCancelSpell,
  screenShake,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  // Cloud layers state for parallax drifting
  const cloudsRef = useRef([
    { x: 50, y: 70, scale: 1.2, speed: 0.15 },
    { x: 300, y: 130, scale: 0.9, speed: 0.22 },
    { x: 600, y: 50, scale: 1.5, speed: 0.12 },
    { x: 850, y: 180, scale: 0.8, speed: 0.28 },
    { x: 150, y: 280, scale: 1.1, speed: 0.18 },
    { x: 520, y: 340, scale: 1.4, speed: 0.14 },
    { x: 780, y: 400, scale: 1.0, speed: 0.25 },
  ]);

  // Ambient floating ether motes
  const motesRef = useRef(
    Array.from({ length: 25 }, () => ({
      x: Math.random() * 1000,
      y: Math.random() * 600,
      size: Math.random() * 2.5 + 1,
      speedY: -(Math.random() * 0.4 + 0.2),
      opacity: Math.random() * 0.6 + 0.3,
    }))
  );

  // Track mouse coordinates for spell reticle
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mousePosRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseLeave = () => {
    mousePosRef.current = null;
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedSpell) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    onCastSpell(clickX, clickY);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedSpell) {
      onCancelSpell();
    }
  };

  // Rendering loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.save();

    // Screen Shake effect
    if (screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake * 1.8;
      const shakeY = (Math.random() - 0.5) * screenShake * 1.8;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Sky Gradient (Atmospheric high-altitude twilight)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#090d16');
    skyGrad.addColorStop(0.35, '#0f172a');
    skyGrad.addColorStop(0.7, '#1e1b4b');
    skyGrad.addColorStop(1, '#0c1a2f');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Distant Floating Celestial Isles (Silhouette with glowing waterfalls)
    ctx.save();
    // Island 1 (center-left)
    drawFloatingIsland(ctx, 280, 180, 110, '#131b2e', '#22d3ee');
    // Island 2 (center-right)
    drawFloatingIsland(ctx, 720, 240, 130, '#131828', '#f59e0b');
    // Distant archway
    drawFloatingArch(ctx, 500, 110, '#172033');
    ctx.restore();

    // 3. Drifting Cloud Layers
    ctx.save();
    cloudsRef.current.forEach((cloud) => {
      cloud.x += cloud.speed;
      if (cloud.x > width + 150) {
        cloud.x = -150;
      }
      drawPuffyCloud(ctx, cloud.x, cloud.y, cloud.scale);
    });
    ctx.restore();

    // 4. Floating Ether Motes
    ctx.save();
    motesRef.current.forEach((mote) => {
      mote.y += mote.speedY;
      if (mote.y < -10) {
        mote.y = height + 10;
        mote.x = Math.random() * width;
      }
      ctx.fillStyle = `rgba(56, 189, 248, ${mote.opacity})`;
      ctx.beginPath();
      ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 5. Center battle altitude line (aesthetic grid marker)
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.07)';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(width / 2, 20);
    ctx.lineTo(width / 2, height - 20);
    ctx.stroke();
    ctx.restore();

    // 6. Draw Player Fortress (Left)
    drawFortress(ctx, 80, height / 2, playerFortress, true, height);

    // 7. Draw Enemy Fortress (Right)
    drawFortress(ctx, width - 80, height / 2, enemyFortress, false, height);

    // 8. Draw Active Units
    units.forEach((unit) => {
      drawUnit(ctx, unit);
    });

    // 9. Draw Projectiles
    projectiles.forEach((proj) => {
      drawProjectile(ctx, proj);
    });

    // 10. Draw Visual Effects (Explosions, damage texts, lightning)
    visualEffects.forEach((fx) => {
      drawVisualEffect(ctx, fx);
    });

    // 11. Hyper Beam sweep if active
    if (playerFortress.megaCannonFiring) {
      drawHyperBeam(ctx, 90, height / 2, width - 80, height / 2, '#38bdf8', '#67e8f9');
    }
    if (enemyFortress.megaCannonFiring) {
      drawHyperBeam(ctx, width - 90, height / 2, 80, height / 2, '#f43f5e', '#fb7185');
    }

    // 12. Selected Spell Targeting Reticle
    if (selectedSpell && mousePosRef.current) {
      const { x, y } = mousePosRef.current;
      const isPlayerHalf = x >= 0 && x <= width;
      ctx.save();
      ctx.strokeStyle = selectedSpell.id === 'celestial_mending' ? '#10b981' : '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);

      // Outer circle
      ctx.beginPath();
      ctx.arc(x, y, selectedSpell.range, 0, Math.PI * 2);
      ctx.stroke();

      // Inner fill
      ctx.fillStyle =
        selectedSpell.id === 'celestial_mending'
          ? 'rgba(16, 185, 129, 0.12)'
          : 'rgba(245, 158, 11, 0.15)';
      ctx.beginPath();
      ctx.arc(x, y, selectedSpell.range, 0, Math.PI * 2);
      ctx.fill();

      // Crosshairs
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(x - 16, y);
      ctx.lineTo(x + 16, y);
      ctx.moveTo(x, y - 16);
      ctx.lineTo(x, y + 16);
      ctx.stroke();

      // Floating label
      ctx.font = '600 12px "Noto Sans KR", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${selectedSpell.name} (클릭하여 시전 / 우클릭 취소)`,
        x,
        y - selectedSpell.range - 10
      );
      ctx.restore();
    }

    ctx.restore();
  }, [
    playerFortress,
    enemyFortress,
    units,
    projectiles,
    visualEffects,
    selectedSpell,
    screenShake,
  ]);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      render();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [render]);

  return (
    <div className="relative w-full aspect-[16/9] max-h-[620px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl select-none">
      <canvas
        ref={canvasRef}
        width={1000}
        height={562}
        className={`w-full h-full block ${selectedSpell ? 'cursor-crosshair' : 'cursor-default'}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      />
    </div>
  );
};

// Helper: Floating sky island background
function drawFloatingIsland(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  color: string,
  glowColor: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy);
  ctx.bezierCurveTo(cx - w / 2, cy - 25, cx + w / 2, cy - 25, cx + w / 2, cy);
  ctx.bezierCurveTo(cx + w / 3, cy + 45, cx - w / 4, cy + 55, cx - w / 2, cy);
  ctx.fill();

  // Floating crystal on top
  ctx.fillStyle = glowColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 35);
  ctx.lineTo(cx + 6, cy - 20);
  ctx.lineTo(cx, cy - 10);
  ctx.lineTo(cx - 6, cy - 20);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Helper: Floating Arch
function drawFloatingArch(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, 35, Math.PI, 0, false);
  ctx.stroke();
  ctx.restore();
}

// Helper: Puffy Cloud
function drawPuffyCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.beginPath();
  ctx.arc(x, y, 28 * scale, 0, Math.PI * 2);
  ctx.arc(x + 24 * scale, y - 10 * scale, 34 * scale, 0, Math.PI * 2);
  ctx.arc(x + 55 * scale, y, 26 * scale, 0, Math.PI * 2);
  ctx.arc(x + 28 * scale, y + 10 * scale, 24 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Helper: Sky Fortress
function drawFortress(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fortress: FortressState,
  isPlayer: boolean,
  canvasHeight: number
) {
  ctx.save();

  const primaryColor = isPlayer ? '#38bdf8' : '#f43f5e';
  const secondaryColor = isPlayer ? '#0284c7' : '#be123c';

  // Shield Dome (if active)
  if (fortress.shield > 0) {
    const shieldRatio = fortress.shield / fortress.maxShield;
    ctx.strokeStyle = isPlayer
      ? `rgba(56, 189, 248, ${0.3 + shieldRatio * 0.4})`
      : `rgba(244, 63, 94, ${0.3 + shieldRatio * 0.4})`;
    ctx.lineWidth = 3;
    ctx.fillStyle = isPlayer
      ? `rgba(56, 189, 248, ${0.08 + shieldRatio * 0.1})`
      : `rgba(244, 63, 94, ${0.08 + shieldRatio * 0.1})`;

    ctx.beginPath();
    ctx.arc(x, y, 78, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
  }

  // Floating Fortress Island Hull
  ctx.shadowColor = primaryColor;
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 2;

  ctx.beginPath();
  if (isPlayer) {
    ctx.moveTo(x - 50, y - 70);
    ctx.lineTo(x + 30, y - 50);
    ctx.lineTo(x + 45, y);
    ctx.lineTo(x + 30, y + 50);
    ctx.lineTo(x - 50, y + 70);
    ctx.closePath();
  } else {
    ctx.moveTo(x + 50, y - 70);
    ctx.lineTo(x - 30, y - 50);
    ctx.lineTo(x - 45, y);
    ctx.lineTo(x - 30, y + 50);
    ctx.lineTo(x + 50, y + 70);
    ctx.closePath();
  }
  ctx.fill();
  ctx.stroke();

  // Spire Towers
  ctx.fillStyle = secondaryColor;
  ctx.fillRect(isPlayer ? x - 35 : x + 25, y - 45, 10, 90);

  // Glowing Ether Crystal Core
  ctx.shadowColor = primaryColor;
  ctx.shadowBlur = 18;
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.arc(isPlayer ? x + 10 : x - 10, y, 14, 0, Math.PI * 2);
  ctx.fill();

  // Mega Cannon Barrel
  ctx.fillStyle = '#334155';
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 1.5;
  if (isPlayer) {
    ctx.fillRect(x + 35, y - 7, 24, 14);
    ctx.strokeRect(x + 35, y - 7, 24, 14);
    if (fortress.megaCannonCharge >= 100) {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(x + 60, y, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillRect(x - 59, y - 7, 24, 14);
    ctx.strokeRect(x - 59, y - 7, 24, 14);
    if (fortress.megaCannonCharge >= 100) {
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(x - 60, y, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Name & Title above fortress
  ctx.shadowBlur = 0;
  ctx.font = '700 13px "Noto Sans KR", sans-serif';
  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'center';
  ctx.fillText(fortress.name, x, y - 86);

  ctx.font = '500 10px "Noto Sans KR", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(fortress.title, x, y - 73);

  // Health and Shield Mini Gauge
  const barW = 86;
  const barH = 5;
  const barX = x - barW / 2;
  const barY = y + 84;

  // HP Bar
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(barX, barY, barW, barH);
  const hpRatio = Math.max(0, fortress.hp / fortress.maxHp);
  ctx.fillStyle = isPlayer ? '#10b981' : '#f43f5e';
  ctx.fillRect(barX, barY, barW * hpRatio, barH);

  // Shield Bar
  if (fortress.maxShield > 0) {
    const sRatio = Math.max(0, fortress.shield / fortress.maxShield);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(barX, barY + 7, barW, 4);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(barX, barY + 7, barW * sRatio, 4);
  }

  ctx.restore();
}

// Helper: Draw Unit
function drawUnit(ctx: CanvasRenderingContext2D, unit: ActiveUnit) {
  ctx.save();
  ctx.translate(unit.x, unit.y);
  ctx.rotate(unit.angle);

  const isPlayer = unit.team === 'player';
  const teamColor = isPlayer ? '#38bdf8' : '#f43f5e';
  const accentColor = isPlayer ? '#67e8f9' : '#fb7185';

  // Thruster Fire Trail
  ctx.fillStyle = isPlayer ? 'rgba(56, 189, 248, 0.8)' : 'rgba(251, 146, 60, 0.8)';
  ctx.beginPath();
  ctx.moveTo(-unit.size * 0.8, -unit.size * 0.3);
  ctx.lineTo(-unit.size * 1.5 - Math.random() * 8, 0);
  ctx.lineTo(-unit.size * 0.8, unit.size * 0.3);
  ctx.closePath();
  ctx.fill();

  // Unit Specific Model
  switch (unit.role) {
    case 'interceptor':
      // Arrowhead jet
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = teamColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(unit.size * 1.2, 0);
      ctx.lineTo(-unit.size * 0.8, -unit.size * 0.7);
      ctx.lineTo(-unit.size * 0.4, 0);
      ctx.lineTo(-unit.size * 0.8, unit.size * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'valkyrie':
      // Winged celestial knight
      ctx.fillStyle = teamColor;
      ctx.beginPath();
      // Wings
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-unit.size * 0.6, -unit.size * 1.2, unit.size * 0.4, -unit.size * 1.0);
      ctx.lineTo(0, -unit.size * 0.3);
      ctx.quadraticCurveTo(-unit.size * 0.6, unit.size * 1.2, unit.size * 0.4, unit.size * 1.0);
      ctx.closePath();
      ctx.fill();

      // Body & Lance
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(0, 0, unit.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(unit.size * 1.4, 0);
      ctx.stroke();
      break;

    case 'dreadnought':
      // Heavy Battleship with dual turrets
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = teamColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(unit.size * 1.3, 0);
      ctx.lineTo(unit.size * 0.7, -unit.size * 0.6);
      ctx.lineTo(-unit.size * 1.1, -unit.size * 0.6);
      ctx.lineTo(-unit.size * 1.3, 0);
      ctx.lineTo(-unit.size * 1.1, unit.size * 0.6);
      ctx.lineTo(unit.size * 0.7, unit.size * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Dual gun turrets
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(unit.size * 0.3, -unit.size * 0.25, 4, 0, Math.PI * 2);
      ctx.arc(unit.size * 0.3, unit.size * 0.25, 4, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'bomber':
      // Stealth swept-wing bomber
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = teamColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(unit.size * 1.0, 0);
      ctx.lineTo(-unit.size * 0.8, -unit.size * 1.1);
      ctx.lineTo(-unit.size * 0.5, 0);
      ctx.lineTo(-unit.size * 0.8, unit.size * 1.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'guardian':
      // Hexagonal shield ship
      ctx.fillStyle = '#0c4a6e';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const rad = (i * Math.PI) / 3;
        const px = Math.cos(rad) * unit.size;
        const py = Math.sin(rad) * unit.size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Shield aura
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
      break;

    default:
      // Generic frigate
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = teamColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(unit.size, 0);
      ctx.lineTo(-unit.size, -unit.size * 0.6);
      ctx.lineTo(-unit.size * 0.6, 0);
      ctx.lineTo(-unit.size, unit.size * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
  }

  // Unit Health Bar (Unrotated upright)
  ctx.restore();
  ctx.save();
  ctx.translate(unit.x, unit.y);

  const hpBarW = Math.max(unit.size * 1.8, 28);
  const hpBarH = 3;
  const hpBarX = -hpBarW / 2;
  const hpBarY = -unit.size - 8;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);

  const hpRatio = Math.max(0, unit.hp / unit.maxHp);
  ctx.fillStyle = isPlayer ? '#10b981' : '#f43f5e';
  ctx.fillRect(hpBarX, hpBarY, hpBarW * hpRatio, hpBarH);

  ctx.restore();
}

// Helper: Draw Projectile
function drawProjectile(ctx: CanvasRenderingContext2D, proj: Projectile) {
  ctx.save();
  ctx.shadowColor = proj.color;
  ctx.shadowBlur = 8;
  ctx.fillStyle = proj.color;

  if (proj.type === 'laser') {
    ctx.strokeStyle = proj.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(proj.x, proj.y);
    ctx.lineTo(proj.x - proj.vx * 3, proj.y - proj.vy * 3);
    ctx.stroke();
  } else if (proj.type === 'missile') {
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
    ctx.fill();

    // Smoke trail
    ctx.fillStyle = 'rgba(203, 213, 225, 0.4)';
    ctx.beginPath();
    ctx.arc(proj.x - proj.vx * 2, proj.y - proj.vy * 2, proj.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
  } else if (proj.type === 'bomb') {
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.radius * 1.4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Plasma / bolt
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(proj.x, proj.y);
    ctx.lineTo(proj.x - proj.vx * 2, proj.y - proj.vy * 2);
    ctx.stroke();
  }

  ctx.restore();
}

// Helper: Visual Effects
function drawVisualEffect(ctx: CanvasRenderingContext2D, fx: VisualEffect) {
  ctx.save();
  const progress = 1 - fx.duration / fx.maxDuration;

  switch (fx.type) {
    case 'explosion': {
      const radius = (fx.size || 25) * (0.3 + progress * 0.9);
      const alpha = Math.max(0, 1 - progress);

      // Flash circle
      const grad = ctx.createRadialGradient(fx.x, fx.y, 0, fx.x, fx.y, radius);
      grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      grad.addColorStop(0.3, `rgba(251, 146, 60, ${alpha * 0.8})`);
      grad.addColorStop(0.8, `rgba(239, 68, 68, ${alpha * 0.5})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, radius, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'thunder_strike': {
      const alpha = Math.max(0, 1 - progress);
      ctx.strokeStyle = `rgba(250, 204, 21, ${alpha})`;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 15;

      // Zig-zag lightning bolt from top of sky
      ctx.beginPath();
      let curX = fx.x + (Math.random() - 0.5) * 40;
      let curY = 0;
      ctx.moveTo(curX, curY);

      while (curY < fx.y) {
        curY += 35;
        curX += (Math.random() - 0.5) * 50;
        ctx.lineTo(curX, Math.min(curY, fx.y));
      }
      ctx.stroke();

      // Ground shock ring
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, progress * 40, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'heal_aura': {
      const alpha = Math.max(0, 1 - progress);
      ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, progress * 60, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'shield_hit': {
      const alpha = Math.max(0, 1 - progress);
      ctx.strokeStyle = fx.color || `rgba(56, 189, 248, ${alpha})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, (fx.size || 20) * (0.5 + progress * 0.8), 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'damage_text': {
      const alpha = Math.max(0, 1 - progress);
      const floatY = fx.y - progress * 24;

      ctx.font = '700 13px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = fx.color || `rgba(255, 255, 255, ${alpha})`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(fx.text || '', fx.x, floatY);
      break;
    }
  }

  ctx.restore();
}

// Helper: Mega Hyper Beam
function drawHyperBeam(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color1: string,
  color2: string
) {
  ctx.save();
  ctx.shadowColor = color1;
  ctx.shadowBlur = 25;

  // Outer glow
  ctx.strokeStyle = color1;
  ctx.lineWidth = 22;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Core white beam
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.restore();
}
