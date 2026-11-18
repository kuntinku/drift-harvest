// spawner.js — waves of drifting crystals and the comets that hunt the harvester.
const rand = (a, b) => a + Math.random() * (b - a);

export class Spawner {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.crystals = [];
    this.comets = [];
    this.target = 0;    // crystals a wave needs collected
    this.collected = 0;
    this.cometTimer = 0;
    this.wave = 0;
  }

  clear() { this.crystals = []; this.comets = []; this.collected = 0; this.cometTimer = 0; }

  buildWave(n, player) {
    this.wave = n;
    this.crystals = [];
    this.comets = [];
    this.target = 6 + n * 2;
    this.collected = 0;
    const count = Math.min(4 + n, 14);
    for (let i = 0; i < count; i++) this.spawnCrystal(true);
    // comets start on wave 2, faster and more numerous as waves climb
    this.cometCount = n < 2 ? 0 : Math.min(1 + Math.floor(n / 2), 6);
    this.cometTimer = 1.2;
    this.cometsLeft = this.cometCount;
  }

  spawnCrystal(away) {
    let x, y, tries = 0;
    do {
      x = rand(50, this.w - 50);
      y = rand(70, this.h - 50);
      tries++;
    } while (away && tries < 20 && this._nearPlayer(x, y));
    this.crystals.push({ x, y, r: 9, spin: rand(0, 6.28), pulse: rand(0, 6.28) });
  }

  _nearPlayer(x, y) {
    const p = this.player;
    return p && Math.hypot(x - p.x, y - p.y) < 130;
  }

  update(dt, world) {
    this.player = world.player;
    const p = world.player;

    // crystals drift slowly and are pulled in by the magnet upgrade
    for (const c of this.crystals) {
      c.spin += dt * 1.6;
      c.pulse += dt * 4;
      const d = Math.hypot(p.x - c.x, p.y - c.y);
      if (d < p.magnet && d > 0.001) {
        const pull = (1 - d / p.magnet) * 260 * dt;
        c.x += ((p.x - c.x) / d) * pull;
        c.y += ((p.y - c.y) / d) * pull;
      }
      if (d < p.radius + c.r) {
        this.collected++;
        world.chain++;
        const gain = 10 * world.mult;
        world.score += gain;
        world.addFloat('+' + gain, c.x, c.y, '#7df7c8');
        world.burst(c.x, c.y, '#7df7c8', 10, 130);
        world.audio.pickup(world.chain % 12);
        c.dead = true;
        if (this.crystals.filter((k) => !k.dead).length < 3) this.spawnCrystal(false);
      }
    }
    this.crystals = this.crystals.filter((c) => !c.dead);

    // comets: steer toward the player, they cost a life on contact
    if (this.cometTimer > 0) this.cometTimer -= dt;
    if (this.cometsLeft > 0 && this.cometTimer <= 0) {
      this.spawnComet(p);
      this.cometsLeft--;
      this.cometTimer = Math.max(0.45, 1.7 - this.wave * 0.09);
    }
    for (const k of this.comets) {
      const d = Math.hypot(p.x - k.x, p.y - k.y) || 1;
      k.vx += ((p.x - k.x) / d) * k.turn * dt;
      k.vy += ((p.y - k.y) / d) * k.turn * dt;
      const sp = Math.hypot(k.vx, k.vy);
      if (sp > k.speed) { k.vx *= k.speed / sp; k.vy *= k.speed / sp; }
      k.x += k.vx * dt;
      k.y += k.vy * dt;
      k.trail.push({ x: k.x, y: k.y });
      if (k.trail.length > 10) k.trail.shift();
      if (d < p.radius + k.r) {
        if (p.hit(world)) { k.dead = true; }
      }
      if (k.x < -60 || k.x > this.w + 60 || k.y < -60 || k.y > this.h + 60) k.dead = true;
    }
    this.comets = this.comets.filter((k) => !k.dead);
  }

  spawnComet(p) {
    const edge = Math.floor(rand(0, 4));
    let x, y;
    if (edge === 0) { x = rand(0, this.w); y = -20; }
    else if (edge === 1) { x = this.w + 20; y = rand(0, this.h); }
    else if (edge === 2) { x = rand(0, this.w); y = this.h + 20; }
    else { x = -20; y = rand(0, this.h); }
    const speed = Math.min(90 + this.wave * 14, 230);
    this.comets.push({
      x, y, r: 15, speed, turn: 120 + this.wave * 12,
      vx: (p.x - x) * 0.15, vy: (p.y - y) * 0.15, trail: [],
    });
  }

  waveCleared() {
    return this.collected >= this.target && this.comets.length === 0 && this.cometsLeft === 0;
  }
}
