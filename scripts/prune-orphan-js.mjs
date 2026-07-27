// Elimina de dist los .js de _astro que no sean ALCANZABLES desde el HTML.
// Con cero directivas client:*, el único JS legítimo es el que linkeamos con
// <script> (y lo que ese JS importe transitivamente). El resto es output muerto
// del build: el runtime de React que @astrojs/react registra como clientEntrypoint
// aunque nada se hidrate (ver docs/PLAN-EJECUCION.md §2.7/§12 y la auditoría de perf).
//
// Alcanzabilidad transitiva sobre los archivos emitidos: se parte de las
// referencias del HTML y se siguen los imports (absolutos `/_astro/…` y relativos
// `./…`) dentro de cada .js. El sesgo es conservador: ante la duda se MARCA como
// referenciado (nunca se borra un chunk que alguien pueda estar usando).
import { readdir, readFile, unlink } from 'node:fs/promises';
import { join, dirname, resolve, relative } from 'node:path';
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

/** Path público (`/_astro/…`) de un archivo absoluto dentro de dist. */
const toPublic = (absPath) => '/' + relative(DIST, absPath).split(/[\\/]/).join('/');

// Referencias absolutas a un .js bajo _astro; y specifiers de import relativos.
const ABS_JS = /\/_astro\/[\w./-]+\.js/g;
const REL_IMPORT = /(?:import|from|import\s*\()\s*["'](\.{1,2}\/[\w./-]+\.js)["']/g;

const files = await walk(DIST);
const jsByPublic = new Map();
for (const f of files) {
  const pub = toPublic(f);
  if (f.endsWith('.js') && pub.startsWith('/_astro/')) jsByPublic.set(pub, f);
}
const htmlFiles = files.filter((f) => f.endsWith('.html'));

const referenced = new Set();
const queue = [];
const mark = (pub) => {
  if (jsByPublic.has(pub) && !referenced.has(pub)) {
    referenced.add(pub);
    queue.push(pub);
  }
};

// Semilla: lo que el HTML linkea.
for (const f of htmlFiles) {
  const content = await readFile(f, 'utf-8');
  for (const m of content.matchAll(ABS_JS)) mark(m[0]);
}

// Cierre transitivo: seguir imports dentro de cada JS alcanzable.
while (queue.length) {
  const abs = jsByPublic.get(queue.pop());
  const content = await readFile(abs, 'utf-8');
  for (const m of content.matchAll(ABS_JS)) mark(m[0]);
  for (const m of content.matchAll(REL_IMPORT)) mark(toPublic(resolve(dirname(abs), m[1])));
}

let removed = 0;
for (const [pub, abs] of jsByPublic) {
  if (!referenced.has(pub)) {
    await unlink(abs);
    console.log(`[prune-orphan-js] eliminado (inalcanzable): ${pub}`);
    removed++;
  }
}
console.log(
  removed
    ? `[prune-orphan-js] ${removed} archivo(s) eliminado(s).`
    : '[prune-orphan-js] nada que podar.',
);
