// Genera las imágenes PLACEHOLDER on-brand (navy) que todavía quedan: las
// galerías de los tres casos con página propia. Sirven para poder construir y
// revisar el sitio sin las fotos reales. Se reemplazan por las fotos reales antes del launch
// (mismo nombre de archivo). NO son contenido final. Correr: node scripts/gen-placeholders.mjs
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const OBRAS = ROOT + 'src/assets/obras/';
const PUBLIC = ROOT + 'public/';
const NAVY = '#003057';
const ARENA = '#D9C2B6';
const STEEL = '#8098AB';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function svg(w, h, title, sub) {
  return Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${NAVY}"/>
      <text x="50%" y="46%" fill="${ARENA}" font-family="Arial, sans-serif" font-size="${Math.round(
        w * 0.058,
      )}" font-weight="600" text-anchor="middle" letter-spacing="1">${esc(title)}</text>
      <text x="50%" y="55%" fill="${STEEL}" font-family="Arial, sans-serif" font-size="${Math.round(
        w * 0.02,
      )}" text-anchor="middle" letter-spacing="4">${esc(sub)}</text>
      <text x="50%" y="94%" fill="${STEEL}" font-family="Arial, sans-serif" font-size="${Math.round(
        w * 0.014,
      )}" text-anchor="middle" letter-spacing="2">PLACEHOLDER — REEMPLAZAR CON FOTO REAL</text>
    </svg>`,
  );
}

async function gen(path, w, h, title, sub) {
  await sharp(svg(w, h, title, sub)).jpeg({ quality: 80, mozjpeg: true }).toFile(path);
  console.log('  ▪', path.replace(ROOT, ''));
}

await mkdir(OBRAS, { recursive: true });

/* PORTADAS: ya no se generan (23/08/2026). Con las fotos reales que entraron
 * en design-v2, las 12 obras de la colección apuntan a una imagen real, así
 * que este bloque solo producía archivos que no referenciaba nadie. Si vuelve
 * a hacer falta una portada provisional para una obra nueva, la receta es la
 * misma que abajo: `gen(`${OBRAS}<slug>-portada.jpg`, 1200, 900, TITULO, SUB)`.
 *
 * Lo único que sigue siendo placeholder son las galerías de los tres casos con
 * página propia, acá abajo. */

/* Galerías de los casos con página propia. El schema de la colección exige
 * mínimo 8 fotos cuando `paginaPropia: true` (ver el superRefine de
 * content.config.ts), así que sin estas ocho el build de esas páginas no pasa.
 *
 * `tacuari-1050` conserva el prefijo viejo a propósito: el .md, la portada y
 * estos archivos siguen nombrados 1050 aunque la obra se muestre como
 * "Tacuarí 1051" y su URL sea /obras/tacuari-1051. Se cambió el texto visible,
 * no los identificadores internos (22/08/2026). */
const galerias = [
  ['prune', 'PRÜNE', (i) => `SUCURSAL ${i}`],
  ['el-aromo', 'EL AROMO', (i) => `VISTA ${i}`],
  ['tacuari-1050', 'TACUARÍ 1051', (i) => `VISTA ${i}`],
];

for (const [slug, title, sub] of galerias) {
  console.log(`Galería ${title} (8):`);
  for (let i = 1; i <= 8; i++) {
    await gen(`${OBRAS}${slug}-${String(i).padStart(2, '0')}.jpg`, 1200, 900, title, sub(i));
  }
}

console.log('Poster del hero:');
await gen(`${PUBLIC}hero-poster.jpg`, 1920, 1080, 'NEST', 'CONSTRUCTORA');

console.log('Listo.');
