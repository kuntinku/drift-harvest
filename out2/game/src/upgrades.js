// upgrades.js — the choices that matter: after every second wave the harvester picks one of three.
export const UPGRADES = {
  all: [
    { id: 'thrust', name: 'Ion Thrust', text: 'Thrust +22%, top speed +15%',
      apply: (p) => { p.thrust *= 1.22; p.maxSpeed *= 1.15; } },
    { id: 'magnet', name: 'Tractor Coil', text: 'Crystal pull radius +60%',
      apply: (p) => { p.magnet *= 1.6; } },
    { id: 'shield', name: 'Hull Plating', text: 'One extra life, longer grace after a hit',
      apply: (p) => { p.extraLife = (p.extraLife || 0) + 1; p.shieldT = Math.max(p.shieldT, 1.2); } },
    { id: 'brake', name: 'Vector Brakes', text: 'Braking 45% stronger, less drift',
      apply: (p) => { p.brake *= 1.45; p.drag *= 1.2; } },
    { id: 'chain', name: 'Chain Lens', text: 'Multiplier climbs every 4 crystals, not 5',
      apply: (p) => { p.chainStep = Math.max(3, (p.chainStep || 5) - 1); } },
    { id: 'glide', name: 'Glide Cells', text: 'Less drag: the ship keeps its momentum',
      apply: (p) => { p.drag *= 0.72; } },
  ],
  pick3(wave) {
    const pool = [...this.all];
    const out = [];
    // a shield offer always shows up when the run is thin on lives; the rest are drawn fresh
    for (let i = 0; i < 3 && pool.length; i++) {
      const k = Math.floor(Math.random() * pool.length);
      out.push(pool.splice(k, 1)[0]);
    }
    return out;
  },
};

export function applyUpgrade(player, up) {
  if (up.id === 'shield') player.extraLife = (player.extraLife || 0) + 1;
  up.apply(player);
}
