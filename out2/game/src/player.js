// player.js — the harvester ship: thrust physics, brake, shields, stats the upgrades raise.
export class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.vx = 0; this.vy = 0;
    this.angle = -Math.PI / 2;
    this.radius = 13;
    this.thrust = 340;      // acceleration, px/s^2
    this.maxSpeed = 340;
    this.brake = 3.2;       // damping when Space is held
    this.fireCooldown = 0;
    this.shots = 0;         // pulse charges from upgrades
    this.magnet = 70;       // crystal pull radius
    this.shieldT = 0;       // invulnerability after a hit
    this.drag = 0.55;
    this.x = x; this.y = y;
  }

  update(dt, input, world) {
    if (this.shieldT > 0) this.shieldT -= dt;
    let ax = 0, ay = 0;
    if (input.down('ArrowLeft', 'KeyA')) ax -= 1;
    if (input.down('ArrowRight', 'KeyD')) ax += 1;
    if (input.down('ArrowUp', 'KeyW')) ay -= 1;
    if (input.down('ArrowDown', 'KeyS')) ay += 1;

    if (ax || ay) {
      const len = Math.hypot(ax, ay);
      ax /= len; ay /= len;
      this.vx += ax * this.thrust * dt;
      this.vy += ay * this.thrust * dt;
      this.angle = Math.atan2(ay, ax);
    }
    if (input.down('Space')) {
      const k = Math.exp(-this.brake * dt);
      this.vx *= k; this.vy *= k;
      world.audio.brake();
    }
    const sp = Math.hypot(this.vx, this.vy);
    if (sp > this.maxSpeed) { this.vx *= this.maxSpeed / sp; this.vy *= this.maxSpeed / sp; }
    const damp = Math.exp(-this.drag * dt);
    this.vx *= damp; this.vy *= damp;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    // bounce softly off the arena walls
    const r = this.radius;
    if (this.x < r) { this.x = r; this.vx = Math.abs(this.vx) * 0.5; }
    if (this.x > world.w - r) { this.x = world.w - r; this.vx = -Math.abs(this.vx) * 0.5; }
    if (this.y < r) { this.y = r; this.vy = Math.abs(this.vy) * 0.5; }
    if (this.y > world.h - r) { this.y = world.h - r; this.vy = -Math.abs(this.vy) * 0.5; }
  }

  hit(world) {
    if (this.shieldT > 0) return false;
    world.chain = 0;
    this.shieldT = 1.6;
    if (this.extraLife > 0) {
      this.extraLife -= 1;
      world.audio.hit();
      world.burst(this.x, this.y, '#7aa8ff', 22, 200);
      world.addFloat('PLATING', this.x, this.y - 26, '#7aa8ff');
      return true;
    }
    world.lives -= 1;
    world.audio.hit();
    world.burst(this.x, this.y, '#ff5566', 26, 220);
    world.addFloat('HIT', this.x, this.y - 26, '#ff5566');
    return true;
  }
}
