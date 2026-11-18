// input.js — keyboard state: thrust, brake, pause and menu keys.
export class Input {
  constructor(target) {
    this.keys = new Set();
    this.pressed = new Set(); // keys pressed this frame
    target.addEventListener('keydown', (e) => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
      if (!this.keys.has(e.code)) this.pressed.add(e.code);
      this.keys.add(e.code);
    });
    target.addEventListener('keyup', (e) => this.keys.delete(e.code));
  }
  down(...codes) { return codes.some((c) => this.keys.has(c)); }
  tapped(...codes) { return codes.some((c) => this.pressed.has(c)); }
  endFrame() { this.pressed.clear(); }
}
