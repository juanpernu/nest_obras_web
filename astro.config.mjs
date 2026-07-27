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
  vite: { plugins: [tailwindcss()] },
});
