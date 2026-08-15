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
- [x] **P2. SEO/GEO** con el skill `seo-geo` — instalado (revisado: benigno) y aplicado. Auditoría reconciliada con §6 en **`docs/seo-geo-checklist.md`**. Aplicado en fundación: `<meta robots>` con rich-preview, JSON-LD enriquecido (`WebSite`, `founder`, `contactPoint`, `alternateName`). Rechazado por conflicto con §6: `meta keywords`, `AggregateRating`/`Review`, keyword-stuffing. Diferido a Fase 4-6: métodos GEO en el copy, `FAQPage` (a decidir con el usuario), Bing Webmaster.

## Code review PR #1 (implementado)
Findings verificados contra el código e implementados con criterio senior:
- [x] **JSON-LD: escapado de `<`** (`toSafeJson`) — cierra inyección XSS cuando `jsonLd` traiga datos de obras en Fase 4. (HIGH)
- [x] `FotoObra`: `sizes` **obligatorio** (§7.4 prohíbe `100vw` por defecto).
- [x] `prune-orphan-js.mjs`: **alcanzabilidad transitiva** (paths anidados + imports abs/rel); `verificar-perf.sh` mide el budget real (JS referenciado/ruta), no "0 archivos".
- [x] `HeroVideo`: `prefers-reduced-motion` plegado en `<source media>` (no descarga-y-oculta).
- [x] Skill `seo-geo` **des-vendorizado** del repo (gitignore + `skills-lock.json`) — no versionar código MIT de terceros en repo propietario.
- [x] `as Props` estandarizado (binding implícito no fiable en el toolchain).
- [x] OG/Twitter completos: `twitter:image`, `og:image:alt`, prop `ogImageAlt`; JSON-LD con `@id`/`publisher`.
- [x] `global.css`: bloque reservado con el mapeo shadcn §3.2 (arena nunca sobre blanco).

Follow-ups tracked (no bloquean el merge):
- [ ] Fase 3: aplicar el mapeo shadcn §3.2 reservado; grep de CI que exija `Astro.props as <T>` en cada `.astro`.
- [ ] Revisar el pin de TypeScript 6.x cuando `astro check` soporte el compilador TS 7.
- [ ] Quitar `minimumReleaseAgeExclude: astro@7.1.4` de `pnpm-workspace.yaml` cuando envejezca el paquete.
- [ ] Verificar el link `wa.me` (dígito `9` móvil AR) en un dispositivo real antes del launch.
- [ ] Fase 4: `og:image:width/height/type` cuando existan imágenes sociales (1200×630).

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

## Code review PR #2 (Fase 2-4) — implementado
Ratios WCAG recalculados (la estimación del doc de identidad estaba mal; el doc pedía recalcular):
- [x] **Contraste de texto**: `text-navy-600` (3.98, falla AA) → `text-navy-700` (5.37 ✅) en 16 lugares.
- [x] **Arena sobre fondo claro** (regla §1.2): números de paso `text-arena-600` (1.92) y bullet `text-arena-700` (2.66) → `text-navy-700`.
- [x] **Bordes no-texto**: inputs `navy-300` (1.84) y filtros `navy-200` (1.48) → `navy-600` (3.98 ✅).
- [x] `BarraEstadisticas`: eliminada la duplicación de label para lectores de pantalla (un solo `<dt>`).
- [x] `/nosotros`: agregado `<h2>Nuestros valores</h2>` (jerarquía §6.4).
- [x] `FormularioConsulta`: quitados placeholders de bajo contraste (hint al label) y `autocomplete="tel"` engañoso.
- [x] JSON-LD consolidado en un solo `@graph` (los `@id` resuelven en el mismo doc).
- [x] `TarjetaObra`: `sizes` como prop (la Home 2-col pasa su propio valor).
- [x] `alt` de placeholders prefijados "Imagen provisoria" (honestidad para lectores de pantalla).
- [x] `src/content/testimonios/.gitkeep` (dir trackeado; el aviso de "colección vacía" es esperado — §4.5 la quiere vacía).
- [x] **§11**: WhatsApp `5491155269160` y email `info@nestobras.com.ar` **confirmados reales** (los pasó el usuario) → dejan de estar pendientes.

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

---

## Feedback en página (agentation) — Home, 15/08/2026 — implementado

10 anotaciones sobre `/`, todas verificadas en `pnpm preview` a 1706×1329.

- [x] **1. Logo del header** — `public/logo-nest.svg` pasa a blanco entero (los 3 paths del isotipo iban en arena `#D9C2B6`). Ese archivo lo usa solo el header de Home sin scrollear; el resto usa la variante oscura. Ahora también lo usa el footer.
- [x] **2. Contador de estadísticas** — el trigger funcionaba, pero por `<dd>` y con `threshold: 0.4`: en mobile (2 columnas) las dos filas contaban desfasadas y en scroll rápido la cuenta arrancaba pasada la mitad. Pasa a un observer por barra (`[data-contadores]`), `threshold: 0` + `rootMargin: 0 0 -10% 0`. Los cuatro números arrancan juntos apenas la barra entra en viewport.
- [x] **3 y 4. Sección "Quiénes somos"** — en desktop la sección pasa a `min-h-dvh` y la foto ocupa la mitad derecha exacta (576px de 1152) a alto completo, apoyada contra la guía derecha de `HojaTecnica`. `gap`/`px` se mueven a la columna de texto para que la mitad sea 50% real. Mobile intacto (una columna, 4:3). `widths` sube a 1280 y `sizes` declara 70vw: el recorte lo manda el alto de la caja, no su ancho.
- [x] **5. GrillaServicios** — fuera el marco "blueprint" completo: reglas horizontales con sangrado a viewport, verticales, divisores de 1px entre tarjetas y las 8 marcas de registro. Se conserva la distribución (3 columnas, 44px de aire arriba/abajo). Las columnas ahora salen de `servicios.length` en vez del `1fr auto 1fr auto 1fr` fijo.
- [x] **6. Velo de las tarjetas de obra** — `color-mix(navy 70%)` → `rgb(0 0 0 / 0.7)`. Misma transparencia, tinta neutra. Contraste contra el texto blanco sube de 5.41 a 8.5 en el peor caso.
- [x] **7. GrillaLogos** — fuera el reticulado entero (segmentos, extensiones difuminadas y puntos de cruce). La grilla queda igual: 2 cols en mobile, 4 en desktop, `auto-rows-fr`. Afecta también a `/servicios`.
- [x] **8. CarruselTestimonios** — eliminado el `.tst-riel` y su sangría; la cita arranca contra el borde de la columna.
- [x] **9. TimelineContacto** — fuera la vertical de referencia, las horizontales por fila y los nodos. Sin líneas los nodos quedaban sueltos, así que se van con ellas, y con ellas la sangría que existía para dejarles lugar. Se conservan las cajas de ícono (son la píldora del sistema, no una línea del marco).
- [x] **10. Footer** — fondo navy, tipografía blanca. Croma invertida entera porque sobre navy los tonos de fondo claro fallan (arena-800 2.53, navy-700 2.51): cuerpo y links en navy-100 (11.24), títulos de columna en arena de marca (7.99), íconos en blanco con borde blanco/30 y hover a arena. Logo → `/logo-nest.svg`.

**No se tocó** el sistema de marco "hoja técnica" (guías de página de `HojaTecnica`, reglas y escuadras de `MarcoSeccion`, `FranjaRayado`): las anotaciones apuntaban a los items dentro de los contenedores, no al marco del documento.

**Verificación:** `astro check` 0 errores / 0 warnings, `pnpm build` OK (6 páginas), `prune-orphan-js` sigue eliminando los 3 chunks de React → cero hidratación intacta. Recorrido visual de `/` y `/servicios` en preview.

### Segunda ronda de feedback (agentation) — Home, 15/08/2026

- [x] **1. Card del formulario → glass** — el navy sólido pasa al mismo tratamiento del header scrolleado, con los cuatro valores copiados de `Nav.astro`: `bg-white/70` + `backdrop-blur-md` + `border-navy-200` + `shadow-[0_12px_40px_rgba(0,0,0,0.1)]`. Al invertirse el fondo, `FormularioConsulta` deja de recibir `sobreNavy` y vuelve a su cromática clara (labels navy, campos con borde navy-600, botón arena sólido). Sobre una sección blanca lisa el blur no tiene nada que difuminar: lo que separa la card son el borde y la sombra.
- [x] **3. Logo oscuro → full navy** — `public/logo-nest-oscuro.svg`: el isotipo iba en arena-800 `#865C46` → navy `#003057`. Ahora las dos variantes del logo son de una sola tinta (blanca la del hero/footer, navy ésta).
- [x] **5. CTA del navbar** — `!text-[1.1rem]` → `!text-[0.9625rem]`, el mismo tamaño que los links del header. Verificado: los dos computan 15.4px.
- [x] **4. Grilla de logos "a todo el ancho"** — la grilla YA medía 1104px = 100% de su padre; lo que no llegaba a los bordes era el contenido. Dos cambios: (a) los logos pasan de `h-12` + `max-w-[140px]` a caja `h-16 w-full` con `object-contain`, y el padding lateral de celda de 24px a 16px; (b) desktop pasa de 4 a **5 columnas** (decisión de la usuaria): 10 logos dan 2 filas exactas y desaparece la fila huérfana que usaba 2 de 4 celdas. Mobile sigue en 2 (5 filas exactas). Techo real documentado en el componente: los 10 SVG tienen ratios de 1.11 a 2.96 y la celda es más ancha que alta, así que todos quedan limitados por el alto de 64px — ensanchar la celda no los agranda, manda `h-16`.

### Tercera ronda de feedback (agentation) — Home, 15/08/2026

- [x] **Servicios a 3 columnas de ancho completo** — la grilla ya eran 3 columnas de 368px, pero cada `.srv-card` traía 48px de padding en desktop: el contenido medía 272px y quedaban 48px muertos contra cada borde del contenedor más 96px entre items. La separación pasa a hacerla el `gap` de la grilla (3rem en desktop, 2.5rem apilado) y el padding se va. Medido: 3 columnas de 336px, el texto del primer item arranca en el borde izquierdo de la grilla y el del tercero termina en el derecho — los 1104px completos. El contenido por item crece 272 → 336px (+23%).
  Se fue con el padding el `background-color: #fff` del hover de la tarjeta, que era letra muerta desde que la Sección 4 pasó a fondo blanco (14/08/2026): pintaba blanco sobre blanco.

### Cuarta ronda de feedback (agentation) — Home, 15/08/2026

- [x] **Píldoras de ícono de Servicios → navy translúcido** — `.srv-ico` pasa del arena-200 plano a la misma receta glass del header scrolleado, en navy en vez de blanco: fill `color-mix(navy 70%, transparent)` + `blur(12px)` (el `backdrop-blur-md` de Tailwind) + el borde navy que ya tenía. Pasó por un paso intermedio de rayado diagonal (mismo día) que se descartó.
  El ícono TIENE que ir en blanco: navy al 70% sobre el blanco de la sección compone #4D6E89, y el trazo navy anterior daba 2.53 contra eso — desaparecía. En blanco da 5.37 (WCAG 1.4.11 pide 3:1 para gráficos).
  El `backdrop-filter` hoy es decorativo: la Sección 4 es blanco liso y no hay nada detrás que difuminar. Va igual porque el pedido era replicar el tratamiento del navbar.
  El patrón `--rayado` queda en `global.css` junto a `--color-hatch`: hoy lo consume solo `FranjaRayado`, pero es un patrón del sistema y ahí está disponible sin volver a copiarlo.
