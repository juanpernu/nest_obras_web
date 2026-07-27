# NEST — Estructura de la web + Lineamientos de desarrollo GEO

**Sitio:** nestobras.com.ar
**Fuente de contenido:** `NEST_Contenido_Web_Completo.pdf` (Julio 2026, uso interno)
**Fuente de lineamientos GEO:** [Guía de Google sobre optimización para IA en la Búsqueda](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide?hl=es-419)
**Estado:** especificación previa a implementación

---

# PARTE 1 — Estructura del sitio

## 1.1 Mapa de rutas

Siete rutas. Cinco páginas principales y dos casos de obra individuales.

| Ruta | Página | Objetivo | En nav |
|---|---|---|---|
| `/` | Home | Convertir visitas en consultas | Sí |
| `/nosotros` | Nosotros | Confianza: equipo, historia, proceso | Sí |
| `/servicios` | Servicios | Cómo trabajan + modalidades de contratación | Sí |
| `/obras` | Obras | Portfolio en grilla con filtros | Sí |
| `/obras/prune` | Caso PRUNE | Caso corporativo estrella | No |
| `/obras/el-canton` | Caso El Canton | Caso residencial premium | No |
| `/contacto` | Contacto | Captar y calificar leads | Sí |

### Cambios respecto del PDF original

- **Se elimina `/obras/corporativo`.** El caso Google/WeWork no se desarrolla como página individual.
- **Google/WeWork sigue en la grilla de `/obras`** como tarjeta de galería, con el filtro "Corporativo" funcionando igual.
- **Se elimina la tarjeta Google/WeWork de la Sección 5 de la Home.** Esa sección queda con 2 tarjetas (PRUNE y El Canton), que son exactamente las dos obras con página propia.
- **Subway y Hospitales** existen solo como logos en la Sección 6 de la Home. No entran a la grilla de obras.
- **El contenido de la ex-página corporativa se reubica** (ver 1.3).

## 1.2 Contenido por página

### `/` — Home

| # | Sección | Contenido |
|---|---|---|
| 1 | Hero | Headline, subheadline, CTA principal, link secundario. Fondo: video existente en `archivo.nestobras.com.ar/archivos/video_nest.mp4` con overlay oscuro al 40% |
| 2 | Barra de estadísticas | +30 años · +100.000 m² · +80 proyectos · +50 clientes |
| 3 | Intro | Texto introductorio de 2-3 líneas |
| 4 | Servicios destacados | 3 tarjetas |
| 5 | Obras destacadas | **2 tarjetas** — PRUNE y El Canton |
| 6 | Clientes corporativos | 8 logos + texto de trayectoria corporativa (reubicado) |
| 7 | Testimonios | 2 tarjetas — placeholders hasta que lleguen los reales |
| 8 | Equipo (preview) | 2 fichas + link a `/nosotros` |
| 9 | Formulario de contacto | Formulario + botón de WhatsApp |

**Headline:** "Tu obra en manos expertas, de principio a fin."

### `/nosotros`

Historia → barra de estadísticas → equipo (Arq. Morena Alegre, Ing. Carlos Alegre) → proceso de 5 pasos → 3 valores → CTA.

### `/servicios`

Cuatro servicios: construcción llave en mano · refacciones y ampliaciones · proyectos corporativos y retail · dirección de obra y consultoría.
Dos modalidades de contratación: llave en mano · solo mano de obra.
La tabla de clientes corporativos se incorpora al bloque del Servicio 3 (ver 1.3).

### `/obras`

Filtros: Todos · Viviendas · Corporativo · Refacciones.

| Proyecto | Zona | Tipo | Página propia |
|---|---|---|---|
| PRUNE — 10 sucursales | CABA, GBA e interior | Retail corporativo | **Sí** → `/obras/prune` |
| El Canton Golf | Escobar, Zona Norte | Vivienda premium | **Sí** → `/obras/el-canton` |
| Google / WeWork | CABA | Corporativo | No — galería |
| Fabric Sushi | Buenos Aires | Gastronomía | No — galería |
| Nordelta — Vivienda | Tigre, Zona Norte | Vivienda premium | No — galería |
| San Isidro — Vivienda | San Isidro, Zona Norte | Vivienda premium | No — galería |
| UADE | Buenos Aires | Corporativo educativo | No — galería |
| IRSA | Buenos Aires | Corporativo comercial | No — galería |
| Barrio Santa Barbara | Pilar, Zona Norte | Vivienda premium | No — galería |
| Nordelta Golf — Casa | Tigre, Zona Norte | Vivienda premium | No — galería |

### `/obras/prune`

Ficha de proyecto → El Desafío → La Solución → El Resultado → Por qué este caso importa → CTA.
Datos: 10 sucursales, 40 días, turnos de 24 horas, 2023.

### `/obras/el-canton`

Ficha → El Proyecto → Lo que hicimos (7 ítems) → CTA. **Campos pendientes de completar: m², plazo, año de entrega, estilo.**

### `/contacto`

Formulario cualificador (nombre\*, WhatsApp\*, email, tipo de proyecto\*, dónde construir\*, descripción) → WhatsApp directo → email → redes → 3 bloques de confianza.

## 1.3 Reubicación del contenido de la ex-página corporativa

| Contenido original (P7) | Destino |
|---|---|
| Párrafo de trayectoria corporativa | Home, Sección 6 |
| Cierre "por qué importa para el cliente residencial" | Home, Sección 6 |
| Tabla de 8 clientes corporativos | `/servicios`, bloque de Servicio 3 |
| CTA | Ya existente en ambos destinos |

## 1.4 Datos pendientes

| Dato | Bloquea |
|---|---|
| Número real de WhatsApp | `/contacto`, Home sección 9 |
| Email definitivo | `/contacto` |
| Ficha de El Canton (m², plazo, año, estilo) | Publicación de `/obras/el-canton` — ver 2.3 |
| Testimonios reales | Home sección 7 |
| Fotos (mín. 8 por obra con página propia) | `/obras/prune`, `/obras/el-canton` |

## 1.5 Inconsistencias del documento original a resolver

1. **Doble comportamiento del formulario.** Home dice "Enviar consulta" con mensaje de confirmación (implica backend). Contacto dice "Enviar consulta por WhatsApp" (deep link, sin backend). Hay que unificar el criterio o justificar los dos.
2. **Bloques de confianza sin separar.** Los 3 bloques del pie de `/contacto` tienen título pegado al cuerpo ("Respuesta en el día En horario hábil respondemos..."). Separar en título + párrafo.

---

# PARTE 2 — Lineamientos de desarrollo GEO

## 2.0 Punto de partida: qué dice realmente Google

La guía de Google es explícita en su premisa y conviene dejarla asentada antes de listar lineamientos:

> Los términos "AEO" (optimización para motores de respuesta) y "GEO" (optimización para motores generativos) circulan en la industria, pero Google lo considera simplemente SEO enfocado en la búsqueda con IA.

El motivo técnico es que las funciones de IA de Google **se apoyan en los sistemas de clasificación centrales**, mediante dos mecanismos:

- **RAG (generación mejorada por recuperación):** recupera páginas pertinentes del índice para fundamentar las respuestas con vínculos destacados.
- **Creación de subconsultas:** el modelo genera búsquedas relacionadas en paralelo para traer resultados adicionales.

**Consecuencia para NEST:** no existe una capa "GEO" separada que se pueda agregar al final. Si la página no está indexada, no está en el índice y por lo tanto RAG no puede recuperarla. Todo lo que sigue son requisitos de implementación que hacen que el contenido sea recuperable y citable — no trucos de posicionamiento.

Google también aclara el techo de las garantías:

> El hecho de cumplir con los requisitos y las políticas no garantiza el rastreo, la indexación o la publicación.

---

## 2.1 Renderizado — el lineamiento de mayor impacto

**Regla: todo el contenido de valor debe estar en el HTML de la respuesta inicial del servidor. Nada de client-side rendering para contenido indexable.**

Google puede procesar contenido inyectado por JavaScript si no está bloqueado, pero su propia guía advierte que agrega complejidad. Y acá aparece la divergencia clave que justifica el criterio estricto: **la guía de Google habla por Google. Los crawlers de otros proveedores de IA — GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot — en general no ejecutan JavaScript.** Un sitio en CSR puede indexarse en Google y ser simultáneamente invisible para el resto de los sistemas de IA. Como el objetivo declarado es que la web sea leída por LLMs en general y no solo por Google, el requisito se endurece.

### Implementación

- **Renderizado estático (SSG) para las 7 rutas.** El contenido es fijo y de baja frecuencia de cambio: es el caso ideal. Next.js con App Router y generación estática, o Astro.
- **Prohibido:** cargar la grilla de obras, los testimonios, las estadísticas o cualquier texto de conversión vía `fetch` en el cliente.
- **Los filtros de `/obras` no filtran contra un endpoint.** Las 10 obras vienen completas en el HTML inicial; el filtro solo muestra u oculta con CSS o estado local. Un crawler que no ejecuta JS tiene que poder leer las 10 obras igual.
- **El hero es un video decorativo.** El headline y el subheadline van como texto real en el DOM, nunca como parte del video ni como imagen.

### Verificación obligatoria antes de considerar terminada cualquier página

```bash
curl -s https://nestobras.com.ar/obras | grep -c "Barrio Santa Barbara"
```

Si devuelve `0`, la página no está lista. Repetir para un texto representativo de cada ruta.

---

## 2.2 Accesibilidad del rastreo

Google enumera como requisito que el contenido sea rastreable y públicamente accesible, porque los sistemas de IA lo usan para "aprender patrones y proporcionar respuestas relevantes y fundamentadas".

### robots.txt

Como el objetivo es maximizar la lectura por LLMs, se habilita explícitamente a los crawlers de IA:

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

**Precisión importante:** las funciones de IA de la Búsqueda de Google (AI Overviews, AI Mode) se rastrean con **Googlebot** y se controlan con las reglas normales de robots. `Google-Extended` es un control distinto: regula si el contenido se usa para grounding y entrenamiento de Gemini. Bloquear `Google-Extended` **no** saca al sitio de AI Overviews, y permitirlo **no** mejora el ranking. Se habilita porque el objetivo es la lectura por LLMs, no porque afecte a la Búsqueda.

### Sitemap

`sitemap.xml` con las 7 URLs y `lastmod` real. Referenciado desde `robots.txt`.

### Otros requisitos de la guía

- **Sin contenido duplicado.** Google señala que desperdicia recursos de rastreo. Riesgo concreto en este sitio: el texto de trayectoria corporativa se reubica en Home y la tabla de clientes en Servicios — deben ser textos complementarios, no el mismo bloque repetido en las dos páginas.
- **Canonical autorreferencial** en las 7 rutas.
- **Baja latencia y buen rendimiento en todos los dispositivos**, mencionado explícitamente por la guía como parte de la experiencia de página.
- **Distinción clara entre el contenido principal y el resto** — nav, footer y decoración separados semánticamente del contenido de la página.

---

## 2.3 Contenido único, no básico — el criterio que Google pone primero

Es la primera recomendación de la guía y la que más impacto tiene en si una página se cita o se ignora. Google pide:

- **Punto de vista único**, con el ejemplo de que "una reseña de primera mano proporciona perspectiva única basada en experiencia personal".
- **Contenido no básico / no commodity:** ir más allá del conocimiento común. El contraste que da la guía es entre "7 consejos para compradores" y un análisis experto de primera mano.
- **Contenido útil, confiable y orientado a personas.**
- **Organización clara** en párrafos, secciones y encabezados.
- **Multimedia de calidad** cuando sea pertinente.

### Cómo se aplica a NEST

**`/obras/prune` es el activo más fuerte del sitio y hay que tratarlo como tal.** Cifras verificables y de primera mano (10 sucursales, 40 días, turnos de 24 horas, 2023), una estructura de desafío/solución/resultado, y un dato que ninguna otra fuente puede aportar. Es exactamente el tipo de contenido que un LLM cita porque no puede generarlo por su cuenta. Prioridad de implementación #1.

**`/obras/el-canton` no se publica con los campos en `[completar]`.** Una página cuya ficha dice "Completar con m2 reales de la obra" y cuya lista de trabajos es genérica es, con el criterio de la guía, contenido básico. Publicarla así no suma y arrastra la percepción de calidad del directorio `/obras`. **Lineamiento: se publica cuando estén los m², el plazo, el año y el estilo reales, o no se publica.** Mientras tanto, El Canton vive como tarjeta de galería igual que las otras siete.

**Los testimonios placeholder no se publican como si fueran reales.** Van cuando lleguen los reales.

### Especificidad por sobre generalidad

Cada dato concreto es un anclaje que un modelo puede recuperar y citar. Preferir siempre:

| En vez de | Escribir |
|---|---|
| "Amplia trayectoria" | "+30 años" |
| "Zona Norte" a secas | "Nordelta, San Isidro, Escobar, Pilar, Tigre" |
| "Grandes clientes" | "Google, WeWork, IRSA, UADE" |
| "Obra rápida" | "10 sucursales en 40 días" |

---

## 2.4 HTML semántico y estructura de encabezados

Google no exige HTML perfecto, pero indica que "es buena idea intentar usar HTML semántico cuando sea posible". Para extracción por máquina la diferencia es material: define qué es contenido y qué es cromo.

### Reglas

- **Un solo `<h1>` por página**, que sea el headline real de la página.
- **Jerarquía sin saltos.** Cada bloque rotulado como "SECCIÓN N" en el PDF es un `<h2>`. Los subtítulos internos, `<h3>`.
- `<main>` para el contenido principal. `<header>`, `<nav>`, `<footer>` para el resto.
- `<article>` para cada caso de obra. `<section>` con `aria-labelledby` para las secciones internas.
- Las listas del PDF marcadas con `+` son `<ul><li>`, no párrafos con un símbolo.
- Las fichas de proyecto (Cliente / Alcance / Plazo / Año) son `<dl><dt><dd>` o una `<table>` con `<th scope="row">`. Son pares clave-valor y hay que marcarlos como tales.
- La barra de estadísticas es texto, no imágenes.

### Mapa de `<h1>` por ruta

| Ruta | `<h1>` |
|---|---|
| `/` | Tu obra en manos expertas, de principio a fin. |
| `/nosotros` | Más de 30 años construyendo lo que prometemos |
| `/servicios` | Servicios de construcción |
| `/obras` | Obras |
| `/obras/prune` | 10 sucursales. 40 días. 24 horas. |
| `/obras/el-canton` | Una casa para toda la vida, en el lugar que elegiste. |
| `/contacto` | Contanos tu proyecto |

### Secciones autocontenidas

Google aclara que **no** hace falta fragmentar el contenido, porque sus sistemas comprenden varios temas en una misma página. El lineamiento correcto no es partir el texto, sino **escribir cada sección de modo que se entienda sin depender de la anterior**. En la práctica: que "La Solución" de PRUNE nombre a PRUNE y a NEST en vez de arrancar con "Por eso organizamos...". Un fragmento recuperado por RAG llega sin el contexto de arriba.

---

## 2.5 Los logos de clientes — el punto de mayor retorno

El PDF ya lo identifica y es correcto: el sitio actual muestra todos los clientes en un único `clientes.webp`. Para cualquier sistema automatizado, esa imagen es un rectángulo sin información. **Google no sabe que NEST trabajó con Google.**

### Implementación

- Cada logo, un elemento independiente dentro de un `<ul>`.
- Cada uno con `alt` propio: `alt="Google"`, `alt="WeWork"`, `alt="IRSA"`, `alt="UADE"`, `alt="PRUNE"`, `alt="Fabric Sushi"`, `alt="Subway"`, `alt="Hospitales"`.
- **Además del `alt`, el nombre del cliente como texto visible en el DOM.** El texto del cuerpo es una señal más fuerte que un atributo `alt`, y hay crawlers que no procesan atributos de imagen con el mismo peso. Si el diseño no admite el nombre visible bajo cada logo, va en un párrafo introductorio que los enumere.
- Nunca un sprite ni una imagen compuesta.

Esto es lo que habilita que un modelo responda "NEST trabajó con Google y WeWork" ante una consulta sobre constructoras en Zona Norte. Sin esto, no hay ninguna otra señal en el sitio que lo sostenga.

---

## 2.6 Datos estructurados

La guía es clara en que **no son obligatorios** para la búsqueda con IA y que **no existe ningún marcado especial de schema.org para IA**. Pero agrega que "es buena idea seguir usándolo" como parte de la estrategia SEO general, por los resultados enriquecidos.

Criterio: se implementa, con alcance acotado, sin esperar que mueva la aguja por sí solo.

| Tipo | Dónde | Para qué |
|---|---|---|
| `GeneralContractor` (subtipo de `LocalBusiness`) | Global, en el layout | Identidad de negocio local: nombre, dirección, teléfono, área de servicio, redes |
| `Organization` | Global | Entidad, logo, `sameAs` a Instagram y LinkedIn |
| `Person` ×2 | `/nosotros` | Morena Alegre y Carlos Alegre con `jobTitle`, `alumniOf` (IAE, Universidad Austral) y `worksFor`. Es la evidencia de experiencia y autoridad |
| `BreadcrumbList` | `/obras/*` | Jerarquía de navegación |
| `Service` ×4 | `/servicios` | Los cuatro servicios |
| `ImageObject` | Galerías | `contentUrl` + `caption` real por foto |

`areaServed` debe enumerar las localidades reales: Nordelta, San Isidro, Escobar, Pilar, Tigre, CABA.

**No inventar `AggregateRating` ni `Review` sin reseñas verificables.** Es una violación de las políticas de spam de datos estructurados y puede costar una acción manual.

---

## 2.7 Negocio local

La guía menciona explícitamente los Perfiles de Negocio de Google como fuente de la que las respuestas de IA pueden tomar información de empresas locales. NEST es un negocio local con área de servicio definida, así que aplica de forma directa.

- Crear o reclamar el Perfil de Negocio de Google.
- **NAP consistente**: el nombre, la dirección y el teléfono deben coincidir carácter por carácter entre el perfil, el marcado `GeneralContractor` y el footer del sitio.
- Categoría primaria: contratista general / empresa constructora.
- Áreas de servicio cargadas con las mismas localidades del `areaServed`.

La sección de Merchant Center de la guía no aplica: NEST no vende productos.

---

## 2.8 Sitio compatible con agentes

La guía introduce las experiencias basadas en agentes y señala que estos sistemas acceden al sitio para recopilar datos analizando el renderizado, **inspeccionando el DOM y el árbol de accesibilidad**.

Esto tiene una consecuencia concreta para la conversión de NEST: si el único camino para consultar es un `<div>` con un `onclick` que abre WhatsApp, un agente no puede recorrerlo.

- Formulario con `<form>` real, `<label for>` asociado a cada campo, `name` y `autocomplete` correctos (`name`, `tel`, `email`).
- El botón de envío es `<button type="submit">`, no un `div` estilizado.
- Los filtros de `/obras` son controles reales con estado accesible, no `div`s con listeners.
- El árbol de accesibilidad tiene que reflejar la estructura de la página. Esto se cumple solo si se cumplió 2.4.

Nota de arquitectura: si el formulario resuelve **solo** con deep link a WhatsApp, la conversión queda fuera del alcance de cualquier agente o crawler. Es un argumento adicional a favor de resolver la inconsistencia señalada en 1.5.1 con un envío server-side real, dejando WhatsApp como canal alternativo y no como único mecanismo.

---

## 2.9 Metadatos

Los títulos y meta descriptions ya vienen definidos en el PDF y se respetan. Consideraciones de implementación:

- Título ≤ 60 caracteres, meta description ≤ 155, tal como está especificado.
- **Los de `/obras/corporativo` se descartan** junto con la página.
- Open Graph e imagen social por ruta.
- `lang="es-AR"` en el `<html>`.
- Las meta descriptions no controlan lo que un modelo resume — la guía es clara en que el contenido de la página es lo que fundamenta la respuesta. Sirven para el snippet, no para el resumen de IA.

---

## 2.10 Qué NO hacer

Esta sección existe porque la guía de Google desmiente de forma explícita varias prácticas que se venden como "GEO". Implementarlas es gasto sin retorno.

| Práctica | Qué dice Google |
|---|---|
| **Archivo `llms.txt`** | "No es necesario crear archivos nuevos legibles por máquinas, archivos de texto de IA, marcas ni Markdown. La Búsqueda de Google no los usa." Crear uno "no perjudicará ni mejorará la visibilidad" ni la clasificación. Ningún proveedor mayor confirmó usarlo. **No se implementa.** |
| **Fragmentar el contenido en bloques chicos** | "No es necesario dividir el contenido en fragmentos pequeños para que la IA lo comprenda mejor." Los sistemas comprenden varios temas en una misma página. |
| **Buscar una longitud "ideal" de página** | "No hay longitud ideal para las páginas." Varía según público y tema. |
| **Reescribir en un estilo "para IA"** | "No es necesario escribir de manera específica solo para la búsqueda con IA." Los sistemas comprenden sinónimos y significados generales; no hace falta cubrir todas las variaciones de una palabra clave. |
| **Generar menciones artificiales de marca** | Buscar menciones no auténticas es "no tan útil como podría parecer". Los sistemas priorizan calidad y bloquean spam. |
| **Marcado schema.org "especial para IA"** | No existe. Los datos estructurados no son obligatorios para la búsqueda con IA. |
| **Páginas por variante de búsqueda** | Crear contenido independiente para cada variante posible con fin manipulador infringe la **política de spam por abuso de contenido a gran escala**. |

### Advertencia específica para este proyecto

El último punto es el riesgo más probable en un sitio de constructora local. La tentación de crear `/constructora-nordelta`, `/constructora-san-isidro`, `/constructora-escobar`, `/constructora-pilar` y `/constructora-tigre` con el mismo texto y el topónimo cambiado es exactamente el patrón que Google tipifica como abuso de contenido a gran escala. **No se hace.** La cobertura geográfica se resuelve nombrando las localidades reales dentro del contenido legítimo — las obras del portfolio ya están geolocalizadas por zona — y con el `areaServed` del marcado.

---

## 2.11 Medición

- **Informe de rendimiento de IA generativa en Search Console.** Es la herramienta oficial que indica la guía para medir el descubrimiento a través de funciones potenciadas por IA. Configurar Search Console desde el día 1, antes del lanzamiento.
- Search Console también es el canal para detectar los problemas técnicos de indexación.
- **Sobre herramientas de terceros**, la guía advierte de forma directa: ninguna "tiene acceso a los sistemas internos de clasificación o IA" y hay que evaluar sus recomendaciones contra la documentación oficial. Aplica a cualquier herramienta o servicio que prometa posicionamiento en respuestas de IA.
- Verificación complementaria y barata: consultar periódicamente a los asistentes de IA por "constructora en Nordelta", "constructora Zona Norte", "quién construyó las sucursales de PRUNE" y registrar si NEST aparece y con qué datos. No es una métrica, pero detecta si el contenido es recuperable.

---

## 2.12 Orden de implementación

Ordenado por impacto sobre la recuperabilidad, no por esfuerzo.

| # | Tarea | Sección |
|---|---|---|
| 1 | Renderizado estático de las 7 rutas, con el test de `curl` como criterio de aceptación | 2.1 |
| 2 | Logos de clientes como elementos individuales con texto real | 2.5 |
| 3 | Estructura semántica y jerarquía de encabezados | 2.4 |
| 4 | `/obras/prune` completa y con fotos | 2.3 |
| 5 | `robots.txt` + `sitemap.xml` + canonicals | 2.2 |
| 6 | Search Console configurado | 2.11 |
| 7 | Formulario y filtros accesibles / recorribles por agentes | 2.8 |
| 8 | Datos estructurados | 2.6 |
| 9 | Perfil de Negocio de Google con NAP consistente | 2.7 |
| 10 | `/obras/el-canton` — **solo cuando estén los datos reales** | 2.3 |

---

## 2.13 Criterios de aceptación

Ninguna página se considera terminada sin esto:

- [ ] `curl` sin JS devuelve todo el contenido de valor de la página
- [ ] Un solo `<h1>`, jerarquía de encabezados sin saltos
- [ ] Los 8 clientes corporativos aparecen como texto en el HTML
- [ ] Cero campos `[completar]` publicados
- [ ] Cero testimonios placeholder publicados como reales
- [ ] Todas las imágenes con `alt` descriptivo y específico
- [ ] Formulario con `<form>`, `<label for>` y `<button type="submit">` reales
- [ ] Canonical autorreferencial presente
- [ ] La ruta figura en `sitemap.xml`
- [ ] Sin `llms.txt` en el repositorio
