# NEST — Plan de ejecución completo

**Proyecto:** nuevo sitio `nestobras.com.ar`
**Repositorio:** `/Users/juanpernu/Workspace/nest_obras_web` (vacío — solo LICENSE y README)
**Fuente de contenido original:** `/Users/juanpernu/Downloads/NEST_Contenido_Web_Completo.pdf` (17 páginas)
**Fecha:** julio 2026

Este documento es autocontenido. Reúne el análisis, las decisiones ya tomadas y el plan de ejecución. No hace falta leer el PDF para construir el sitio, pero sí conviene abrirlo para verificar los textos de las páginas 10 a 17 (ver §5.6).

Documentos de respaldo en `docs/`: `nest-web-estructura-y-geo.md` y `especificaciones-tecnicas.md`. Este archivo los condensa; ante cualquier discrepancia, **manda este**.

---

## 0. Cómo leer este documento

| Sección | Para qué |
|---|---|
| §1 | Qué es NEST y qué se está construyendo |
| §2 | Decisiones ya cerradas — **no reabrir** |
| §3 | Stack y arquitectura |
| §4 | Modelo de contenido |
| §5 | Contenido literal de cada página |
| §6 | Reglas GEO que condicionan la implementación |
| §7 | Mobile-first |
| §8 | Formulario e infraestructura |
| §9 | Deploy |
| §10 | Plan de ejecución por fases |
| §11 | Datos que faltan y quién los tiene que traer |
| §12 | Checklist innegociable |

---

## 1. Contexto

NEST es una empresa constructora argentina con más de 30 años de trayectoria. Construye viviendas premium, refacciones y obra corporativa en Zona Norte del Gran Buenos Aires (Nordelta, San Isidro, Escobar, Pilar, Tigre) y CABA.

**Su diferenciador comercial:** trabajó para Google, WeWork, IRSA, UADE, PRUNE, Fabric Sushi y Subway. Ese portfolio corporativo es el argumento que usa para vender obra residencial premium — si Google los eligió, una casa está en buenas manos.

**Socios fundadores:**
- **Arq. Morena Alegre** — arquitecta, MBA en Universidad Austral (IAE), ex WeWork y ex Google Argentina.
- **Ing. Carlos Alegre** — ingeniero civil, +30 años en obra, ex Benito Roggio.

**Objetivo del sitio:** convertir visitas en consultas. Es un sitio de captación de leads, no un catálogo.

**Público:** mayoritariamente móvil. Clientes residenciales de alto poder adquisitivo en Zona Norte, y responsables de obra de empresas.

---

## 2. Decisiones cerradas

No reabrir sin instrucción explícita del usuario.

| # | Decisión | Motivo |
|---|---|---|
| 1 | **7 rutas.** Se eliminó `/obras/corporativo` | El caso Google/WeWork no se desarrolla como página propia |
| 2 | **Google/WeWork sigue en la grilla de `/obras`** como tarjeta de galería | Mantiene el filtro "Corporativo" con contenido |
| 3 | **La Home muestra 2 obras destacadas**, no 3 | Se sacó la tarjeta Google/WeWork; quedan las dos que tienen página propia |
| 4 | **Subway y Hospitales solo como logos** en la Home | No entran a la grilla de obras |
| 5 | **Astro 5 estático**, sin SSR | Requisito GEO §6 |
| 6 | **shadcn/ui en `.tsx`, sin ports a `.astro`** | Sin directiva `client:*` no envían JS; portarlos no compra nada y rompe `shadcn add` |
| 7 | **Cero directivas `client:*` en el proyecto** | 0 KB de framework en mobile (§7) |
| 8 | **Formulario server-side** con WhatsApp como canal alternativo | Requisito GEO §6.8 |
| 9 | **Resend** para email, **Airtable** para persistir leads | §8 |
| 10 | **Sin `llms.txt`** | Google declara explícitamente que no lo usa (§6.10) |
| 11 | **`/obras/el-canton` no se publica** hasta tener datos reales | §6.3 |

---

## 3. Stack y arquitectura

| Capa | Decisión |
|---|---|
| Framework | Astro 5 |
| Renderizado | `output: 'static'` + una única ruta on-demand (el endpoint del form) |
| Componentes | shadcn/ui (`.tsx`, renderizados a HTML estático) |
| Estilos | Tailwind CSS v4 (plugin de Vite) |
| React | 19 vía `@astrojs/react` — **dependencia de build, no de runtime** |
| JS enviado | 0 KB de framework en todas las rutas |
| Contenido | Content Layer API de Astro + Zod |
| Imágenes | Sharp en build (`astro:assets`) |
| Hosting | Vercel (plan Pro — Hobby no permite uso comercial) |
| Email | Resend |
| Leads | Airtable |
| Antispam | Honeypot + Cloudflare Turnstile |
| Paquetes | pnpm |

### 3.1 Inicialización

Preferir el preset visual, que deja los tokens del design system cargados desde el primer commit: [shadcn/create](https://ui.shadcn.com/create?template=astro), con los tokens de §3.5.

```bash
pnpm dlx shadcn@latest init --preset [CODE] --template astro
```

Alternativa sin preset:

```bash
pnpm dlx shadcn@latest init -t astro
```

Después, en cualquier caso:

```bash
pnpm astro add vercel sitemap
```

Si se parte de un proyecto Astro existente hay que configurar el alias `@/*` en `tsconfig.json` **antes** de correr `shadcn init`, o el comando falla:

```json
{ "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./src/*"] } } }
```

### 3.2 `astro.config.mjs`

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://nestobras.com.ar',
  trailingSlash: 'never',
  output: 'static',
  adapter: vercel(),
  integrations: [react(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
```

- **`site` es obligatorio**: sin él el sitemap sale con URLs relativas y no se pueden construir canonicals absolutos.
- **`trailingSlash: 'never'`** debe coincidir con la config de Vercel, o `/obras` y `/obras/` responden ambas 200 y hay contenido duplicado.
- **No usar `imageService: true`**: el servicio de imágenes de Vercel factura por transformación en runtime. Son ~30 fotos fijas; Sharp en build es gratis.

### 3.3 Estructura del repositorio

```
nest-web/
├── docs/
├── public/
│   ├── robots.txt
│   └── fonts/
├── src/
│   ├── content.config.ts
│   ├── content/
│   │   ├── obras/            # 10 archivos .md
│   │   ├── servicios/        # 4
│   │   ├── equipo/           # 2
│   │   └── testimonios/      # vacío hasta que lleguen los reales
│   ├── data/
│   │   ├── clientes.ts       # los 8 logos
│   │   ├── estadisticas.ts
│   │   └── site.ts           # NAP, redes, WhatsApp, URL canónica
│   ├── components/
│   │   ├── ui/               # shadcn .tsx — render estático
│   │   └── astro/            # componentes propios
│   ├── layouts/
│   │   └── main.astro        # el del starter — carga global.css, NO renombrar
│   ├── pages/
│   │   ├── index.astro
│   │   ├── nosotros.astro
│   │   ├── servicios.astro
│   │   ├── contacto.astro
│   │   ├── obras/
│   │   │   ├── index.astro
│   │   │   └── [id].astro
│   │   └── api/
│   │       └── consulta.ts   # única ruta on-demand
│   └── assets/obras/
├── astro.config.mjs
└── components.json
```

`src/layouts/main.astro` es el layout del starter de Tailwind y carga el stylesheet global. **No renombrarlo** — la documentación de shadcn advierte que hay que mantenerlo o asegurar que cada página importe `@/styles/global.css`. Se lo extiende con metadatos, canonical y JSON-LD.

No hay directorio `islands/`: el proyecto no hidrata componentes.

### 3.4 shadcn: cómo se usa

Los presentacionales —Card, Button, Badge, Input, Label, Textarea, Separator, Table, Avatar— se importan directo en los `.astro` **sin directiva `client:*`**. Astro los renderiza a HTML en build y no manda nada al navegador:

```astro
---
import Layout from "@/layouts/main.astro"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
---
<Layout>
  <Card className="max-w-sm">
    <CardHeader><CardTitle>PRUNE</CardTitle></CardHeader>
    <CardContent>10 sucursales en 40 días.</CardContent>
  </Card>
</Layout>
```

Dentro de un componente React va `className`, no `class`.

**Quedan afuera** los componentes construidos sobre comportamiento de Radix —Sheet, Dialog, Select, Carousel, Accordion, Tabs—, porque sin hidratar renderizan markup inerte. Se reemplazan por equivalentes nativos:

| Patrón | Solución | JS |
|---|---|---|
| Nav mobile | `<details>` / `<summary>` con Tailwind | 0 |
| Galería de obra | Carrusel con CSS scroll-snap + `<dialog>` nativo | ~10 líneas inline |
| Filtro de `/obras` | Radios + `:has()` (§4.4) | 0 |
| Select del formulario | `<select>` nativo estilado | 0 |
| Validación del form | HTML5 nativo + server-side | 0 |

El scroll-snap y el `<select>` nativo **son mejores que su equivalente en JS en un teléfono**: usan el scroll real del sistema y el picker del SO. `<details>` y `<dialog>` traen del navegador el manejo de foco y el cierre con Escape.

**Costo asumido:** Radix aporta accesibilidad probada y al no usarlo esa responsabilidad pasa al equipo. La mitigación es usar elementos nativos que ya la traen, no reimplementar el comportamiento con `div`s.

### 3.5 Identidad visual

Extraída del sitio actual (`nestobras.com.ar`, julio 2026) por inspección de estilos computados. **La marca no tiene dorado ni amarillo** — el amarillo del PDF pertenece al diseño de ese documento, no a NEST.

#### Paleta

| Token | Hex | RGB | HSL | Uso |
|---|---|---|---|---|
| `navy` (primario) | `#003057` | `0, 48, 87` | `hsl(207, 100%, 17%)` | Fondo dominante, footer, header |
| `arena` (acento) | `#D9C2B6` | `217, 194, 182` | `hsl(21, 31%, 78%)` | Botones, bordes, texto de acento sobre navy |
| `blanco` | `#FFFFFF` | — | — | Texto sobre navy, fondos de sección |
| `negro` | `#000000` | — | — | Uso mínimo |
| overlay | `rgba(0,0,0,0.5)` | — | — | Capa sobre imagen y video |

Solo dos colores de marca. Es una paleta deliberadamente austera, coherente con el rubro.

#### Contraste verificado (WCAG)

| Combinación | Ratio | Veredicto |
|---|---|---|
| Blanco sobre navy | **13.46** | AAA |
| Arena sobre navy | **7.91** | AAA |
| Navy sobre arena | **7.91** | AAA |
| Navy sobre blanco | **13.46** | AAA |
| Negro sobre arena | **12.34** | AAA |
| **Arena sobre blanco** | **1.70** | ❌ **Falla todo** |

⚠️ **Restricción de diseño:** el arena `#D9C2B6` solo funciona contra navy, negro o imagen oscura. **Sobre blanco es decorativo únicamente** — nunca texto, nunca borde fino, nunca ícono, nunca estado de foco. El sitio actual lo evita por accidente (casi todo es navy); el sitio nuevo va a tener secciones blancas, así que hay que decidirlo a conciencia. Para acento sobre fondo claro, usar navy.

Esto es condición del checklist de accesibilidad en 100 (§12).

#### Tipografía

**Roboto Condensed**, familia única, pesos 300 / 400 / 500. No hay segunda familia ni serif.

| Rol | Tamaño | Peso | Tracking | Line-height |
|---|---|---|---|---|
| Hero | 40 px | 300 | −0.84 px (≈ −0.021em) | 1.43 |
| Hero eyebrow | 24 px | 300 | −0.84 px | 1.43 |
| H1 | 40 px | 500 | normal | 1.2 |
| H2 | 32 px | 500 | normal | 1.2 |
| Body | 16 px | 400 | normal | 1.5 |
| Botón / nav | 16 px | 500 / 400 | −0.24 px / normal | 1.5 |

Rasgos del sistema: mayúsculas en navegación, botones, títulos de sección y hero. Tracking negativo en los tamaños grandes. **El peso 300 es el que carga la voz de marca** — el hero es 40 px en light, no en bold. Es una decisión de tono: sobriedad antes que impacto.

Self-hosted en `public/fonts/`, no Google Fonts (§11). Subsetear a latin + latin-ext y cargar solo 300/400/500.

#### Estilos visuales

- **Composición:** rectangular, sin radios de esquina, sin sombras. Botones de esquina viva.
- **Superficies:** navy plano en grandes áreas. Sin degradados.
- **Fotografía:** protagonista y sin tratamiento — la imagen aporta el color que la paleta no tiene.
- **Tono:** austero, institucional, silencioso. Densidad tipográfica baja y mucho aire.

**Lo que hay que conservar en el rediseño:** la austeridad cromática, el peso 300 en los tamaños grandes, las mayúsculas, la ausencia de radios y sombras, y la fotografía como fuente de color.

**Lo que hay que corregir:** la jerarquía tipográfica es plana —el hero y el H1 miden ambos 40 px—, y el nuevo hero (*"Tu obra en manos expertas, de principio a fin"*) necesita más peso relativo que un H2 de sección. Y el mínimo de 16 px en inputs de §7.3 sigue aplicando.

---

## 4. Modelo de contenido

### 4.1 Colección de obras

Es la pieza central. Resuelve que una obra viva como tarjeta de galería o como página propia, y que promoverla sea cargar datos y no escribir código.

```ts
// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const obras = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/obras' }),
  schema: ({ image }) =>
    z
      .object({
        nombre: z.string(),
        zona: z.string(),
        localidad: z.enum([
          'Nordelta', 'San Isidro', 'Escobar', 'Pilar',
          'Tigre', 'CABA', 'GBA', 'Interior',
        ]),
        tipo: z.enum(['vivienda', 'corporativo', 'refaccion', 'gastronomia']),
        anio: z.number().optional(),
        orden: z.number(),

        portada: image(),
        portadaAlt: z.string().min(10),

        destacadaEnHome: z.boolean().default(false),
        paginaPropia: z.boolean().default(false),

        // Requeridos solo si paginaPropia === true
        slug: z.string().optional(),
        seo: z
          .object({
            titulo: z.string().max(60),
            descripcion: z.string().max(155),
          })
          .optional(),
        headline: z.string().optional(),
        subtitulo: z.string().optional(),
        ficha: z
          .array(z.object({ clave: z.string(), valor: z.string() }))
          .optional(),
        galeria: z
          .array(z.object({ src: image(), alt: z.string().min(10) }))
          .optional(),
      })
      .superRefine((obra, ctx) => {
        if (!obra.paginaPropia) return;

        const faltan = (['slug', 'seo', 'headline', 'ficha'] as const)
          .filter((campo) => obra[campo] === undefined);

        if (faltan.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              `"${obra.nombre}" tiene paginaPropia: true pero le faltan: ${faltan.join(', ')}. ` +
              `Completalos o poné paginaPropia: false.`,
          });
        }

        if ((obra.galeria?.length ?? 0) < 8) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `"${obra.nombre}" tiene ${obra.galeria?.length ?? 0} fotos. Mínimo 8.`,
          });
        }

        const placeholders = obra.ficha?.filter((f) =>
          /completar|\[.*\]|TODO/i.test(f.valor),
        );
        if (placeholders?.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              `"${obra.nombre}" tiene campos sin completar: ` +
              `${placeholders.map((f) => f.clave).join(', ')}. No se publica con placeholders.`,
          });
        }
      }),
});

export const collections = { obras };
```

**Qué gana esto:** convierte las reglas de contenido en errores de build. La regla "no publicar páginas con placeholders" y los límites SEO de 60/155 caracteres dejan de ser disciplina del equipo y pasan a romper el build con un mensaje explícito.

**Estado inicial:** `paginaPropia: true` **solo** en `prune.md`. El Canton arranca en `false`.

> Si `.superRefine()` genera fricción con la inferencia de tipos de `reference()` más adelante, mover la validación a un script de pre-build sobre `getCollection('obras')`. El comportamiento —build que falla— se mantiene.

### 4.2 Las 10 obras

| Proyecto | Localidad | Tipo | `paginaPropia` | `destacadaEnHome` |
|---|---|---|---|---|
| PRUNE — 10 sucursales | CABA / GBA / Interior | corporativo | **true** | **true** |
| El Canton Golf | Escobar | vivienda | false *(hasta tener datos)* | **true** |
| Google / WeWork | CABA | corporativo | false | false |
| Fabric Sushi | CABA | gastronomia | false | false |
| Nordelta — Vivienda | Tigre | vivienda | false | false |
| San Isidro — Vivienda | San Isidro | vivienda | false | false |
| UADE | CABA | corporativo | false | false |
| IRSA | CABA | corporativo | false | false |
| Barrio Santa Bárbara | Pilar | vivienda | false | false |
| Nordelta Golf — Casa | Tigre | vivienda | false | false |

### 4.3 Generación de rutas

```ts
// src/pages/obras/[id].astro
export async function getStaticPaths() {
  const obras = await getCollection('obras', (o) => o.data.paginaPropia);
  return obras.map((obra) => ({
    params: { id: obra.data.slug },
    props: { obra },
  }));
}
```

Con el estado inicial genera una sola ruta: `/obras/prune`.

### 4.4 Filtro de `/obras` sin JavaScript

Las 10 obras se renderizan siempre en el HTML. El filtro se resuelve con radios y `:has()`:

```astro
<fieldset class="flex gap-2">
  <input type="radio" name="filtro" id="f-todos" class="sr-only" checked />
  <label for="f-todos">Todos</label>
  <input type="radio" name="filtro" id="f-vivienda" class="sr-only" />
  <label for="f-vivienda">Viviendas</label>
  <!-- corporativo, refaccion -->
</fieldset>

<ul>
  {obras.map((o) => (
    <li data-tipo={o.data.tipo}><TarjetaObra obra={o} /></li>
  ))}
</ul>

<style>
  body:has(#f-vivienda:checked) li[data-tipo]:not([data-tipo="vivienda"]) { display: none }
  body:has(#f-corporativo:checked) li[data-tipo]:not([data-tipo="corporativo"]) { display: none }
  body:has(#f-refaccion:checked) li[data-tipo]:not([data-tipo="refaccion"]) { display: none }
</style>
```

**No usar query params** para el filtro: en un sitio estático obligarían a JavaScript o a generar páginas por variante, y eso último es el patrón de contenido duplicado prohibido en §6.10.

### 4.5 Otras colecciones

`servicios` (4), `equipo` (2), `testimonios` (vacía). **Si `testimonios` está vacía, la sección 7 de la Home no se renderiza** — no se muestran placeholders.

Lo que no es contenido editorial va en `src/data/` como TypeScript tipado. `site.ts` es la única fuente del NAP: la consumen el footer, el JSON-LD y el Perfil de Negocio de Google.

---

## 5. Contenido de las páginas

> ⚠️ **CRÍTICO — tildes.** Los textos del PDF fuente vienen **sin acentuación** ("30 anos", "mas", "trayectoria", "gestion"). En este documento están corregidos. **"anos" sin tilde significa otra cosa en español y no puede publicarse.** Revisar cada texto antes de subirlo y aplicar acentuación correcta en todo el sitio, incluidos los `alt`, los metadatos y los mensajes del formulario.

### 5.1 Home — `/`

**Título SEO:** `NEST | Constructora premium en Zona Norte y CABA | Viviendas y proyectos`
**Meta description:** `Constructora con +30 años, +80 proyectos y clientes como Google, WeWork y PRUNE. Viviendas premium y proyectos corporativos en Zona Norte y CABA. Consulta sin compromiso.`
**Nav:** HOME · NOSOTROS · SERVICIOS · OBRAS · CONTACTO

**Sección 1 — Hero**
- `<h1>`: **Tu obra en manos expertas, de principio a fin.**
- Subheadline: *30 años construyendo casas y proyectos que cumplen plazo, presupuesto y los más altos estándares. Con un equipo que te acompaña desde el primer trazo.*
- CTA principal: **Consulta tu proyecto**
- Link secundario: **Ver obras**
- Fondo: video existente en `archivo.nestobras.com.ar/archivos/video_nest.mp4`, overlay oscuro al 40%. **En mobile no se carga el video** (§7.2).

**Sección 2 — Estadísticas**

| +30 | +100.000 | +80 | +50 |
|---|---|---|---|
| años de trayectoria | m² entregados | proyectos exitosos | clientes satisfechos |

**Sección 3 — Intro**
*NEST es una empresa constructora especializada en viviendas premium, refacciones y proyectos corporativos en Zona Norte de GBA y CABA. Combinamos ingeniería de primer nivel con acompañamiento personalizado para que tu obra sea una experiencia sin sorpresas, desde el primer trazo hasta la llave en la mano.*

**Sección 4 — Servicios destacados (3 tarjetas)**
1. **Viviendas y Refacciones** — Casas llave en mano, ampliaciones y refacciones en barrios cerrados y zonas premium. De principio a fin, con un solo responsable.
2. **Proyectos Corporativos** — Oficinas, locales y desarrollos comerciales. Cumplimos plazos ajustados sin interrumpir tu operación. 10 sucursales PRUNE en 40 días.
3. **Dirección de Obra** — Asesoramiento técnico, control de presupuesto y gestión integral. Nos hacemos cargo del proceso para que vos te concentres en lo que importa.

**Sección 5 — Obras destacadas (2 tarjetas)**
Cada tarjeta: foto, título, zona/tipo, link a la página del caso.
1. **PRUNE | Retail Corporativo** — 10 sucursales en CABA, GBA e interior. 40 días de ejecución. → `/obras/prune`
2. **El Canton Golf | Residencial** — Vivienda premium en barrio cerrado. Zona Norte, Escobar. → `/obras/el-canton`

> La tarjeta de Google/WeWork fue eliminada (decisión §2.3). Mientras El Canton no tenga página propia, su tarjeta enlaza a `/obras`.

**Sección 6 — Clientes corporativos**
- Título: **Empresas que confiaron en NEST**
- Logos: Google · WeWork · IRSA · UADE · PRUNE · Fabric Sushi · Subway · Hospitales
- **Cada logo es un elemento independiente con su `alt` y su nombre como texto visible.** Nunca una imagen única (§6.5).
- Texto reubicado desde la ex-página corporativa: el párrafo de trayectoria corporativa y el cierre sobre por qué le importa al cliente residencial (*si NEST pasó el filtro de una empresa como Google, una casa está en las mejores manos*). **Tomar la redacción exacta de la página 14 del PDF.**

**Sección 7 — Testimonios (2 tarjetas)**
**No se renderiza hasta tener testimonios reales.** Los del PDF son placeholders explícitos.

**Sección 8 — Equipo (preview)**
- Título: **El equipo detrás de cada obra**
- Arq. Morena Alegre — Arquitecta y socia fundadora — MBA Universidad Austral (IAE) | Ex WeWork y Google Argentina
- Ing. Carlos Alegre — Ingeniero Civil y socio fundador — Ex Benito Roggio | +30 años en obra
- Link: Ver todo el equipo → `/nosotros`

**Sección 9 — Formulario**
- Título: **Contanos tu proyecto**
- Subtítulo: *Respondemos en menos de 24 horas en días hábiles.*
- Campos: Nombre completo\* · WhatsApp o email\* · Tipo de proyecto\* (desplegable: Vivienda nueva / Refacción / Proyecto corporativo / Otro) · Describe tu proyecto (opcional — zona, m², etapa)
- Botón: **Enviar consulta**
- Confirmación: *Recibimos tu consulta. Te contactamos en menos de 24 horas.*
- Además: botón de WhatsApp con texto pre-cargado → `wa.me/549XXXXXXXXXXX?text=Hola+NEST+quiero+consultar+sobre+un+proyecto`

### 5.2 Nosotros — `/nosotros`

**Título SEO:** `Quiénes somos | NEST Constructora Zona Norte y CABA`
**Meta:** `Conocé al equipo de NEST: Arq. Morena Alegre (MBA IAE, ex WeWork y Google) e Ing. Carlos Alegre (ex Benito Roggio). +30 años construyendo en Zona Norte y CABA.`

**Sección 1 — Historia**
- `<h1>`: **Más de 30 años construyendo lo que prometemos**
- *NEST nació de la convicción de que construir una casa merece el mismo nivel de gestión, rigor técnico y atención al cliente que los proyectos corporativos más exigentes. Fundada hace más de 30 años, combinamos el respaldo de la ingeniería con la sensibilidad de la arquitectura para entregar obras que cumplen lo que prometen: plazo, presupuesto y calidad. No hacemos promesas que no podemos cumplir. Y lo que prometemos, lo entregamos.*
- Barra de estadísticas (misma que la Home).

**Sección 2 — Equipo**
- Título: **Las personas que están detrás de tu obra**
- **Arq. Morena Alegre** — Socia fundadora | Arquitectura y gestión
  *Arquitecta con MBA en la Universidad Austral (IAE). Antes de NEST, trabajó en el desarrollo de espacios para WeWork y en proyectos de Google en Argentina. Ese paso por empresas globales le dio una mirada de gestión y procesos que hoy aplica en cada obra: planificación rigurosa, comunicación constante y foco en el resultado final.*
  Credenciales: `MBA IAE | Ex WeWork | Ex Google Argentina`
- **Ing. Carlos Alegre** — Socio fundador | Ingeniería y ejecución
  *Ingeniero Civil con más de 30 años de experiencia en obra. Formado en Benito Roggio, una de las mayores constructoras del país, donde participó en proyectos de gran escala. Ese background de ingeniería de nivel corporativo garantiza en NEST el control técnico, la solidez estructural y el cumplimiento de plazos en cada proyecto.*
  Credenciales: `Ex Benito Roggio | Ing. Civil | +30 años en obra`

**Sección 3 — Proceso (5 pasos)**
Título: **Cómo trabajamos, paso a paso**

| # | Paso | Descripción |
|---|---|---|
| 01 | Primera consulta | Nos contás tu proyecto. Sin costo, sin compromiso. Te respondemos en el día. |
| 02 | Relevamiento y propuesta | Visitamos el terreno o la obra y elaboramos una propuesta detallada con plazos y presupuesto. |
| 03 | Proyecto y documentación | Diseñamos, generamos los planos y gestionamos los permisos municipales. |
| 04 | Ejecución de obra | Construimos con control diario de avance, materiales y presupuesto. Reportes periódicos. |
| 05 | Entrega y postventa | Entregamos la obra terminada y te acompañamos en el período post-entrega. |

**Sección 4 — Valores (3 tarjetas)**
- **Transparencia** — Sabés en todo momento en qué estado está tu obra y tu presupuesto. Sin sorpresas.
- **Cumplimiento** — Los plazos son compromisos, no estimaciones. Lo que prometemos, lo entregamos.
- **Calidad** — Cada detalle importa. No hacemos obra terminada, hacemos obra bien terminada.

**CTA final:** **Contá con NEST para tu proyecto** → `/contacto`

### 5.3 Servicios — `/servicios`

**Título SEO:** `Servicios de construcción | NEST Zona Norte y CABA`
**Meta:** `Construcción llave en mano, refacciones, proyectos corporativos y dirección de obra. NEST cubre todo el proceso de principio a fin en Zona Norte y CABA.`

**Servicio 1 — Construcción llave en mano**
*Construimos tu casa de principio a fin.* Desde la selección del lote hasta la llave en la mano. Nos hacemos cargo de todo: proyecto, permisos, ejecución, control de materiales y entrega.
Incluye: Anteproyecto y renders 3D · Documentación técnica y planos municipales · Gestión de permisos (municipio o consorcio del barrio cerrado) · Ejecución completa de obra · Control de presupuesto y plazos · Informes de avance periódicos · Entrega con garantía

**Servicio 2 — Refacciones y ampliaciones**
*Modernizamos y ampliamos tu espacio.* Reformamos, ampliamos y modernizamos espacios existentes con el mismo nivel de rigor técnico y atención al detalle que en obra nueva.
Incluye: Diagnóstico del estado actual · Proyecto de reforma · Ejecución con mínima interrupción de tu vida cotidiana · Materiales premium y terminaciones de calidad · Plazos cumplidos

**Servicio 3 — Proyectos corporativos y retail**
*Obras comerciales que no interrumpen tu operación.* Oficinas, locales comerciales, desarrollos gastronómicos y espacios corporativos. Cumplimos plazos ajustados, coordinamos múltiples sedes y trabajamos en horarios que minimizan la interrupción de tu negocio. PRUNE confió en nosotros para abrir 10 sucursales en 40 días.
Incluye: Coordinación de obras multisede · Turnos diurnos y nocturnos según necesidad · Único punto de contacto para el cliente · Control centralizado de avance y materiales · Cumplimiento de identidad visual de marca · Plazos corporativos, no estimaciones
**Acá va la tabla de 8 clientes corporativos** reubicada desde la ex-página `/obras/corporativo` (página 14 del PDF).

**Servicio 4 — Dirección de obra y consultoría**
*Supervisión y gestión si ya tenés tu proyecto.* Si ya tenés tu proyecto diseñado, nos ocupamos de la dirección técnica, el control de avance y la gestión del presupuesto. También asesoramos en compra de lotes y análisis de prefactibilidad.
Incluye: Dirección técnica de obra · Control de gremios y materiales · Reporte de avance y presupuesto · Asesoramiento en compra de lote (sin costo adicional) · Análisis de prefactibilidad

**Modalidades de contratación** — *Cómo preferís trabajar con nosotros*
- **LLAVE EN MANO** — Precio único acordado, pliego de especificaciones técnicas detallado y certeza del tiempo de ejecución, costo y calidad final. Es la opción más tranquila: vos decidís, nosotros gestionamos todo.
  *Ideal para: clientes que quieren despreocuparse del proceso y recibir la obra terminada.*
- **SOLO MANO DE OBRA** — Nos ocupamos de la dirección y ejecución de la obra proveyendo todos los gremios necesarios. Vos gestionás la compra de materiales contando con nuestro asesoramiento y los descuentos que nuestros proveedores nos otorgan.
  *Ideal para: clientes que quieren mayor control de los materiales y ya tienen experiencia en obra.*

**CTA final:** **Consulta tu proyecto sin compromiso** → `/contacto`

### 5.4 Obras — `/obras`

Grilla con las 10 obras de §4.2, filtros Todos / Viviendas / Corporativo / Refacciones.
Cada tarjeta: foto, título, zona. Las que tienen `paginaPropia: true` enlazan a su caso; el resto no son clickeables.
**Título SEO y meta:** tomar de la página 10 del PDF.

### 5.5 PRUNE — `/obras/prune`

**Es el activo más fuerte del sitio.** Cifras verificables de primera mano que ningún modelo puede generar por su cuenta: 10 sucursales, 40 días, turnos de 24 horas, 2023. Prioridad de implementación #1.

Estructura: ficha de proyecto → **El Desafío** → **La Solución** → **El Resultado** → **Por qué este caso importa** → CTA.
`<h1>`: **10 sucursales. 40 días. 24 horas.**
**Copy completo: páginas 11-12 del PDF.**

### 5.6 Contenido a verificar contra el PDF

Las páginas 1 a 9 del PDF están transcriptas arriba de forma completa. Para estas secciones hay que abrir el PDF y tomar la redacción literal:

| Sección | Página del PDF |
|---|---|
| `/obras` — título SEO, meta e intro | 10 |
| `/obras/prune` — caso completo | 11-12 |
| `/obras/el-canton` — estructura (no se publica aún) | 13 |
| Texto de trayectoria corporativa + tabla de 8 clientes | 14 |
| `/contacto` — copy completo y bloques de confianza | 15-17 |

**Nota sobre `/contacto`:** los 3 bloques de confianza del pie tienen en el PDF el título pegado al cuerpo (*"Respuesta en el día En horario hábil respondemos..."*). Separar en título y párrafo.

---

## 6. Reglas GEO

Derivadas de la [guía oficial de Google sobre optimización para IA](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide?hl=es-419). Condicionan la implementación; no son sugerencias.

**Premisa.** Google dice explícitamente que "GEO" y "AEO" son SEO. Sus funciones de IA usan RAG sobre el índice de búsqueda normal: si la página no está indexada, no hay nada que recuperar. No existe una capa que se agregue al final.

### 6.1 Renderizado
Todo el contenido de valor en el HTML de la respuesta inicial. Google renderiza JavaScript, pero **los crawlers de otros proveedores de IA (GPTBot, ClaudeBot, PerplexityBot) en general no lo hacen**. Un sitio en CSR puede indexarse en Google y ser invisible para el resto.

Criterio de aceptación:
```bash
curl -s https://nestobras.com.ar/obras | grep -c "Barrio Santa Bárbara"
```
Si devuelve `0`, la página no está lista.

### 6.2 Rastreo
`robots.txt` estático en `public/`:
```
User-agent: *
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: https://nestobras.com.ar/sitemap.xml
```
*Precisión: AI Overviews y AI Mode se rastrean con Googlebot y se controlan con las reglas normales. `Google-Extended` regula grounding y entrenamiento de Gemini — bloquearlo no saca al sitio de AI Overviews ni permitirlo mejora el ranking.*

Además: sitemap con `lastmod` real, canonical autorreferencial en las 7 rutas, sin contenido duplicado.

### 6.3 Contenido único y no básico
Es la primera recomendación de la guía. Google contrasta "7 consejos para compradores" con análisis experto de primera mano.

- **No publicar páginas con campos `[completar]`.** El schema de §4.1 lo hace fallar en build.
- **No publicar testimonios placeholder** como si fueran reales.
- Preferir siempre el dato concreto: "+30 años" y no "amplia trayectoria"; "Nordelta, San Isidro, Escobar, Pilar, Tigre" y no "Zona Norte"; "10 sucursales en 40 días" y no "obra rápida".

### 6.4 HTML semántico
Un solo `<h1>` por página. Jerarquía sin saltos: cada "SECCIÓN N" del PDF es un `<h2>`. `<main>`, `<header>`, `<nav>`, `<footer>`. `<article>` por caso de obra. Las listas con `+` son `<ul><li>`. Las fichas de proyecto son `<dl>` o `<table>` con `<th scope="row">`. La barra de estadísticas es texto, no imágenes.

`<h1>` por ruta:

| Ruta | `<h1>` |
|---|---|
| `/` | Tu obra en manos expertas, de principio a fin. |
| `/nosotros` | Más de 30 años construyendo lo que prometemos |
| `/servicios` | Servicios de construcción |
| `/obras` | Obras |
| `/obras/prune` | 10 sucursales. 40 días. 24 horas. |
| `/contacto` | Contanos tu proyecto |

**Secciones autocontenidas.** Google aclara que *no* hay que fragmentar el contenido. La regla correcta no es partir el texto, sino que cada sección se entienda sin depender de la anterior: que "La Solución" de PRUNE nombre a PRUNE y a NEST en vez de arrancar con "Por eso organizamos...". Un fragmento recuperado por RAG llega sin el contexto de arriba.

### 6.5 Logos de clientes — mayor retorno del sitio
El sitio actual muestra todos los clientes en un único `clientes.webp`. Para cualquier sistema automatizado eso es un rectángulo sin información: **Google no sabe que NEST trabajó con Google.**

```astro
<ul class="flex flex-wrap items-center gap-8">
  {clientes.map((c) => (
    <li class="flex flex-col items-center gap-2">
      <img src={c.logo.src} alt={c.nombre} width="120" height="40" />
      <span class="text-sm text-muted-foreground">{c.nombre}</span>
    </li>
  ))}
</ul>
```

El `<span>` no es redundante con el `alt`: el cuerpo del documento pesa más que un atributo de imagen. Si el diseño no admite el nombre bajo cada logo, va en un párrafo que los enumere — pero tiene que estar como texto.

### 6.6 Datos estructurados
Google aclara que **no son obligatorios** y que no existe marcado especial para IA, pero recomienda seguir usándolos. Alcance acotado, sin esperar que mueva la aguja solo:

| Tipo | Dónde |
|---|---|
| `GeneralContractor` + `Organization` | Global, en el layout |
| `Person` ×2 | `/nosotros` — con `jobTitle`, `alumniOf`, `worksFor` |
| `BreadcrumbList` | `/obras/*` |
| `Service` ×4 | `/servicios` |
| `ImageObject` | Galerías |

`areaServed`: Nordelta, San Isidro, Escobar, Pilar, Tigre, CABA.
**Sin `AggregateRating` ni `Review`** sin reseñas verificables — es violación de políticas de spam.

### 6.7 Negocio local
Crear o reclamar el Perfil de Negocio de Google. **NAP idéntico carácter por carácter** entre el perfil, el marcado `GeneralContractor` y el footer. Categoría: contratista general / empresa constructora.

### 6.8 Sitio compatible con agentes
La guía señala que los agentes inspeccionan el DOM y el árbol de accesibilidad. `<form>` real, `<label for>` en cada campo, `name` y `autocomplete` correctos, `<button type="submit">` — nunca un `div` con listener. Los filtros de `/obras` son controles reales.

### 6.9 Metadatos
Título ≤60, meta ≤155 (validado en el schema). Open Graph e imagen social por ruta. `lang="es-AR"`. Las meta descriptions no controlan lo que un modelo resume — sirven para el snippet.

### 6.10 Qué NO hacer
Google desmiente explícitamente estas prácticas. Implementarlas es gasto sin retorno.

| Práctica | Qué dice Google |
|---|---|
| `llms.txt` | "No es necesario crear archivos nuevos legibles por máquinas... La Búsqueda de Google no los usa." No mejora ni perjudica. **No se crea.** |
| Fragmentar en bloques chicos | "No es necesario dividir el contenido en fragmentos pequeños." |
| Buscar longitud "ideal" | "No hay longitud ideal para las páginas." |
| Reescribir en estilo "para IA" | "No es necesario escribir de manera específica solo para la búsqueda con IA." |
| Menciones artificiales de marca | "No tan útil como podría parecer." |
| Schema "especial para IA" | No existe. |
| **Páginas por variante de búsqueda** | Infringe la política de **abuso de contenido a gran escala**. |

⚠️ **Riesgo específico de este proyecto:** la tentación de crear `/constructora-nordelta`, `/constructora-san-isidro`, `/constructora-escobar`, `/constructora-pilar` con el mismo texto y el topónimo cambiado es exactamente ese patrón prohibido. **No se hace.** La cobertura geográfica se resuelve nombrando las localidades reales dentro del contenido legítimo y con el `areaServed` del marcado.

### 6.11 Medición
Configurar Search Console **antes del lanzamiento**. El informe de rendimiento de IA generativa es la herramienta oficial. Google advierte de forma directa sobre herramientas de terceros que prometan posicionamiento en respuestas de IA: ninguna tiene acceso a sus sistemas internos.

---

## 7. Mobile-first

El público llega mayoritariamente desde el teléfono y el CTA principal es un WhatsApp. Se diseña y se mide en mobile primero.

### 7.1 Presupuesto de recursos

| Recurso | Presupuesto en mobile |
|---|---|
| JS de framework | **0 KB** — garantizado por la decisión §2.7 |
| JS propio | < 5 KB, solo scripts inline |
| JS de analítica de terceros | **Exento del presupuesto**, con condiciones (abajo) |
| CSS | < 20 KB comprimido |
| Poster del hero | < 120 KB |
| LCP en 4G | < 2,0 s |
| CLS | < 0,05 |

**Excepción para la analítica de terceros.** GA4 (`gtag.js`, ~90 KB) y Meta Pixel
(`fbevents.js`, ~70 KB) no entran en los 5 KB y el negocio los necesita igual. Se
los exime del presupuesto —igual que a Turnstile (`DEUDA-TECNICA.md` §1.3)— pero
solo bajo estas tres condiciones, que no son negociables:

1. **Nada de terceros en el camino crítico.** En el HTML va únicamente el
   encolador inline (4,7 KB en crudo, **1,8 KB gzip**, medido). Los scripts reales se inyectan en runtime
   después del `load`, ante lo que ocurra primero entre `requestIdleCallback` y
   la primera interacción.
2. **Ningún `<script src>` de terceros servido desde el HTML.** Es lo que
   verifica `scripts/verificar-tracking.sh`, porque `verificar-perf.sh` solo mide
   `/_astro/*.js` y no vería el problema.
3. **Lighthouse mobile sigue siendo ≥ 95** (§12). Si esto se rompe, se revisa la
   excepción, no el número.

Implementación: `src/components/astro/Analytics.astro`.

### 7.2 Video del hero
Es el mayor riesgo de rendimiento del sitio. **En viewports menores a 768 px no se carga el video**: solo el poster optimizado. La decisión se toma con `<source media="...">` o no renderizando el elemento — **nunca cargándolo y ocultándolo con CSS**, que descarga igual.

En desktop: `preload="none"`, `poster`, `muted playsinline loop`, `aria-hidden="true"`, sin texto embebido. Respetar `prefers-reduced-motion`.

**El LCP tiene que ser el `<h1>`, no el video.**

### 7.3 Interacción táctil
- Objetivos táctiles de 44×44 px mínimo, incluidos los `<label>` del filtro.
- Sin estados que dependan de `:hover` para revelar información.
- Botón de WhatsApp accesible sin scroll desde cualquier punto de la Home.
- `font-size` mínimo de 16 px en inputs: por debajo, Safari iOS hace zoom automático al enfocar.

### 7.4 Imágenes
`sizes` según el layout real de cada breakpoint, no `100vw` por defecto. AVIF con fallback WebP. `width` y `height` siempre presentes. `alt` descriptivo obligatorio — el schema lo fuerza con `min(10)`. `loading="eager"` + `fetchpriority="high"` solo en la portada de cada obra.

---

## 8. Formulario e infraestructura

### 8.1 Arquitectura
Envío server-side real, con WhatsApp como canal alternativo y **no** como único mecanismo. Si la conversión resuelve solo con deep link a `wa.me`, queda fuera del alcance de agentes y crawlers.

```ts
// src/pages/api/consulta.ts
export const prerender = false;   // única ruta on-demand del proyecto

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, redirect }) => {
  const datos = await request.formData();
  // 1. validar server-side  2. verificar Turnstile
  const lead = await guardarLead(datos);          // si falla → 500
  await enviarEmail(lead).catch(registrarFallo);  // si falla, el lead ya existe
  return redirect('/contacto/gracias', 303);
};
```

**Orden de operaciones: primero persistir, después notificar.**

### 8.2 Mejora progresiva
```astro
<form method="POST" action="/api/consulta">
  <label for="nombre">Nombre completo</label>
  <input id="nombre" name="nombre" type="text" autocomplete="name" required />

  <label for="whatsapp">WhatsApp</label>
  <input id="whatsapp" name="whatsapp" type="tel" autocomplete="tel" required />

  <button type="submit">Enviar consulta</button>
</form>
```
Funciona sin JavaScript y sin framework. Los atributos nativos (`required`, `type="tel"`, `type="email"`) además cambian el teclado que aparece en el teléfono. El estado de envío se resuelve con unas líneas inline, no con una isla.

### 8.3 Servicios

| Servicio | Elección | Costo |
|---|---|---|
| Email | **Resend** — free tier 3.000/mes (100/día) | $0 |
| Leads | **Airtable** — free tier | $0 |
| Antispam | Honeypot + **Cloudflare Turnstile** | $0 |
| **Vercel Pro** | Hobby no permite uso comercial | **$20/mes** |

**Volumen esperado:** 20-100 consultas/mes × ~2 emails = 40-200 emails. El free tier de Resend cubre entre 15× y 75× eso.

**Ruta de escape:** el envío está aislado detrás de `enviarEmail()`. Migrar a AWS SES ($0,10 por 1.000) es cambiar esa función.

**Por qué Airtable y no solo email:** el email no es un almacén de leads — se pierde con un borrado, cae en spam sin dejar rastro, no se puede deduplicar ni marcar como atendido. Para un negocio donde cada lead es un contrato de obra es un riesgo desproporcionado. Airtable además le da al equipo de NEST (dos socios, sin desarrolladores) una vista usable sin construir un panel.
*Alternativa si prefieren no depender de un tercero:* **Neon** (Postgres, free tier). **Supabase no** en free tier: pausa proyectos tras una semana sin actividad, que es justo el patrón de un formulario de baja frecuencia.

### 8.4 Variables de entorno

| Variable | Expuesta al cliente |
|---|---|
| `RESEND_API_KEY` | No |
| `NOTIFY_EMAIL` | No |
| `AIRTABLE_TOKEN` / `AIRTABLE_BASE_ID` | No |
| `TURNSTILE_SECRET_KEY` | No |
| `PUBLIC_TURNSTILE_SITE_KEY` | Sí |
| `PUBLIC_WHATSAPP` | Sí |
| `PUBLIC_GA4_ID` | Sí |
| `PUBLIC_META_PIXEL_ID` | Sí |

Solo las que llevan prefijo `PUBLIC_` llegan al navegador.

**Con `output: 'static'` las `PUBLIC_*` se hornean EN BUILD.** Cargar o cambiar una
variable en Vercel no alcanza: hay que redeployar para que llegue al HTML. Vale en
particular para `PUBLIC_META_PIXEL_ID`, que hoy está vacía a la espera del ID.

Valores para `.env` local (el archivo está en `.gitignore`):

```
PUBLIC_GA4_ID=G-TNT3V28PR5
PUBLIC_META_PIXEL_ID=
```

Si falta el ID de una plataforma, esa plataforma no se inicializa y no se descarga
su script. Con las dos vacías, `Analytics.astro` no renderiza nada.

---

## 9. Deploy

| Ítem | Valor |
|---|---|
| Framework preset | Astro |
| Build | `pnpm build` |
| Node | 22.x |
| Región de funciones | `gru1` (São Paulo) |
| Plan | **Pro** — Hobby es solo para uso personal no comercial |

### Dos verificaciones obligatorias

**Deployment Protection apagada en producción.** Con protección por contraseña o SSO activa, el sitio responde 401 a Googlebot, GPTBot y ClaudeBot. Es la forma más rápida de que un sitio impecable sea invisible. Dejarla activa solo en previews.

**Previews fuera del índice.** Los `*.vercel.app` compiten por contenido duplicado con producción:

```json
// vercel.json
{
  "headers": [{
    "source": "/(.*)",
    "has": [{ "type": "host", "value": "(?<host>.*\\.vercel\\.app)" }],
    "headers": [{ "key": "X-Robots-Tag", "value": "noindex" }]
  }]
}
```

**Dominio:** `nestobras.com.ar` principal, redirect 308 desde `www`. Un solo host canónico.
**Confirmar que `archivo.nestobras.com.ar` (donde vive el video) sigue apuntando a su destino actual tras la migración de DNS.**

---

## 10. Plan de ejecución

### Fase 1 — Fundaciones
1. Scaffold con `shadcn init -t astro` (preferentemente con preset de marca).
2. `pnpm astro add vercel sitemap`. Configurar `astro.config.mjs` (§3.2).
3. `src/data/site.ts` con NAP, redes, WhatsApp, URL canónica.
4. `main.astro` extendido: metadatos, canonical, `lang="es-AR"`, Open Graph, JSON-LD global.
5. `public/robots.txt` (§6.2).
6. Tipografías self-hosted en `public/fonts/` con `font-display: swap`.

**Aceptación:** `pnpm build` genera HTML; `curl` de la home devuelve el `<h1>`; sitemap con URLs absolutas.

### Fase 2 — Modelo de contenido
1. `src/content.config.ts` con la colección `obras` de §4.1 y las de §4.5.
2. Los 10 `.md` de obras con los datos de §4.2. Solo `prune.md` con `paginaPropia: true`.
3. Colecciones `servicios` y `equipo`.

**Aceptación:** `astro check` pasa. Poner `paginaPropia: true` en `el-canton.md` **debe romper el build** con un mensaje sobre campos faltantes — verificarlo explícitamente y después revertir.

### Fase 3 — Componentes base
1. Instalar los presentacionales de shadcn: Card, Button, Badge, Input, Label, Textarea, Separator, Table, Avatar.
2. Componentes propios en `src/components/astro/`: `TarjetaObra`, `BarraEstadisticas`, `GrillaLogos`, `FichaProyecto`.
3. Nav con `<details>`/`<summary>` y footer.

**Aceptación:** ninguna directiva `client:*` en el repo. `GrillaLogos` renderiza los 8 nombres como texto.

### Fase 4 — Páginas de contenido
Orden: `/` → `/nosotros` → `/servicios` → `/obras` (con el filtro CSS de §4.4) → `/obras/prune`.
Copy de §5, con acentuación corregida.

**Aceptación:** un `<h1>` por página según §6.4; el `curl` de `/obras` devuelve las 10 obras; Lighthouse mobile ≥ 95.

### Fase 5 — Conversión
1. `/contacto` con el formulario de §8.2.
2. `/api/consulta.ts` con Turnstile, Airtable y Resend.
3. `/contacto/gracias`.
4. Botón de WhatsApp con texto pre-cargado.

**Aceptación:** el formulario envía con JavaScript deshabilitado; el lead aparece en Airtable; llega el mail; un envío con el honeypot completo se rechaza.

### Fase 6 — GEO y cierre
1. JSON-LD de §6.6.
2. Search Console configurado y sitemap enviado.
3. Perfil de Negocio de Google con NAP idéntico.
4. `vercel.json` con el `X-Robots-Tag` de §9.
5. Verificar Deployment Protection apagada en producción.
6. Script `scripts/verificar-html.sh` y checks de CI (§12).

### Fase 7 — Bloqueada por terceros
Solo cuando lleguen los datos de §11: publicar `/obras/el-canton`, activar la sección de testimonios, cargar el WhatsApp y el email reales.

---

## 11. Datos pendientes

**No se pueden inventar. Si falta alguno, dejar la sección sin publicar y avisar.**

| Dato | Bloquea | Quién lo trae |
|---|---|---|
| Número real de WhatsApp | `/contacto`, Home §9, todos los `wa.me` | NEST |
| Email definitivo | `/contacto`, `NOTIFY_EMAIL` | NEST |
| Ficha de El Canton: m², plazo, año, estilo | Publicación de `/obras/el-canton` | NEST |
| Testimonios reales | Sección 7 de la Home | NEST — previsto "semana 3" |
| Fotos, mínimo 8 por obra con página propia | `/obras/prune` | NEST |
| Dirección física para el NAP | JSON-LD, footer, Perfil de Negocio | NEST |
| Colores exactos de marca | Preset de shadcn | Del PDF |

**Analítica: decisión cerrada.** Se implementó **GA4 + Meta Pixel**, no Vercel Web
Analytics: NEST necesita medir el tráfico *y* poder correr campañas con audiencias
de remarketing, y lo segundo no se resuelve sin el pixel. Van con carga diferida
bajo la excepción de §7.1 y Consent Mode v2 sin banner. Ver
`src/components/astro/Analytics.astro` y `src/data/analytics.ts`.

| Dato | Bloquea | Quién lo trae |
|---|---|---|
| ID del Meta Pixel (`PUBLIC_META_PIXEL_ID`) | La medición de campañas de Meta | NEST — requiere acceso a business.facebook.com |
| Marcar las conversiones en la UI de GA4 | Que los leads figuren como conversión | NEST o acceso a la propiedad |
| Validación legal de `/privacidad` | Publicar en producción | NEST |

**Decisión abierta que no bloquea:** tipografías (el PDF no las especifica;
self-hosted, no Google Fonts, para no agregar una conexión externa al camino crítico).

---

## 12. Checklist innegociable

Ninguna página se considera terminada sin esto:

- [ ] `curl` sin JS devuelve todo el contenido de valor de la página
- [ ] Cero directivas `client:*` en el repositorio
- [ ] Un solo `<h1>`, jerarquía de encabezados sin saltos
- [ ] Los 8 clientes corporativos aparecen como **texto** en el HTML de la Home
- [ ] Cero campos `[completar]` publicados
- [ ] Cero testimonios placeholder publicados como reales
- [ ] **Toda la acentuación corregida** — ningún "anos", "mas", "gestion" sin tilde
- [ ] Todas las imágenes con `alt` descriptivo y específico
- [ ] `<form>`, `<label for>` y `<button type="submit">` reales
- [ ] Canonical autorreferencial presente
- [ ] La ruta figura en `sitemap.xml`
- [ ] Sin `llms.txt` en el repositorio
- [ ] Ninguna página por variante geográfica
- [ ] Lighthouse **perfil mobile** ≥ 95 performance, 100 accesibilidad
- [ ] Objetivos táctiles ≥ 44×44 px
- [ ] En mobile no se descarga el video del hero

### Checks de CI

| Check | Falla si |
|---|---|
| `astro check` | Errores de tipos o de schema de contenido |
| `verificar-html.sh` | Falta contenido en el HTML inicial |
| Lighthouse CI mobile | Performance < 95 o Accessibility < 100 |
| Grep de `client:` | Aparece cualquier directiva de hidratación |
| Tamaño del bundle JS | Supera 5 KB en cualquier ruta |
| `verificar-tracking.sh` | Falta el snippet en alguna página, falta un `data-evento` esperado, o hay un `<script src>` de terceros en el HTML |
| Grep de `llms.txt` | Existe el archivo |

```bash
# scripts/verificar-html.sh
for ruta in "" nosotros servicios obras obras/prune contacto; do
  html=$(curl -s "$BASE_URL/$ruta")
  echo "$html" | grep -q "<h1" || echo "FALTA h1: /$ruta"
done

curl -s "$BASE_URL/obras" | grep -q "Barrio Santa Bárbara" \
  || echo "FALLA: la grilla de obras no está en el HTML inicial"

for cliente in Google WeWork IRSA UADE PRUNE "Fabric Sushi" Subway Hospitales; do
  curl -s "$BASE_URL/" | grep -q "$cliente" || echo "FALTA cliente en HTML: $cliente"
done
```
