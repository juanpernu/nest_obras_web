#!/usr/bin/env bash
# Chequeos de presupuesto de performance sobre dist/ (correr tras `pnpm build`).
# Ver docs/PLAN-EJECUCION.md §7.1 y la auditoría de performance.
set -u
fail=0

# CSS: presupuesto 20 KB gzip; aviso a partir del 80%.
for css in dist/_astro/*.css; do
  [ -e "$css" ] || continue
  gz=$(gzip -c "$css" | wc -c | tr -d ' ')
  if [ "$gz" -gt 20480 ]; then
    echo "FALLA: CSS ${gz} B gzip > 20 KB — $(basename "$css")"; fail=1
  elif [ "$gz" -gt 16384 ]; then
    echo "AVISO: CSS ${gz} B gzip (>80% del presupuesto de 20 KB) — $(basename "$css")"
  fi
done

# JS referenciado por ruta: < 5 KB (solo scripts inline; 0 KB de framework).
while IFS= read -r html; do
  total=0
  for js in $(grep -oE '/_astro/[A-Za-z0-9_.-]+\.js' "$html" | sort -u); do
    [ -e "dist${js}" ] && total=$((total + $(wc -c < "dist${js}")))
  done
  [ "$total" -gt 5120 ] && { echo "FALLA: ${html} referencia ${total} B de JS (>5 KB)"; fail=1; }
done < <(find dist -name "*.html")

# Invariante: sin JS huérfano en _astro (prune-orphan-js.mjs debe haber corrido).
orphan=$(find dist/_astro -name "*.js" 2>/dev/null | wc -l | tr -d ' ')
[ "$orphan" -gt 0 ] && { echo "FALLA: dist/_astro tiene ${orphan} JS huérfano(s) — revisar prune-orphan-js.mjs"; fail=1; }

[ "$fail" -eq 0 ] && echo "OK: performance dentro de presupuesto (CSS < 20 KB gz, JS < 5 KB/ruta, 0 huérfanos)."
exit "$fail"
