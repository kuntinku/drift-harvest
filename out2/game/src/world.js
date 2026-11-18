// world.js — the whole game state machine: title, play, upgrade, paused, gameover.
import { Player } from './player.js';
import { Spawner } from './spawner.js';
import { UPGRADES, applyUpgrade } from './upgrades.js';

const ST = { TITLE: 'title', PLAY: 'play', UPGRADE: 'upgrade', PAUSED: 'paused', OVER: 'over' };

export class World {
  constructor(w, h, audio) {
    this.w = w; this.h = h;
    this.audio = audio;
    this.spawner = new Spawner(w, h);
    this.state = ST.TITLE;
    this.time = 0;
    this.screenT = 0; // seconds since the screen changed
    this.stars = [];
    for (let i = 0; i < 90; i++) {
      this.stars.push({ x: Math.random() * w, y: Math.random() * h, s: 0.4 + Math.random() * 1.6, t: Math.random() });
    }
    this.reset();
  }

  reset() {
    this.player = new Player(this.w / 2, this.h / 2);
    this.score = 0;
    this.lives = 3;
    this.wave = 0;
    this.chain = 0;          // pickups without a hit: builds the multiplier
    this.mult = 1;
    this.floaters = [];      // rising score texts
    this.particles = [];
    this.spawner.clear();
    this.upgradeOffer = null;
  }

  startRun() {
    this.reset();
    this.state = ST.PLAY;
    this.screenT = 0;
    this.nextWave();
    this.audio.start();
  }

  nextWave() {
    this.wave++;
    this.spawner.buildWave(this.wave, this.player);
    this.waveBanner = 2.2;
  }

  openUpgrades() {
    this.state = ST.UPGRADE;
    this.screenT = 0;
    this.upgradeOffer = UPGRADES.pick3(this.wave);
  }

  pickUpgrade(i) {
    applyUpgrade(this.player, this.upgradeOffer[i]);
    this.audio.upgrade();
    this.upgradeOffer = null;
    this.state = ST.PLAY;
    this.screenT = 0;
    this.nextWave();
  }

  addFloat(text, x, y, color) { this.floaters.push({ text, x, y, t: 1.1, color }); }

  burst(x, y, color, n = 14, spd = 160) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = spd * (0.3 + Math.random());
      this.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0.5 + Math.random() * 0.4, color });
    }
  }

  update(dt, input) {
    this.time += dt;
    this.screenT += dt;
    for (const s of this.stars) { s.y += s.s * 8 * dt; if (s.y > this.h) { s.y = 0; s.x = Math.random() * this.w; } }

    if (this.state === ST.TITLE && (input.tapped('Space', 'Enter') || input.tapped('KeyS'))) this.startRun();
    if (this.state === ST.OVER && input.tapped('Space', 'Enter')) this.startRun();
    if (this.state === ST.UPGRADE && this.upgradeOffer) {
      for (let i = 0; i < this.upgradeOffer.length; i++) {
        if (input.tapped('Digit' + (i + 1))) { this.pickUpgrade(i); break; }
      }
    }
    if (this.state === ST.PLAY && input.tapped('KeyP')) { this.state = ST.PAUSED; return this.endFrame(input); }
    if (this.state === ST.PAUSED && input.tapped('KeyP')) { this.state = ST.PLAY; return this.endFrame(input); }

    if (this.state !== ST.PLAY) return this.endFrame(input);

    if (this.waveBanner > 0) this.waveBanner -= dt;

    this.player.update(dt, input, this);
    this.spawner.update(dt, this);

    this.mult = 1 + Math.min(4, Math.floor(this.chain / 5)); // chain of 5, 10, 15... raises the multiplier
    for (const f of this.floaters) f.t -= dt;
    this.floaters = this.floaters.filter((f) => f.t > 0);
    for (const p of this.particles) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; }
    this.particles = this.particles.filter((p) => p.t > 0);

    if (this.spawner.waveCleared()) {
      if (this.wave % 2 === 0) { this.openUpgrades(); }
      else { this.nextWave(); }
    }
    if (this.lives <= 0) {
      this.state = ST.OVER;
      this.screenT = 0;
      this.audio.gameover();
    }
    this.endFrame(input);
  }

  endFrame(input) { input.endFrame(); }
}
