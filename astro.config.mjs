// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://nestobras.com.ar',
  trailingSlash: 'never',
  output: 'static',
  // prefetch queda DESACTIVADO (implícito). No activar: Astro's prefetch inyecta
  // un <script src> real (~7 KB) en cada página y rompe "solo scripts inline"
  // (docs/PLAN-EJECUCION.md §7.1).
  adapter: vercel(),
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    // `assetsInlineLimit: 0` — ningún asset se base64-inlinea en el CSS
    // (16/08/2026, auditoría de performance). Vite inlinea por defecto todo lo
    // que baje de 4 KB, y con los agregados de Fontsource (ver el comentario de
    // los @import en global.css) eso alcanzaba a 6 subsets chicos —greek,
    // greek-ext, vietnamese— que este sitio NUNCA renderiza: +26.185 B de CSS
    // sin comprimir, y encima bloqueante, para caras que el `unicode-range`
    // jamás va a activar. Base64 pesa 4/3 del binario y no comprime.
    //
    // Es el mismo problema que la nota original de global.css documentaba. La
    // diferencia es que ahora se ataca en la causa —el inlining— en vez de
    // evitando los archivos que traen `unicode-range`, así se conservan las dos
    // cosas: cero base64 y descarga por rango.
    build: { assetsInlineLimit: 0 },
  },
});
