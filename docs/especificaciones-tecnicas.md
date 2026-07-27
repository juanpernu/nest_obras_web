# NEST — Especificaciones técnicas

**Documento relacionado:** [Estructura de la web + Lineamientos GEO](./nest-web-estructura-y-geo.md)
Las referencias del tipo *(GEO §2.1)* apuntan a secciones de ese documento.

---

## 1. Stack

| Capa | Decisión |
|---|---|
| Framework | Astro 5 |
| Renderizado | `output: 'static'` (prerenderizado total) + opt-out puntual por ruta |
| Componentes | shadcn/ui (`.tsx`, renderizados a HTML estático) |
| Estilos | Tailwind CSS v4 (plugin de Vite) |
| React | 19 vía `@astrojs/react` — **dependencia de build, no de runtime** (§5.5) |
| JS enviado al navegador | 0 KB de framework en todas las rutas |
| Contenido | Content Layer API de Astro + Zod |
| Hosting | Vercel |
| Adaptador | `@astrojs/vercel` |
| Imágenes | Optimización en build con Sharp (`astro:assets`) |
| Email transaccional | Resend |
| Gestor de paquetes | pnpm |

### Por qué Astro estático y no SSR

GEO §2.1 fija que todo el contenido de valor tiene que estar en el HTML de la respuesta inicial, porque los crawlers de IA que no son de Google en general no ejecutan JavaScript. El contenido de NEST es fijo y de baja frecuencia de cambio: siete rutas, diez obras, textos cerrados. Prerenderizar todo en build es la opción que cumple el requisito por construcción, sin depender de que nadie se acuerde de la regla.

`output: 'static'` es el default de Astro 5. El adaptador de Vercel se instala igual, porque hace falta una única ruta on-demand para el endpoint del formulario (§7).

---

## 2. Inicialización

El repositorio está vacío, así que se usa el scaffold de shadcn, que crea el proyecto Astro completo con Tailwind, React y el alias ya configurados.

### Recomendado: preset visual

[shadcn/create](https://ui.shadcn.com/create?template=astro) permite fijar estilo, colores, tipografías e iconos antes de generar el proyecto, y devuelve un comando con el preset embebido:

```bash
pnpm dlx shadcn@latest init --preset [CODE] --template astro
```

Conviene usar esta vía y no la genérica: la identidad de NEST ya está definida en el PDF (azul marino, dorado, amarillo de acento), y cargarla como preset deja los tokens del design system correctos desde el primer commit en lugar de sobrescribir los defaults después.

### Alternativa: scaffold directo

```bash
pnpm dlx shadcn@latest init -t astro
```

### Si se parte de un proyecto Astro ya creado

```bash
pnpm create astro@latest nest-web -- --template with-tailwindcss --install --add react --git
```

Agregar el alias en `tsconfig.json` —requisito de la CLI de shadcn, sin él `init` falla— y recién después correr `pnpm dlx shadcn@latest init`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### En cualquiera de los tres casos

```bash
pnpm astro add vercel sitemap
```

---

## 3. Estructura del repositorio

```
nest-web/
├── docs/
│   ├── nest-web-estructura-y-geo.md
│   └── especificaciones-tecnicas.md
├── public/
│   ├── robots.txt
│   └── fonts/
├── src/
│   ├── content.config.ts
│   ├── content/
│   │   ├── obras/            # 10 archivos .md — uno por obra
│   │   ├── servicios/        # 4 archivos
│   │   ├── equipo/           # 2 archivos
│   │   └── testimonios/      # cuando lleguen los reales
│   ├── data/
│   │   ├── clientes.ts       # los 8 logos corporativos
│   │   ├── estadisticas.ts   # +30 / +100.000 / +80 / +50
│   │   └── site.ts           # NAP, redes, WhatsApp, URL canónica
│   ├── components/
│   │   ├── ui/               # shadcn .tsx — render estático, sin hidratar
│   │   └── astro/            # componentes propios del sitio (.astro)
│   ├── layouts/
│   │   └── main.astro        # el del starter — carga global.css
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
│   └── assets/
│       └── obras/            # fotos fuente, optimizadas en build
├── astro.config.mjs
└── components.json
```

No hay directorio `islands/`: el proyecto no hidrata componentes (§5.5).

**`src/layouts/main.astro` no se renombra.** Es el layout del starter de Tailwind y es donde se carga el stylesheet global; la documentación de shadcn advierte que hay que mantenerlo en su lugar o asegurarse de que cada página importe `@/styles/global.css`. Se lo extiende con los metadatos, el canonical y el JSON-LD de §11, pero conserva el nombre.

---

## 4. Configuración de Astro

```js
// astro.config.mjs
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

**`site`** es obligatorio: sin él el sitemap se genera con URLs relativas y los canonicals absolutos no se pueden construir (GEO §2.2).

**`trailingSlash: 'never'`** tiene que coincidir con la configuración de Vercel. Si `/obras` y `/obras/` responden ambas 200, hay contenido duplicado — que GEO §2.2 marca como desperdicio de presupuesto de rastreo.

**No se usa `imageService: true`.** El servicio de imágenes de Vercel factura por transformación en runtime. Las fotos de obra son un set fijo de unas 30 imágenes: optimizarlas en build con Sharp es gratis, sirve archivos estáticos desde el CDN y no agrega latencia (GEO §2.2, rendimiento).

---

## 5. shadcn/ui — estrategia de renderizado

### 5.1 El punto a resolver

shadcn/ui es React. Astro renderiza componentes React a HTML estático **cuando no llevan directiva `client:*`**, y en ese caso no manda nada de JavaScript al navegador. Pero eso solo sirve para componentes verdaderamente presentacionales.

Los componentes de shadcn construidos sobre primitivas de comportamiento — Dialog, Select, Accordion, Tabs, Popover, Sheet — renderizan markup estático que **queda inerte** sin hidratación: los atributos ARIA están, pero nada responde. Renderizarlos sin `client:*` produce una UI rota, no una UI liviana.

De ahí salen dos categorías con reglas distintas.

### 5.2 Presentacionales — se usan tal cual, sin directiva, cero JavaScript

Card, Button, Badge, Separator, Table, Avatar, Alert, Label.

Se instalan con la CLI y se importan directo en los `.astro`, **sin ninguna directiva `client:*`**. Astro los renderiza a HTML en build y no manda nada al navegador. Es el patrón que muestra la documentación oficial de shadcn para Astro:

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

Ojo con el prop: dentro de un componente React se escribe `className`, no `class`.

**No se portan a `.astro`.** Un componente React sin directiva y un `.astro` equivalente mandan exactamente lo mismo al navegador —nada—, así que el port no compra performance y sí cuesta: rompe el camino de actualización de `shadcn add` y duplica el design system en dos sintaxis. React queda como dependencia de build, no de runtime.

El directorio `src/components/astro/` del árbol de §3 se reserva para componentes propios del sitio (tarjeta de obra, barra de estadísticas, grilla de logos), no para reimplementar primitivas de shadcn.

### 5.3 Interactivos — resueltos con HTML nativo, sin framework

El inventario de islas de la primera versión de este documento tenía un error de fondo que aparece al mirarlo desde mobile-first.

La isla `NavMobile` vivía en el layout, o sea en las siete rutas. Hidratarla con `client:media="(max-width: 768px)"` significa que **cada visita desde un teléfono descarga React, react-dom y una primitiva de Radix —del orden de 45 KB comprimidos más el costo de hidratación— para abrir un menú hamburguesa**, mientras que desde una computadora no se descarga nada. Eso es exactamente al revés: carga el framework sobre el dispositivo lento, con la red peor, y lo exime al que tiene fibra. Para un sitio cuyo tráfico va a ser mayoritariamente móvil, es el peor reparto posible.

Revisados con ese criterio, los tres casos interactivos se resuelven sin framework y —en dos de los tres— con mejor resultado en mobile:

| Patrón | Solución | JS enviado |
|---|---|---|
| Nav mobile | `<details>` / `<summary>` con Tailwind | 0 |
| Galería de obra | Carrusel con CSS scroll-snap + `<dialog>` nativo | ~10 líneas inline |
| Filtro de `/obras` | Radios + `:has()` (§7.2) | 0 |
| Select del formulario | `<select>` nativo estilado | 0 |
| Validación del formulario | Validación nativa de HTML5 + server-side (§8) | 0 |

**El carrusel con scroll-snap es mejor que uno de JavaScript en un teléfono**, no un reemplazo aceptable: usa el scroll nativo del sistema, con su inercia y su gesto real, en vez de reimplementar el arrastre con listeners.

**El `<select>` nativo es mejor que un dropdown custom en un teléfono**: abre el picker del sistema operativo, que el usuario ya sabe usar y es accesible sin trabajo adicional.

**`<details>` y `<dialog>` traen del navegador** el manejo de foco, el estado expandido y el cierre con Escape que de otro modo habría que reimplementar.

### 5.4 Qué aporta shadcn entonces

Los tokens del design system, los estilos y las primitivas presentacionales: Card, Button, Badge, Input, Label, Textarea, Separator, Table, Avatar. Todo eso se usa tal cual, en `.tsx`, renderizado a HTML estático.

Lo que queda afuera son los componentes construidos sobre comportamiento de Radix —Sheet, Dialog, Select, Carousel, Accordion, Tabs—, reemplazados por su equivalente nativo.

**El costo, dicho de frente:** Radix aporta accesibilidad probada —trampa de foco, cableado de ARIA, manejo de teclado— y al no usarlo esa responsabilidad pasa a nosotros. La mitigación es no reimplementarla: usar elementos nativos que ya la traen del navegador, en vez de construir el mismo comportamiento con `div`s. Por eso la tabla de arriba dice `<details>` y `<dialog>` y no "un componente propio".

### 5.5 Regla de aceptación

**Ninguna directiva `client:*` en el proyecto.** Ni `load`, ni `visible`, ni `media`. React queda como dependencia de build para renderizar los componentes de shadcn a HTML estático, y el sitio no envía framework en ninguna ruta.

Si algún requerimiento futuro justifica una isla, se discute y se agrega acá con su costo en KB. No se agrega por conveniencia de implementación.

---

## 6. Modelo de contenido

### 6.1 Colección de obras

Es la pieza central: tiene que resolver que una obra viva como tarjeta de galería o como página propia, y que promoverla de una a otra sea cargar datos y no escribir código (Estructura §1.1).

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
              `Completalos o poné paginaPropia: false (GEO §2.3).`,
          });
        }

        if ((obra.galeria?.length ?? 0) < 8) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              `"${obra.nombre}" tiene ${obra.galeria?.length ?? 0} fotos. ` +
              `Una obra con página propia necesita 8 como mínimo.`,
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
              `${placeholders.map((f) => f.clave).join(', ')}. ` +
              `No se publica una página con placeholders (GEO §2.3).`,
          });
        }
      }),
});

export const collections = { obras };
```

### 6.2 Qué gana este schema

**Convierte reglas de contenido en errores de build.** GEO §2.3 dice que `/obras/el-canton` no se publica con los `[completar]`, y §2.13 pide cero placeholders publicados. En vez de dejarlo como disciplina del equipo, el build falla:

```
[content] "El Canton Golf" tiene campos sin completar: Superficie, Plazo de ejecucion,
Ano de entrega. No se publica una página con placeholders (GEO §2.3).
```

Los límites SEO de 60 y 155 caracteres del PDF también dejan de ser una convención y pasan a ser `.max()` verificado en cada build.

**El flujo de promoción queda en un archivo.** Para que una obra de galería pase a página propia: cargar `slug`, `seo`, `headline`, `ficha`, 8 fotos, y poner `paginaPropia: true`. Si falta algo, el build lo dice con nombre y apellido. No hay que tocar rutas, ni el sitemap, ni la grilla.

**Estado inicial:** `paginaPropia: true` solo en `prune.md`. El Canton arranca en `false` hasta que lleguen los m², el plazo, el año y el estilo reales.

> Nota: `.superRefine()` devuelve un `ZodEffects`. Si genera fricción con la inferencia de tipos de `reference()` más adelante, la validación se mueve a un script de pre-build que corre sobre `getCollection('obras')`. El comportamiento —build que falla— se mantiene igual.

### 6.3 Otras colecciones

`servicios` (4), `equipo` (2), `testimonios` (vacía hasta que lleguen los reales — la sección de la Home no se renderiza si la colección está vacía, en vez de mostrar placeholders).

Datos que no son contenido editorial van en `src/data/` como TypeScript tipado: los 8 clientes corporativos, las estadísticas y el NAP del negocio, que se consume desde el footer, desde el JSON-LD y desde el Perfil de Negocio de Google — una sola fuente, que es lo que GEO §2.7 exige para la consistencia.

---

## 7. Rutas

### 7.1 Generación

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

Con el estado inicial genera una sola ruta: `/obras/prune`. Cuando El Canton tenga los datos, genera dos. `/obras/corporativo` no existe y no hay nada que borrar.

### 7.2 Filtro de `/obras` sin JavaScript

Las 10 obras se renderizan siempre en el HTML (GEO §2.1). El filtro se resuelve con radios y `:has()`, sin isla:

```astro
<fieldset class="flex gap-2">
  <input type="radio" name="filtro" id="f-todos" class="peer/todos sr-only" checked />
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

Cero JavaScript, funciona con JS deshabilitado, y un crawler que no ejecuta scripts lee las 10 obras. Los `<label>` son controles reales, lo que satisface el requisito de recorribilidad por agentes de GEO §2.8.

No se usan query params para el filtro: en un sitio estático obligarían a JavaScript o a generar páginas por variante, y esto último es el patrón de contenido duplicado que GEO §2.10 prohíbe explícitamente.

---

## 8. Formulario de consulta

Resuelve la inconsistencia señalada en Estructura §1.5.1 y el requisito de agentes de GEO §2.8.

### 8.1 Arquitectura

**Envío server-side real, con WhatsApp como canal alternativo y no como único mecanismo.** Si la conversión resuelve solo con deep link a `wa.me`, queda fuera del alcance de cualquier agente o crawler.

```ts
// src/pages/api/consulta.ts
export const prerender = false;   // única ruta on-demand del proyecto

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, redirect }) => {
  const datos = await request.formData();
  // validación server-side + envío vía Resend
  return redirect('/contacto/gracias', 303);
};
```

`export const prerender = false` es lo que habilita una función serverless puntual en un sitio con `output: 'static'`. Las otras siete rutas se siguen sirviendo como HTML estático desde el CDN.

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

El formulario funciona sin JavaScript y sin framework. La validación se apoya en los atributos nativos —`required`, `type="tel"`, `type="email"`, `pattern`— que en un teléfono además cambian el teclado que aparece, y se repite del lado del servidor, que es la única que cuenta. El desplegable de tipo de proyecto es un `<select>` nativo (§5.3).

El estado de envío ("Enviando…", deshabilitar el botón) se resuelve con unas líneas inline, no con una isla.

`<label for>` asociado a cada campo, `autocomplete` correcto y `<button type="submit">` real —nunca un `div` con listener— son requisitos de GEO §2.8: los agentes recorren el árbol de accesibilidad.

### 8.3 Proveedor de email

**Volumen esperado:** una constructora de este perfil recibe entre 20 y 100 consultas por mes. Con notificación interna más autorespuesta al lead son ~2 emails por consulta: entre 40 y 200 emails mensuales. Incluso multiplicando por cinco, el orden de magnitud no cambia.

| Proveedor | Free tier | Pago | Veredicto |
|---|---|---|---|
| **Resend** | 3.000/mes (100/día) | $20/mes por 50k | **Elegido.** El free tier cubre entre 15× y 75× el volumen real |
| Brevo | 300/día (~9.000/mes) | desde $9/mes | Free tier más amplio, pero es suite de marketing: más superficie de la necesaria |
| AWS SES | 62k/mes desde EC2 | $0,10 por 1.000 | Imbatible a escala, irrelevante acá. Requiere salir del sandbox y más configuración |
| Postmark | 100/mes | desde $16,50/mes | Mejor deliverability del rubro, pero el free tier no alcanza y no justifica el gasto |

**Resend**, por free tier holgado, API mínima y buena integración con el stack. El costo proyectado es **$0 y se mantiene en $0** salvo que el volumen se multiplique por quince.

**Ruta de escape si eso pasa:** el endpoint aísla el envío detrás de una función `enviarEmail()`. Cambiar a SES —$0,10 por 1.000— es reemplazar esa función, no tocar el formulario. No hay lock-in que justifique optimizar hoy.

### 8.4 Persistencia del lead

**El email no es un almacén de leads.** Si la consulta solo existe como mail, se pierde con un borrado accidental, cae en spam sin dejar rastro, no se puede deduplicar ni marcar como atendida, y no hay forma de saber qué tipo de proyecto convierte mejor. Para un negocio donde cada lead es un contrato de obra, es un riesgo desproporcionado frente a lo que cuesta evitarlo.

**Orden de operaciones en el endpoint: primero persistir, después notificar.** Si falla el envío del mail, el lead ya está guardado.

```ts
const lead = await guardarLead(datos);        // si esto falla, error 500 al usuario
await enviarEmail(lead).catch(registrarFallo); // si esto falla, el lead ya existe
return redirect('/contacto/gracias', 303);
```

**Almacén propuesto: Airtable.** Free tier suficiente, y el equipo de NEST —dos socios, sin desarrolladores— obtiene una vista usable de sus leads con estados y filtros desde el día uno, sin que nadie construya un panel de administración. Un Postgres sería más prolijo de ingeniería y menos útil para ellos.

*Alternativa si prefieren no depender de un tercero:* **Neon** (Postgres, free tier, reanuda al conectarse). Implica construir después alguna vista para consultar los leads. **Supabase no** en free tier: pausa los proyectos tras una semana sin actividad, y un formulario de baja frecuencia es exactamente el caso que dispara esa pausa.

### 8.5 Antispam

Sin CAPTCHA visible, que agrega fricción sobre un formulario de alto valor:

1. **Honeypot** — campo oculto que un humano nunca completa. Gratis, sin dependencias, filtra la mayor parte de los bots.
2. **Cloudflare Turnstile** — gratuito e ilimitado, invisible en la mayoría de los casos, sin las implicancias de privacidad de reCAPTCHA.
3. **Validación server-side** — nunca confiar en la del cliente; la isla de React es cosmética.

### 8.6 Variables de entorno

| Variable | Uso | Expuesta |
|---|---|---|
| `RESEND_API_KEY` | Envío de la consulta | No |
| `NOTIFY_EMAIL` | Destinatario interno | No |
| `AIRTABLE_TOKEN` / `AIRTABLE_BASE_ID` | Persistencia del lead | No |
| `TURNSTILE_SECRET_KEY` | Verificación server-side | No |
| `PUBLIC_TURNSTILE_SITE_KEY` | Widget en el cliente | Sí |
| `PUBLIC_WHATSAPP` | Deep links `wa.me` | Sí |

Solo las que llevan prefijo `PUBLIC_` llegan al navegador. Las demás nunca deben quedar expuestas.

### 8.7 Costo total

| Ítem | Costo mensual |
|---|---|
| Resend | $0 |
| Airtable | $0 |
| Cloudflare Turnstile | $0 |
| Funciones serverless de Vercel | $0 — una ruta, tráfico marginal |
| **Vercel Pro** | **$20** |

El plan Hobby de Vercel es para uso personal no comercial, así que un sitio de empresa requiere Pro. **Ese es el piso real de costo del proyecto, y es entre 20 y 40 veces lo que costaría cualquier decisión sobre el proveedor de email.** Conviene tenerlo presente antes de invertir tiempo optimizando la parte gratis.

---

## 9. Imágenes y video

### 9.1 Fotos

`astro:assets` con Sharp en build. Las imágenes van en `src/assets/obras/`, no en `public/`, para que pasen por el pipeline de optimización.

- AVIF con fallback WebP, `sizes` explícito.
- `width` y `height` siempre presentes: evita CLS, que GEO §2.2 toca vía rendimiento.
- `alt` descriptivo obligatorio — el schema lo fuerza con `z.string().min(10)`, así que un `alt=""` o un `alt="foto"` rompe el build.
- `loading="eager"` + `fetchpriority="high"` solo en la portada de cada obra; el resto `lazy`.

### 9.2 Logos de clientes

Es el punto de mayor retorno del sitio (GEO §2.5). Nunca un sprite ni una imagen compuesta:

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

El `<span>` con el nombre visible no es redundante con el `alt`: GEO §2.5 pide que los nombres estén como texto en el DOM porque el cuerpo del documento pesa más que un atributo de imagen. Si el diseño no admite el nombre bajo cada logo, va en un párrafo que los enumere — pero tiene que estar como texto.

### 9.3 Video del hero

`archivo.nestobras.com.ar/archivos/video_nest.mp4`, con overlay al 40%.

- `preload="none"`, `poster` con una imagen optimizada, `muted playsinline loop`.
- **El LCP tiene que ser el `<h1>`, no el video.** El headline es texto en el DOM y se pinta antes que cualquier frame.
- `@media (prefers-reduced-motion: reduce)` → solo el poster.
- Es decorativo: sin `alt`, sin texto embebido, `aria-hidden="true"`.

---

## 10. Mobile-first

El público de NEST llega mayoritariamente desde el teléfono, y el CTA principal es un WhatsApp. El sitio se diseña y se mide en mobile primero; desktop es la mejora progresiva, no al revés.

### 10.1 Presupuesto de recursos

| Recurso | Presupuesto en mobile |
|---|---|
| JavaScript de framework | **0 KB** — garantizado por §5.5 |
| JavaScript total | < 5 KB, solo scripts inline |
| CSS | < 20 KB comprimido |
| Imagen del hero (poster) | < 120 KB |
| LCP en 4G | < 2,0 s |
| CLS | < 0,05 |

El presupuesto de JavaScript no es una aspiración: es consecuencia de que no haya ninguna directiva `client:*`, y el check de CI de §13 lo verifica.

### 10.2 Video del hero en mobile

Es el mayor riesgo de rendimiento del sitio. Un mp4 de fondo autoplay en un teléfono con datos móviles consume plan del usuario, calienta el dispositivo y compite por ancho de banda con el LCP.

**En viewports menores a 768 px no se carga el video.** Se muestra únicamente el poster optimizado. La decisión se toma con `<source media="...">` dentro del `<video>`, o directamente no renderizando el elemento en mobile — nunca cargándolo y ocultándolo con CSS, que descarga igual.

También se respeta `prefers-reduced-motion` y, donde esté disponible, `navigator.connection.saveData`.

### 10.3 Interacción táctil

- Objetivos táctiles de 44×44 px como mínimo, incluidos los `<label>` del filtro de obras y los items del nav.
- Sin estados que dependan de `:hover` para revelar información: en touch no existe el hover. Todo lo que se muestra al pasar el mouse tiene que estar visible o ser alcanzable con un tap.
- Botón de WhatsApp accesible sin scroll desde cualquier punto de la Home.
- `font-size` mínimo de 16 px en los inputs: por debajo de eso, Safari en iOS hace zoom automático al enfocar el campo.

### 10.4 Imágenes

`sizes` declarado en función del layout real de cada breakpoint, no `100vw` por defecto. Las fotos de obra en la grilla se sirven a una columna en mobile y no deben descargar la resolución de escritorio: es el ahorro de bytes más grande del sitio después del video.

---

## 11. Capa técnica de SEO/GEO

| Requisito | Implementación |
|---|---|
| Sitemap (§2.2) | `@astrojs/sitemap`, automático desde `site` |
| robots.txt (§2.2) | Archivo estático en `public/robots.txt` con los agentes de IA habilitados |
| Canonical (§2.2) | En `main.astro`, autorreferencial con `Astro.site` + `Astro.url.pathname` |
| `lang="es-AR"` (§2.9) | En `main.astro` |
| Título ≤60 / meta ≤155 (§2.9) | Props tipadas del layout, con `.max()` validado en el schema |
| JSON-LD (§2.6) | Componente `<SchemaOrg>` que emite `<script type="application/ld+json">` |
| Jerarquía de encabezados (§2.4) | Un `<h1>` por página, según el mapa de la §2.4 del doc GEO |
| Sin `llms.txt` (§2.10) | No se crea. Google declara explícitamente que no lo usa |

El JSON-LD se arma desde `src/data/site.ts`, la misma fuente que alimenta el footer. Tipos: `GeneralContractor` y `Organization` globales, `Person` ×2 en `/nosotros`, `BreadcrumbList` en `/obras/*`, `Service` ×4 en `/servicios`.

**Sin `AggregateRating` ni `Review`** mientras no haya reseñas verificables (GEO §2.6).

---

## 12. Vercel

### 12.1 Configuración del proyecto

| Ítem | Valor |
|---|---|
| Framework preset | Astro |
| Build command | `pnpm build` |
| Output directory | detectado por el adaptador |
| Node | 22.x |
| Región de funciones | `gru1` (São Paulo) — la más cercana a Argentina |

### 12.2 Dos cosas que hay que verificar sí o sí

**Deployment Protection apagada en producción.** Vercel puede activar protección por contraseña o SSO en el proyecto. Con eso encendido, todo el sitio responde 401 a los crawlers — Googlebot, GPTBot, ClaudeBot, todos. Es la forma más rápida de que un sitio impecable sea invisible. Dejarla activa solo en los preview deployments.

**Preview deployments fuera del índice.** Los dominios `*.vercel.app` de preview deben responder `X-Robots-Tag: noindex`, o compiten con producción por contenido duplicado.

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "has": [{ "type": "host", "value": "(?<host>.*\\.vercel\\.app)" }],
      "headers": [{ "key": "X-Robots-Tag", "value": "noindex" }]
    }
  ]
}
```

### 12.3 Dominio

`nestobras.com.ar` como dominio principal, con redirect 308 desde `www`. Un solo host canónico.

El video sigue sirviéndose desde `archivo.nestobras.com.ar` — hay que confirmar que ese subdominio queda apuntando donde está hoy y no se rompe con la migración de DNS.

---

## 13. Verificación

### 13.1 Script de contenido en HTML

Automatiza el criterio de aceptación de GEO §2.1 y §2.13:

```bash
# scripts/verificar-html.sh — corre contra el build local o el preview
for ruta in "" nosotros servicios obras obras/prune contacto; do
  html=$(curl -s "$BASE_URL/$ruta")
  echo "$html" | grep -q "<h1" || echo "FALTA h1: /$ruta"
done

curl -s "$BASE_URL/obras" | grep -q "Barrio Santa Barbara" \
  || echo "FALLA: la grilla de obras no está en el HTML inicial"

for cliente in Google WeWork IRSA UADE PRUNE "Fabric Sushi" Subway Hospitales; do
  curl -s "$BASE_URL/" | grep -q "$cliente" || echo "FALTA cliente en HTML: $cliente"
done
```

### 13.2 Checks de CI

| Check | Falla si |
|---|---|
| `astro check` | Errores de tipos o de schema de contenido |
| `verificar-html.sh` | Falta contenido en el HTML inicial |
| Lighthouse CI **en perfil mobile** | Performance < 95 o Accessibility < 100 |
| Grep de `client:` | Aparece cualquier directiva de hidratación (§5.5) |
| Tamaño del bundle JS | Supera 5 KB en cualquier ruta (§10.1) |
| Grep de `llms.txt` | Existe el archivo (GEO §2.10) |

Lighthouse corre en perfil **mobile**, no desktop. Un sitio sin framework debería superar 95 con holgura; si no lo hace, el problema son las imágenes o el video, y conviene enterarse en CI.

---

## 14. Decisiones que quedan abiertas

1. **Analítica.** No está definida. Vercel Web Analytics es la de menor fricción y no agrega scripts de terceros.
2. **Tipografías.** El PDF no las especifica. Van self-hosted en `public/fonts/` con `font-display: swap` y `preload` solo de la variante usada en el `<h1>`. No se usa Google Fonts: agrega una conexión externa al camino crítico, que en 4G se paga caro.

### Decisiones ya cerradas

| Tema | Resolución |
|---|---|
| Envío del formulario | Server-side vía endpoint, con WhatsApp como canal alternativo (§8.1) |
| Proveedor de email | Resend, free tier (§8.3) |
| Persistencia del lead | Airtable, con Neon como alternativa (§8.4) |
| Antispam | Honeypot + Cloudflare Turnstile (§8.5) |
| Convención de componentes | Todo `.tsx` de shadcn, sin ports a `.astro` (§5.2) |
| Hidratación | Ninguna. Cero directivas `client:*` (§5.5) |
