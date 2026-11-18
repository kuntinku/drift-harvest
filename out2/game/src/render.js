// render.js — every screen drawn: title, play with its HUD, upgrade picks, pause, game over.
import { drawHud } from './hud.js';

const STARS_PER = 90;

function bg(ctx, world, w, h, t) {
  ctx.fillStyle = '#070b16';
  ctx.fillRect(0, 0, w, h);
  // drifting starfield with a faint blue nebula wash
  const g = ctx.createRadialGradient(w * 0.7, h * 0.3, 40, w * 0.7, h * 0.3, w * 0.8);
  g.addColorStop(0, 'rgba(40,70,160,0.14)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#c9d6f2';
  for (const s of world.stars) {
    ctx.globalAlpha = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 2 + s.t * 9));
    ctx.fillRect(s.x, s.y, s.s, s.s);
  }
  ctx.globalAlpha = 1;
}

function ship(ctx, p, t) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  if (p.shieldT > 0) {
    ctx.beginPath();
    ctx.arc(0, 0, p.radius + 9, 0, 6.29);
    ctx.strokeStyle = `rgba(122,168,255,${0.4 + 0.4 * Math.sin(t * 12)})`;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(-12, -11);
  ctx.lineTo(-6, 0);
  ctx.lineTo(-12, 11);
  ctx.closePath();
  ctx.fillStyle = '#ffd76a';
  ctx.fill();
  ctx.strokeStyle = '#8f6a1d';
  ctx.lineWidth = 2;
  ctx.stroke();
  // thruster flame when moving
  const sp = Math.hypot(p.vx, p.vy);
  if (sp > 30) {
    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.lineTo(-10 - Math.min(26, sp / 12), 0);
    ctx.lineTo(-10, 5);
    ctx.fillStyle = 'rgba(120,200,255,0.85)';
    ctx.fill();
  }
  ctx.restore();
}

function crystal(ctx, c, t) {
  const r = c.r + 1.5 * Math.sin(c.pulse);
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(c.spin);
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(125,247,200,0.9)';
  ctx.strokeStyle = '#2f9f77';
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function comet(ctx, k) {
  ctx.strokeStyle = 'rgba(255,120,90,0.35)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  k.trail.forEach((pt, i) => i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y));
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(k.x, k.y, k.r, 0, 6.29);
  ctx.fillStyle = '#ff6b4a';
  ctx.fill();
  ctx.strokeStyle = '#7a2a16';
  ctx.lineWidth = 3;
  ctx.stroke();
}

export function drawScreen(ctx, world, w, h, t) {
  bg(ctx, world, w, h, t);
  const { state } = world;

  if (state === 'title') return title(ctx, world, w, h, t);
  if (state === 'over') { scene(ctx, world, t); return over(ctx, world, w, h); }
  if (state === 'upgrade') { scene(ctx, world, t); return upgrade(ctx, world, w, h); }
  scene(ctx, world, t);
  drawHud(ctx, world, w, h);
  if (state === 'paused') paused(ctx, world, w, h);
}

function scene(ctx, world, t) {
  for (const c of world.spawner.crystals) crystal(ctx, c, t);
  for (const k of world.spawner.comets) comet(ctx, k);
  for (const p of world.particles) {
    ctx.globalAlpha = Math.max(0, p.t * 2);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  }
  ctx.globalAlpha = 1;
  ship(ctx, world.player, t);
  ctx.textAlign = 'center';
  for (const f of world.floaters) {
    ctx.globalAlpha = Math.min(1, f.t);
    ctx.fillStyle = f.color;
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.fillText(f.text, f.x, f.y - (1.1 - f.t) * 34);
  }
  ctx.globalAlpha = 1;
  if (world.waveBanner > 0) {
    ctx.fillStyle = `rgba(234,242,255,${Math.min(1, world.waveBanner)})`;
    ctx.font = 'bold 34px "Segoe UI", sans-serif';
    ctx.fillText('WAVE ' + world.wave, world.w / 2, 90);
  }
}

function panel(ctx, x, y, w2, h2) {
  ctx.fillStyle = 'rgba(12,18,34,0.92)';
  ctx.strokeStyle = 'rgba(90,130,220,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w2, h2, 14);
  ctx.fill();
  ctx.stroke();
}

function title(ctx, world, w, h, t) {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#eaf2ff';
  ctx.font = 'bold 54px "Segoe UI", sans-serif';
  ctx.fillText('DRIFT HARVEST', w / 2, 200 + Math.sin(t * 1.4) * 5);
  ctx.fillStyle = '#8fa3c8';
  ctx.font = '19px "Segoe UI", sans-serif';
  ctx.fillText('Harvest energy crystals. Dodge the comets.', w / 2, 246);
  ctx.fillText('Chains raise your score multiplier. Survive the waves.', w / 2, 274);
  const pulse = 0.6 + 0.4 * Math.sin(t * 3);
  ctx.fillStyle = `rgba(125,247,200,${pulse})`;
  ctx.font = 'bold 26px "Segoe UI", sans-serif';
  ctx.fillText('Press SPACE to launch', w / 2, 360);
  ctx.fillStyle = '#5f719a';
  ctx.font = '15px "Segoe UI", sans-serif';
  ctx.fillText('Arrows / WASD thrust · SPACE brake · P pause', w / 2, 410);
}

function upgrade(ctx, world, w, h) {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#eaf2ff';
  ctx.font = 'bold 30px "Segoe UI", sans-serif';
  ctx.fillText('WAVE ' + world.wave + ' CLEARED', w / 2, 120);
  ctx.fillStyle = '#8fa3c8';
  ctx.font = '18px "Segoe UI", sans-serif';
  ctx.fillText('Pick one refit for the harvester — press 1, 2 or 3', w / 2, 152);
  world.upgradeOffer.forEach((u, i) => {
    const x = w / 2 - 330 + i * 230, y = 210, w2 = 200, h2 = 150;
    panel(ctx, x, y, w2, h2);
    ctx.fillStyle = '#7df7c8';
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.fillText(u.name, x + w2 / 2, y + 44);
    ctx.fillStyle = '#c9d6f2';
    ctx.font = '14px "Segoe UI", sans-serif';
    wrap(ctx, u.text, x + w2 / 2, y + 78, w2 - 26, 18);
    ctx.fillStyle = '#ffd76a';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText('[' + (i + 1) + ']', x + w2 / 2, y + h2 - 18);
  });
}

function over(ctx, world, w, h) {
  panel(ctx, w / 2 - 250, 170, 500, 250);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff5566';
  ctx.font = 'bold 40px "Segoe UI", sans-serif';
  ctx.fillText('HARVEST LOST', w / 2, 230);
  ctx.fillStyle = '#eaf2ff';
  ctx.font = 'bold 26px "Segoe UI", sans-serif';
  ctx.fillText('Score ' + world.score, w / 2, 280);
  ctx.fillStyle = '#8fa3c8';
  ctx.font = '18px "Segoe UI", sans-serif';
  ctx.fillText('Waves survived: ' + world.wave + '   Crystals: ' + world.spawner.collected, w / 2, 316);
  const pulse = 0.6 + 0.4 * Math.sin(world.screenT * 3);
  ctx.fillStyle = `rgba(125,247,200,${pulse})`;
  ctx.font = 'bold 22px "Segoe UI", sans-serif';
  ctx.fillText('Press SPACE to fly again', w / 2, 380);
}

function paused(ctx, world, w, h) {
  ctx.fillStyle = 'rgba(5,8,16,0.55)';
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#eaf2ff';
  ctx.font = 'bold 34px "Segoe UI", sans-serif';
  ctx.fillText('PAUSED — P to resume', w / 2, h / 2);
}

function wrap(ctx, text, cx, y, max, lh) {
  const words = text.split(' ');
  let line = '', lines = [];
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > max && line) { lines.push(line); line = word; }
    else line = test;
  }
  lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, cx, y + i * lh));
}
