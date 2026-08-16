// Elimina de la salida del build los assets de _astro que no referencia NADIE.
//
// astro:assets copia el archivo ORIGINAL de cada imagen importada además de
// generar las variantes optimizadas. Los originales no los linkea ningún HTML
// ni ningún CSS —el `srcset` apunta siempre a las variantes— así que no cuestan
// transferencia, pero se suben a Vercel en cada deploy: 251.427 B medidos en la
// auditoría de performance del 16/08/2026, 19 archivos.
//
// Corre sobre TODAS las raíces de salida (ver scripts/lib/salidas-build.mjs);
// apuntar solo a `dist/` dejaba intactos los 251.427 B en el árbol que Vercel
// realmente deploya.
//
// Hermano de prune-orphan-js.mjs, que hace lo mismo con el JS muerto de React.
// Ese resuelve alcanzabilidad TRANSITIVA porque un chunk puede importar a otro;
// acá no hace falta: los assets son hojas del grafo, nadie importa desde adentro
// de un .jpg. Alcanza con preguntar si el nombre aparece en algún archivo de
// texto emitido.
//
// El sesgo es conservador, y de forma deliberadamente burda:
//  - La semilla son TODOS los archivos de texto del build (html, css, js, xml,
//    json, txt, webmanifest), no solo el HTML. El sitemap y el CSS también
//    referencian assets, y sembrar solo desde el HTML es exactamente cómo este
//    script borraría algo que sí se usa.
//  - Se busca por BASENAME, no por ruta. Si el nombre aparece en cualquier lado
//    —aunque sea dentro de un string, un comentario o partido por el minificador
//    en una forma que igual contiene el basename— el archivo se conserva.
//  - Solo se consideran extensiones de imagen y solo bajo `_astro/`. Fuentes,
//    JS y CSS quedan fuera del alcance de este script por construcción.
//
// Ante la duda, NO se borra. Un falso positivo acá es una imagen rota en
// producción; un falso negativo son unos KB de más en el bundle de deploy.
import { readFile, unlink, stat } from 'node:fs/promises';
import { extname, basename, relative } from 'node:path';
import { enBytes, raicesDeSalida, walk } from './lib/salidas-build.mjs';

/** Extensiones que este script puede podar. */
const PODABLES = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg']);
/** Extensiones que se leen como texto para buscar referencias. */
const TEXTO = new Set(['.html', '.css', '.js', '.mjs', '.xml', '.json', '.txt', '.webmanifest']);

/**
 * Poda una raíz de salida.
 *
 * @param {string} raiz
 * @returns {Promise<{removed: number, bytes: number}>}
 */
async function podar(raiz) {
  const files = await walk(raiz);

  // Semilla: el texto completo de todo lo emitido que sea texto.
  const referencias = [];
  for (const f of files) {
    if (TEXTO.has(extname(f).toLowerCase())) referencias.push(await readFile(f, 'utf-8'));
  }
  const corpus = referencias.join('\n');

  const candidatos = files.filter((f) => {
    const rel = relative(raiz, f).split(/[\\/]/).join('/');
    return rel.startsWith('_astro/') && PODABLES.has(extname(f).toLowerCase());
  });

  let removed = 0;
  let bytes = 0;
  for (const abs of candidatos) {
    if (corpus.includes(basename(abs))) continue;
    bytes += (await stat(abs)).size;
    await unlink(abs);
    console.log(`[prune-orphan-assets] eliminado (sin referencias): /${relative(raiz, abs)}`);
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
    ? `[prune-orphan-assets] ${removed} archivo(s), ${enBytes(bytes)} en ${raices.length} raíz/raíces.`
    : '[prune-orphan-assets] nada que podar.',
);
