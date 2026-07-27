// Elimina de dist/_astro cualquier .js que ningún HTML final referencie.
// Con cero directivas client:*, el único JS legítimo es el que linkeamos con
// <script>. Todo lo demás es output muerto del build de Astro: el runtime de
// React que @astrojs/react registra como clientEntrypoint aunque nada se hidrate
// (ver docs/PLAN-EJECUCION.md §2.7, §12 y la auditoría de performance).
import { readdir, readFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = await walk(DIST);
const html = files.filter((f) => f.endsWith('.html'));
const js = files.filter((f) => f.includes('/_astro/') && f.endsWith('.js'));

const referenced = new Set();
for (const f of html) {
  const content = await readFile(f, 'utf-8');
  for (const m of content.matchAll(/\/_astro\/[\w.-]+\.js/g)) referenced.add(m[0]);
}

let removed = 0;
for (const f of js) {
  const publicPath = '/_astro/' + f.split('/_astro/')[1];
  if (!referenced.has(publicPath)) {
    await unlink(f);
    console.log(`[prune-orphan-js] eliminado (sin referencias): ${publicPath}`);
    removed++;
  }
}
console.log(
  removed
    ? `[prune-orphan-js] ${removed} archivo(s) eliminado(s).`
    : '[prune-orphan-js] nada que podar.',
);
