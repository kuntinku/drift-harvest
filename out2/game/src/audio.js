// audio.js — every sound is synthesised with WebAudio: no asset files, nothing to load.
export class AudioKit {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }
  blip(freq, dur = 0.08, type = 'square', vol = 0.15, slide = 0) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
  pickup(n) { this.blip(520 + n * 40, 0.09, 'triangle', 0.18, 300); }
  hit() { this.blip(140, 0.25, 'sawtooth', 0.25, -90); }
  wave() { this.blip(330, 0.15, 'triangle', 0.2, 220); this.blip(440, 0.2, 'triangle', 0.15, 260); }
  upgrade() { this.blip(600, 0.1, 'square', 0.15, 200); this.blip(820, 0.12, 'square', 0.12, 260); }
  gameover() { this.blip(300, 0.5, 'sawtooth', 0.25, -220); }
  start() { this.blip(440, 0.12, 'triangle', 0.18, 180); }
  brake() { this.blip(90, 0.06, 'sine', 0.08, -30); }
}
