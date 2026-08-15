#!/usr/bin/env bash
# Chequeos de la capa de tracking sobre dist/ (correr tras `pnpm build`).
# Ver src/components/astro/Analytics.astro y docs/PLAN-EJECUCION.md §7.1.
#
# ALCANCE: esto NO ejecuta JavaScript. Verifica marcado estático y la presencia
# de invariantes del script inline; no prueba comportamiento. Un bug de lógica
# que no borre ninguna de las cadenas de abajo pasa en verde. Para comportamiento
# hacen falta GA4 DebugView / Meta Pixel Helper contra el deploy real.
#
# El check 3 es el importante: verificar-perf.sh solo mide /_astro/*.js, así que
# un <script src> de terceros metido en el HTML pasaría el presupuesto de JS sin
# que nadie se entere y se comería el Lighthouse. Acá se corta.
set -u
fail=0

if [ ! -d dist ]; then
  echo "FALLA: no existe dist/ — correr 'pnpm build' primero."
  exit 1
fi

html_files=$(find dist -name "*.html" | sort)

# 1. El snippet inline tiene que estar en TODAS las páginas: el layout lo monta
#    una sola vez, así que si falta en alguna es que esa ruta no usa el layout.
faltantes=0
for f in $html_files; do
  grep -q "nest_debug" "$f" || { echo "FALLA: sin snippet de tracking — $f"; faltantes=1; }
done
[ "$faltantes" -eq 1 ] && fail=1
[ "$faltantes" -eq 0 ] && echo "OK: snippet presente en $(echo "$html_files" | wc -l | tr -d ' ') página(s)."

# 2. Los data-evento esperados, en la ruta que corresponde. Si alguien borra un
#    atributo al refactorizar un componente, el evento deja de existir en silencio.
esperado() {
  ruta="$1"; shift
  if [ ! -f "$ruta" ]; then
    echo "FALLA: no existe $ruta"; fail=1; return
  fi
  for ev in "$@"; do
    grep -q "data-evento=\"${ev}\"" "$ruta" \
      || { echo "FALLA: falta data-evento=\"${ev}\" en ${ruta}"; fail=1; }
  done
}

esperado dist/index.html            whatsapp_click email_click cta_contacto obra_card_click
esperado dist/contacto/index.html   whatsapp_click email_click tel_click form_submit
esperado dist/obras/index.html      filtro_obras obra_card_click
esperado dist/servicios/index.html  whatsapp_click
esperado dist/nosotros/index.html   whatsapp_click
esperado dist/privacidad/index.html email_click

# Los eventos de página no son atributos: viajan dentro del snippet.
grep -q "obra_view" dist/obras/prune/index.html \
  || { echo "FALLA: /obras/prune no dispara obra_view"; fail=1; }
grep -q "servicio_view" dist/servicios/index.html \
  || { echo "FALLA: /servicios no dispara servicio_view"; fail=1; }

# 3. Ningún script de terceros servido desde el HTML: gtag.js y fbevents.js SOLO
#    se inyectan en runtime, después del load. Si aparecen acá, alguien rompió la
#    carga diferida y el presupuesto de performance (§7.1).
for f in $html_files; do
  if grep -oE '<script[^>]+src="[^"]*(googletagmanager\.com|connect\.facebook\.net)[^"]*"' "$f" | grep -q .; then
    echo "FALLA: script de terceros servido desde el HTML (rompe la carga diferida) — $f"
    fail=1
  fi
done

# 4. Invariantes del script inline que un refactor puede romper en silencio sin
#    tocar ningún atributo ni agregar ningún <script src>.
invariante() {
  descripcion="$1"; patron="$2"
  grep -q "$patron" dist/index.html \
    || { echo "FALLA: ${descripcion} — no aparece /${patron}/ en el snippet"; fail=1; }
}

# Consent Mode v2: el default va ANTES de que cargue gtag.js (requisito de Google).
# Si desaparece cualquiera de los dos bloques, el sitio mide sin consentimiento.
invariante "falta el consent default global"        "'consent', 'default'"
invariante "falta el bloque de consent por región"  "region: regiones"
invariante "faltan los 4 parámetros de Consent v2"  "ad_personalization"
invariante "falta la denegación para EEA/UK"        "analytics_storage: 'denied'"

# Un <form> se mide SOLO por 'submit'. Sin esta guarda, closest() resuelve al
# <form> desde cualquier input y un click en un campo cuenta un Lead falso.
invariante "falta la guarda que evita Leads falsos por click dentro del <form>" \
  "el.tagName === 'FORM'"

# 'play' no burbujea: si alguien saca la fase de captura, deja de medirse.
invariante "el listener de 'play' perdió la fase de captura" "'play', manejar, true"

if [ "$fail" -eq 0 ]; then
  echo "OK: tracking instrumentado, invariantes presentes y sin terceros en el HTML."
fi
exit "$fail"
