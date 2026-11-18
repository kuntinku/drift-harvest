// best-game-01 entry: Drift Harvest, a crystal-harvest arcade game as static files under game/.
// Node 22, standard library only, deterministic: the program copies game/ and screenshots/ beside
// this file to /output (MAKEFUN_OUTPUT_DIR stands in for /output outside the grader's container)
// and writes /output/dossier.json, the summary the judge reads, with the vendored makefun-game
// library. It runs twice and both runs must write the same bytes — nothing here reads the clock
// or the network, so they do.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's caps (reference/gate.json): at most 4 screenshots of 256 KiB each, at most 993
// game files totalling 48 MiB, every path under game/ at most 1,000 bytes, and the dossier's
// source text capped at 160 KiB. The library refuses an output the scorer would refuse.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
