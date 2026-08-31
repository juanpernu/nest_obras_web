# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primario — cliente residencial premium de Zona Norte (GBA) y CABA.** Está por
encargar una casa nueva, una refacción o una ampliación en Nordelta, San Isidro,
Escobar, Pilar, Tigre o CABA. Es la compra más cara y más larga que va a hacer, y
el trabajo que está haciendo en el sitio es **decidir a quién confiarle la obra**:
busca señales de que la empresa cumple plazo y presupuesto y de que no lo van a
dejar solo. Llega mayoritariamente desde el teléfono.

**Secundario — responsable de obra de una empresa.** Necesita locales, oficinas o
desarrollos comerciales con plazos ajustados, varias sedes en paralelo y sin
interrumpir la operación. Evalúa capacidad de coordinación y antecedentes.

## Product Purpose

`nestobras.com.ar` es un **sitio de captación de leads, no un catálogo de obras**.
Existe para convertir la visita en una consulta: formulario enviado o conversación
de WhatsApp iniciada. El éxito se mide en consultas calificadas, no en tiempo de
permanencia ni en cantidad de páginas vistas.

## Positioning

NEST (razón visible de Nest Obras) es una constructora argentina con **más de 30
años** que trabajó para **Google, WeWork, IRSA, UADE, PRÜNE, Fabric Sushi, Subway
y hospitales**. Ese portfolio corporativo es el argumento con el que vende obra
residencial premium: *si NEST pasó el filtro de una empresa como Google, una casa
está en las mejores manos.* Ninguna constructora residencial vecina puede copiar
esa credencial sin tenerla.

La estructura societaria sostiene el mismo argumento: **Arq. Morena Alegre**
(arquitecta, MBA en Universidad Austral/IAE, ex WeWork y ex Google Argentina) e
**Ing. Carlos Alegre** (ingeniero civil, +30 años en obra, formado en Benito
Roggio). Gestión corporativa + ingeniería de gran escala aplicadas a una casa.

El caso **PRÜNE** es el activo más fuerte del sitio: 10 sucursales, 40 días,
turnos de 24 horas, 2023. Son cifras verificables de primera mano.

## Operating Context

- **La consulta arranca en el teléfono y suele seguir por WhatsApp**, canal
  primario de contacto comercial en Argentina. El sitio ofrece formulario y
  WhatsApp en paralelo, nunca uno solo.
- **El contenido lo entrega NEST por tandas** (fotos de obra, textos, fichas), y
  llega incompleto: hay obras sin fotos suficientes y fichas sin datos. El sitio
  tiene que tolerar esa asimetría sin publicar huecos.
- **La fuente original de copy** es `NEST_Contenido_Web_Completo.pdf` (17 páginas,
  fuera del repositorio). Sus textos vienen **sin acentuación**; el spec los
  corrige y la corrección es obligatoria antes de publicar.
- **Visibilidad en buscadores y en motores de IA (GEO)** es objetivo explícito del
  proyecto, no un extra: condiciona render, marcado semántico y datos
  estructurados (`docs/PLAN-EJECUCION.md` §6).

## Capabilities and Constraints

- **Estado actual: el sitio todavía no está publicado.** Fases 1-4 implementadas
  en `main` (6 páginas, modelo de contenido, componentes). Fase 5 —el endpoint de
  leads— no existe todavía: `FormularioConsulta.astro` postea a `/api/consulta`,
  que hoy da 404. Los leads solo pueden entrar por WhatsApp hasta que se
  implemente.
- **7 rutas**: `/`, `/nosotros`, `/servicios`, `/obras`, `/obras/[id]`,
  `/contacto`, `/privacidad`. `/obras/corporativo` fue eliminada por decisión
  cerrada; `/obras/el-canton` no se publica hasta tener datos reales.
- **Arquitectura estática innegociable**: Astro `output: 'static'`, **cero
  directivas `client:*`**, 0 KB de framework en el navegador. La única ruta
  on-demand prevista es `/api/consulta`. Los patrones interactivos se resuelven
  con HTML/CSS nativo (`<details>`, `<dialog>`, scroll-snap, `:has()`).
- **Presupuesto de recursos como requisito de aceptación**: LCP < 2 s (el LCP es
  el `<h1>`), CLS < 0,05, JS < 5 KB por ruta, CSS < 20 KB, Lighthouse mobile ≥ 95
  performance y **100 accesibilidad**. Todo lo que no entre en ese presupuesto no
  se implementa.
- **El contenido rompe el build**: el schema Zod (`src/content.config.ts`) valida
  límites SEO, exige `alt` y no deja publicar campos `[completar]`.
- **Idioma**: español rioplatense, voseo, **acentuación correcta obligatoria** —
  incluidos `alt`, metadatos y mensajes del formulario.
- **Prohibiciones vigentes**: sin `llms.txt`, sin páginas por variante
  geográfica, sin embeds de terceros en el camino crítico. El embed de YouTube en
  el hero se intentó y se revirtió tres veces (14, 16 y 17/08/2026): el hero usa
  `<video>` nativo. No reintentarlo sin leer `docs/DEUDA-TECNICA.md` §5.
- **Terminología del dominio**: *obra*, *llave en mano*, *refacción*, *dirección
  de obra*, *barrio cerrado*, *pliego*, *gremios*, *prefactibilidad*. Es el
  vocabulario del cliente, no jerga a traducir.
- **Infraestructura prevista** (aún sin provisionar): Resend para email, Airtable
  para persistir leads, Cloudflare Turnstile como mejora progresiva. Hosting
  Vercel (Node 22.x, región `gru1`). Analítica: GA4 + Meta Pixel con carga
  diferida y Consent Mode v2 — decisión cerrada.
- **Abierto**: ID del Meta Pixel, marcado de conversiones en GA4 y validación
  legal de `/privacidad` siguen pendientes de NEST.

## Brand Commitments

- Nombre legal **Nest Obras**; marca visible **NEST**.
- La identidad está documentada y es vinculante en
  [`docs/identidad-visual.md`](docs/identidad-visual.md): la marca son **dos
  colores** —navy `#003057` y arena `#D9C2B6`— y **Roboto Condensed** en pesos
  300/400/500, self-hosted (nunca Google Fonts: ninguna conexión externa en el
  camino crítico).
- **No hay dorado ni amarillo en la marca.** Los del PDF de contenido pertenecen a
  ese documento, no a NEST.
- El arena sobre blanco da 1.70 de contraste y falla todo; sobre fondo claro el
  acento es navy. Es una restricción de accesibilidad, no una preferencia.
- **Voz**: sobria, concreta, sin superlativos vacíos. La promesa central es
  *"lo que prometemos, lo entregamos"*; el sitio no debe hacer promesas que la
  empresa no pueda cumplir.
- **NAP idéntico carácter por carácter en todo el sitio** (§6.7), con fuente única
  en `src/data/site.ts`.

## Evidence on Hand

**Real y verificado:**
- **Caso PRÜNE**: 10 sucursales, 40 días, turnos de 24 h, 2023.
- **8 clientes corporativos** con logos en `public/logos/` y nombre como texto.
- **Estadísticas**: +30 años, +100.000 m² entregados, +80 proyectos, +50 clientes
  (`src/data/estadisticas.ts`).
- **Bios y credenciales del equipo** (`src/content/equipo/`), con fotos reales.
- **Fotos de obra** en `src/assets/obras/` — cobertura desigual: El Aromo, PRÜNE y
  Tacuarí 1050 tienen material para página propia; varias obras solo tienen
  portada.
- **NAP confirmado**: Paraná 26, Ciudad de Buenos Aires, CPA `C1017AAE`; WhatsApp
  **+54 9 11 6526-9160** (`5491165269160`); `info@nestobras.com.ar`; Instagram
  `nest.obras`. Confirmado por el usuario el 29/08/2026 — es el número correcto,
  y cualquier registro anterior con `5491155269160` está equivocado.

**Ausencias que no se pueden rellenar inventando:**
- **No hay testimonios reales.** Los dos publicados (`Juan R.`, `María L.`) son
  **placeholders inventados**, marcados como tales en el frontmatter, mantenidos
  por decisión explícita del cliente y a reemplazar antes del launch. No
  presentarlos como reales en copy nuevo ni generar más.
- **El Canton**: faltan m², plazo, año y estilo → la página no se publica.
- No hay reseñas, premios, certificaciones, precios ni benchmarks confirmados. No
  inventarlos.

## Product Principles

1. **Cada página tiene que producir una consulta, no una impresión.** Si una
   sección no acerca al visitante a escribir, no se gana el espacio.
2. **La prueba corporativa vende la obra residencial.** Google, WeWork, IRSA y
   PRÜNE son el argumento, no un adorno del footer.
3. **Nada inventado.** Si el dato no existe, la sección no se publica y se avisa.
   La honestidad es parte del producto, no una restricción externa.
4. **El contenido de valor existe sin JavaScript.** Lo que no se ve con `curl`, no
   existe para un buscador, para un motor de IA ni para un visitante con mala
   conexión.
5. **Mobile es el caso principal y el presupuesto de recursos es un requisito.**
   Una idea que no entra en el presupuesto no es una idea cara: es una idea
   descartada.

## Accessibility & Inclusion

- **Lighthouse accesibilidad = 100** es criterio de aceptación del proyecto, no
  una aspiración. WCAG 2.1 AA como piso, con los contrastes verificados y
  documentados.
- Objetivos táctiles ≥ 44×44 px.
- `prefers-reduced-motion` respetado: con esa preferencia no se descarga ningún
  video de hero, en ningún ancho.
- El formulario funciona sin JavaScript, con `<label for>`, `<button
  type="submit">` y validación server-side reales.
- Todas las imágenes con `alt` descriptivo; el material provisorio se declara como
  tal en el `alt` en lugar de disfrazarse.
