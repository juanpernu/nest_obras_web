# NEST — Plan de implementación del sitio `nestobras.com.ar`

> **Fuente de verdad:** `docs/PLAN-EJECUCION.md` (§ = sus secciones). Este plan lo
> secuencia en tareas revisables con criterio de aceptación por fase. Ante
> discrepancia, manda el spec. Sub-skill de ejecución: `superpowers:executing-plans`.

**Goal:** construir `nestobras.com.ar` — Astro 5 estático, captador de leads, mobile-first, GEO.

**Arquitectura:** Astro 5 `output: 'static'` + una única ruta on-demand (`/api/consulta`). shadcn/ui en `.tsx` → HTML en build, **cero `client:*`**. Interacción con nativos (`<details>`, `<dialog>`, scroll-snap, `:has()`). Content Layer + Zod (validación que rompe el build). Sharp en build. Vercel Pro.

**Stack:** Astro 5, React 19 (`@astrojs/react`, solo build), Tailwind v4 (`@tailwindcss/vite`), shadcn/ui, `astro:assets`, `@astrojs/sitemap`, `@astrojs/vercel`, Resend, Airtable, Cloudflare Turnstile, pnpm, Node 22.x (Vercel).

---

## Estado de datos y bloqueos (§11)

| Dato | Estado | Efecto |
|---|---|---|
| WhatsApp, email, dirección (NAP) | **Disponible** | valores reales desde Fase 1/5. No bloquean. |
| PDF fuente (pp. 10-17) | **Disponible** | copy literal de /obras, PRUNE, El Canton, tabla clientes, /contacto. |
| Portadas de obra (`portada: image()` obligatoria §4.1) | **Solo algunas** | solo compilan las obras con portada en disco; `/obras` = subconjunto; el resto a Fase 7. Checks hardcodeados → data-driven. |
| Galería 8+ por página propia (§4.1) | **No** | bloqueo duro de PRUNE → `prune.md` en `paginaPropia:false`; publicación a Fase 7. |
| Colores de marca / preset | **No** | bloqueo blando: tokens por defecto, swap en Fase 7. Usar tokens semánticos, no hex. |
| Ficha El Canton | **No** | `/obras/el-canton` a Fase 7. |
| Testimonios reales | **No** (~sem. 3) | Sección 7 Home no se renderiza; a Fase 7. |

**Regla de obras:** una obra se publica solo si su portada existe en `src/assets/obras/`.

---

## Restricciones globales innegociables (§12/§2/§7) — implícitas en TODA tarea

- Cero `client:*`. `curl` sin JS devuelve todo el contenido de valor.
- Un solo `<h1>`/página, jerarquía sin saltos. 8 clientes como TEXTO en la Home.
- Cero `[completar]` / testimonios placeholder. **Acentuación corregida en TODO** (el PDF viene sin tildes).
- `alt` descriptivo en toda imagen. `<form>`/`<label for>`/`<button type=submit>` reales.
- Canonical autorreferencial + ruta en `sitemap.xml` (7 rutas). Sin `llms.txt`. Ninguna página por variante geográfica.
- Mobile: 0 KB framework, JS < 5 KB/ruta, CSS < 20 KB, LCP < 2 s (= `<h1>`), CLS < 0,05, video del hero NO se descarga en mobile, táctiles ≥ 44 px, inputs `font-size` ≥ 16 px.
- Lighthouse mobile ≥ 95 perf / 100 a11y, contra build servido (no `astro dev`).

## Decisiones de implementación (resueltas en la validación)

1. **Turnstile** = mejora progresiva. Sin JS no hay token → server acepta validando honeypot + server-side; con JS exige token (modo invisible/managed; eximido del check de tamaño JS).
2. **Fixture de PRUNE** git-ignored (`src/content/obras/__fixture.md`) para probar el template sin publicar placeholders. Nunca flipear `prune.md` real.
3. **Tokens semánticos** siempre (`bg-primary`…), nunca hex → swap de marca = 1 archivo + re-Lighthouse a11y/contraste.
4. **Checks data-driven**: parametrizar `verificar-html.sh` a las obras publicadas; documentar líneas rojas-esperadas hasta Fase 7.

---

## Fase 1 — Fundaciones

- [x] **1.9a `LICENSE`** — MIT → **propietario / All rights reserved** (MIT es incorrecto para sitio comercial). Holder: Juan Pernumian, desarrollado para NEST. *(hecho; confirmar si el holder debe ser NEST)*
- [x] **1.9b `README.md`** — README real (qué es, stack, principios, estructura, scripts, env, deploy, link al spec). *(hecho)*
- [x] **1.1 Scaffold.** Astro **7.1.4** (última; ver decisión de versión) + Tailwind v4 (`@tailwindcss/vite` + `@import "tailwindcss"` en `global.css`) + `@astrojs/react` 6 (React 19). Alias `@/*` en `tsconfig.json`. `.npmrc` (`ignore-workspace-root-check`) + `pnpm-workspace.yaml` (`allowBuilds: esbuild/sharp`). TypeScript pin **6.x** (astro check no soporta TS 7 nativo). *(hecho — `pnpm build` y `astro check` verdes)*
- [x] **1.2 `astro.config.mjs`** (§3.2): `site`, `trailingSlash:'never'`, `output:'static'`, `adapter: vercel()`, `integrations:[react(), sitemap()]`, `vite.plugins:[tailwindcss()]`. Sin `imageService:true`. *(hecho)*
- [x] **1.3 `src/data/`**: `site.ts` ✓ (WhatsApp/email/Instagram reales; nombre "Nest Obras"; dirección TBD → JSON-LD omite `address`), `clientes.ts` (8) ✓, `estadisticas.ts` ✓.
- [x] **1.4 `src/layouts/main.astro`**: `lang="es-AR"`, canonical autorreferencial, OG por ruta, Twitter card, JSON-LD global `GeneralContractor`+`Organization` (desde `site.ts`; `address` omitido hasta tener dirección). ✓
- [x] **1.5 `public/robots.txt`** literal §6.2 (Sitemap → `sitemap-index.xml`). *(hecho)*
- [x] **1.6 `vercel.json`**: `X-Robots-Tag: noindex` en `*.vercel.app` (§9). Confirmar trailing-slash de Vercel = `never` al deployar. *(hecho)*
- [x] **1.7 Tipografía** — **Roboto Condensed** self-hosted vía Fontsource (pesos 300/400/500, `swap`), preload del peso 300 (hero/LCP). Tokens de marca + escala tipográfica de `identidad-visual.md` aplicados en `global.css` (**adelantado desde Fase 7**). ✓
- [ ] **1.8 Vercel** *(acción del usuario)*: proyecto (Node 22.x, región `gru1`), primer preview deploy; Deployment Protection solo en previews.

**Aceptación:** `pnpm build` OK ✓; `curl` home → `<h1>` ✓; sitemap con URLs absolutas ✓; `astro check` 0 errores ✓; JS al usuario = 0 KB ✓; CSS ≈ 17,9 KB gz (< 20 KB) ✓; preview `X-Robots-Tag: noindex` *(al deployar)*.

> **Identidad visual aplicada** (`docs/identidad-visual.md`): navy `#003057` + arena `#D9C2B6`, escala tipográfica fluida, radius 0, sin sombras/degradados. Restricción a11y: **arena sobre blanco falla (1.70)** → acento claro = navy; se aplica en el mapeo shadcn de Fase 3 (§3.2 del doc).
> **Hallazgo perf:** `@astrojs/react` emite un chunk `client.*.js` (~191 KB) **huérfano** — ningún HTML lo referencia (0 KB al usuario). El check de tamaño de bundle (§12) debe medir JS **referenciado por ruta** (=0), no chunks huérfanos.

## Post-Fase-1 (pedido del usuario)
- [x] **P1. Análisis profundo de performance** (agente `frontend-developer`) — hecho e implementado:
  - **CSS −86%**: import de subsets `latin`/`latin-ext` en vez de all-subset → 17,9 KB → **2,4 KB gz** (había un greek-ext base64-inline = 62% del presupuesto).
  - **Chunk React huérfano podado**: `scripts/prune-orphan-js.mjs` (en `pnpm build`) borra el `client.*.js` sin referencias → **0 JS** en el artefacto.
  - **`prefetch` off + documentado** en `astro.config.mjs` (activarlo inyecta un `<script src>` que rompe el budget).
  - **`vercel.json` `trailingSlash: false`** (matchea `astro.config`, evita duplicados).
  - **Guardarraíles creados**: `FotoObra.astro` (§7.4), `HeroVideo.astro` (§7.2), `scripts/verificar-perf.sh` (budget CSS/JS).
  - **CLS**: stopgap "Arial Narrow" en el stack. **fontaine descartado** (evidencia: mal-derivó métricas → "Roboto fallback" con size-adjust ~100%, y no inyecta en la CSS-var de Tailwind v4). → **Fallback métrico definitivo diferido a Fase 4** (medir CLS contra el hero real; un `<h1>` placeholder no da CLS medible).
- [x] **P2. SEO/GEO** con el skill `seo-geo` — instalado (`.agents/skills/seo-geo`, revisado: benigno) y aplicado. Auditoría reconciliada con §6 en **`docs/seo-geo-checklist.md`**. Aplicado en fundación: `<meta robots>` con rich-preview, JSON-LD enriquecido (`WebSite`, `founder`, `contactPoint`, `alternateName`). Rechazado por conflicto con §6: `meta keywords`, `AggregateRating`/`Review`, keyword-stuffing. Diferido a Fase 4-6: métodos GEO en el copy, `FAQPage` (a decidir con el usuario), Bing Webmaster.

## Fase 2 — Modelo de contenido

- [ ] **2.1 Inventario de portadas**: cuáles obras tienen portada → a `src/assets/obras/`; `.md` solo para esas; listar diferidas.
- [ ] **2.2 `src/content.config.ts`**: colección `obras` (§4.1, incl. `portada` + `superRefine`) + `servicios`/`equipo`/`testimonios` (§4.5).
- [ ] **2.3 `.md` de obras** (con portada), §4.2. Todas `paginaPropia:false` (incl. `prune.md`, con copy PDF pp.11-12 sin `galeria`). `destacadaEnHome:true` solo en destacadas con portada.
- [ ] **2.4 `servicios` (4) + `equipo` (2)**; `testimonios` vacía.
- [ ] **2.5 Verificar fail de build**: flip a `paginaPropia:true` sin campos → `astro check` falla con "…le faltan…" → revertir (o usar fixture).

**Aceptación:** `astro check` pasa; el test de flip falla y se revierte; obras publicadas = obras con portada.

## Fase 3 — Componentes base

- [ ] **3.1 shadcn**: `card button badge input label textarea separator table avatar`.
- [ ] **3.2 Componentes Astro** (`src/components/astro/`): `TarjetaObra` (prop de link: caso / `/obras` / no-clickeable; imagen `astro:assets` §7.4), `BarraEstadisticas`, `GrillaLogos` (8 nombres texto §6.5), `FichaProyecto` (`<dl>`), `Galeria` (scroll-snap + `<dialog>`, ~10 líneas JS), `FormularioConsulta` (postea a `/api/consulta`).
- [ ] **3.3 Nav** `<details>`/`<summary>` + footer con NAP. Táctiles ≥ 44 px.

**Aceptación:** `grep -r "client:" src` = 0; `GrillaLogos` = 8 nombres texto; `TarjetaObra` respeta 3 links; tokens semánticos.

## Fase 4 — Páginas de contenido

Orden: `/` → `/nosotros` → `/servicios` → `/obras` → template `/obras/[id].astro`. Copy §5 con acentuación. OG por página (§6.9). JSON-LD de página aquí: `Person`×2 (/nosotros), `Service`×4 (/servicios), `BreadcrumbList` (/obras/*). `ImageObject` (galerías) → Fase 7.

- [ ] **4.1 `/`** (§5.1): hero (video solo desktop vía `<source media>` o render condicional, nunca load-and-hide; LCP=`<h1>`; `prefers-reduced-motion`), stats, intro, 3 servicios, destacadas (con portada; PRUNE linkea a `/obras` hasta Fase 7), `GrillaLogos`, preview equipo, testimonios **condicional**, `FormularioConsulta` + WhatsApp. Confirmar que el `.mp4` de `archivo.nestobras.com.ar` responde antes de Lighthouse.
- [ ] **4.2 `/nosotros`** (§5.2): historia, equipo, proceso (5), valores (3). `Person`×2 JSON-LD.
- [ ] **4.3 `/servicios`** (§5.3): 4 servicios + Modalidades de contratación + tabla 8 clientes (PDF p.14). `Service`×4.
- [ ] **4.4 `/obras`** (§5.4): grilla de obras publicadas; filtro CSS `:has()` (§4.4); título/meta/intro PDF p.10.
- [ ] **4.5 Template `/obras/[id].astro`** (§4.3/§5.5): ficha→Desafío→Solución→Resultado→Por qué importa→CTA; `<h1>` "10 sucursales. 40 días. 24 horas."; `BreadcrumbList`. Probar con **fixture git-ignored** (8 imgs): rutas, `Galeria`, `FichaProyecto`, `ImageObject`, un `<h1>`, `curl`. Quitar fixture; publicación real → Fase 7.

**Aceptación:** un `<h1>`/página + jerarquía sin saltos; `curl /obras` = obras publicadas (data-driven); video NO se descarga en mobile; Lighthouse mobile ≥ 95 perf / 100 a11y.

## Fase 5 — Conversión

**Prereq:** owner provisiona `RESEND_API_KEY`, `NOTIFY_EMAIL`, `AIRTABLE_TOKEN`/`AIRTABLE_BASE_ID`, `TURNSTILE_SECRET_KEY`, `PUBLIC_TURNSTILE_SITE_KEY`, `PUBLIC_WHATSAPP` (§8.4).

- [ ] **5.1 `/contacto`** (§5.1 §9 + PDF pp.15-17): `FormularioConsulta` + 3 bloques de confianza (separar título/párrafo §5.6) + WhatsApp. Inputs `font-size ≥ 16 px`.
- [ ] **5.2 `src/pages/api/consulta.ts`** (§8.1): `prerender=false`; validar → Turnstile si hay token / honeypot-only si no → Airtable (falla→500) → Resend (`.catch`) → `redirect('/contacto/gracias',303)`.
- [ ] **5.3 `/contacto/gracias`**.

**Aceptación:** envía sin JS (honeypot) y con JS (Turnstile); lead en Airtable; llega mail; honeypot lleno → rechazado.

## Fase 6 — GEO, CI y cierre

- [ ] **6.1 `scripts/verificar-html.sh`** (§12) parametrizado + guarda de acentuación + guarda de video-mobile.
- [ ] **6.2 CI** (`.github/workflows/`, `$BASE_URL`=preview): `astro check`; `verificar-html.sh`; Lighthouse CI mobile; grep `client:`; grep `llms.txt`; tamaño JS < 5 KB/ruta (eximir Turnstile).
- [ ] **6.3 JSON-LD + OG** verificados en 7 rutas. Sin `AggregateRating`/`Review`.
- [ ] **6.4 Search Console** + sitemap enviado + Perfil de Negocio (NAP idéntico). *(owner)*
- [ ] **6.5 Deploy (§9):** Deployment Protection OFF en prod; 308 `www`→apex; confirmar DNS de `archivo.`.

**Aceptación:** checklist §12 verde para el alcance publicable (PRUNE/obras sin portada documentadas rojas-esperadas).

## Fase 7 — Bloqueada por §11

- [ ] Obras diferidas: al llegar cada portada → `.md` + asset → re-verificar.
- [ ] `/obras/prune`: con ≥8 fotos → `galeria` + `paginaPropia:true` → re-validar template + activar línea de `verificar-html.sh`.
- [ ] `/obras/el-canton`: con ficha real → `paginaPropia:true`.
- [ ] Testimonios reales → activar Sección 7 Home.
- [ ] Tokens de marca (colores exactos) → editar `global.css` → re-Lighthouse a11y/contraste.
- [ ] Analítica (§11): Vercel Web Analytics → reconciliar con budget < 5 KB.

---

## Verificación end-to-end

1. `pnpm build && pnpm preview` → `scripts/verificar-html.sh` sin "FALTA" (salvo rojas-esperadas).
2. `grep -rn "client:" src` vacío; sin `llms.txt`.
3. `astro check` OK; flip incompleto → falla.
4. Lighthouse mobile: perf ≥ 95, a11y = 100; traza mobile → `.mp4` no se descarga.
5. Form: sin JS → lead+mail; honeypot lleno → rechazo; con JS → Turnstile.
6. `curl -I` `*.vercel.app` → `noindex`; `www` → 308.

## Review (se completa al cierre de cada fase)

- **Fase 1:** _pendiente_
