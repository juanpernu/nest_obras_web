#!/usr/bin/env bash
# Chequeos de presupuesto de performance sobre dist/ (correr tras `pnpm build`).
# Mide el presupuesto REAL de cara al usuario (JS referenciado por ruta, CSS gz);
# la higiene del artefacto (chunks huérfanos) la resuelve prune-orphan-js.mjs.
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

# JS por ruta: < 5 KB (0 KB de framework; solo scripts inline chicos). Suma el
# JS externo referenciado (/_astro/*.js) Y el inline (<script> sin
# type="application/ld+json"): desde el 05/09/2026 los scripts hoisted viajan
# inline (assetsInlineLimit en astro.config.mjs), así que contar solo los
# externos daba 0 y el presupuesto quedaba sin control (code review del PR #12).
# Los <script data-analitica> (encoladores de GA4/Meta y Vercel Analytics) no
# se cuentan: la analítica de terceros está exenta del presupuesto por §7.1,
# con la condición de que el script real se inyecte después del `load`.
while IFS= read -r html; do
  externo=0
  for js in $(grep -oE '/_astro/[A-Za-z0-9_./-]+\.js' "$html" | sort -u); do
    [ -e "dist${js}" ] && externo=$((externo + $(wc -c < "dist${js}")))
  done
  inline=$(node -e '
    const h = require("fs").readFileSync(process.argv[1], "utf8");
    let n = 0;
    for (const m of h.matchAll(/<script(\b[^>]*)>([\s\S]*?)<\/script>/g)) {
      if (/type=["\x27]application\/ld\+json/.test(m[1])) continue;
      if (/\bdata-analitica\b/.test(m[1])) continue;
      n += Buffer.byteLength(m[2]);
    }
    console.log(n);
  ' "$html")
  total=$((externo + inline))
  [ "$total" -gt 5120 ] && { echo "FALLA: ${html} carga ${total} B de JS (${inline} inline + ${externo} externo, >5 KB)"; fail=1; }
done < <(find dist -name "*.html")

# Info (no falla): tras prune, cada .js de _astro debería ser alcanzable desde el
# HTML; un número inesperado sugiere que prune-orphan-js.mjs no corrió.
js_count=$(find dist/_astro -name "*.js" 2>/dev/null | wc -l | tr -d ' ')
echo "info: ${js_count} archivo(s) .js en dist/_astro"

[ "$fail" -eq 0 ] && echo "OK: performance dentro de presupuesto (CSS < 20 KB gz, JS < 5 KB/ruta)."
exit "$fail"
