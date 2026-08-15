#!/usr/bin/env bash
# Chequeos de la capa de tracking sobre dist/ (correr tras `pnpm build`).
# Ver src/components/astro/Analytics.astro y docs/PLAN-EJECUCION.md §7.1.
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

if [ "$fail" -eq 0 ]; then
  echo "OK: tracking instrumentado y sin scripts de terceros en el HTML."
fi
exit "$fail"
