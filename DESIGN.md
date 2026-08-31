---
name: NEST — nestobras.com.ar
description: Hormigón a la vista y marco de hoja técnica para una constructora premium de Zona Norte y CABA.
colors:
  navy-saturado-profundo: "#003057"
  beige-calido-desaturado: "#d9c2b6"
  azul-medio-legible: "#4d6e89"
  azul-limite-de-control: "#66839a"
  azul-de-borde: "#ccd6dd"
  azul-casi-blanco: "#e6eaee"
  azul-papel: "#f2f5f7"
  beige-papel: "#f0e6e0"
  beige-sombra: "#c3afa4"
  terracota-apagada: "#865c46"
  blanco-papel: "#ffffff"
  linea-de-guia: "color-mix(in srgb, #d9c2b6 60%, transparent)"
  tinta-neutra: "rgb(0 0 0 / 0.5)"
typography:
  display:
    fontFamily: "Roboto Condensed, Arial Narrow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.125rem, 1rem + 5.6vw, 4.375rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.022em"
  stat:
    fontFamily: "Roboto Condensed, Arial Narrow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.9rem + 3vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Roboto Condensed, Arial Narrow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1.4rem + 1.7vw, 2.5rem)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Roboto Condensed, Arial Narrow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 1.05rem + 2.25vw, 2.625rem)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  subtitle:
    fontFamily: "Roboto Condensed, Arial Narrow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)"
    fontWeight: 500
    lineHeight: 1.3
  lead:
    fontFamily: "Roboto Condensed, Arial Narrow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 300
    lineHeight: 1.625
  body:
    fontFamily: "Roboto Condensed, Arial Narrow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Roboto Condensed, Arial Narrow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.18em"
rounded:
  none: "0"
  full: "9999px"
spacing:
  gutter: "1.5rem"
  celda-sm: "1.25rem"
  celda-md: "2rem"
  celda-lg: "3rem"
  seccion-y: "5rem"
  seccion-y-lg: "7.5rem"
components:
  button-primary:
    backgroundColor: "rgb(255 255 255 / 0.1)"
    textColor: "{colors.blanco-papel}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.5rem"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.beige-calido-desaturado}"
    textColor: "{colors.navy-saturado-profundo}"
  button-primary-light:
    backgroundColor: "transparent"
    textColor: "{colors.navy-saturado-profundo}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.5rem"
    height: "44px"
  button-primary-light-hover:
    backgroundColor: "{colors.navy-saturado-profundo}"
    textColor: "{colors.blanco-papel}"
  button-underline:
    backgroundColor: "transparent"
    textColor: "{colors.navy-saturado-profundo}"
    padding: "0.75rem 0"
    height: "44px"
  button-underline-dark:
    backgroundColor: "transparent"
    textColor: "{colors.beige-calido-desaturado}"
    padding: "0.75rem 0"
    height: "44px"
  button-submit:
    backgroundColor: "{colors.beige-calido-desaturado}"
    textColor: "{colors.navy-saturado-profundo}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1.5rem"
    width: "100%"
    height: "44px"
  input-field:
    backgroundColor: "{colors.blanco-papel}"
    textColor: "{colors.navy-saturado-profundo}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.75rem"
    height: "44px"
  input-field-glass:
    backgroundColor: "rgb(255 255 255 / 0.1)"
    textColor: "{colors.blanco-papel}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.75rem"
    height: "44px"
  card-obra:
    backgroundColor: "{colors.navy-saturado-profundo}"
    textColor: "{colors.blanco-papel}"
    rounded: "{rounded.none}"
    padding: "0"
  icon-pill:
    backgroundColor: "{colors.beige-papel}"
    textColor: "{colors.navy-saturado-profundo}"
    rounded: "{rounded.none}"
    size: "56px"
  header-scrolled:
    backgroundColor: "rgb(255 255 255 / 0.7)"
    textColor: "{colors.navy-saturado-profundo}"
    padding: "0.75rem 1.5rem"
  fab-whatsapp:
    backgroundColor: "{colors.beige-calido-desaturado}"
    textColor: "{colors.navy-saturado-profundo}"
    rounded: "{rounded.full}"
    size: "56px"
  footer:
    backgroundColor: "{colors.navy-saturado-profundo}"
    textColor: "{colors.blanco-papel}"
    padding: "3.5rem 1.5rem"
---

# Design System: NEST — nestobras.com.ar

## Overview

**Creative North Star: "Obra Vista"**

Hormigón a la vista: nada se tapa, y lo que sostiene la pieza es lo que se ve. El sitio no aplica una capa decorativa encima del contenido — el contenido, encuadrado con precisión, **es** el acabado. De ahí las tres ausencias que definen el sistema más que cualquier presencia: **cero radio, cero sombra, cero degradado** en todo el cuerpo del documento. Una tarjeta de obra es una foto y dos líneas de texto; una tarjeta de servicio no tiene fondo hasta que la apuntás; un botón en reposo es un rectángulo de 1px de trazo. Cuando una superficie no se justifica, no existe.

Sobre ese material desnudo corre un solo recurso gráfico: el **marco de hoja técnica**. Dos guías verticales de 1px recorren el documento entero de la primera sección a la última, y cada bloque de contenido clipea sus cuatro esquinas sobre ellas con escuadras de registro en navy. Las reglas horizontales son casi subliminales; lo que ancla el ojo son las esquinas. Tres franjas de rayado diagonal a 115° marcan cambio de capítulo, no separación de sección. El efecto acumulado es que la página se lee como un plano de obra —márgenes de imprenta, marcas de registro, achurado— sin que ninguna de esas piezas grite.

El carácter resultante es **sobrio, preciso y cálido**. La precisión manda: la geometría es exacta, el movimiento tiene una sola curva y los pesos tipográficos son tres. Pero el beige de marca y la fotografía de obra real —blanco y negro en reposo, color al apuntarla— impiden que se lea como un documento frío. Es un profesional que explica bien, no un catálogo técnico ni un folleto.

**Key Characteristics:**
- Radio cero y sombra cero en todo el cuerpo del documento; la única excepción es la capa flotante.
- El marco de hoja técnica —guías, escuadras de 9px, rayado a 115°— como único ornamento del sistema.
- Dos colores de marca y nada más; los neutros derivan del navy, nunca son grises ajenos.
- Los controles nacen como trazo y se rellenan al usarse, siempre de izquierda a derecha.
- Fotografía en blanco y negro que revela color en hover, tap o foco.
- Tres pesos tipográficos (300/400/500); el énfasis chico se hace con mayúsculas y tracking, nunca con bold.
- Presupuesto de recursos como restricción de diseño: cada efecto se resuelve en CSS, sin hidratación.

## Colors

Dos colores de marca —un azul frío de saturación máxima y un beige cálido apagado— y una escala de neutros que se obtiene mezclando el azul con blanco, para que los grises del sistema conserven la temperatura de la marca en vez de leerse como gris de oficina.

### Primary
- **Navy Saturado Profundo** (`#003057`, token `navy`): el color del sitio. Es texto sobre fondo claro, es fondo del footer y de las superficies fotográficas, es el trazo de las escuadras de registro y es el acento sobre fondo claro. Saturación 100 % y luminosidad 17 %: tiene cuerpo, no se lee como negro lavado. Blanco sobre navy da **13.46** (AAA).

### Secondary
- **Beige Cálido Desaturado** (`#d9c2b6`, token `arena`): único acento de marca. Sobre navy es texto, subrayado, borde de botón y título de columna del footer (**7.91**, AAA). Sobre fondo claro solo puede ser **fondo, línea ornamental o relleno de llegada** — nunca texto ni borde de control. La línea de arena de 3px bajo el `<h1>` es su gesto firma.
- **Terracota Apagada** (`#865c46`, token `arena-800`): la misma tinta (H 20.6°, S 31.5 %) bajada a L 40 % para poder ser **texto** sobre fondo claro. Existe para un solo uso: el eyebrow sobre blanco (**5.78**). No es un color decorativo nuevo, es el acento hecho legible.
- **Beige Papel** (`#f0e6e0`, token `arena-200`): fondo de las píldoras de ícono (servicios, contacto). Superficie, nunca trazo.
- **Beige Sombra** (`#c3afa4`, token `arena-600`): el rayado diagonal de las franjas de capítulo, y el hover del botón arena sólido.

### Neutral
- **Blanco Papel** (`#ffffff`): fondo de todo el cuerpo del documento. Desde el 14/08/2026 **todas** las secciones son blancas; el navy quedó para el hero, el footer y las superficies fotográficas.
- **Azul Medio Legible** (`#4d6e89`, token `navy-700`): el neutro de trabajo del sitio, con diferencia el más usado. Texto secundario, bajadas, metadatos de tarjeta, placeholders (5.48) y hover de link sobre claro.
- **Azul Límite de Control** (`#66839a`, token `navy-600`): borde de campo de formulario en reposo. Elegido por contraste: 3.4:1 contra blanco, sobre el mínimo de 3:1 que WCAG 1.4.11 exige para el límite de un control.
- **Azul de Borde** (`#ccd6dd`, token `navy-200`): divisores de ficha técnica, borde del header scrolleado, etiquetas de estadística sobre navy.
- **Azul Casi Blanco** (`#e6eaee`, token `navy-100`): cuerpo de texto sobre navy — un escalón por debajo del blanco para separar jerarquía en el footer y el hero sin bajar a un gris que no existe en la paleta (11.24 sobre navy).
- **Azul Papel** (`#f2f5f7`, token `navy-50`): fondo de sección alterna.
- **Línea de Guía** (`color-mix(in srgb, #d9c2b6 60%, transparent)`, token `--color-rule`): **el color más característico del sistema**. Todas las guías de página, reglas de marco y divisores de grilla. Va al 60 % y no sólido: en un trazo de 1px la diferencia contra el arena pleno recién se percibe a esa dilución. Es geometría de plano, no lectura — por eso puede vivir sobre blanco.
- **Tinta Neutra** (`rgb(0 0 0 / 0.5)`): el velo sobre el video del hero. Negro deliberado, no navy. La misma tinta al 70 % es el degradé de 20 % de alto en el pie de las tarjetas de obra destacadas.

La escala completa (`navy-300`…`navy-950`, `arena-300`, `arena-700`) y los semánticos (`--color-error`, `--color-exito`, `--color-aviso`) están declarados en `src/styles/global.css` como reserva del sistema pero hoy **no tienen consumidor**. Verificá el ratio antes de estrenar uno.

### Named Rules

**La Regla del Arena.** El arena `#d9c2b6` sobre blanco da **1.70** y falla todo — AA, AAA y el umbral 3.0 de componentes de interfaz. Sobre fondo claro el arena solo puede ser fondo grande, línea puramente ornamental o relleno de hover; **nunca** texto, borde de control, ícono con significado, anillo de foco ni estado. Sobre fondo claro el acento es navy. El arena brilla sobre oscuro.

**La Regla de la Tinta Neutra.** Todo velo sobre fotografía es negro, no navy. Un tinte de marca sobre la foto la vuelve una ilustración de marca; el negro la deja ser una foto. Además rinde: el velo negro al 70 % sube el contraste contra texto blanco de 5.41 a 8.5 en el peor caso.

**La Regla del Neutro Derivado.** Ningún gris nuevo entra al sistema. Todo neutro sale de mezclar navy con blanco. Si hace falta un tono que no está, se calcula desde el navy y se verifica el ratio; no se toma de una paleta ajena.

## Typography

**Display Font:** Roboto Condensed (fallback `Arial Narrow`, luego `ui-sans-serif`, `system-ui`)
**Body Font:** Roboto Condensed — la misma familia en todo el sitio
**Label/Mono Font:** ninguna. No hay monoespaciada en el sistema.

**Character:** una sola condensada humanista sostiene todo el sitio. La condensación deja títulos largos en pocas líneas sin achicar el cuerpo —"Tu obra en manos expertas, de principio a fin" entra a 70px— y le da al conjunto una densidad de plano técnico que una grotesca normal no tendría. Autohospedada por peso (300/400/500 con `unicode-range`), con precarga solo del peso 300 latino, que es el del `<h1>` y por lo tanto el LCP.

### Hierarchy
- **Display** (400, `clamp(2.125rem, 1rem + 5.6vw, 4.375rem)`, lh 1.1, ls −0.022em): el `<h1>` del hero de la Home, sobre video. Único lugar donde se usa. Toca el mínimo a ~320px y el máximo a ~960px.
- **Stat** (400, `clamp(2.5rem, 1.9rem + 3vw, 3.5rem)`, lh 1, ls −0.02em): los cuatro números de la barra de estadísticas. Peso normal a gran tamaño: es dato editorial, no cartel.
- **Headline** (500, `clamp(1.75rem, 1.4rem + 1.7vw, 2.5rem)`, lh 1.15, ls −0.01em): el `<h1>` de las cinco páginas internas, dentro de la hoja técnica.
- **Title** (400, `clamp(1.5rem, 1.05rem + 2.25vw, 2.625rem)`, lh 1.2, ls −0.01em): los `<h2>` de sección. Peso 400, no 500: el tamaño ya jerarquiza.
- **Subtitle** (500, `clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)`, lh 1.3): `<h3>` de tarjeta — nombre de obra, título de servicio.
- **Lead** (300, 1.125rem, lh 1.625, máx. 680px): bajada de cabecera y párrafo del hero. El peso 300 es el que hace que un párrafo largo se lea como aire y no como bloque.
- **Body** (400, 1rem, lh 1.625): cuerpo general. Los párrafos de lectura se limitan entre 640px y 680px.
- **Label** (500, 0.6875rem, ls 0.18em, MAYÚSCULAS): el eyebrow, siempre inmediatamente arriba de un `<h2>`, como `<span>` y nunca como heading. Variantes de la misma idea: metadatos de tarjeta (0.875rem / 0.06em), links de nav (17.6px / 0.08em), títulos de columna del footer (0.625rem / 0.24em).

### Named Rules

**La Regla de los Tres Pesos.** Solo existen 300, 400 y 500. Pedir 600 o 700 dispara **bold sintético**: el navegador engorda el trazo por su cuenta y el resultado desentona con todo lo demás. Si hace falta más énfasis del que da el 500, se cambia el tamaño, el color o el caso — nunca el peso.

**La Regla de la Versalita.** El énfasis en texto chico se hace con mayúsculas más tracking, nunca con bold ni con color de acento. Es el mismo recurso en eyebrow, nav, botones, metadatos y encabezados de ficha, y es lo que da la voz técnica del sitio: cuanto más chico el texto, más abierto el tracking (0.06em → 0.24em).

**La Regla del H1 Visible.** El `<h1>` es el LCP de todas las rutas. Su animación de entrada se declara en CSS y arranca en el primer frame; nunca depende de un script ni de un observer, y nunca arranca en `opacity: 0` gobernado por JS. Un `<h1>` en opacidad cero deja de ser candidato a LCP y la métrica se degrada entre 140 y 424 ms.

## Layout

**Columna única de 1152px.** Todo el sitio comparte el mismo contenedor: `mx-auto max-w-6xl px-6`, con `--container-6xl` pisado a `clamp(72rem, 60vw, 96rem)` — el valor queda intacto hasta 1920px y de ahí escala hasta un techo de 1536px, para no crecer sin límite en monitores ultra-anchos. Header, footer y cada sección miden exactamente lo mismo.

**Las dos guías de página.** `HojaTecnica` envuelve el cuerpo del documento —de la primera sección a la última, **sin** hero ni footer— y dibuja dos líneas verticales de 1px que lo recorren entero. Su posición es `max(--guia-margen, (100% - --container-6xl) / 2)`: en desktop caen justo sobre el borde exterior de la columna de contenido, y en pantallas chicas gana el margen fijo (12px, 20px desde 640px). Ese mismo cálculo lo repiten las escuadras de `MarcoSeccion`, el rayado de `FranjaRayado` y los marcos de las grillas, así que todo el sistema se alinea contra las mismas dos líneas.

**Ritmo vertical.** Las secciones respiran `py-20` en mobile y `py-[120px]` desde 768px. Dentro de una sección: eyebrow → 10px → `<h2>` → 40px → contenido. Las celdas de grilla escalan su padding en tres pasos —1.25rem / 2rem / 3rem— y esa escala es compartida por servicios, proceso y valores, para que ningún módulo tenga densidad propia.

**Grillas.** Servicios: 1 columna → 3 columnas con divisores verticales de 1px en 1024px. Proceso: 1 columna → bento de 6 columnas (celdas de span 3 y span 2) en 768px. Logos: 2 columnas en mobile, 5 en desktop. Obras: 1 / 2 / 3 columnas. Las destacadas de la Home van en una fila de tarjetas `flex-1` de 600px de alto, pegadas entre sí sin gap en desktop.

**Entrada por scroll.** Cada bloque marcado con `data-reveal` entra desde 28px abajo con opacidad 0 → 1 en 1.1s, escalonado 240ms **según su posición dentro de su `<section>`** — el delay se calcula en runtime, así que agregar o mover bloques no obliga a renumerar nada. El estado oculto lo aplica JS, no el CSS: el default del documento es visible, y hay un failsafe a 2s. Con `prefers-reduced-motion` todo aparece sin transición.

### Named Rules

**La Regla de las Dos Guías.** Todo lo que dibuje marco —guías, reglas, escuadras, rayado, sangrías— se posiciona con `max(var(--guia-margen), calc((100% - var(--container-6xl)) / 2))`. Nunca con un valor propio, y **nunca con `100vw`**: `100vw` cuenta la barra de scroll y el contenedor no, y esa diferencia es scroll horizontal garantizado. Cero `100vw` en el repositorio, y es a propósito.

**La Regla de la Regla Compartida.** La regla horizontal pertenece siempre al **borde superior** del bloque. La inferior se dibuja solo cuando el bloque cierra una cadena de secciones pegadas —la última de la página, o la anterior a una `FranjaRayado`— vía la prop `cierra`. Si cada sección dibujara las dos, en cada junta habría dos líneas de 1px apiladas y el contorno se vería de 2px en las juntas y de 1px en el resto.

**La Regla del Corte de Capítulo.** El rayado diagonal separa **capítulos**, no secciones. En la Home son tres, uno por cambio de tema. Si fuera entre todas las secciones dejaría de leerse como corte y pasaría a ser un fondo.

## Elevation & Depth

El sistema declara **dos planos**, y la separación entre ellos es una regla de diseño, no un accidente de implementación.

**El plano del documento es absolutamente plano.** Sin sombras, sin degradados, sin radios. La profundidad la comunican el color (navy contra blanco), el peso del trazo (escuadras de 1.5px contra reglas de 1px) y la superficie que aparece en hover (las tarjetas de servicio son transparentes en reposo y se pintan de blanco al apuntarlas). Una sombra dentro del documento sería una mentira sobre un material que no tiene relieve.

**Sobre él flota una capa de navegación y acción**, con su propio lenguaje: vidrio esmerilado —`bg-white/70` + `backdrop-blur` + un halo difuso de `0 12px 40px rgba(0,0,0,0.1)`— y, en el caso del botón flotante de WhatsApp, el único radio del sitio. Esta capa es la que se superpone a contenido ajeno, y por eso se le permite lo que al documento no.

### Shadow Vocabulary
- **Halo de capa flotante** (`box-shadow: 0 12px 40px rgba(0,0,0,0.1)`): header scrolleado, menú móvil desplegado y card del formulario de la Home. Es difuso y bajo de opacidad a propósito: separa la capa sin dibujar un borde de caja.
- **Sombra de acción persistente** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / .1), 0 4px 6px -4px rgb(0 0 0 / .1)`): exclusiva del botón flotante de WhatsApp, que vive fuera del flujo en todas las páginas.
- **Realce de campo** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / .05)`): el `shadow-xs` heredado del lenguaje de shadcn en los campos de formulario. Es el único resto de sombra dentro del documento y es prácticamente imperceptible.

### Named Rules

**La Regla de los Dos Planos.** Glass, blur y sombra son atributos de la capa flotante, no efectos disponibles. Solo puede usarlos un elemento que efectivamente se superpone a otro contenido: header, menú, card sobre foto, botón fijo. Un bloque que vive en el flujo del documento es plano, sin discusión.

**La Regla del Blur Proporcional.** La fuerza del blur es proporcional a cuánto contenido tapa la superficie: 12px (`backdrop-blur-md`) para la barra de 44px de alto, 40px (`backdrop-blur-2xl`) para el menú móvil que cubre la pantalla. No es un valor de gusto.

## Shapes

**Radio cero, sin excepciones.** `--radius` y `--radius-boton` valen ambos `0`. Hubo una excepción de 4px para la acción primaria (03/08/2026) y se revirtió por pedido directo (14/08/2026). Los tokens se mantienen en 0 en vez de borrarse, para no reescribir cada `rounded-boton` del código. La única forma redonda del sitio es el botón flotante de WhatsApp (56px, `rounded-full`), que pertenece a la capa flotante y usa la forma como señal de "esto no es parte de la página".

**El vocabulario de formas es de dibujo técnico, no de interfaz.** Cuatro piezas, y ninguna es un `border`:
- **Regla** — línea de 1px en `--color-rule`, horizontal a ancho completo o vertical de punta a punta.
- **Escuadra** — cuadrado de 9px con solo dos de sus cuatro lados, en navy de 1.5px. Es la marca de registro del sistema y su elemento firma. El grosor mayor contra el 1px de la regla es lo que la hace leer como marca y no como parte de la línea.
- **Rayado** — `repeating-linear-gradient` a 115°, 8.5px de aire y 1px de trazo, en `arena-600`.
- **Píldora cuadrada de ícono** — 56px (40px en filas de contacto) en `arena-200`, radio 0, sin borde.

**Fotografía.** Recorte 4:3 para tarjetas de obra, `grayscale` en reposo y color en hover, foco o tap. El blanco y negro es del sistema: unifica material fotográfico de calidad desigual y hace que el color sea una recompensa de la interacción.

### Named Rules

**La Regla del Radio Cero.** Ningún elemento del documento lleva `border-radius`. Si algo necesita distinguirse, se distingue por trazo, color o superficie. La única excepción viva es el FAB, y es circular precisamente porque no pertenece al documento.

**La Regla de la Escuadra en las Cuatro Esquinas.** Las escuadras marcan las cuatro esquinas de un rectángulo, y nada más. Los cruces internos de un reticulado no se marcan. En una junta entre dos secciones encadenadas, las dos escuadras inferiores de una y las dos superiores de la siguiente se encuentran sobre la misma regla y forman una marca de registro completa — eso es deliberado y es lo que hace leer las cajas encadenadas de un plano.

## Components

### Buttons
- **Shape:** rectángulo sin radio (`0`), alto mínimo 44px, texto en mayúsculas con 0.02em de tracking y peso 500.
- **Primario (sobre navy):** borde arena de 1px, fondo `rgb(255 255 255 / .1)` con `backdrop-blur`, texto blanco. En hover/foco un `::before` a `translateX(-100%)` entra hasta `translateX(0)` y lo rellena de arena sólido, con el texto virando a navy (**7.91**, AAA). Estandarizado **solo** para fondo navy: su texto blanco en reposo no pasa contraste sobre claro.
- **Primario claro (sobre blanco):** mismo lenguaje de caja, borde y texto navy (**13.46**); el relleno de llegada es navy sólido con texto blanco.
- **Subrayado (`secundario` / `sobreNavy`):** sin caja. El trazo se convierte en un subrayado de 3px dibujado con un gradiente en `currentColor` y animado por `background-size` de 0% a 100% — no dispara layout ni necesita pseudo-elemento. Sin padding horizontal, para que el texto alinee con el párrafo que lo precede.
- **Submit del formulario:** ancho completo. En fondo claro es arena sólido con texto navy (hover a `arena-600`); en la variante glass repite exactamente el primario.
- **Foco:** siempre `outline` de 2px con 2px de offset, en arena sobre navy y en navy sobre claro. Nunca arena sobre claro.

### Cards / Containers
- **Corner Style:** radio 0 en todas.
- **Tarjeta de obra (`/obras`):** foto 4:3 sobre fondo navy, `grayscale` → color y `scale(1.03)` en hover del grupo (500ms); debajo, `<h3>` y una línea de metadatos en mayúsculas. Sin borde, sin fondo, sin sombra: la foto es la tarjeta.
- **Tarjeta destacada (Home):** 600px de alto, imagen recortada a 4:3 en build y sobreescalada a 1.15 para que el desplazamiento no descubra el borde. En reposo la foto está limpia y sin texto; en hover el bloque sube 20px, aparece un degradé negro/70 acotado al 20 % inferior y el texto entra desde abajo. Las tarjetas hermanas se desenfocan con `:has()`. En touch (`hover: none`) el texto se muestra siempre.
- **Tarjeta de servicio:** sin superficie en reposo — la delimitan el marco de la grilla y los divisores de 1px. En hover se pinta de blanco (300ms). Padding 1.25 / 2 / 3rem.
- **Tarjeta de testimonio:** borde superior de 4px en arena, fondo blanco, comilla decorativa en `arena-600`, y avatar cuadrado de 44px en navy con las iniciales en blanco.

### Inputs / Fields
- **Style:** alto mínimo 44px, radio 0, `appearance-none` también en los `<select>` (con chevron propio de 14px repuesto en el markup, para que los tres tipos de control compartan exactamente la misma caja). `font-size` fijo de 16px: por debajo, iOS hace zoom al enfocar.
- **Claro:** fondo blanco, borde `navy-600` (3.4:1, el mínimo de WCAG 1.4.11 para el límite de un control), placeholder en `navy-700` (5.48).
- **Glass:** borde `white/25` sobre `bg-white/10` con blur, placeholder `white/60`. Los `<option>` se pintan a mano (`#00263f`) porque el navegador los renderiza en su propia capa y no heredan el fondo del control.
- **Focus:** el borde pasa al color de anillo y se suma un ring de 3px al 40-50 % — navy sobre claro, arena sobre glass.
- **Labels:** siempre visibles, en mayúsculas con 0.06em de tracking. Nunca placeholder como etiqueta.

### Navigation
- **Style:** links en mayúsculas, 17.6px, tracking 0.08em, alto mínimo 44px. El estado activo se marca con **peso 500 y color**, nunca con una barra ni con arena sobre claro.
- **Home:** header `fixed` y 100 % transparente sobre el video, con texto blanco y hover arena. Al pasar 8px de scroll vira a glass blanco con texto navy, aparece el borde `navy-200` y el halo, y las dos variantes del logo se cruzan por opacidad. El CTA vive en un grid de `0fr` que crece a `1fr` en 700ms y empuja los tabs para hacerse lugar.
- **Resto de las páginas:** header `sticky`, blanco sólido, texto navy desde el vamos.
- **Mobile:** `<details>`/`<summary>` nativo, cero JS. La hamburguesa son dos trazos de 1px en `currentColor` que se juntan al centro y rotan a una X. El panel usa el mismo glass que el header pero con blur de 40px.

### Sistema de marco "hoja técnica" (componente firma)

Tres capas que se montan juntas y que son la identidad visual del sitio:

1. **`HojaTecnica`** — wrapper del cuerpo del documento; dibuja las dos guías verticales de 1px (`z-10`, `pointer-events: none`). No envuelve hero ni footer: sobre esas superficies oscuras una línea clara deja de ser subliminal y pasa a ser un trazo de alto contraste.
2. **`MarcoSeccion`** — envuelve cada sección; dos reglas horizontales a ancho completo (`left: 0; right: 0`, `z-11`) más cuatro escuadras (`z-12`) posicionadas con el mismo cálculo que las guías, de modo que caen exactamente encima de ellas. La prop `cierra` gobierna la regla inferior.
3. **`FranjaRayado`** — franja de rayado a 115° de guía a guía (no full-bleed), 80px en mobile y 48/68px en desktop. Marca cambio de capítulo.

Las grillas de servicios, valores, proceso y logos replican la técnica con sus propios selectores (`.bp-*`, `.val-*`, `.gp-*`, `.esq`). **Si cambia el grosor de una escuadra o el color de una regla, hay que replicarlo en las cinco.** La duplicación es deliberada —son ~20 líneas de CSS por componente— pero exige mantenerlas sincronizadas.

### Named Rules

**La Regla del Trazo.** El reposo es línea; el relleno es la llegada. Botón: borde de 1px que se rellena. Link: subrayado que crece de 0 a 100 %. Campo: borde, nunca fondo de color. Tarjeta de servicio: sin superficie hasta el hover. Ningún control nace como caja sólida salvo el submit en fondo claro, donde el arena macizo es lo único que pasa contraste.

**La Regla de Izquierda a Derecha.** Todo relleno progresivo entra desde la izquierda con `transform: translateX(-100%) → 0`, nunca con un cambio de color instantáneo ni animando `width`. La única excepción son los botones de flecha del carrusel, donde el relleno entra **desde el lado al que apunta la flecha**, porque ahí la dirección significa algo. Tres archivos comparten esta receta (`Boton`, `FormularioConsulta`, `CarruselTestimonios`): si cambia el timing en uno, se sincronizan los tres.

**La Regla de la Curva Única.** Todo el movimiento del sitio usa `cubic-bezier(0.22, 1, 0.36, 1)`. Las duraciones son igual de disciplinadas: 300ms para estados de control, 500ms para revelado de contenido dentro de una tarjeta, 1.1s con 28px de recorrido para la entrada de un bloque. Toda animación tiene su rama `prefers-reduced-motion`, y la regla para decidir qué se apaga es: **el fade informa el estado y va siempre; el desplazamiento es decorativo y solo corre si no se pidió menos movimiento.**

## Do's and Don'ts

### Do:
- **Do** posicionar cualquier elemento de marco con `max(var(--guia-margen), calc((100% - var(--container-6xl)) / 2))`, para que caiga sobre las guías de página.
- **Do** usar navy como acento sobre fondo claro y arena como acento sobre navy, siempre.
- **Do** resolver los patrones interactivos con HTML y CSS nativos: `<details>` para el menú, `:has()` para el foco de fila y el filtro de obras, `scroll-snap` para carruseles. El sitio tiene cero directivas `client:*` y eso es una restricción de diseño, no solo técnica.
- **Do** dar 44×44px mínimo a todo objetivo táctil, y 16px de `font-size` a todo campo de formulario.
- **Do** escribir mayúsculas con tracking abierto para cualquier texto chico de énfasis (0.06em a 0.24em según el tamaño).
- **Do** entregar la fotografía en blanco y negro por defecto, con el color como respuesta a hover, foco o tap.
- **Do** declarar en CSS la animación de entrada de cualquier bloque que contenga el `<h1>`; nunca gobernarla desde JS.
- **Do** verificar el ratio de contraste antes de estrenar un token de la escala que hoy no tiene consumidor.

### Don't:
- **Don't** poner arena sobre fondo claro como texto, borde de control, ícono con significado, anillo de foco o estado. 1.70 rompe el criterio de accesibilidad 100 del proyecto.
- **Don't** agregar `border-radius`, sombra ni degradado a nada que viva en el flujo del documento. Esos tres recursos pertenecen a la capa flotante.
- **Don't** pedir pesos tipográficos fuera de 300/400/500: dispara bold sintético.
- **Don't** usar `100vw` para sangrar a ancho completo. Con `left: 0; right: 0` sobre un bloque que ya es de ancho completo alcanza, y no mete scroll horizontal.
- **Don't** dibujar la regla inferior de una sección que tiene otra sección con marco pegada abajo.
- **Don't** teñir de navy un velo sobre fotografía: la tinta sobre foto es negra.
- **Don't** derivar hacia la **constructora argentina genérica**: fotos de stock con casco, dorados y degradados, carrusel de valores con íconos de librería, sellos de calidad inventados. El PDF de contenido trae amarillo y dorado; no son de la marca.
- **Don't** derivar hacia el **estudio de arquitectura frío**: blanco absoluto, tipografía diminuta, contraste al mínimo, navegación críptica y la obra escondida detrás de la interfaz. Este sitio existe para que alguien escriba una consulta.
- **Don't** meter un embed de terceros en el hero. Se intentó tres veces con YouTube y se revirtió tres veces; el historial está en `docs/DEUDA-TECNICA.md` §5.
- **Don't** reintroducir líneas dasheadas. Se eliminaron del sitio entero el 15/08/2026 en favor de reglas continuas casi subliminales con marcas navy en las esquinas.
