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

---

## 3. 🟠 Bloqueado por datos de terceros (§11)

| Dato | Desbloquea | Estado |
|---|---|---|
| **Dirección física** (NAP) | `address` en el JSON-LD `GeneralContractor`, footer, Perfil de Negocio de Google | Falta (el JSON-LD hoy **omite** `address` a propósito) |
| **Ficha de El Canton** (m², plazo, año, estilo) | publicar `/obras/el-canton` (`paginaPropia: true`) | Falta |
| **Fotos reales de PRUNE** (≥8) | reemplazar placeholders del caso | Falta |
| **Testimonios reales** | Sección 7 de la Home (hoy no se renderiza, §6.3) | Falta (~semana 3) |

---

## 4. 🟡 Fase 6 — GEO, CI y deploy (pendiente)

- [ ] `scripts/verificar-html.sh` completo y parametrizado (§12) + guarda de acentuación + guarda de "video no se descarga en mobile".
- [ ] **CI** (`.github/workflows/`): `astro check`, `verificar-html.sh`, **Lighthouse CI mobile** (perf ≥95 / a11y =100), grep `client:`, grep `llms.txt`, **check de tamaño de bundle JS < 5 KB/ruta** (eximir el script de Turnstile). Definir `$BASE_URL` = preview de Vercel.
- [ ] **Search Console** configurado + sitemap enviado (antes del lanzamiento, §6.11).
- [ ] **Bing Webmaster Tools** + sitemap (alimenta Copilot — del skill `seo-geo`).
- [ ] **Perfil de Negocio de Google** con NAP idéntico carácter por carácter (§6.7) — bloqueado por la dirección física.
- [ ] **Deployment Protection APAGADA en producción** (con protección, Googlebot/GPTBot reciben 401, §9). Dejarla solo en previews.
- [ ] **Dominio**: `nestobras.com.ar` principal + redirect **308** desde `www`; confirmar que `archivo.nestobras.com.ar` (video del hero) sigue apuntando tras la migración de DNS.
- [ ] **Lighthouse mobile real** ≥95 perf / 100 a11y contra el preview servido (no `astro dev`).
- [ ] **FAQ + `FAQPage` schema** — recomendación del skill `seo-geo` (mayor palanca GEO). **Es una adición al spec §5 → requiere OK del usuario.** Preguntas candidatas ya armables con contenido real (zonas, proceso, modalidades).

---

## 5. 🟢 Deuda menor / decisiones tomadas / known issues

- **Fallback tipográfico métrico (CLS)** — hoy stopgap `"Arial Narrow"` en el stack. El fallback métrico definitivo (`@font-face` con `size-adjust`/`ascent-override`) quedó diferido; ahora que el hero real existe (Fase 4) se puede medir CLS e implementarlo. `fontaine` no sirve (no inyecta en la CSS-var de Tailwind v4).
- **Aviso de build "colección testimonios vacía"** — esperado: §4.5 la quiere vacía hasta tener testimonios. Benigno (build OK, `astro check` limpio). Se resuelve solo al cargar testimonios reales.
- **`PLAN-EJECUCION.md` dice "Astro 5"** (§2.5/§3) pero se usa **Astro 7** (decisión aprobada). Doc desactualizado — conviene anotar la versión real ahí.
- **shadcn (§2.6) reemplazado por componentes Astro** por la identidad austera (radius 0, sin sombras). Decisión tomada; no revertir salvo pedido. Si se integra shadcn, el mapeo de tokens §3.2 está reservado como comentario en `global.css` (regla: arena nunca sobre blanco).
- **TypeScript pineado a 6.x** — `astro check` (language server) no soporta el compilador nativo TS 7. Revisar cuando lo soporte.
- **`pnpm-workspace.yaml` `minimumReleaseAgeExclude: [astro@7.1.4]`** — carve-out de la política de supply-chain; quitar cuando el paquete envejezca.
- **Dividers decorativos `navy-200`** (bajo contraste, 1.48) — WCAG-exempt (decorativos, no son bordes de componente). Dejar, o subir a `navy-300` si se quiere más visibilidad.
- **Guardarraíl de CI**: grep que exija `Astro.props as <Tipo>` en cada `.astro` (el binding implícito de `Props` no es 100% fiable en el toolchain — ver code review PR #1).
- **Verificar el link `wa.me`** (dígito `9` móvil AR) en un **dispositivo real** antes del launch.
- **`og:image` por ruta** (1200×630) + `og:image:width/height/type` — pendientes hasta tener imágenes sociales reales.

---

## 6. Checklist innegociable pre-launch (§12)

- [ ] `curl` sin JS devuelve todo el contenido de valor de cada página
- [ ] Cero `client:*` · Cero `llms.txt` · Ninguna página por variante geográfica
- [ ] Un solo `<h1>` + jerarquía sin saltos
- [ ] 8 clientes como **texto** en la Home
- [ ] Cero `[completar]` / cero placeholders publicados (fotos + copy reales)
- [ ] **Toda la acentuación correcta** (ningún "anos", "mas", "gestion" sin tilde)
- [ ] `<form>` / `<label for>` / `<button type=submit>` reales · form envía sin JS
- [ ] Canonical autorreferencial + ruta en `sitemap.xml`
- [ ] **Lighthouse mobile ≥ 95 perf / 100 a11y** · táctiles ≥ 44 px · video no se descarga en mobile
- [ ] Deployment Protection off en prod · dominio + redirect 308
