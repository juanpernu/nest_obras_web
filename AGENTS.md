# AGENTS.md — nest_obras_web

## Precedencia

Ante contradicción entre fuentes, manda en este orden:

1. Instrucción explícita del usuario, en la conversación en curso.
2. `docs/PLAN-EJECUCION.md` — spec autoritativo de producto y arquitectura. No reabrir su §2 (decisiones cerradas) sin pedido explícito.
3. `PRODUCT.md` — verdad de producto: usuarios, posicionamiento, evidencia disponible, ausencias que no se inventan.
4. `DESIGN.md` + `.impeccable/design.json` — sistema visual, normativo.
5. El código, para lo que ninguno de los anteriores resuelve.

`README.md` y `tasks/todo.md` son informativos y pueden estar desactualizados. Confirmado: la "Cuarta ronda de feedback" de `tasks/todo.md` dice que las píldoras de ícono de Servicios son navy translúcido; `DESIGN.md` (sección Shapes) y el código las tienen en `arena-200` (Beige Papel). Manda `DESIGN.md`.

## Orden de lectura por tarea

`docs/PLAN-EJECUCION.md` tiene 1036 líneas — andá a la sección que corresponde, no lo leas entero salvo que toques arquitectura o reabras una decisión de §2.

| Tarea | Leé, en este orden |
|---|---|
| UI / componente / página | `DESIGN.md` completo → `.impeccable/design.json` (componentes con HTML/CSS de referencia) → `src/styles/global.css` (tokens reales) → el archivo a tocar |
| Contenido (obra, servicio, equipo, testimonio) | `PRODUCT.md` §Evidence on Hand → `docs/PLAN-EJECUCION.md` §4 → `src/content.config.ts` (schema Zod que rompe el build) → el `.md` correspondiente en `src/content/` |
| Performance / SEO / GEO | `docs/PLAN-EJECUCION.md` §6 y §7 → `PRODUCT.md` §Capabilities and Constraints → `docs/DEUDA-TECNICA.md` §4 y §6 |
| Copy | `PRODUCT.md` §Positioning y §Brand Commitments → `docs/PLAN-EJECUCION.md` §5 y §6.3 |
| Arquitectura / stack | `docs/PLAN-EJECUCION.md` §0, §2 y §3 completos |

Mapa real del código: `src/components/astro/` (componentes propios, cero `client:*`), `src/content/{obras,servicios,equipo,testimonios}/`, `src/data/` (`site.ts` = única fuente del NAP; también `clientes.ts`, `estadisticas.ts`), `src/pages/` + `src/pages/obras/`, `src/layouts/main.astro` (metadatos y JSON-LD global — no renombrar).

## Invariantes

- Cero directivas `client:*`. 0 KB de framework en el navegador.
- Única ruta on-demand prevista: `/api/consulta` — **no existe todavía** (da 404 hoy). Los leads solo entran por WhatsApp hasta que se implemente.
- Presupuesto de recursos como criterio de aceptación: LCP < 2s (el `<h1>` es el LCP), CLS < 0.05, JS < 5 KB por ruta, CSS < 20 KB, Lighthouse mobile ≥95 performance y **100 accesibilidad**.
- El arena nunca porta significado sobre fondo claro (texto, borde de control, ícono, anillo de foco, estado) — ver `DESIGN.md` → La Regla del Arena. Sobre fondo claro el acento es navy.
- Solo pesos tipográficos 300/400/500 — pedir 600 o 700 dispara bold sintético.
- Radio 0 y sombra 0 en todo el cuerpo del documento. Dos excepciones, las dos documentadas: la capa flotante (header scrolleado, menú mobile, FAB de WhatsApp) y el `shadow-xs` de los campos de formulario. El vocabulario completo está en `DESIGN.md` → Shadow Vocabulary; ante duda, manda esa lista y no esta línea.
- Nunca `100vw` para sangrar a ancho completo.
- Acentuación correcta obligatoria en todo el sitio, incluidos `alt`, metadatos y mensajes del formulario.
- Nada inventado: sin testimonios reales nuevos, sin precios, sin premios, sin certificaciones. La única excepción ya documentada (2 testimonios placeholder en producción, por pedido explícito del cliente) está en `docs/DEUDA-TECNICA.md` §2.3 — no la repliques como patrón.
- El schema Zod de `src/content.config.ts` rompe el build a propósito: valida límites SEO, exige `alt`, no deja publicar campos `[completar]`. Si falla, es la barrera funcionando, no un bug a esquivar.

## Cómo contribuir

- `DESIGN.md` y `.impeccable/design.json` se **regeneran**, nunca se editan a mano: cambiá primero el sistema visual en el código (`src/styles/global.css`, componentes) y corré `/impeccable document` después. Nunca al revés.
- `PRODUCT.md` se actualiza con `/impeccable init`.
- `.impeccable/config.json` fija `buildPath: "code"` — Impeccable construye/audita sobre el código fuente en `src/`, no sobre un artefacto aparte.
- `.impeccable/surfaces/` guarda un brief por superficie: alcance, audiencia, dirección elegida y decisiones abiertas de esa ruta o artefacto. Leelo antes de tocar la superficie que describe; no copies verdad global ni tokens ahí adentro.
- Todo lo demás (`docs/*.md`, `src/`) se edita a mano.
- Verificación real, en este orden: `pnpm build` → `pnpm astro check` → `bash scripts/verificar-perf.sh` (JS/CSS sobre `dist/`) → `bash scripts/verificar-tracking.sh` (sobre `dist/`) → `grep -rn "client:" src` (tiene que devolver vacío).
- El `verificar-html.sh` que cita `docs/PLAN-EJECUCION.md` §12 (`curl` contra un `$BASE_URL` en vivo) **no existe todavía** en `scripts/` — es trabajo pendiente, ver `docs/DEUDA-TECNICA.md` §4.

## Trampas conocidas

- Embed de YouTube en el hero: se intentó y revirtió tres veces (14, 16 y 17/08/2026) por superposición de la UI del player en cada loop. No reintentarlo sin leer `docs/DEUDA-TECNICA.md` §5. El hero usa `<video>` nativo (`hero-video.mp4` en desktop, `hero-video-mobile.mp4` en mobile).
- El content store de Astro no purga una colección de contenido que queda en cero: borrar el último `.md` de `src/content/*` no alcanza con `rm -rf .astro dist`; hay que borrar `node_modules/.astro/data-store.json` o el build republica entradas viejas.
- El favicon publicado hoy es el default de Astro, sin reemplazar por el isotipo de NEST.
