// Raíces de salida que los scripts de poda tienen que recorrer.
//
// `astro build` con el adapter de Vercel deja DOS árboles en el repo:
//
//   dist/                      salida estándar de Astro
//   .vercel/output/static/     lo que Vercel efectivamente deploya
//
// El adapter copia el segundo desde el primero en el hook `astro:build:done`,
// es decir ANTES de que corran estos scripts, que van encadenados después de
// `astro build` en package.json. Podar solo `dist/` es entonces un no-op sobre
// el artefacto que se sube: el 16/08/2026 sobrevivían al deploy 251.427 B de
// imágenes originales y 603.258 B de JS de React inalcanzable, exactamente lo
// que los dos scripts creían estar borrando.
//
// Se podan las dos y no solo la de Vercel a propósito: `dist/` es lo que sirve
// `astro preview`, y si las dos no quedan iguales el preview deja de
// representar lo que ve producción.
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Candidatas, relativas a este archivo (`scripts/lib/`), en orden de build. */
const CANDIDATAS = ['../../dist/', '../../.vercel/output/static/'];

/**
 * Raíces de salida que existen en disco.
 *
 * Filtrar por existencia evita romper el build con un `ENOENT` cuando una
 * configuración no emite alguna de las dos: estos scripts van encadenados con
 * `&&` después de `astro build`, así que un throw acá voltea `pnpm build`.
 *
 * Pero CERO raíces no es un caso benigno: después de un build siempre existe al
 * menos `dist/`. Si no hay ninguna, o el build no corrió o estas rutas
 * quedaron desactualizadas, y en los dos casos la poda silenciosa reportando
 * "nada que podar" es exactamente el modo de falla que estos scripts tienen que
 * evitar. Por eso ahí sí se tira.
 *
 * @returns {Promise<string[]>} paths absolutos, con separador del sistema.
 */
export async function raicesDeSalida() {
  const raices = (
    await Promise.all(
      CANDIDATAS.map(async (rel) => {
        const dir = fileURLToPath(new URL(rel, import.meta.url));
        const info = await stat(dir).catch(() => null);
        return info?.isDirectory() ? dir : null;
      }),
    )
  ).filter((r) => r !== null);

  if (!raices.length) {
    throw new Error(
      'No se encontró ninguna raíz de salida del build. Buscadas: ' +
        CANDIDATAS.map((c) => fileURLToPath(new URL(c, import.meta.url))).join(', ') +
        '. ¿Corriste `astro build` antes? ¿Cambió el outDir o el adapter?',
    );
  }
  return raices;
}

/**
 * Todos los archivos bajo `dir`, recursivo.
 *
 * @param {string} dir
 * @param {string[]} out
 * @returns {Promise<string[]>} paths absolutos.
 */
export async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else out.push(full);
  }
  return out;
}

/** Formatea bytes con separador de miles es-AR. */
export const enBytes = (n) => `${n.toLocaleString('es-AR')} bytes`;
