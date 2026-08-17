/**
 * Etiquetas visibles del campo `tipo` de la colección `obras`.
 *
 * Vivían copiadas en tres lugares (TarjetaObra, obras/[id] y el filtro de
 * obras/index). Centralizarlas no es solo higiene: los `Record<string, string>`
 * originales aceptaban cualquier clave, así que agregar un valor al enum de
 * `content.config.ts` no rompía nada y la página renderizaba `undefined` en
 * producción. Tipando contra el union real de la colección, esa misma omisión
 * ahora es un error de `astro check`.
 */
import type { CollectionEntry } from 'astro:content';

export type TipoObra = CollectionEntry<'obras'>['data']['tipo'];

/** Singular, para la ficha de una obra y la línea "tipo · zona" de la tarjeta. */
export const tipoLabel: Record<TipoObra, string> = {
  vivienda: 'Vivienda',
  corporativo: 'Corporativo',
  refaccion: 'Refacción',
  gastronomia: 'Gastronomía',
  edificio: 'Edificio',
};

/** Plural, para las píldoras del filtro de /obras: agrupan varias obras. */
export const filtroLabel: Record<TipoObra, string> = {
  vivienda: 'Viviendas',
  corporativo: 'Corporativo',
  refaccion: 'Refacciones',
  gastronomia: 'Gastronomía',
  edificio: 'Edificios',
};
