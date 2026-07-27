# NEST — Identidad visual: paleta cromática y tipografía

**Fuente:** inspección de estilos computados sobre `https://nestobras.com.ar/` (julio 2026)
**Método:** extracción de `getComputedStyle` sobre el DOM en vivo, ponderada por área de superficie y por frecuencia de uso en nodos de texto.

> **Cómo leer este documento.** Todo lo marcado **EXTRAÍDO** es valor real medido en el sitio actual: es la marca. Lo marcado **PROPUESTO** es extensión mía para completar un sistema utilizable — dos colores y tres pesos no alcanzan para construir una interfaz con formularios, estados y jerarquía. Lo propuesto se puede discutir; lo extraído es punto de partida.

> **Aviso.** El PDF de contenido (`NEST_Contenido_Web_Completo.pdf`) usa amarillo y dorado en su diseño. **Eso pertenece al documento, no a la marca.** No hay ni un dorado ni un amarillo en el sitio de NEST.

---

# PARTE 1 — Paleta cromática

## 1.1 Colores de marca — EXTRAÍDO

La marca son **dos colores**. Nada más.

### Navy — primario

| | |
|---|---|
| **Hex** | `#003057` |
| **RGB** | `rgb(0, 48, 87)` |
| **HSL** | `hsl(207, 100%, 17%)` |
| **Luminancia relativa** | `0.028` |

Fondo dominante del sitio: header, hero, footer y la mayor parte de las superficies grandes. Medido por área, cubre más del 95 % del color aplicado de la página.

Es un azul de saturación máxima y luminosidad muy baja. No es un gris azulado ni un navy neutro: tiene saturación 100 %, lo que le da cuerpo y evita que se lea como negro lavado.

### Arena — acento

| | |
|---|---|
| **Hex** | `#D9C2B6` |
| **RGB** | `rgb(217, 194, 182)` |
| **HSL** | `hsl(21, 31%, 78%)` |
| **Luminancia relativa** | `0.541` |

Único acento. Aparece en botones (fondo), bordes y texto de acento sobre navy.

Es un beige cálido, ligeramente rosado, de saturación baja. La elección es deliberada y funciona: contra un azul frío de saturación alta, un cálido desaturado da contraste de temperatura sin agregar un tercer color que compita.

### Neutros

| Token | Hex | Uso |
|---|---|---|
| Blanco | `#FFFFFF` | Texto sobre navy, fondos de sección |
| Negro | `#000000` | Uso mínimo |
| Overlay | `rgba(0, 0, 0, 0.5)` | Capa sobre imagen y video |

### No es de marca

`#4DC247` — verde del widget flotante de WhatsApp. Es el color corporativo de WhatsApp, inyectado por el widget de terceros. **No forma parte del sistema** y no debe replicarse en componentes propios.

---

## 1.2 Matriz de contraste — EXTRAÍDO, verificado

Ratios calculados según WCAG 2.1 (fórmula de luminancia relativa).

| Combinación | Ratio | Texto normal | Texto grande | UI / gráficos |
|---|---|---|---|---|
| Blanco sobre navy | **13.46** | AAA | AAA | ✅ |
| Navy sobre blanco | **13.46** | AAA | AAA | ✅ |
| Negro sobre arena | **12.34** | AAA | AAA | ✅ |
| Arena sobre navy | **7.91** | AAA | AAA | ✅ |
| Navy sobre arena | **7.91** | AAA | AAA | ✅ |
| **Arena sobre blanco** | **1.70** | ❌ | ❌ | ❌ |

Umbrales de referencia: AA normal 4.5 · AA grande 3.0 · AAA normal 7.0 · UI y gráficos 3.0.

### ⚠️ La restricción que hay que tener presente

**El arena `#D9C2B6` sobre blanco da 1.70 y falla absolutamente todo.** No pasa AA, no pasa AAA, no pasa ni el umbral de 3.0 para componentes de interfaz.

El sitio actual esquiva el problema por accidente: es navy casi entero, así que el arena casi siempre cae sobre fondo oscuro. **El sitio nuevo va a tener secciones de fondo blanco, y ahí la regla deja de cumplirse sola.**

Sobre fondo claro, el arena queda restringido a:

| Permitido | Prohibido |
|---|---|
| Bloques de fondo grandes (con texto navy o negro encima) | Texto de cualquier tamaño |
| Divisores gruesos, de 3 px o más, decorativos | Bordes finos que comuniquen estructura |
| Elementos puramente ornamentales | Íconos que porten significado |
| — | Anillos de foco |
| — | Bordes de campo de formulario |
| — | Cualquier estado (error, activo, seleccionado) |

**Para acento sobre fondo claro se usa navy.** El arena solo brilla sobre oscuro.

Esto no es una preferencia estética: el proyecto tiene como criterio de aceptación Lighthouse accesibilidad en 100, y el contraste insuficiente lo hace fallar de forma automática.

---

## 1.3 Escala de neutros — PROPUESTO

Dos colores no alcanzan para construir tarjetas, tablas, campos de formulario y estados. Esta escala **deriva del navy de marca** mezclándolo con blanco, en vez de introducir grises neutros ajenos. Así los fondos sutiles y los bordes conservan la temperatura de la marca en lugar de leerse como un gris genérico pegado encima.

| Token | Hex | % de navy | Uso sugerido |
|---|---|---|---|
| `navy-50` | `#F2F5F7` | 5 % | Fondo de sección alterna |
| `navy-100` | `#E6EAEE` | 10 % | Fondo de tarjeta, filas alternas |
| `navy-200` | `#CCD6DD` | 20 % | Bordes, divisores |
| `navy-300` | `#B3C1CD` | 30 % | Bordes de campo en reposo |
| `navy-400` | `#99ACBC` | 40 % | Texto deshabilitado |
| `navy-500` | `#8098AB` | 50 % | Placeholder, texto terciario |
| `navy-600` | `#66839A` | 60 % | Texto secundario sobre blanco |
| `navy-700` | `#4D6E89` | 70 % | — |
| `navy-800` | `#335979` | 80 % | — |
| `navy-900` | `#1A4568` | 90 % | Hover sobre superficie navy |
| `navy` | `#003057` | 100 % | **Marca** |
| `navy-950` | `#002646` | +20 % negro | Estado presionado, footer más profundo |

**Verificar antes de usar como texto:** `navy-600` sobre blanco da aproximadamente 4.7 (pasa AA normal). De `navy-500` para arriba, solo texto grande o elementos no textuales. Recalcular en implementación con la fórmula real, no confiar en esta estimación.

### Escala de arena — PROPUESTO

| Token | Hex | Uso |
|---|---|---|
| `arena-300` | `#ECE1DB` | Fondo cálido muy sutil |
| `arena` | `#D9C2B6` | **Marca** |
| `arena-600` | `#C3AFA4` | Hover del botón arena |
| `arena-700` | `#AE9B92` | Estado presionado |

---

## 1.4 Colores semánticos — PROPUESTO

La marca no define ninguno, pero el sitio tiene un formulario de conversión: necesita comunicar error, éxito y aviso. Elegidos para armonizar con la temperatura cálida del arena en vez de recurrir a rojos y verdes de sistema, que junto a esta paleta se ven ajenos.

**Cada estado necesita dos variantes**, porque el sitio tiene superficies claras y oscuras y ningún color funciona en ambas.

| Estado | Sobre fondo claro | Ratio vs blanco | Sobre navy | Ratio vs navy |
|---|---|---|---|---|
| Error | `#B3402F` | ~5.7 ✅ AA | `#F0A392` | ~6.6 ✅ AA |
| Éxito | `#146B3A` | ~6.6 ✅ AA | `#7FD3A0` | verificar |
| Aviso | `#8A5A12` | verificar | `#E8C07A` | verificar |

Los ratios marcados "verificar" son estimaciones y deben recalcularse en implementación. **Ningún color entra al sistema sin su ratio medido.**

Regla adicional: el color nunca es el único portador del significado. Un campo con error lleva además el mensaje en texto y `aria-invalid`, no solo el borde rojo.

---

## 1.5 Reglas de aplicación

1. **El navy es el fondo por defecto de las superficies de marca.** Header, footer, hero y bloques de cierre.
2. **El arena se reserva para la acción.** Es el color del botón primario. Usarlo decorativamente en muchos lugares le quita su función de señalar dónde hacer clic.
3. **Sobre fondo claro, el acento es navy, no arena** (§1.2).
4. **El color de la página lo aporta la fotografía**, no la paleta. Es la razón por la que un sistema de dos colores funciona: las fotos de obra traen los marrones, verdes y cielos. Cargar la interfaz de color compite con eso.
5. **Sin degradados.** El sitio actual no tiene ninguno y la austeridad es parte de la identidad.
6. **El overlay sobre imagen y video es `rgba(0,0,0,0.5)`.** El PDF de contenido pide 40 % para el hero; el sitio actual usa 50 %. Verificar legibilidad del `<h1>` sobre el frame real antes de fijarlo.

---

# PARTE 2 — Tipografía

## 2.1 Familia — EXTRAÍDO

**Roboto Condensed**, familia única en todo el sitio. No hay segunda familia, ni serif de apoyo, ni monoespaciada.

```css
font-family: "Roboto Condensed", sans-serif;
```

Pesos en uso: **300 (Light) · 400 (Regular) · 500 (Medium)**. No se usa 600 ni 700 en ningún nodo del documento.

**Ese techo de peso es una decisión de tono, no un descuido.** Una constructora podría defender su solidez con tipografía pesada; NEST hace lo contrario. El condensado aporta la verticalidad y el rigor; el peso liviano aporta la sobriedad. El resultado se lee como estudio de arquitectura, no como corralón.

### Implementación

Self-hosted en `public/fonts/`, no desde Google Fonts: evita una conexión externa en el camino crítico, que en 4G se paga caro.

- Formato `woff2` únicamente.
- Subset `latin` + `latin-ext` (el contenido es español rioplatense y necesita tildes y `ñ`).
- **Solo los pesos 300, 400 y 500.** Cargar 700 "por si acaso" son bytes que nunca se usan.
- `font-display: swap`.
- `preload` **únicamente** de la variante del `<h1>` — el resto compite con el LCP.

---

## 2.2 Escala tipográfica actual — EXTRAÍDO

Medido en viewport de escritorio.

| Rol | Tamaño | Peso | Tracking | Line-height | Ratio LH |
|---|---|---|---|---|---|
| Hero | 40 px | 300 | −0.84 px | 57.2 px | 1.43 |
| Hero eyebrow | 24 px | 300 | −0.84 px | 34.3 px | 1.43 |
| H1 | 40 px | 500 | normal | 48 px | 1.20 |
| H2 | 32 px | 500 | normal | 38.4 px | 1.20 |
| Subtítulo | 20 px | 500 | normal | — | — |
| Cuerpo | 16 px | 400 | normal | 24 px | 1.50 |
| Navegación | 16 px | 400 | normal | 24 px | 1.50 |
| Botón | 16 px | 500 | −0.24 px | 24 px | 1.50 |
| Pie / legal | 14 px | 400 | normal | 21 px | 1.50 |

### Patrones del sistema

**Tracking negativo en los tamaños grandes.** −0.84 px sobre 40 px son ≈ −0.021 em. En tipografías condensadas los caracteres ya están juntos; cerrarlos todavía más a tamaño grande compacta el titular en un bloque sólido. Es una decisión correcta y hay que conservarla, **expresada en `em` y no en `px`** para que escale con el tamaño.

**Line-height escalonado según función.** 1.2 para títulos, 1.43 para el hero, 1.5 para cuerpo. Consistente con la práctica editorial: cuanto más grande el texto, más ajustado el interlineado.

**Mayúsculas.** Navegación, botones, títulos de sección y hero van en caja alta. En el sitio actual están escritas en mayúsculas en el HTML, no aplicadas con `text-transform`.

> ⚠️ **Corregir en el sitio nuevo.** Las mayúsculas deben aplicarse con `text-transform: uppercase` sobre texto escrito en caja normal. Escribirlas en el HTML degrada la lectura por lectores de pantalla —que pueden deletrear las siglas— y entrega a los sistemas de indexación un texto en mayúsculas en vez de la frase real. Es directamente relevante para los lineamientos GEO del proyecto.

---

## 2.3 El problema a corregir: la jerarquía es plana

**El hero y el H1 miden ambos 40 px.** El H2 mide 32 px. Entre el elemento más importante de la página y un título de sección hay un 25 % de diferencia de tamaño, y la única distinción real es el peso: 300 contra 500.

Eso funcionaba con el mensaje institucional actual ("ARQUITECTURA E INGENIERÍA"), que es una declaración de rubro. **No funciona con el headline nuevo** —*"Tu obra en manos expertas, de principio a fin"*—, que es una promesa comercial y tiene que dominar la primera pantalla.

La escala propuesta abajo abre esa distancia sin romper el carácter: el hero sigue siendo liviano, solo que más grande.

---

## 2.4 Escala propuesta, mobile-first — PROPUESTO

Definida desde mobile hacia arriba, que es el orden en que se construye el sitio. Los valores fluidos usan `clamp()` para evitar saltos entre breakpoints.

| Rol | Mobile | Desktop | `clamp()` | Peso | Tracking | LH |
|---|---|---|---|---|---|---|
| Hero `<h1>` | 34 px | 64 px | `clamp(2.125rem, 1.2rem + 4.6vw, 4rem)` | 300 | −0.022em | 1.1 |
| Hero eyebrow | 15 px | 20 px | `clamp(0.94rem, 0.85rem + 0.4vw, 1.25rem)` | 400 | 0.08em | 1.4 |
| `<h1>` de sección | 28 px | 40 px | `clamp(1.75rem, 1.4rem + 1.7vw, 2.5rem)` | 500 | −0.01em | 1.15 |
| `<h2>` | 24 px | 32 px | `clamp(1.5rem, 1.3rem + 1.0vw, 2rem)` | 500 | −0.01em | 1.2 |
| `<h3>` | 20 px | 24 px | `clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)` | 500 | normal | 1.3 |
| Cuerpo grande | 18 px | 20 px | `clamp(1.125rem, 1.07rem + 0.25vw, 1.25rem)` | 400 | normal | 1.6 |
| Cuerpo | 16 px | 16 px | `1rem` | 400 | normal | 1.6 |
| Cuerpo chico | 14 px | 14 px | `0.875rem` | 400 | normal | 1.5 |
| Etiqueta / eyebrow | 13 px | 13 px | `0.8125rem` | 500 | 0.08em | 1.4 |
| Botón | 16 px | 16 px | `1rem` | 500 | 0.02em | 1 |
| Estadística | 40 px | 56 px | `clamp(2.5rem, 1.9rem + 3vw, 3.5rem)` | 300 | −0.02em | 1 |

### Decisiones de la escala

**El hero salta de 40 a 64 px en desktop** y abre la distancia con el H1 de sección (40 px). Mantiene el peso 300: gana presencia por tamaño, no por grosor. El carácter no cambia.

**El tracking pasa a `em`.** El sitio actual usa `−0.84px` fijo, que a 40 px es −0.021em pero a 64 px sería −0.013em: el titular se aflojaría al crecer. En `em` el ajuste óptico se mantiene proporcional.

**Tracking positivo donde va en mayúsculas.** El eyebrow, las etiquetas y los botones llevan `0.08em` y `0.02em`. La caja alta necesita más aire entre caracteres, y en una condensada la necesidad se acentúa. El sitio actual no lo hace y las etiquetas quedan apretadas.

**El cuerpo sube a `line-height: 1.6`** desde el 1.5 actual. Los textos del sitio nuevo son considerablemente más largos que los actuales, y una condensada a 16 px con interlineado ajustado cansa en pantalla chica.

**Las estadísticas (+30, +100.000, +80, +50) usan peso 300 a 56 px.** Son el elemento con más impacto visual después del hero y con el peso liviano se leen como dato editorial, no como cartel promocional. Es el registro correcto para la marca.

**Nada baja de 16 px en campos de formulario.** Por debajo de eso Safari en iOS hace zoom automático al enfocar el input, y el usuario queda con la página descuadrada. Es la razón por la que el cuerpo no baja de `1rem`.

---

## 2.5 Reglas tipográficas

1. **Una sola familia.** No introducir una segunda tipografía. La jerarquía se construye con tamaño, peso y espacio.
2. **Techo de peso en 500.** No usar 600 ni 700. El día que algo "necesita" negrita, casi siempre lo que necesita es más tamaño o más espacio alrededor.
3. **Mayúsculas con `text-transform`**, nunca escritas en el HTML (§2.2).
4. **Tracking negativo solo de 24 px para arriba.** En cuerpo perjudica la legibilidad.
5. **Tracking positivo en toda la caja alta**, sin excepción.
6. **Medida de línea entre 60 y 75 caracteres** en bloques de texto largo. En una condensada entran más caracteres por línea que en una normal, así que el ancho de columna tiene que ser más angosto de lo que intuitivamente parece.
7. **Un solo `<h1>` por página**, y el tamaño no lo define la jerarquía semántica: el hero es visualmente el más grande y también es el `<h1>`, pero un `<h2>` puede tener el tamaño que la composición pida sin cambiar de etiqueta.

---

# PARTE 3 — Implementación

## 3.1 Tokens para Tailwind v4

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  /* ---- Marca (EXTRAÍDO) ---- */
  --color-navy: #003057;
  --color-arena: #D9C2B6;

  /* ---- Escala de navy (PROPUESTO) ---- */
  --color-navy-50:  #F2F5F7;
  --color-navy-100: #E6EAEE;
  --color-navy-200: #CCD6DD;
  --color-navy-300: #B3C1CD;
  --color-navy-400: #99ACBC;
  --color-navy-500: #8098AB;
  --color-navy-600: #66839A;
  --color-navy-700: #4D6E89;
  --color-navy-800: #335979;
  --color-navy-900: #1A4568;
  --color-navy-950: #002646;

  /* ---- Escala de arena (PROPUESTO) ---- */
  --color-arena-300: #ECE1DB;
  --color-arena-600: #C3AFA4;
  --color-arena-700: #AE9B92;

  /* ---- Semánticos (PROPUESTO — verificar ratios) ---- */
  --color-error:         #B3402F;
  --color-error-light:   #F0A392;
  --color-exito:         #146B3A;
  --color-exito-light:   #7FD3A0;
  --color-aviso:         #8A5A12;
  --color-aviso-light:   #E8C07A;

  /* ---- Tipografía ---- */
  --font-sans: "Roboto Condensed", ui-sans-serif, system-ui, sans-serif;

  --text-hero: clamp(2.125rem, 1.2rem + 4.6vw, 4rem);
  --text-hero--line-height: 1.1;
  --text-hero--letter-spacing: -0.022em;

  --text-stat: clamp(2.5rem, 1.9rem + 3vw, 3.5rem);
  --text-stat--line-height: 1;
  --text-stat--letter-spacing: -0.02em;

  --text-h1: clamp(1.75rem, 1.4rem + 1.7vw, 2.5rem);
  --text-h1--line-height: 1.15;
  --text-h1--letter-spacing: -0.01em;

  --text-h2: clamp(1.5rem, 1.3rem + 1.0vw, 2rem);
  --text-h2--line-height: 1.2;
  --text-h2--letter-spacing: -0.01em;

  --text-h3: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);
  --text-h3--line-height: 1.3;
}
```

## 3.2 Mapeo a variables de shadcn

shadcn espera roles semánticos. Este es el mapeo, con la restricción de contraste de §1.2 ya aplicada:

| Variable de shadcn | Valor | Nota |
|---|---|---|
| `--background` | `#FFFFFF` | |
| `--foreground` | `#003057` | 13.46 sobre blanco |
| `--primary` | `#003057` | |
| `--primary-foreground` | `#FFFFFF` | |
| `--secondary` | `#D9C2B6` | |
| `--secondary-foreground` | `#003057` | 7.91 — **nunca blanco encima** |
| `--muted` | `#F2F5F7` | |
| `--muted-foreground` | `#66839A` | verificar ≥ 4.5 |
| `--accent` | `#D9C2B6` | Solo como fondo |
| `--accent-foreground` | `#003057` | |
| `--border` | `#CCD6DD` | **No arena**: sobre blanco da 1.70 |
| `--input` | `#B3C1CD` | Igual — no arena |
| `--ring` | `#003057` | Foco en navy. El arena no alcanza el umbral de 3.0 |
| `--destructive` | `#B3402F` | |
| `--radius` | `0` | Sin radios (§3.3) |

**Los tres que más importan:** `--border`, `--input` y `--ring`. La tentación de usar arena en los tres es fuerte porque es "el color de acento" — y los tres fallarían contra fondo blanco.

## 3.3 Geometría y superficie — EXTRAÍDO

Del sitio actual, para completar el sistema:

- **Sin radios de esquina.** Botones, tarjetas y campos rectos. `--radius: 0`.
- **Sin sombras.** La separación se resuelve con color de fondo y espacio.
- **Sin degradados.**
- **Superficies planas** de navy en grandes áreas.
- **Fotografía sin tratamiento** — sin filtros de color ni duotonos. La foto aporta el color que la paleta no tiene.

---

## Resumen operativo

| | |
|---|---|
| **Colores de marca** | 2 — navy `#003057` y arena `#D9C2B6` |
| **Familia tipográfica** | 1 — Roboto Condensed |
| **Pesos** | 3 — 300 / 400 / 500 |
| **Radios** | 0 |
| **Sombras** | ninguna |
| **Restricción crítica** | El arena falla sobre blanco (1.70). Acento claro = navy |
| **Corrección pendiente** | Jerarquía plana: el hero tiene que separarse del H1 |
| **Corrección pendiente** | Mayúsculas con `text-transform`, no escritas en el HTML |
