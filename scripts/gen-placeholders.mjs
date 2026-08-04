// Genera imágenes PLACEHOLDER on-brand (navy) para poder construir y revisar el
// sitio sin las fotos reales. Se reemplazan por las fotos reales antes del launch
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

const obras = [
  ['prune', 'PRUNE', 'RETAIL CORPORATIVO'],
  ['el-canton', 'EL CANTÓN GOLF', 'VIVIENDA · ESCOBAR'],
  ['google-wework', 'GOOGLE / WEWORK', 'CORPORATIVO · CABA'],
  ['fabric-sushi', 'FABRIC SUSHI', 'CORPORATIVO · BUENOS AIRES'],
  ['tacuari-1050', 'TACUARÍ 1050', 'EDIFICIO · CABA'],
  ['nordelta', 'NORDELTA', 'VIVIENDA · TIGRE'],
  ['san-isidro', 'SAN ISIDRO', 'VIVIENDA'],
  ['uade', 'UADE', 'CORPORATIVO · CABA'],
  ['irsa', 'IRSA', 'CORPORATIVO · CABA'],
  ['santa-barbara', 'BARRIO SANTA BÁRBARA', 'VIVIENDA · PILAR'],
  ['nordelta-golf', 'NORDELTA GOLF', 'VIVIENDA · TIGRE'],
];

console.log('Portadas de obra:');
for (const [slug, title, sub] of obras) {
  await gen(`${OBRAS}${slug}-portada.jpg`, 1200, 900, title, sub);
}

console.log('Galería PRUNE (8):');
for (let i = 1; i <= 8; i++) {
  await gen(`${OBRAS}prune-${String(i).padStart(2, '0')}.jpg`, 1200, 900, 'PRUNE', `SUCURSAL ${i}`);
}

console.log('Poster del hero:');
await gen(`${PUBLIC}hero-poster.jpg`, 1920, 1080, 'NEST', 'CONSTRUCTORA');

console.log('Listo.');
