# NEST — nestobras.com.ar

Sitio web de **NEST**, empresa constructora de Zona Norte (GBA) y CABA. Es un
sitio de **captación de leads** —no un catálogo—: convierte visitas en consultas,
con foco en público **mobile** y en optimización para buscadores y motores de IA
(**GEO**).

> **Fuente de verdad:** [`docs/PLAN-EJECUCION.md`](docs/PLAN-EJECUCION.md).
> El plan de implementación por fases vive en [`tasks/todo.md`](tasks/todo.md).
> Ante cualquier discrepancia con este README, manda el spec.

## Principios de arquitectura

- **Estático primero.** Astro 5 con `output: 'static'` + **una única** ruta
  on-demand (el endpoint del formulario, `/api/consulta`).
- **0 KB de framework en el navegador.** shadcn/ui (React) se renderiza a HTML
  en build; **cero directivas `client:*`**. Los patrones interactivos usan
  elementos nativos (`<details>`, `<dialog>`, scroll-snap CSS, `:has()`).
- **Mobile-first medible.** LCP < 2 s (el LCP es el `<h1>`), CLS < 0,05,
  JS < 5 KB por ruta, CSS < 20 KB, Lighthouse mobile ≥ 95 / accesibilidad 100.
- **El contenido rompe el build.** El schema de contenido (Zod) valida límites
  SEO, exige `alt`, y no deja publicar páginas con placeholders.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Astro 5 (`output: 'static'`) |
| UI | shadcn/ui (`.tsx` → HTML estático), Tailwind CSS v4 |
| React | 19 vía `@astrojs/react` — dependencia de **build**, no de runtime |
| Contenido | Content Layer API + Zod |
| Imágenes | Sharp en build (`astro:assets`) |
| Hosting | Vercel (Pro) · Node 22.x · región `gru1` |
| Email / Leads / Antispam | Resend · Airtable · Cloudflare Turnstile |
| Paquetes | pnpm |

## Requisitos

- Node.js **22.x**
- pnpm

## Scripts

```bash
pnpm install       # instalar dependencias
pnpm dev           # servidor de desarrollo
pnpm build         # build de producción (HTML estático)
pnpm preview       # servir el build localmente (usar esto para Lighthouse, no dev)
pnpm astro check   # chequeo de tipos y de schema de contenido
```

## Estructura

```
src/
├── content.config.ts     # colecciones (obras, servicios, equipo, testimonios) + Zod
├── content/              # contenido editorial (.md)
├── data/                 # site.ts (NAP), clientes.ts, estadisticas.ts
├── components/
│   ├── ui/               # shadcn (.tsx, render estático)
│   └── astro/            # componentes propios
├── layouts/main.astro    # metadatos, canonical, JSON-LD global (NO renombrar)
├── pages/                # rutas + api/consulta.ts (única ruta on-demand)
└── assets/obras/         # fotos de obra, optimizadas en build
docs/                     # spec y documentos de respaldo
tasks/                    # plan de ejecución
```

## Variables de entorno

Solo las que llevan prefijo `PUBLIC_` llegan al navegador. Ver detalle en
`docs/PLAN-EJECUCION.md` §8.4.

| Variable | Pública |
|---|---|
| `RESEND_API_KEY` | No |
| `NOTIFY_EMAIL` | No |
| `AIRTABLE_TOKEN` / `AIRTABLE_BASE_ID` | No |
| `TURNSTILE_SECRET_KEY` | No |
| `PUBLIC_TURNSTILE_SITE_KEY` | Sí |
| `PUBLIC_WHATSAPP` | Sí |

## Deploy

Vercel (preset Astro), build `pnpm build`, Node 22.x, región `gru1`. Producción
en `nestobras.com.ar` con redirect 308 desde `www`. Las previews `*.vercel.app`
se sirven con `X-Robots-Tag: noindex`.

## Licencia

Propietario — todos los derechos reservados. Ver [`LICENSE`](LICENSE).
