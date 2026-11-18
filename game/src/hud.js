// hud.js — the readout of the run: score, multiplier, lives, wave progress.
export function drawHud(ctx, world, w, h) {
  const p = world.player;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#eaf2ff';
  ctx.font = 'bold 24px "Segoe UI", sans-serif';
  ctx.fillText('SCORE ' + world.score, 24, 40);
  ctx.fillStyle = world.mult > 1 ? '#7df7c8' : '#5f719a';
  ctx.font = 'bold 18px "Segoe UI", sans-serif';
  ctx.fillText('x' + world.mult + (world.mult > 1 ? '  chain ' + world.chain : ''), 24, 66);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#8fa3c8';
  ctx.font = 'bold 17px "Segoe UI", sans-serif';
  ctx.fillText('WAVE ' + world.wave + '   crystals ' + world.spawner.collected + '/' + world.spawner.target, w / 2, 38);

  // lives as small ship glyphs, plus any hull plating still in reserve
  ctx.textAlign = 'right';
  const total = world.lives + (p.extraLife || 0);
  for (let i = 0; i < total; i++) {
    const x = w - 28 - i * 30, y = 32;
    ctx.beginPath();
    ctx.moveTo(x + 9, y);
    ctx.lineTo(x - 6, y - 6);
    ctx.lineTo(x - 3, y);
    ctx.lineTo(x - 6, y + 6);
    ctx.closePath();
    ctx.fillStyle = '#ffd76a';
    ctx.fill();
  }
  // wave progress bar
  const frac = Math.min(1, world.spawner.collected / Math.max(1, world.spawner.target));
  ctx.fillStyle = 'rgba(90,120,190,0.35)';
  ctx.fillRect(w / 2 - 110, 48, 220, 8);
  ctx.fillStyle = '#7df7c8';
  ctx.fillRect(w / 2 - 110, 48, 220 * frac, 8);
}
