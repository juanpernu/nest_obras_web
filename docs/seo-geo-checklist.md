# NEST — Checklist SEO/GEO (skill `seo-geo` ⨉ spec §6)

Derivado del skill `seo-geo` reconciliado con `PLAN-EJECUCION.md` §6 (que es **más
estricto y manda**). Google declara que "GEO/AEO son SEO": si la página no está
indexada, no hay nada que citar. Lo aplicado en Fase 1 está marcado; el resto son
ganchos para Fase 3-6.

## Aplicado en Fase 1 (fundación)
- [x] `robots.txt` con bots de IA (Googlebot vía `*`, Google-Extended, GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot) + Sitemap.
- [x] Sitemap con URLs absolutas · canonical autorreferencial · `lang="es-AR"`.
- [x] `<meta name="robots">` con `max-image-preview:large, max-snippet:-1, max-video-preview:-1` (+ prop `noindex` para `/contacto/gracias`).
- [x] OG por ruta + Twitter card. JSON-LD global `GeneralContractor`+`Organization`+`WebSite` con `alternateName`, `description`, `founder` (Morena y Carlos Alegre — reales), `contactPoint`.

## Fase 3 (componentes)
- [ ] Links externos (Instagram en footer, `wa.me`) con `rel="noopener noreferrer"` y `target="_blank"`.
- [ ] Jerarquía de encabezados sin saltos (h1→h2→h3) en Nav/Footer/tarjetas.

## Fase 4 (páginas y contenido) — métodos GEO Princeton (del skill), alineados con §6.3
Aplicar al copy de §5 (que ya prioriza el dato concreto):
- [ ] **Estadísticas / datos concretos** ("+30 años", "10 sucursales en 40 días", "+100.000 m²") — no vaguedades. (+37% citación IA)
- [ ] **Tono autoritativo + citas de origen** (caso PRUNE = dato de primera mano verificable). (+40%)
- [ ] **Estructura "answer-first"**: cada sección se entiende sola (§6.4), respuesta directa arriba, párrafos de 2-3 frases, listas y tablas.
- [ ] **NO keyword stuffing** (−10%) ni páginas por variante geográfica (§6.10).
- [ ] JSON-LD de página: `Person`×2 (`/nosotros`, con `alumniOf`/`worksFor`), `Service`×4 (`/servicios`), `BreadcrumbList` (`/obras/*`), `ImageObject` (galerías, Fase 7).
- [ ] `og:image` por ruta (1200×630) cuando existan las fotos.

## Recomendación NUEVA a decidir con el usuario (no está en el spec)
- [ ] **Sección FAQ + `FAQPage` schema** — el skill la marca como su mayor palanca GEO (+40% visibilidad IA); Perplexity/Google AIO citan FAQs. **Requiere contenido visible real** (no schema huérfano). Preguntas candidatas construibles con contenido real del spec, sin inventar: *"¿En qué zonas construye NEST?"* (§areaServed), *"¿Cómo es el proceso de obra?"* (§5.2 proceso 5 pasos), *"¿Qué es llave en mano vs. mano de obra?"* (§5.3 modalidades), *"¿NEST trabaja para empresas?"* (Google/WeWork/PRUNE §1). **Es una adición a la estructura de páginas del spec §5 → requiere OK del usuario.**

## Fase 6 (medición) — del skill + §6.11
- [ ] Google Search Console (informe de rendimiento de IA generativa) — antes del lanzamiento.
- [ ] **Bing Webmaster Tools** (del skill): Bing alimenta Copilot; enviar sitemap también a Bing.
- [ ] Perfil de Negocio de Google con NAP idéntico (bloqueado por dirección física, §11).
- [ ] Validar schema: Rich Results Test + Schema.org Validator (post-deploy).

## Rechazado del skill (conflige con §6, no aplicar)
- ❌ `<meta name="keywords">` — obsoleto, Google lo ignora; señal artificial (§6.10).
- ❌ `AggregateRating` / `Review` sin reseñas verificables — viola políticas de spam (§6.6).
- ❌ Tácticas de densidad de keyword / menciones artificiales de marca (§6.10).
- ❌ `SpeakableSpecification` — limitado a noticias por Google; bajo valor acá (opcional, no prioritario).
- ⚠️ Scripts Python del skill (DataForSEO) — requieren credenciales de pago + red; no se usan.
