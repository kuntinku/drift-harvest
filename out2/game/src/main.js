// main.js — bootstrap: canvas, loop, wiring the screens together.
import { Input } from './input.js';
import { AudioKit } from './audio.js';
import { World } from './world.js';
import { drawScreen } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const input = new Input(window);
const audio = new AudioKit();

const world = new World(W, H, audio);
window.__world = world; // debug handle for headless playtesting

let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  world.update(dt, input);
  drawScreen(ctx, world, W, H, now / 1000);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
