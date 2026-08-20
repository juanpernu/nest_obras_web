# NEST — Deuda técnica y trabajo pendiente

**Actualizado:** julio 2026 · **Estado del sitio:** Fases 1-4 implementadas y en `main`.
Este documento junta todo lo que falta para llegar a producción, ordenado por prioridad.
La **Fase 5 (formulario funcionando)** es el bloque de trabajo más grande y está detallada en §1.

> Referencias: `PLAN-EJECUCION.md` (spec autoritativo), `identidad-visual.md`, `seo-geo-checklist.md`, `tasks/todo.md` (plan por fases).

---

## 0. Estado actual (qué ya está hecho)

- **Fase 1** — fundación: Astro 7 estático, Tailwind v4, layout con canonical/OG/JSON-LD (`@graph`), `robots.txt`, sitemap, `vercel.json`, tokens de marca + Roboto Condensed self-hosted.
- **Fase 2** — contenido: `content.config.ts` (Zod + `superRefine`), 10 obras, 4 servicios, 2 equipo.
- **Fase 3** — 11 componentes Astro (0 `client:*`).
- **Fase 4** — 6 páginas: `/`, `/nosotros`, `/servicios`, `/obras`, `/obras/prune`, `/contacto`.
- **Tracking** — GA4 (`G-TNT3V28PR5`) + Meta Pixel con carga diferida y Consent Mode v2, instrumentación declarativa por `data-evento`, y `/privacidad`. Ver §6.
- **Verde:** `pnpm build`, `astro check` 0/0/0, 0 KB JS de framework, CSS ~5 KB gz, contraste AA/AAA, un `<h1>` por página.
- **Code reviews** de PR #1 y #2 aplicados (seguridad JSON-LD, accesibilidad/contraste, perf).

**Lo que falta = este documento.**

---

## 1. 🔴 Fase 5 — Formulario funcionando de punta a punta (PRIORIDAD)

### 1.1 Qué falta hoy
- **No existe `src/pages/api/consulta.ts`** — `FormularioConsulta.astro` postea a `/api/consulta`, que hoy da 404.
- **No existe `src/pages/contacto/gracias.astro`** (página de confirmación post-envío).
- **No existe el widget de Turnstile** en el formulario.
- **No están provisionadas** las cuentas/keys de Resend, Airtable y Cloudflare Turnstile.

El formulario (`FormularioConsulta.astro`) ya está listo del lado del markup: `<form method="POST" action="/api/consulta">`, campos `nombre` / `contacto` / `tipo` / `mensaje`, honeypot `_gotcha`, `<select>` nativo, funciona sin JS.

### 1.2 Arquitectura del endpoint (§8.1)
Ruta **on-demand** (la única del proyecto con `output: 'static'`). Orden **persistir → notificar**:

```ts
// src/pages/api/consulta.ts
export const prerender = false; // única ruta on-demand

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, redirect, clientAddress }) => {
  const datos = await request.formData();

  // 1. Honeypot: si `_gotcha` viene lleno, es un bot → cortar sin ruido.
  if (datos.get('_gotcha')) return redirect('/contacto/gracias', 303);

  // 2. Validación server-side (los campos requeridos existen y tienen forma válida).
  const nombre = String(datos.get('nombre') ?? '').trim();
  const contacto = String(datos.get('contacto') ?? '').trim();
  const tipo = String(datos.get('tipo') ?? '').trim();
  const mensaje = String(datos.get('mensaje') ?? '').trim();
  if (!nombre || !contacto || !tipo) {
    return new Response('Faltan campos requeridos', { status: 400 });
  }

  // 3. Turnstile como MEJORA PROGRESIVA (§1.3): si hay token, verificarlo;
  //    si no hay (JS deshabilitado), aceptar validando solo honeypot + server-side.
  const token = datos.get('cf-turnstile-response');
  if (token && !(await verificarTurnstile(String(token), clientAddress))) {
    return new Response('Verificación antispam fallida', { status: 400 });
  }

  // 4. Persistir PRIMERO (si falla, 500 y no se pierde el lead).
  const lead = { nombre, contacto, tipo, mensaje, fecha: new Date().toISOString() };
  await guardarLeadAirtable(lead); // throw → 500

  // 5. Notificar DESPUÉS (si falla el mail, el lead ya está guardado).
  await enviarEmailResend(lead).catch(registrarFallo);

  return redirect('/contacto/gracias', 303);
};
```

Helpers a implementar: `verificarTurnstile()`, `guardarLeadAirtable()`, `enviarEmailResend()`, `registrarFallo()`.

### 1.3 Decisión: Turnstile vs. "funciona sin JS" vs. budget < 5 KB (ya resuelta)
- El `<form>` funciona **sin JS** y valida server-side; **Turnstile es mejora progresiva**.
- Sin JS no hay token → el server acepta validando **honeypot + validación server-side**. Con JS, exige token.
- Usar Turnstile en modo **invisible/managed**; su script es cross-origin (el check de `client:` no lo detecta) → **eximirlo explícitamente** del check de tamaño de JS en CI.

### 1.4 Pasos de implementación
1. **Provisionar servicios** (owner):
   - **Resend**: crear cuenta → API key. **Verificar el dominio `nestobras.com.ar`** (registros DNS SPF/DKIM) para poder enviar *desde* `info@nestobras.com.ar`. (Esto es "chequear con Vercel/DNS" que quedó pendiente.)
   - **Airtable**: crear base + tabla `leads` con columnas: `Nombre`, `Contacto`, `Tipo`, `Mensaje`, `Fecha`, `Estado` (para marcar atendido). Generar Personal Access Token + Base ID.
   - **Cloudflare Turnstile**: crear un site → `Site Key` (pública) + `Secret Key`.
2. **Variables de entorno** en Vercel (+ `.env` local) — §8.4:

   | Variable | Pública | Uso |
   |---|---|---|
   | `RESEND_API_KEY` | No | enviar email |
   | `NOTIFY_EMAIL` | No | destinatario de la notificación (`info@nestobras.com.ar`) |
   | `AIRTABLE_TOKEN` | No | persistir lead |
   | `AIRTABLE_BASE_ID` | No | base de leads |
   | `TURNSTILE_SECRET_KEY` | No | verificar token |
   | `PUBLIC_TURNSTILE_SITE_KEY` | Sí | widget en el form |
   | `PUBLIC_WHATSAPP` | Sí | ya en `site.ts` (`5491155269160`) |

3. **Código**:
   - `src/pages/api/consulta.ts` (arriba) + los 4 helpers.
   - Agregar el widget Turnstile a `FormularioConsulta.astro` (div `.cf-turnstile` con `data-sitekey={import.meta.env.PUBLIC_TURNSTILE_SITE_KEY}` + `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer is:inline>`), en modo managed/invisible.
   - `src/pages/contacto/gracias.astro` → `<Layout noindex>` con el mensaje "*Recibimos tu consulta. Te contactamos en menos de 24 horas.*".
4. **Ruta de escape**: `enviarEmailResend()` aislado → migrar a AWS SES ($0,10/1.000) es cambiar esa función.

### 1.5 Aceptación (§10 Fase 5)
- [ ] El formulario **envía con JavaScript deshabilitado** (honeypot-only) → lead en Airtable + mail.
- [ ] Con JS: exige y verifica Turnstile.
- [ ] Un envío con el honeypot `_gotcha` completo se **rechaza** (redirige a gracias sin persistir).
- [ ] Llega el mail a `NOTIFY_EMAIL`; el lead aparece en Airtable.
- [ ] Turnstile eximido del check de bundle JS en CI.

---

## 2. 🟠 Contenido provisional (reemplazar antes del launch)

Todo lo provisional está marcado en el código (`grep -rn "provisoria\|PROVISIONAL\|PENDIENTE" src`).

### 2.1 Imágenes placeholder
- Hoy son placeholders navy generados por `scripts/gen-placeholders.mjs` (10 portadas + 8 galería PRUNE + `public/hero-poster.jpg`).
- **Reemplazar por fotos reales con el MISMO nombre de archivo** (`src/assets/obras/<slug>-portada.jpg`, `prune-01..08.jpg`, `public/hero-poster.jpg`) y rebuild.
- Al cargar las reales, **quitar el prefijo "Imagen provisoria — "** de los `alt` en los `.md` de obra.

### 2.2 Copy verbatim del PDF (pp. 10-17)
El PDF fuente (`NEST_Contenido_Web_Completo.pdf`) **no es accesible desde el entorno** (bloqueo de privacidad de macOS sobre `~/Downloads`). **Copiarlo a `docs/`** (`cp ~/Downloads/NEST_Contenido_Web_Completo.pdf docs/`) para poder tomar la redacción exacta de:
- **PRUNE** — narrativa del caso (Desafío/Solución/Resultado/Por qué importa) → cuerpo de `src/content/obras/prune.md` (pp. 11-12). Las cifras (10 / 40 días / 24 h / 2023) ya son reales.
- **`/obras`** — título SEO, meta e intro (p. 10) → `src/pages/obras/index.astro`.
- **`/contacto`** — bloques de confianza (pp. 15-17) → `src/pages/contacto.astro`.
- **Home §6** — párrafo de trayectoria corporativa (p. 14) → `src/pages/index.astro` (Sección 6).
- **`/servicios`** — tabla/redacción de los 8 clientes corporativos (p. 14).

### 2.3 🔴 Testimonios placeholder EN PRODUCCIÓN (excepción a §6.3)

`src/content/testimonios/juan-r.md` y `maria-l.md` son **inventados**: "Juan R. — San Isidro" y "María L. — Nordelta" no son clientes reales, y sus textos tampoco. Se publican en la Home por **decisión explícita del cliente (2026-08-04)**, pedida en `NEST_cambios_home.md` punto 6.

Esto es una **excepción deliberada** a reglas que el propio proyecto documenta en cuatro lugares:
- `PLAN-EJECUCION.md` §6.3 — "No publicar testimonios placeholder como si fueran reales."
- `PLAN-EJECUCION.md` §5.1 Sección 7 — "No se renderiza hasta tener testimonios reales."
- `PLAN-EJECUCION.md` §4.5 — "Si `testimonios` está vacía, la sección 7 no se renderiza."
- `PLAN-EJECUCION.md` §12 checklist pre-launch — "Cero testimonios placeholder publicados como reales."

**Riesgo:** son reseñas de clientes atribuidas a personas que no existen, en el sitio comercial de una constructora. En Argentina eso entra en publicidad engañosa (Ley 24.240 de Defensa del Consumidor, arts. 4 y 8). Además el sitio **no** emite `Review`/`AggregateRating` en el JSON-LD (§6.6), así que Google no los indexa como reseñas — pero un visitante sí los lee como tales.

**Cómo revertir (30 segundos):** `rm src/content/testimonios/*.md` y rebuild. La sección desaparece sola, sin tocar código. Ojo: hay que borrar también `node_modules/.astro/data-store.json` — ver §5, el store no purga una colección que queda en cero.

**Cómo reemplazar:** sobrescribir los dos `.md` con los textos reales (campos `nombre`, `zona`, `iniciales` + el texto en el cuerpo) y borrar el bloque de comentarios ⚠️ del frontmatter.

### 2.4 🟠 Imagen a definir en la cabecera de `/nosotros` (20/08/2026)

La Sección 1 de `src/pages/nosotros.astro` abre con el texto a la izquierda y un **bloque visual al 50% del ancho de la sección** a la derecha, que hoy es un **plano navy sin imagen**. El layout está terminado; lo que falta es la foto, que el usuario dejó a definir.

- **Cómo reemplazarlo (sin tocar el layout):** meter un `<Image>` dentro del `<div class="cab-visual">`, con `class="absolute inset-0 h-full w-full object-cover"`, y agregarle `relative isolate overflow-hidden` al div. La geometría —que muere exacto sobre las dos reglas de `<MarcoSeccion>` y sobre la guía derecha de página— vive en `.cab-visual`, en el `<style>` de la página, y **no depende de la imagen**: es alto de fila más márgenes negativos.
- **Sacar el `aria-hidden="true"` del div** y decidir el `alt` según qué termine siendo la foto: si es una obra o el equipo, descripción real; si es textura, `alt=""`.
- **Ojo con el LCP:** hoy el bloque es color plano y el LCP de la ruta es el `<h1>`. Una foto de ~50% de la primera pantalla puede pasar a ser el elemento LCP. Al cargarla, medir y evaluar `loading="eager"` + `fetchpriority="high"` en vez del `lazy` por defecto.
- Candidata única real y horizontal disponible hoy: `src/assets/obras/el-canton-aerea.jpg` (el resto de las `portada` son los placeholders de §2.1).
- **Contexto:** esto revierte la decisión "SIN FOTO" que la página tenía documentada desde el 16/08/2026, incluida su recomendación de usar "una banda propia debajo de la cabecera, no partiendo el h1". Se le presentó esa nota al usuario y eligió la cabecera igual. La consecuencia asumida es que `/nosotros` y `/servicios` ya no abren con la misma composición.

---

## 3. 🟠 Bloqueado por datos de terceros (§11)

| Dato | Desbloquea | Estado |
|---|---|---|
| **Dirección física** (NAP) | `address` en el JSON-LD `GeneralContractor`, footer, Perfil de Negocio de Google | ✅ Resuelto 2026-08-04: Paraná 26, CABA, CPA **C1017AAE** — cargado en `site.ts`, emitido en el `PostalAddress` y visible en footer y bloque de contacto |
| **Ficha de El Canton** (m², plazo, año, estilo) | publicar `/obras/el-canton` (`paginaPropia: true`) | Falta |
| **Fotos reales de PRUNE** (≥8) | reemplazar placeholders del caso | Falta |
| **Testimonios reales** | reemplazar los **placeholders publicados** (§2.3) | Falta (~semana 3) — 🔴 mientras tanto hay 2 reseñas inventadas en el aire |
| **ID del Meta Pixel** | la medición de campañas de Meta (§6) | Falta — requiere acceso a `business.facebook.com` |

---

## 4. 🟡 Fase 6 — GEO, CI y deploy (pendiente)

- [ ] `scripts/verificar-html.sh` completo y parametrizado (§12) + guarda de acentuación + guarda de "video no se descarga en mobile" (el hero sigue en `<video>` propio — ver nota del 17/08/2026 en §5 sobre por qué se revirtió el embed de YouTube que hubo brevemente el 16/08).
- [ ] **CI** (`.github/workflows/`): `astro check`, `verificar-html.sh`, **`verificar-tracking.sh`**, **Lighthouse CI mobile** (perf ≥95 / a11y =100), grep `client:`, grep `llms.txt`, **check de tamaño de bundle JS < 5 KB/ruta** (eximir el script de Turnstile). Definir `$BASE_URL` = preview de Vercel.
  - ⚠️ **El gate de Lighthouse es la excepción: NO sirve contra un preview.** El tracking solo se activa en el hostname de producción, así que en un `*.vercel.app` el snippet ni se renderiza y Lighthouse devuelve un 100 que no mide nada de los 160 KB de terceros. Ese gate tiene que correr contra `nestobras.com.ar` post-deploy (PageSpeed Insights o LHCI apuntado a producción), mirando **TBT** en particular (§7.1).
- [ ] **Search Console** configurado + sitemap enviado (antes del lanzamiento, §6.11).
- [ ] **Bing Webmaster Tools** + sitemap (alimenta Copilot — del skill `seo-geo`).
- [ ] **Perfil de Negocio de Google** con NAP idéntico carácter por carácter (§6.7) — bloqueado por la dirección física.
- [ ] **Deployment Protection APAGADA en producción** (con protección, Googlebot/GPTBot reciben 401, §9). Dejarla solo en previews.
- [ ] **Dominio**: `nestobras.com.ar` principal + redirect **308** desde `www`. (El hero volvió a `<video>` propio el 17/08/2026 — ver nota de §5 —, así que ya no depende de `archivo.nestobras.com.ar` ni de YouTube; el archivo se sirve desde `public/hero-video.mp4`.)
- [ ] **Lighthouse mobile real** ≥95 perf / 100 a11y contra el preview servido (no `astro dev`).
- [ ] **FAQ + `FAQPage` schema** — recomendación del skill `seo-geo` (mayor palanca GEO). **Es una adición al spec §5 → requiere OK del usuario.** Preguntas candidatas ya armables con contenido real (zonas, proceso, modalidades).

---

## 5. 🟢 Deuda menor / decisiones tomadas / known issues

- **Embed de YouTube en el hero, probado y revertido dos veces (14/08, 16/08, 17/08/2026)** — se intentó reemplazar el `<video>` propio por un embed de YouTube en al menos dos oportunidades, cada vez atacando los problemas de la vez anterior (superposición de UI del player en cada loop, autoplay poco confiable, visibilidad rota, y por último autoplay forzado en todas las condiciones incluyendo `prefers-reduced-motion`, derogando el §7.2 del plan). El 17/08/2026 se revirtió otra vez a `<video>` nativo con `public/hero-video.mp4`: el problema de fondo (la superposición de UI de YouTube en cada ciclo del loop) nunca se resolvió de forma confiable, y un embed de terceros mete >1 MB de JS que no puede estar en el camino crítico sin comprometer el budget de performance. Si se vuelve a plantear este cambio, revisar primero este historial antes de reintentarlo.
- **Fallback tipográfico métrico (CLS)** — hoy stopgap `"Arial Narrow"` en el stack. El fallback métrico definitivo (`@font-face` con `size-adjust`/`ascent-override`) quedó diferido; ahora que el hero real existe (Fase 4) se puede medir CLS e implementarlo. `fontaine` no sirve (no inyecta en la CSS-var de Tailwind v4).
- **El content store NO purga una colección que queda en cero** — al borrar el último `.md` de una colección, el glob loader avisa `No files found matching` pero las entradas ya sincronizadas **siguen renderizando**. `rm -rf .astro dist` no alcanza: el store persistente vive en **`node_modules/.astro/data-store.json`**. Verificado 2026-08-04 (dos testimonios de prueba sobrevivieron a tres builds limpios). Importa porque la caché de build de Vercel puede incluir `node_modules`: si algún día se despublican los testimonios, hay que borrar ese archivo o el deploy los republica.
- **`PLAN-EJECUCION.md` dice "Astro 5"** (§2.5/§3) pero se usa **Astro 7** (decisión aprobada). Doc desactualizado — conviene anotar la versión real ahí.
- **shadcn (§2.6) reemplazado por componentes Astro** por la identidad austera (radius 0, sin sombras). Decisión tomada; no revertir salvo pedido. Si se integra shadcn, el mapeo de tokens §3.2 está reservado como comentario en `global.css` (regla: arena nunca sobre blanco).
- **TypeScript pineado a 6.x** — `astro check` (language server) no soporta el compilador nativo TS 7. Revisar cuando lo soporte.
- **`pnpm-workspace.yaml` `minimumReleaseAgeExclude: [astro@7.1.4]`** — carve-out de la política de supply-chain; quitar cuando el paquete envejezca.
- **Dividers decorativos `navy-200`** (bajo contraste, 1.48) — WCAG-exempt (decorativos, no son bordes de componente). Dejar, o subir a `navy-300` si se quiere más visibilidad.
- **Guardarraíl de CI**: grep que exija `Astro.props as <Tipo>` en cada `.astro` (el binding implícito de `Props` no es 100% fiable en el toolchain — ver code review PR #1).
- **Verificar el link `wa.me`** (dígito `9` móvil AR) en un **dispositivo real** antes del launch.
- **`og:image` por ruta** (1200×630) + `og:image:width/height/type` — pendientes hasta tener imágenes sociales reales.

---

## 6. 🟠 Tracking — pendientes y decisiones tomadas

Implementado en `src/components/astro/Analytics.astro` (script inline diferido) y
`src/data/analytics.ts` (catálogo de eventos). Instrumentación **declarativa**: un
componente se trackea agregando `data-evento="…"` al HTML, sin escribir JS.

### 6.1 Pendiente de NEST

| Ítem | Bloquea | Nota |
|---|---|---|
| `PUBLIC_GA4_ID=G-TNT3V28PR5` en Vercel (producción) | Que el sitio deployado mida algo | Con `output: 'static'` hay que **redeployar** tras cargarla |
| **ID del Meta Pixel** → `PUBLIC_META_PIXEL_ID` | Toda la medición de Meta | Requiere acceso a `business.facebook.com`. Vacío = el pixel no se inicializa y no rompe nada |
| Marcar conversiones en la UI de GA4 | Que los leads figuren como conversión | `whatsapp_click`, `generate_lead`, `tel_click`. Administrar → Eventos → "Marcar como evento clave". **No se puede hacer desde el código** |
| Prender **Enhanced Measurement** en GA4 | Scroll y engagement | Es un toggle de la propiedad, no código. Por eso no hay eventos de scroll en el catálogo |
| **Validación legal de `/privacidad`** | 🔴 Publicar en producción | La página es un **borrador** redactado por desarrollo, no por un abogado |
| Confirmar hostname de producción | El gate de entorno | Hoy `nestobras.com.ar`, derivado de `site.url` |

### 6.2 Trabajo futuro

- **Conversions API de Meta** — atado a Fase 5: necesita `/api/consulta`, que todavía
  no existe. El pixel ya emite un `eventID` por conversión, pero **hoy ese id se genera
  y se consume en la misma línea, dentro de una IIFE cerrada**: no queda accesible para
  nadie más. Deduplicar contra CAPI no es solo "mandar lo mismo del lado del servidor",
  hace falta plomería: exponer el id (p. ej. escribirlo en un `<input type="hidden">`
  del formulario antes del POST) para que el endpoint reciba exactamente el mismo valor
  que usó el pixel. Presupuestar ese trabajo, no darlo por hecho.
- **Banner de consentimiento** — hoy no hay, por decisión (tráfico AR, Ley 25.326 no
  lo exige). La estructura de Consent Mode v2 ya está: enchufar un banner es agregar
  el `gtag('consent','update', …)`, no rehacer nada.

### 6.3 Decisiones tomadas (no revertir sin motivo)

- **Carga diferida, no `async` en el head.** Ver la excepción de §7.1 del plan y sus
  tres condiciones. Un rebote instantáneo, antes del `load`, no se mide: es el precio
  aceptado de no poner 160 KB delante del LCP.
- **El video del hero NO se trackea.** Es `autoplay muted aria-hidden`: el evento
  `play` se dispara solo al cargar la página, así que medirlo daría una métrica que
  parece engagement pero es un pageview de desktop disfrazado. Está explicado en
  `HeroVideo.astro`; el mapeo `video_play` queda listo para un video con controles.
- **Sin `<noscript>` del pixel.** El `<img>` de fallback de Meta dispararía un
  PageView salteándose toda la lógica de consentimiento. GA4 tampoco mide sin JS.
- **Consent de Meta por heurística de timezone.** Meta no tiene defaults por región
  como Google. Es imperfecta a propósito: falla si un usuario argentino tiene el reloj
  en Europa. GA4 sí usa `region`, que Google resuelve server-side y es exacto.
- **Nombres propios en GA4** para los eventos de dominio, salvo `generate_lead` y
  `video_start` que son recomendados y encajan exactos. No se usan `view_item` /
  `select_item`: sin un array `items` de ecommerce no alimentan ningún reporte.

---

## 7. Checklist innegociable pre-launch (§12)

- [ ] `curl` sin JS devuelve todo el contenido de valor de cada página
- [ ] Cero `client:*` · Cero `llms.txt` · Ninguna página por variante geográfica
- [ ] Un solo `<h1>` + jerarquía sin saltos
- [ ] 8 clientes como **texto** en la Home
- [ ] Cero `[completar]` / cero placeholders publicados (fotos + copy reales)
- [ ] **Testimonios reales cargados** — hoy hay 2 inventados en producción (§2.3). No lanzar sin reemplazarlos.
- [ ] **Toda la acentuación correcta** (ningún "anos", "mas", "gestion" sin tilde)
- [ ] `<form>` / `<label for>` / `<button type=submit>` reales · form envía sin JS
- [ ] Canonical autorreferencial + ruta en `sitemap.xml`
- [ ] **Lighthouse mobile ≥ 95 perf / 100 a11y** · táctiles ≥ 44 px · **a re-medir**: desde el 16/08/2026 mobile sí descarga el embed (ver §5)
- [ ] Deployment Protection off en prod · dominio + redirect 308
- [ ] **`/privacidad` validada legalmente** — hoy es un borrador de desarrollo (§6.1)
- [ ] `PUBLIC_GA4_ID` cargada en Vercel **y redeployada** · conversiones marcadas en GA4
- [ ] `bash scripts/verificar-tracking.sh` en verde contra el build de producción
