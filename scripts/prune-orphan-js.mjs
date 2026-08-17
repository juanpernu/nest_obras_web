// Elimina de la salida del build los .js de _astro que no sean ALCANZABLES
// desde el HTML.
//
// Con cero directivas client:*, el único JS legítimo es el que linkeamos con
// <script> (y lo que ese JS importe transitivamente). El resto es output muerto
// del build: el runtime de React que @astrojs/react registra como clientEntrypoint
// aunque nada se hidrate (ver docs/PLAN-EJECUCION.md §2.7/§12 y la auditoría de perf).
//
// Corre sobre TODAS las raíces de salida (ver scripts/lib/salidas-build.mjs).
// Hasta el 16/08/2026 apuntaba solo a `dist/`, así que los 603.258 B de React
// inalcanzable se subían igual a Vercel en cada deploy: la poda limpiaba un
// árbol que no se deploya.
//
// Alcanzabilidad transitiva sobre los archivos emitidos: se parte de las
// referencias del HTML y se siguen los imports (absolutos `/_astro/…` y relativos
// `./…`) dentro de cada .js. El sesgo es conservador: ante la duda se MARCA como
// referenciado (nunca se borra un chunk que alguien pueda estar usando).
import { readFile, unlink, stat } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';
import { enBytes, raicesDeSalida, walk } from './lib/salidas-build.mjs';

// Referencias absolutas a un .js bajo _astro; y specifiers de import relativos.
const ABS_JS = /\/_astro\/[\w./-]+\.js/g;
const REL_IMPORT = /(?:import|from|import\s*\()\s*["'](\.{1,2}\/[\w./-]+\.js)["']/g;

/**
 * Poda una raíz de salida.
 *
 * @param {string} raiz
 * @returns {Promise<{removed: number, bytes: number}>}
 */
async function podar(raiz) {
  /** Path público (`/_astro/…`) de un archivo absoluto dentro de la raíz. */
  const toPublic = (absPath) => '/' + relative(raiz, absPath).split(/[\\/]/).join('/');

  const files = await walk(raiz);
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
  let bytes = 0;
  for (const [pub, abs] of jsByPublic) {
    if (referenced.has(pub)) continue;
    bytes += (await stat(abs)).size;
    await unlink(abs);
    console.log(`[prune-orphan-js] eliminado (inalcanzable): ${pub}`);
    removed++;
  }
  return { removed, bytes };
}

const raices = await raicesDeSalida();
let removed = 0;
let bytes = 0;
for (const raiz of raices) {
  const r = await podar(raiz);
  removed += r.removed;
  bytes += r.bytes;
}

console.log(
  removed
    ? `[prune-orphan-js] ${removed} archivo(s), ${enBytes(bytes)} en ${raices.length} raíz/raíces.`
    : '[prune-orphan-js] nada que podar.',
);
